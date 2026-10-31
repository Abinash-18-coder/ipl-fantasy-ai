import { z } from "zod";

export type GeminiThinkingLevel = "minimal" | "low" | "medium" | "high";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url()
    .default("https://placeholder-project.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1)
    .default("placeholder-anon-key"),
});

const serverEnvSchema = clientEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1)
    .default("placeholder-service-role-key"),
  GEMINI_API_KEY: z
    .string()
    .min(1)
    .default("placeholder-gemini-api-key"),
  GEMINI_MODEL: z
    .string()
    .min(1)
    .default("gemini-3.8-flash"),
  GEMINI_THINKING_LEVEL: z
    .enum(["minimal", "low", "medium", "high"])
    .default("high"),
  GEMINI_DEEP_RESEARCH_MODE: z
    .enum(["true", "false"])
    .default("true"),
  CRICKET_API_KEY: z
    .string()
    .min(1)
    .default("placeholder-cricket-api-key"),
  CRICKET_API_BASE_URL: z
    .string()
    .url()
    .default("https://api.cricapi.com/v1"),
  UPSTASH_REDIS_REST_URL: z
    .string()
    .url()
    .default("https://placeholder-redis.upstash.io"),
  UPSTASH_REDIS_REST_TOKEN: z
    .string()
    .min(1)
    .default("placeholder-upstash-token"),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getClientEnv(): ClientEnv {
  return clientEnvSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

export const clientEnv: ClientEnv = getClientEnv();

export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error(
      "Security Violation: getServerEnv() cannot be invoked inside a browser client component."
    );
  }

  return serverEnvSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    GEMINI_THINKING_LEVEL: process.env.GEMINI_THINKING_LEVEL,
    GEMINI_DEEP_RESEARCH_MODE: process.env.GEMINI_DEEP_RESEARCH_MODE,
    CRICKET_API_KEY: process.env.CRICKET_API_KEY,
    CRICKET_API_BASE_URL: process.env.CRICKET_API_BASE_URL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}