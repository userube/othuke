# ---- STAGE 1: Build ----
FROM node:20-alpine AS builder

# Set working directory inside container
WORKDIR /app

# Accept DATABASE_URL at build time
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Generate Prisma client and build NestJS
RUN npx prisma generate
RUN npm run build
RUN npx prisma migrate deploy

# ---- STAGE 2: Production ----
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy built files and package.json from builder stage
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Expose default NestJS port
EXPOSE 3000

# Start the app
CMD ["node", "dist/main.js"]
