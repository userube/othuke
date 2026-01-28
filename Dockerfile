# ---- STAGE 1: Build ----
FROM node:20-bullseye AS builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y curl bash && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the NestJS project
RUN npm run build

# ---- STAGE 2: Production ----
FROM node:20-bullseye

WORKDIR /app

# Install runtime dependencies (optional: minimal)
RUN apt-get update && apt-get install -y curl bash && rm -rf /var/lib/apt/lists/*

# Copy built app from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Expose your app port
EXPOSE 3000

# Start the app
CMD ["node", "dist/main.js"]
