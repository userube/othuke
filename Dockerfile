# ---- STAGE 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# 👇 Provide a dummy DATABASE_URL for Prisma generate
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/dummy"

COPY package*.json ./
RUN npm install

COPY . .

# Prisma client generation (needs DATABASE_URL in Prisma v5)
RUN npx prisma generate

# Build NestJS
RUN npm run build

# ---- STAGE 2: Production ----
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Real DATABASE_URL comes from Render at runtime
CMD npx prisma migrate deploy && node dist/main.js
