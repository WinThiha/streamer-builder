## 1. Documentation and architecture

- [x] 1.1 Write `docs/architecture.md` with stack decisions (TypeScript, pnpm, Vite+React, Hono, PostgreSQL+Drizzle, Zod, Tailwind, shadcn direction, Shaka Phase 1, Caddy Phase 4)
- [x] 1.2 Update `README.md` with prerequisites, folder map, env setup, and dev commands

## 2. Monorepo tooling

- [x] 2.1 Create root `package.json`, `pnpm-workspace.yaml`, and workspace package entries
- [x] 2.2 Add shared `tsconfig` base and per-package TypeScript configs (strict mode)
- [x] 2.3 Configure ESLint and Prettier at root with workspace scripts (`typecheck`, `lint`, `format`)

## 3. Shared connector contract

- [x] 3.1 Scaffold `packages/shared` with build/export setup
- [x] 3.2 Implement Zod schemas and types for `MediaRef`, `Source`, and resolve v1 request/response
- [x] 3.3 Export schemas and inferred types from package entry point

## 4. API foundation

- [x] 4.1 Scaffold `apps/api` with Hono and Node 22
- [x] 4.2 Add environment validation (Zod) including `DATABASE_URL` and `APP_MODE`
- [x] 4.3 Implement `GET /health` endpoint
- [x] 4.4 Configure Drizzle with PostgreSQL client using `DATABASE_URL`
- [x] 4.5 Add workspace dependency on `@movie-streamer/shared` (or equivalent package name)

## 5. Web foundation

- [x] 5.1 Scaffold `apps/web` with Vite, React, and React Router
- [x] 5.2 Configure Tailwind and CSS variables scaffold for future theming
- [x] 5.3 Add TanStack Query provider and placeholder pages (home + secondary route)
- [x] 5.4 Wire `VITE_API_URL` for API calls (health check acceptable)
- [x] 5.5 Configure Vite dev proxy for `/api` when running outside Docker

## 6. Local dev Docker

- [x] 6.1 Create `docker-compose.dev.yml` (postgres:5432, api:3001, web:5173)
- [x] 6.2 Add Dockerfiles or dev commands for api and web services
- [x] 6.3 Create `.env.example` with all required variables
- [x] 6.4 Add `docker/production/` README placeholder for Phase 4 Deploy Pack

## 7. Verification

- [x] 7.1 Run `pnpm install`, `pnpm typecheck`, and `pnpm lint` successfully
- [x] 7.2 Validate `docker compose -f docker-compose.dev.yml config`
- [x] 7.3 Verify `docker compose -f docker-compose.dev.yml up` starts postgres, api, and web
