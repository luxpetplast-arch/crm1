# Full-stack build for Render deployment (Frontend + Backend)
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

# Build frontend only (server runs with tsx)
RUN npm run build

# Use PORT from environment (Render sets this)
ENV PORT=10000
EXPOSE 10000

# Run backend API with tsx (Express will serve frontend static files)
CMD ["npx", "tsx", "server/index.ts"]
