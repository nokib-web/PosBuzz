# Build stage
FROM node:20-alpine AS builder

# Install build dependencies for native modules (like bcrypt) and Prisma
RUN apk add --no-cache python3 make g++ openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies including devDependencies for build
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Install production runtime dependencies (Prisma needs openssl on Alpine)
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm install --omit=dev

# Copy build artifacts and prisma files from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Script to run migrations and then start the app
CMD npx prisma migrate deploy && node dist/main
