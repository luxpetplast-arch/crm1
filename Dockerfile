# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

# Build client
RUN npm run build:client

# Build server TypeScript files with verbose output
RUN npm run build:server 2>&1 || (echo "=== BUILD FAILED ===" && cat server/tsconfig.json && exit 1)

# Verify server build output exists
RUN echo "=== Checking server/dist contents ===" && ls -la /app/server/dist/ && \
    echo "=== Checking middleware ===" && ls -la /app/server/dist/middleware/ && \
    echo "=== Checking swagger ===" && ls -la /app/server/dist/swagger.js && \
    echo "=== All checks passed ==="

# Generate Prisma client
RUN npm run db:generate

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/prisma ./prisma

# Copy node_modules for Prisma
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Generate Prisma client for production
RUN npx prisma generate

EXPOSE 5000

CMD ["node", "server/dist/index.js"]
