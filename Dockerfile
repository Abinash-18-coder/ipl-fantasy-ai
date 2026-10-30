FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENV NEXT_PUBLIC_SUPABASE_URL="https://placeholder-project.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="placeholder-anon-key"
ENV SUPABASE_SERVICE_ROLE_KEY="placeholder-service-role-key"
ENV GEMINI_API_KEY="placeholder-gemini-api-key"
ENV GEMINI_MODEL="gemini-3.8-flash"
ENV CRICKET_API_KEY="placeholder-cricket-api-key"
ENV CRICKET_API_BASE_URL="https://api.cricapi.com/v1"
ENV UPSTASH_REDIS_REST_URL="https://placeholder-redis.upstash.io"
ENV UPSTASH_REDIS_REST_TOKEN="placeholder-upstash-token"

RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]