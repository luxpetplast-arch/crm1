# Backend-only build for Render deployment - v3 (direct tsx)
FROM node:20-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

# Generate Prisma client
RUN npm run db:generate

# Use PORT from environment (Render sets this)
ENV PORT=10000
EXPOSE 10000

# Run TypeScript directly with tsx (no build step)
CMD ["npx", "tsx", "server/index.ts"]
