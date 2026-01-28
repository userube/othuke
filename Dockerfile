# ---- STAGE 1: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json first and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# Generate Prisma client (no DB needed) and build NestJS
RUN npx prisma generate
RUN npm run build

# ---- STAGE 2: Production ----
FROM node:20-alpine
WORKDIR /app

# Copy built code and node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Expose NestJS port
EXPOSE 3000

# Start app
CMD ["node", "dist/main.js"]
