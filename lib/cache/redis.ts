
import { Redis } from "@upstash/redis";
import { getServerEnv } from "@/lib/env";
import {
  fetchMatchScorecard,
  fetchMatchSquadsAndToss,
  fetchUpcomingAndLiveMatches,
} from "@/lib/cricket/apiClient";
import type {
  CacheBackendMode,
  CachedCricketEnvelope,
  CricketApiEnvelope,
  NormalizedMatchFixture,
  NormalizedMatchScorecard,
  NormalizedMatchSquadAndToss,
} from "@/types";

export const TTL_LIVE_SCORECARD_SECONDS = 15;
export const TTL_SQUAD_TOSS_SECONDS = 30;
export const TTL_ROLLING_FIXTURES_SECONDS = 60;

interface MemoryCacheEntry {
  serialized: string;
  expiresAtMs: number;
}

const memoryStore = new Map<string, MemoryCacheEntry>();
const inFlightRequests = new Map<string, Promise<unknown>>();

let cachedRedisInstance: Redis | null = null;

function isPlaceholderRedisConfig(url: string, token: string): boolean {
  return (
    !url ||
    !token ||
    url.includes("placeholder-redis.upstash.io") ||
    token.startsWith("placeholder-")
  );
}

function getUpstashRedisClient(): {
  client: Redis | null;
  backend: CacheBackendMode;
} {
  const env = getServerEnv();

  if (
    isPlaceholderRedisConfig(
      env.UPSTASH_REDIS_REST_URL,
      env.UPSTASH_REDIS_REST_TOKEN
    )
  ) {
    return {
      client: null,
      backend: "IN_MEMORY_FALLBACK",
    };
  }

  if (!cachedRedisInstance) {
    cachedRedisInstance = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return {
    client: cachedRedisInstance,
    backend: "UPSTASH_REDIS",
  };
}

function readFromMemoryCache<T>(
  key: string
): CricketApiEnvelope<T> | null {
  const entry = memoryStore.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAtMs) {
    memoryStore.delete(key);
    return null;
  }

  try {
    return JSON.parse(entry.serialized) as CricketApiEnvelope<T>;
  } catch {
    memoryStore.delete(key);
    return null;
  }
}

function writeToMemoryCache<T>(
  key: string,
  envelope: CricketApiEnvelope<T>,
  ttlSeconds: number
): void {
  try {
    memoryStore.set(key, {
      serialized: JSON.stringify(envelope),
      expiresAtMs: Date.now() + ttlSeconds * 1000,
    });
  } catch {
    return;
  }
}

export async function withCricketCacheShield<T>(
  cacheKey: string,
  ttlSeconds: number,
  fetcher: () => Promise<CricketApiEnvelope<T>>
): Promise<CachedCricketEnvelope<T>> {
  const startMs = Date.now();
  const { client, backend } = getUpstashRedisClient();

  if (client) {
    try {
      const cached = await client.get<CricketApiEnvelope<T>>(cacheKey);

      if (cached && typeof cached === "object" && "data" in cached) {
        return {
          ...cached,
          latency_ms: Date.now() - startMs,
          cache_status: "REDIS_HIT",
          cache_backend: "UPSTASH_REDIS",
          cache_key: cacheKey,
          ttl_seconds: ttlSeconds,
        };
      }
    } catch {
      const fallbackHit = readFromMemoryCache<T>(cacheKey);

      if (fallbackHit) {
        return {
          ...fallbackHit,
          latency_ms: Date.now() - startMs,
          cache_status: "MEMORY_HIT",
          cache_backend: "IN_MEMORY_FALLBACK",
          cache_key: cacheKey,
          ttl_seconds: ttlSeconds,
        };
      }
    }
  } else {
    const memoryHit = readFromMemoryCache<T>(cacheKey);

    if (memoryHit) {
      return {
        ...memoryHit,
        latency_ms: Date.now() - startMs,
        cache_status: "MEMORY_HIT",
        cache_backend: backend,
        cache_key: cacheKey,
        ttl_seconds: ttlSeconds,
      };
    }
  }

  const existingPromise = inFlightRequests.get(cacheKey) as
    | Promise<CricketApiEnvelope<T>>
    | undefined;

  if (existingPromise) {
    const coalescedResult = await existingPromise;

    return {
      ...coalescedResult,
      latency_ms: Date.now() - startMs,
      cache_status: "COALESCED_HIT",
      cache_backend: backend,
      cache_key: cacheKey,
      ttl_seconds: ttlSeconds,
    };
  }

  const fetchPromise = (async () => {
    try {
      const freshEnvelope = await fetcher();

      writeToMemoryCache(cacheKey, freshEnvelope, ttlSeconds);

      if (client) {
        try {
          await client.set(cacheKey, freshEnvelope, { ex: ttlSeconds });
        } catch {
          // Memory cache remains available if Redis writes fail.
        }
      }

      return freshEnvelope;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, fetchPromise);

  const freshResult = await fetchPromise;

  return {
    ...freshResult,
    cache_status: "MISS",
    cache_backend: backend,
    cache_key: cacheKey,
    ttl_seconds: ttlSeconds,
  };
}

export async function invalidateCricketCacheKey(
  cacheKey: string
): Promise<void> {
  memoryStore.delete(cacheKey);

  const { client } = getUpstashRedisClient();

  if (client) {
    try {
      await client.del(cacheKey);
    } catch {
      return;
    }
  }
}

export async function getCachedRollingMatches(): Promise<
  CachedCricketEnvelope<NormalizedMatchFixture[]>
> {
  return withCricketCacheShield(
    "cricintel:fixtures:rolling:v1",
    TTL_ROLLING_FIXTURES_SECONDS,
    () => fetchUpcomingAndLiveMatches()
  );
}

export async function getCachedMatchScorecard(
  matchId: string
): Promise<CachedCricketEnvelope<NormalizedMatchScorecard>> {
  const safeId = matchId.trim().toLowerCase();

  return withCricketCacheShield(
    `cricintel:scorecard:${safeId}:v1`,
    TTL_LIVE_SCORECARD_SECONDS,
    () => fetchMatchScorecard(safeId)
  );
}

export async function getCachedMatchSquadsAndToss(
  matchId: string
): Promise<CachedCricketEnvelope<NormalizedMatchSquadAndToss>> {
  const safeId = matchId.trim().toLowerCase();

  return withCricketCacheShield(
    `cricintel:squads-toss:${safeId}:v1`,
    TTL_SQUAD_TOSS_SECONDS,
    () => fetchMatchSquadsAndToss(safeId)
  );
}
