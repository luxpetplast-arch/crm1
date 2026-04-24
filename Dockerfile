# Production stage with tsx
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

EXPOSE 5000

# Use tsx to run TypeScript directly
CMD ["npx", "tsx", "server/index.ts"]
