# ---------- Base Dependencies ----------
FROM node:20 AS base
WORKDIR /app

ENV PLAYWRIGHT_BROWSERS_PATH=/usr/bin \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    NODE_ENV=production \
    PORT=3000

# ---------- Install Dependencies ----------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---------- Build App ----------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ✅ Ensure Next.js picks up config
COPY next.config.js ./next.config.js

# ✅ Ensure standalone output works
RUN npm install --include=dev
RUN npm run build

# ---------- Run App ----------
FROM base AS runner
WORKDIR /app

# No need to copy .env.production; Azure injects env vars directly

# ✅ Copy built output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]