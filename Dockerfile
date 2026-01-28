# ---- STAGE 1: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client (database not required at build)
RUN npx prisma generate

# Build NestJS
RUN npm run build

# ---- STAGE 2: Production ----
FROM node:20-alpine
WORKDIR /app

# Copy build artifacts and node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Expose NestJS port
EXPOSE 3000

# Start app (Prisma uses DATABASE_URL from Render env)
CMD ["node", "dist/main.js"]
