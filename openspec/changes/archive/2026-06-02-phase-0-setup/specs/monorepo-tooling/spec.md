## ADDED Requirements

### Requirement: Root workspace installs all packages

The repository SHALL provide a pnpm workspace at the repository root that includes `apps/web`, `apps/api`, and `packages/shared`.

#### Scenario: Install from root

- **WHEN** a developer runs `pnpm install` at the repository root
- **THEN** dependencies for all workspace packages are installed without error

### Requirement: Shared TypeScript strict mode

The repository SHALL use TypeScript in strict mode with a shared base configuration extended by each package.

#### Scenario: Typecheck all packages

- **WHEN** a developer runs the root `typecheck` script
- **THEN** all workspace packages compile without TypeScript errors

### Requirement: Lint and format scripts

The repository SHALL provide root scripts for ESLint and Prettier applicable to workspace packages.

#### Scenario: Lint passes on clean scaffold

- **WHEN** a developer runs the root `lint` script after Phase 0 implementation
- **THEN** lint completes with no errors on scaffolded code
