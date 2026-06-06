FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web
COPY docker/production/nginx.conf ./docker/production/nginx.conf

ENV VITE_API_URL=

RUN pnpm --filter @movie-streamer/shared build \
  && pnpm --filter @movie-streamer/web build

FROM nginx:1.27-alpine AS runtime

COPY docker/production/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80
