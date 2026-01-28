# ---- STAGE 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Accept DATABASE_URL at build time
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

COPY package*.json ./
RUN npm install

COPY . .

# Prisma client generation does NOT touch DB
RUN npx prisma generate

# Build NestJS
RUN npm run build

# ---- STAGE 2: Production ----
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

EXPOSE 3000

# Run migrations at container startup (DATABASE_URL is available here)
CMD npx prisma migrate deploy && node dist/main.js
