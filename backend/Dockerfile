# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies including devDependencies for build
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client and build the application
RUN npm run build

# Production stage
FROM node:18-alpine

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
