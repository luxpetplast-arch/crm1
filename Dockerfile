# Production stage with tsx
FROM node:20-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

# Build server TypeScript
RUN cd server && npx tsc

# Generate Prisma client
RUN npm run db:generate

EXPOSE 5000

# Run compiled JavaScript
CMD ["node", "server/dist/index.js"]
