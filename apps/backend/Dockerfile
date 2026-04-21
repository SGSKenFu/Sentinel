FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/types/package*.json ./packages/types/
COPY packages/sdk/package*.json ./packages/sdk/
COPY packages/prompts/package*.json ./packages/prompts/

RUN npm ci --workspace=apps/backend --workspace=packages/types --workspace=packages/sdk --workspace=packages/prompts

COPY packages/ ./packages/
COPY apps/backend/ ./apps/backend/

RUN npm run build:backend

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main"]
