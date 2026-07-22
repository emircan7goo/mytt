# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Bağımlılıkları önce kopyala (layer cache optimizasyonu)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --ignore-scripts

# Prisma client üret
RUN npx prisma generate

# Kaynak kodları kopyala ve derle
COPY . .
RUN npm run build

# ── Stage 2: Production ───────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Sadece production bağımlılıkları
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production --ignore-scripts

# Prisma client (runner için)
RUN npx prisma generate

# Build çıktısını kopyala
COPY --from=builder /app/dist ./dist

# Uploads klasörü — volume ile mount edilecek
RUN mkdir -p uploads

# Non-root user — güvenlik
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3001

# Migration + start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
