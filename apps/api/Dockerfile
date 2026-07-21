# MCPFAC BIOTECH — Nest API production image (monorepo context = repo root)
# Build:  docker build -t mcpfac-api:staging -f apps/api/Dockerfile .
# Run:    docker run --env-file .env -p 3001:3001 mcpfac-api:staging

FROM node:22-bookworm-slim AS deps
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY prisma ./prisma
COPY packages ./packages
COPY apps/api/package.json ./apps/api/package.json

RUN pnpm install --frozen-lockfile --filter @mcpfac/api...

FROM node:22-bookworm-slim AS build
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
WORKDIR /app

COPY --from=deps /app /app
COPY prisma ./prisma
COPY packages ./packages
COPY apps/api ./apps/api

RUN pnpm db:generate
RUN pnpm --filter @mcpfac/api build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate \
  && apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/api ./apps/api

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
