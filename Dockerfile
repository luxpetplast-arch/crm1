# Backend-only build for Render deployment
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

# Build server TypeScript only (frontend on Netlify)
RUN npm run build:server

# Generate Prisma client
RUN npm run db:generate

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies only
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --production

# Copy built artifacts from builder
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Use PORT from environment (Render sets this)
ENV PORT=10000
EXPOSE 10000

# Run compiled JavaScript
CMD ["node", "server/dist/index.js"]
