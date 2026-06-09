FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN pnpm --filter @movie-streamer/shared build \
  && pnpm --filter @movie-streamer/api build

# Clean monorepo slice for full-source Deploy Pack generation (no node_modules)
FROM node:22-alpine AS pack-source

WORKDIR /pack-source

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY apps/web ./apps/web
COPY docker/production ./docker/production

FROM node:22-alpine AS runtime

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

ENV NODE_ENV=production
ENV DEPLOY_PACK_REPO_ROOT=/pack-source

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/drizzle ./apps/api/drizzle
COPY --from=pack-source /pack-source /pack-source

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/index.js"]
