# --- base ---
FROM node:20-alpine AS base
WORKDIR /app

# --- deps ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f yarn.lock ]; then corepack enable && yarn --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
    else npm i; fi

# --- builder ---
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
# Build-time public envs (baked into client bundles)
ARG NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
ENV NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=${NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy standalone server and generated static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY package.json ./

# Expose port, healthcheck and default command
EXPOSE 3000
ENV PORT=3000 \
    HOST=0.0.0.0
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -sf http://localhost:3000/ || exit 1

USER 1001
CMD ["node", "server.js"] 