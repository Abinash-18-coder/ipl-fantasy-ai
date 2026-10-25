// File: lib/env.ts
import { z } from "zod";

/**
 * Helper that converts empty strings ("") to undefined so Zod's .default()
 * kicks in cleanly during local development and GitHub Actions CI builds.
 */
const emptyToUndefined = (val: string | undefined): string | undefined => {
  if (typeof val === "string" && val.trim() === "") {
    return undefined;
  }
  return val;
};

/**
 * 1. Public Client Environment Schema
 * Safe to import in both Client Components ("use client") and Server Components.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid http:// or https:// URL")
    .default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid https:// Supabase URL")
    .default("https://placeholder-project.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY cannot be empty")
    .default("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-anon-key"),
});

/**
 * 2. Server-Only Environment Schema
 * Extends clientEnvSchema with secret backend keys. Strictly for Server Components,
 * Route Handlers, and Server Actions.
 */
const serverEnvSchema = clientEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY cannot be empty")
    .default("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-service-role-key"),
  CRICKET_API_KEY: z
    .string()
    .min(1, "CRICKET_API_KEY cannot be empty")
    .default("placeholder-cricket-api-key"),
  CRICKET_API_BASE_URL: z
    .string()
    .url("CRICKET_API_BASE_URL must be a valid URL")
    .default("https://api.cricapi.com/v1"),
  UPSTASH_REDIS_REST_URL: z
    .string()
    .url("UPSTASH_REDIS_REST_URL must be a valid https:// Upstash URL")
    .default("https://placeholder-redis.upstash.io"),
  UPSTASH_REDIS_REST_TOKEN: z
    .string()
    .min(1, "UPSTASH_REDIS_REST_TOKEN cannot be empty")
    .default("placeholder-upstash-token"),
  GEMINI_API_KEY: z
    .string()
    .min(1, "GEMINI_API_KEY cannot be empty")
    .default("placeholder-gemini-api-key"),
  GEMINI_MODEL_ID: z
    .string()
    .min(1, "GEMINI_MODEL_ID cannot be empty")
    .default("gemini-3.8-flash"),
  GEMINI_DEFAULT_THINKING_LEVEL: z
    .enum(["low", "medium", "high"])
    .default("low"),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Validated Public Client Environment Object
 */
export const clientEnv: ClientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_APP_URL: emptyToUndefined(process.env.NEXT_PUBLIC_APP_URL),
  NEXT_PUBLIC_SUPABASE_URL: emptyToUndefined(
    process.env.NEXT_PUBLIC_SUPABASE_URL
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: emptyToUndefined(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ),
});

/**
 * Validates and returns all Server + Client environment variables.
 * Throws an immediate security error if called inside a browser Client Component.
 */
export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error(
      "SECURITY VIOLATION: getServerEnv() was called inside a browser Client Component. Secret keys must only be accessed on the server."
    );
  }

  const parsed = serverEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: emptyToUndefined(process.env.NEXT_PUBLIC_APP_URL),
    NEXT_PUBLIC_SUPABASE_URL: emptyToUndefined(
      process.env.NEXT_PUBLIC_SUPABASE_URL
    ),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: emptyToUndefined(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
    SUPABASE_SERVICE_ROLE_KEY: emptyToUndefined(
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    CRICKET_API_KEY: emptyToUndefined(process.env.CRICKET_API_KEY),
    CRICKET_API_BASE_URL: emptyToUndefined(process.env.CRICKET_API_BASE_URL),
    UPSTASH_REDIS_REST_URL: emptyToUndefined(
      process.env.UPSTASH_REDIS_REST_URL
    ),
    UPSTASH_REDIS_REST_TOKEN: emptyToUndefined(
      process.env.UPSTASH_REDIS_REST_TOKEN
    ),
    GEMINI_API_KEY: emptyToUndefined(process.env.GEMINI_API_KEY),
    GEMINI_MODEL_ID: emptyToUndefined(process.env.GEMINI_MODEL_ID),
    GEMINI_DEFAULT_THINKING_LEVEL: emptyToUndefined(
      process.env.GEMINI_DEFAULT_THINKING_LEVEL
    ),
  });

  if (!parsed.success) {
    const formattedIssues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(" | ");
    console.error(`❌ Invalid Environment Configuration: ${formattedIssues}`);
    throw new Error(`Invalid server environment configuration: ${formattedIssues}`);
  }

  return parsed.data;
}