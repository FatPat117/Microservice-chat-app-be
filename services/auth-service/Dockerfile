FROM node:22-alpine AS base

#Install pnpm
RUN corepack enable & corepack prepare pnpm@10.14.0 --activate

WORKDIR /app

FROM base AS deps

#Copy workspace configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.json tsconfig.base.json ./

#Copy package.json file for all needed packages
COPY packages/common/package.json ./packages/common/package.json
COPY services/auth-service/package.json ./services/auth-service/package.json

#Install dependencies
RUN pnpm install --no-frozen-lockfile

FROM deps as builder

#COPY SOURCE CODE
COPY packages/common ./packages/common
COPY services/auth-service ./services/auth-service

#Build common package first
RUN pnpm --filter @chatapp/common build && \
    sed -i 's|"../errors/http-error"|"../errors/http-error.js"|g' packages/common/dist/http/internal-auth.js && \
    sed -i 's|"../errors/http-error"|"../errors/http-error.js"|g' packages/common/dist/http/validate-request.js && \
    sed -i 's|"./env"|"./env.js"|g' packages/common/dist/index.js && \
    sed -i 's|"./errors/http-error"|"./errors/http-error.js"|g' packages/common/dist/index.js && \
    sed -i 's|"./http/internal-auth"|"./http/internal-auth.js"|g' packages/common/dist/index.js && \
    sed -i 's|"./http/validate-request"|"./http/validate-request.js"|g' packages/common/dist/index.js

#Build auth service package
RUN pnpm --filter @chatapp/auth-service build

FROM node:22-alpine AS production

#Install pnpm and curl (for healthcheck)
RUN corepack enable & corepack prepare pnpm@10.14.0 --activate && \
    apk add --no-cache curl

#Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser

WORKDIR /app

#Copy workspace configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.json tsconfig.base.json ./

#Copy package.json file for all needed packages
COPY packages/common/package.json ./packages/common/package.json
COPY services/auth-service/package.json ./services/auth-service/package.json

#Install dependencies
RUN pnpm install --no-frozen-lockfile --production

#Copy built artifacts from builder
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/services/auth-service/dist ./services/auth-service/dist

#Change ownership of the files to the non-root user
RUN chown -R nodeuser:nodejs /app

USER nodeuser

ENV NODE_ENV=production
ENV AUTH_SERVICE_PORT=4003

EXPOSE 4003

WORKDIR /app/services/auth-service

CMD ["node", "dist/index.js"]