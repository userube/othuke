# ---- STAGE 1: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the app source
COPY . .

# Generate Prisma client (no real DB needed)
RUN npx prisma generate

# Build NestJS
RUN npm run build

# ---- STAGE 2: Production ----
FROM node:20-alpine
WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Expose NestJS default port
EXPOSE 3000

# Start app
CMD ["node", "dist/main.js"]
