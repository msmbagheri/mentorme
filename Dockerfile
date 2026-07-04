# syntax=docker/dockerfile:1

# MentorMe — production image.
# Debian-slim (not Alpine) so Prisma's OpenSSL engine "just works".
# Stages: base → deps → builder → runner (slim app) + migrator (runs prisma migrate/seed).

FROM node:20-bookworm-slim AS base
# fonts-dejavu-core + fontconfig are REQUIRED at runtime: the login captcha
# rasterizes an SVG with sharp/librsvg, which renders no glyphs without a font
# installed (the slim image ships none) — the captcha would show only noise.
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates fonts-dejavu-core fontconfig \
  && rm -rf /var/lib/apt/lists/*
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# ---- deps: install ALL deps (incl. dev — needed for the build and for tsx seed) ----
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# ---- builder: generate Prisma client + build the Next.js standalone bundle ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Placeholder env so build never touches a real DB/secret. sitemap is force-dynamic,
# so no DB query runs at build; these just satisfy any module-level reads.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public" \
    NEXTAUTH_SECRET="build-time-placeholder-not-used-at-runtime" \
    NODE_ENV=production
RUN npx prisma generate && npm run build

# ---- migrator: tiny image that can run `prisma migrate deploy` / `prisma db seed` ----
FROM base AS migrator
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
COPY tsconfig.json ./
RUN npx prisma generate
# Default action; overridden per-service in docker-compose for seeding.
CMD ["npx", "prisma", "migrate", "deploy"]

# ---- runner: minimal runtime that serves the app ----
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN groupadd --gid 1001 nodejs \
  && useradd --uid 1001 --gid nodejs --create-home nextjs
# Standalone server + assets. public/ holds static assets; uploads is a mounted volume.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Ensure the media uploads dir exists and is writable by the app user.
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
