FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

WORKDIR /app

FROM base AS deps

# Copy workspace configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.json tsconfig.base.json ./

# Copy package.json for required packages
COPY packages/common/package.json ./packages/common/package.json
COPY services/user-service/package.json ./services/user-service/package.json

# Install dependencies for workspace
RUN pnpm install --no-frozen-lockfile

FROM deps AS builder

# Copy source code
COPY packages/common ./packages/common
COPY services/user-service ./services/user-service

# Build common first, then user-service. Also patch common dist imports for Node ESM.
RUN pnpm --filter @chatapp/common build && \
    sed -i 's|"../errors/http-error"|"../errors/http-error.js"|g' packages/common/dist/http/internal-auth.js && \
    sed -i 's|"../errors/http-error"|"../errors/http-error.js"|g' packages/common/dist/http/validate-request.js && \
    sed -i 's|"./env"|"./env.js"|g' packages/common/dist/index.js && \
    sed -i 's|"./errors/http-error"|"./errors/http-error.js"|g' packages/common/dist/index.js && \
    sed -i 's|"./http/internal-auth"|"./http/internal-auth.js"|g' packages/common/dist/index.js && \
    sed -i 's|"./http/validate-request"|"./http/validate-request.js"|g' packages/common/dist/index.js

FROM node:22-alpine AS production

# Install pnpm and curl (for healthcheck)
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate && \
    apk add --no-cache curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser

WORKDIR /app

# Copy workspace configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.json tsconfig.base.json ./

# Copy package.json for required packages
COPY packages/common/package.json ./packages/common/package.json
COPY services/user-service/package.json ./services/user-service/package.json

# Install production dependencies
RUN pnpm install --no-frozen-lockfile --production

# Copy built artifacts from local build
COPY packages/common/dist ./packages/common/dist
COPY services/user-service/dist ./services/user-service/dist

# Change ownership
RUN chown -R nodeuser:nodejs /app

USER nodeuser

ENV NODE_ENV=production
ENV USER_SERVICE_PORT=4001

EXPOSE 4001

WORKDIR /app/services/user-service

CMD ["node", "dist/index.js"]

