# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (layer-cache friendly)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and config files needed for the build
COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

# Generate the Prisma client into src/generated/prisma.
# tsc will then compile it into dist/generated/prisma because
# src/lib/prisma.ts imports from it (exclude only stops root-level
# compilation, not transitive imports).
RUN npx prisma generate

# Compile TypeScript → dist/
RUN npm run build

# Prune to production-only deps (the prisma CLI is still reachable
# via @prisma/client's bundled binary, so migrate deploy works)
RUN npm ci --omit=dev

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production

WORKDIR /app

# Copy pruned node_modules and compiled output from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Prisma config + schema + migrations are needed at runtime for
# `prisma migrate deploy` in the entrypoint.
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/prisma ./prisma

# Entrypoint script: runs migrations, then starts the server
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["dumb-init", "--"]
CMD ["./docker-entrypoint.sh"]
