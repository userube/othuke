FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache openssl1.1 libc6-compat curl bash

COPY package*.json ./
RUN npm install

COPY . .

# Prisma generate (no DB connection required at build)
RUN npx prisma generate

# Build NestJS
RUN npm run build

# ---- STAGE 2: Production ----
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache openssl1.1 libc6-compat curl bash

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

EXPOSE 3000

CMD ["node", "dist/main.js"]
