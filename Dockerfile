# ---- STAGE 1: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client (dummy DB at build time)
RUN npx prisma generate

# Build NestJS
RUN npm run build

# ---- STAGE 2: Production ----
FROM node:20-alpine
WORKDIR /app

# Copy built files and production node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "dist/main.js"]
