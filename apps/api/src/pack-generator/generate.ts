import { createWriteStream, readFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { mkdtempSync, rmSync } from 'node:fs';
import { cpSync, writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import archiver from 'archiver';
import { stringify as stringifyYaml } from 'yaml';
import type { SiteConfig, WizardPayload } from '@movie-streamer/shared';

const __dirname = dirname(fileURLToPath(import.meta.url));

const EXCLUDED_COPY_NAMES = new Set([
  'node_modules',
  'dist',
  '.git',
  'data',
  'uploads',
  '.turbo',
  '.cache',
]);

const REPO_SOURCE_ROOT_FILES = [
  'package.json',
  'pnpm-workspace.yaml',
  'pnpm-lock.yaml',
  'tsconfig.base.json',
  'docker-compose.build.yml',
] as const;

const REPO_SOURCE_DIRS = ['apps/api', 'apps/web', 'packages/shared'] as const;

function isRepoRoot(dir: string): boolean {
  return (
    existsSync(join(dir, 'pnpm-workspace.yaml')) &&
    existsSync(join(dir, 'apps/api/Dockerfile')) &&
    existsSync(join(dir, 'apps/web/Dockerfile')) &&
    existsSync(join(dir, 'packages/shared/package.json'))
  );
}

function findRepoRootFrom(startDir: string): string | null {
  let dir = startDir;
  for (let depth = 0; depth < 10; depth++) {
    if (isRepoRoot(dir)) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

export function resolveRepoRoot(): string {
  const envRoot = process.env.DEPLOY_PACK_REPO_ROOT;
  if (envRoot && isRepoRoot(envRoot)) {
    return envRoot;
  }

  const fromFile = findRepoRootFrom(__dirname);
  if (fromFile) return fromFile;

  const fromCwd = findRepoRootFrom(process.cwd());
  if (fromCwd) return fromCwd;

  throw new Error(
    'Monorepo root not found for full-source pack. Set DEPLOY_PACK_REPO_ROOT to a directory containing apps/api, apps/web, and packages/shared.',
  );
}

function resolveTemplateDir(repoRoot: string): string {
  const fromRepo = join(repoRoot, 'docker/production');
  if (existsSync(fromRepo)) return fromRepo;

  if (process.env.DEPLOY_PACK_TEMPLATE_DIR && existsSync(process.env.DEPLOY_PACK_TEMPLATE_DIR)) {
    return process.env.DEPLOY_PACK_TEMPLATE_DIR;
  }

  throw new Error('Deploy pack template directory not found at docker/production.');
}

function isExcludedPackSourceName(name: string): boolean {
  if (EXCLUDED_COPY_NAMES.has(name)) return true;
  if (name.startsWith('test-') && name.endsWith('.mjs')) return true;
  return false;
}

function copyDirFiltered(src: string, dest: string): void {
  if (!existsSync(src)) {
    throw new Error(`Source path missing for full-source pack: ${src}`);
  }
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    if (isExcludedPackSourceName(entry)) continue;
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stats = statSync(srcPath);
    if (stats.isDirectory()) {
      copyDirFiltered(srcPath, destPath);
    } else {
      cpSync(srcPath, destPath);
    }
  }
}

function randomSecret(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}

function buildEnvContent(payload: WizardPayload): string {
  const postgresPassword = randomSecret(16);
  const sessionSecret = randomSecret(32);
  const apiImage = payload.apiImage ?? 'ghcr.io/example/movie-streamer-api';
  const webImage = payload.webImage ?? 'ghcr.io/example/movie-streamer-web';

  return `# Generated Deploy Pack — review before install
DOMAIN=${payload.domain}
ACME_EMAIL=${payload.acmeEmail ?? `admin@${payload.domain}`}
POSTGRES_USER=movie
POSTGRES_PASSWORD=${postgresPassword}
POSTGRES_DB=movie_streamer
SESSION_SECRET=${sessionSecret}
TMDB_API_KEY=
API_IMAGE=${apiImage}
WEB_IMAGE=${webImage}
IMAGE_TAG=${payload.imageTag}
COOKIE_SECURE=true
SITE_CONFIG_BOOTSTRAP_PATH=./site.config.yaml
`;
}

function writeSiteConfig(bundleDir: string, siteConfig: SiteConfig): void {
  writeFileSync(join(bundleDir, 'site.config.yaml'), stringifyYaml(siteConfig), 'utf8');
}

const DEPLOY_ONLY_LOCAL_BUILD_ARTIFACTS = ['docker-compose.build.yml'] as const;

const DEPLOY_ONLY_SCRIPTS = ['install.sh', 'update.sh'] as const;

/** Matches the USE_LOCAL_BUILD compose override block copied from repo scripts. */
const LOCAL_BUILD_COMPOSE_IF_BLOCK =
  /if \[ "\$\{USE_LOCAL_BUILD:-false\}" = "true" \]; then\n  COMPOSE_FILES="\$COMPOSE_FILES -f docker-compose\.build\.yml"\nfi\n/;

/** install.sh: optional image build before `up`. */
const LOCAL_BUILD_INSTALL_BUILD_BLOCK =
  /if \[ "\$\{USE_LOCAL_BUILD:-false\}" = "true" \]; then\n  docker compose \$COMPOSE_FILES build api web\nfi\n\n/;

/** update.sh: build-or-pull branch — deploy-only always pulls registry images. */
const LOCAL_BUILD_UPDATE_BUILD_OR_PULL_BLOCK =
  /if \[ "\$\{USE_LOCAL_BUILD:-false\}" = "true" \]; then\n  docker compose \$COMPOSE_FILES build api web\nelse\n  docker compose \$COMPOSE_FILES pull api web \|\| true\nfi\n/;

function deployOnlyReadme(): string {
  return `# Deploy Pack (registry images)

Production Docker stack: Caddy TLS, web, API, PostgreSQL. Installs **prebuilt container images** from your registry — no application source is included.

## Contents

| File | Purpose |
|------|---------|
| \`docker-compose.yml\` | Production stack (registry images via \`.env\`) |
| \`Caddyfile\` | TLS, \`/api\` reverse proxy, SPA fallback |
| \`.env\` | Pre-generated environment (review before install) |
| \`site.config.yaml\` | Bootstrap site branding/config |
| \`scripts/install.sh\` | First install and health wait |
| \`scripts/update.sh\` | Pull/recreate services |
| \`scripts/backup.sh\` | Postgres dump + uploads archive |
| \`scripts/restore.sh\` | Restore from backup |
| \`QUICKSTART.md\` | Step-by-step install guide |

## Install

See [QUICKSTART.md](./QUICKSTART.md).

\`\`\`bash
chmod +x scripts/*.sh
./scripts/install.sh
\`\`\`

Need to build from source on the server? Download the **full source pack** from the vendor configure wizard instead.
`;
}

function deployOnlyQuickstart(domain: string): string {
  return `# Deploy Pack — Quickstart (registry images)

This pack installs prebuilt container images from your registry. It does **not** include application source code.

## Install

1. Unzip on your Linux VPS and \`cd\` into this directory (the folder containing \`docker-compose.yml\`).
2. Review \`.env\` — domain, secrets, and \`API_IMAGE\` / \`WEB_IMAGE\` / \`IMAGE_TAG\` are pre-filled.
3. Point DNS for **${domain}** to this server (ports 80 and 443 open).
4. Run:

\`\`\`bash
chmod +x scripts/*.sh
./scripts/install.sh
\`\`\`

5. Open \`https://${domain}/setup\` and complete first-run setup (admin password, TMDB key, optional connector).

## Notes

- \`site.config.yaml\` is imported on first boot via \`SITE_CONFIG_BOOTSTRAP_PATH\`.
- Update: \`./scripts/backup.sh\` then \`./scripts/update.sh\`
- To build from source on the server, download the **full source pack** from the vendor configure wizard.
`;
}

function removeDeployOnlyLocalBuildArtifacts(bundleDir: string): void {
  for (const name of DEPLOY_ONLY_LOCAL_BUILD_ARTIFACTS) {
    const path = join(bundleDir, name);
    if (existsSync(path)) {
      unlinkSync(path);
    }
  }
}

function stripLocalBuildFromDeployScripts(bundleDir: string): void {
  for (const scriptName of DEPLOY_ONLY_SCRIPTS) {
    const path = join(bundleDir, 'scripts', scriptName);
    if (!existsSync(path)) {
      throw new Error(`Deploy-only pack missing script: scripts/${scriptName}`);
    }
    const original = readFileSync(path, 'utf8');
    let stripped = original.replace(LOCAL_BUILD_COMPOSE_IF_BLOCK, '');
    if (scriptName === 'install.sh') {
      stripped = stripped.replace(LOCAL_BUILD_INSTALL_BUILD_BLOCK, '');
    } else if (scriptName === 'update.sh') {
      stripped = stripped.replace(
        LOCAL_BUILD_UPDATE_BUILD_OR_PULL_BLOCK,
        'docker compose $COMPOSE_FILES pull api web || true\n',
      );
    }
    if (stripped === original || stripped.includes('USE_LOCAL_BUILD')) {
      throw new Error(`Failed to strip local-build branch from scripts/${scriptName}`);
    }
    writeFileSync(path, stripped, 'utf8');
  }
}

function assertDeployOnlyBundle(bundleDir: string): void {
  for (const name of DEPLOY_ONLY_LOCAL_BUILD_ARTIFACTS) {
    if (existsSync(join(bundleDir, name))) {
      throw new Error(`Deploy-only pack must not include ${name}`);
    }
  }

  for (const scriptName of DEPLOY_ONLY_SCRIPTS) {
    const path = join(bundleDir, 'scripts', scriptName);
    if (!existsSync(path)) continue;
    const content = readFileSync(path, 'utf8');
    if (content.includes('USE_LOCAL_BUILD') || content.includes('docker-compose.build.yml')) {
      throw new Error(`Deploy-only scripts/${scriptName} must not reference local build`);
    }
  }
}

function fullSourceQuickstart(domain: string): string {
  return `# Full Source Pack — Quickstart (local Docker build)

This pack includes the application source and Dockerfiles. Build images on the server — no container registry required.

## Install

1. Unzip on your Linux VPS.
2. \`cd movie-streamer/docker/production\`
3. Review \`.env\` (domain **${domain}**, secrets, and optional image tags).
4. Point DNS for **${domain}** to this server.
5. Build and start:

\`\`\`bash
chmod +x scripts/*.sh
USE_LOCAL_BUILD=true ./scripts/install.sh
\`\`\`

The first install may take several minutes while Docker builds API and web images.

6. Open \`https://${domain}/setup\` and complete first-run setup.

## Layout

\`\`\`
movie-streamer/
  docker-compose.build.yml  # Build override (context: pack root)
  apps/api/          # API source + Dockerfile
  apps/web/          # Web source + Dockerfile
  packages/shared/   # Shared types
  docker/production/ # Compose, Caddy, scripts, .env, site.config.yaml
\`\`\`

## Notes

- Local builds use \`docker-compose.build.yml\` at the pack root (\`movie-streamer/\`, build \`context: .\`).
- \`docker/production/docker-compose.build.yml\` includes that file when \`USE_LOCAL_BUILD=true\`.
- \`site.config.yaml\` is imported on first boot via \`SITE_CONFIG_BOOTSTRAP_PATH\`.
`;
}

function prepareDeployOnlyBundle(bundleDir: string, payload: WizardPayload): void {
  const repoRoot = resolveRepoRoot();
  const templateDir = resolveTemplateDir(repoRoot);
  cpSync(templateDir, bundleDir, { recursive: true });

  removeDeployOnlyLocalBuildArtifacts(bundleDir);
  stripLocalBuildFromDeployScripts(bundleDir);

  writeFileSync(join(bundleDir, '.env'), buildEnvContent(payload), 'utf8');
  writeSiteConfig(bundleDir, payload.siteConfig);
  writeFileSync(join(bundleDir, 'README.md'), deployOnlyReadme(), 'utf8');
  writeFileSync(join(bundleDir, 'QUICKSTART.md'), deployOnlyQuickstart(payload.domain), 'utf8');

  assertDeployOnlyBundle(bundleDir);
}

function prepareFullSourceBundle(bundleDir: string, payload: WizardPayload): void {
  const repoRoot = resolveRepoRoot();
  const productionDir = join(bundleDir, 'docker/production');

  mkdirSync(productionDir, { recursive: true });

  for (const file of REPO_SOURCE_ROOT_FILES) {
    const srcFile = join(repoRoot, file);
    if (!existsSync(srcFile)) {
      throw new Error(`Missing repo file for full-source pack: ${file}`);
    }
    cpSync(srcFile, join(bundleDir, file));
  }

  for (const dir of REPO_SOURCE_DIRS) {
    copyDirFiltered(join(repoRoot, dir), join(bundleDir, dir));
  }

  cpSync(join(repoRoot, 'docker/production'), productionDir, { recursive: true });

  writeFileSync(join(productionDir, '.env'), buildEnvContent(payload), 'utf8');
  writeSiteConfig(productionDir, payload.siteConfig);
  writeFileSync(join(productionDir, 'QUICKSTART.md'), fullSourceQuickstart(payload.domain), 'utf8');

  const manifest = [
    '# Full source pack manifest',
    `generatedAt: ${new Date().toISOString()}`,
    `repoRoot: ${repoRoot}`,
    'includes:',
    ...REPO_SOURCE_ROOT_FILES.map((f) => `  - ${f}`),
    ...REPO_SOURCE_DIRS.map((d) => `  - ${d}/`),
    '  - docker/production/',
  ].join('\n');
  writeFileSync(join(bundleDir, 'PACK_MANIFEST.txt'), manifest, 'utf8');

  const requiredPaths = [
    'apps/api/src/index.ts',
    'apps/web/src/main.tsx',
    'packages/shared/src/index.ts',
    'docker-compose.build.yml',
    'docker/production/docker-compose.yml',
    'docker/production/docker-compose.build.yml',
    'docker/production/nginx.conf',
  ];
  for (const rel of requiredPaths) {
    if (!existsSync(join(bundleDir, rel))) {
      throw new Error(`Full-source pack assembly failed: missing ${rel}`);
    }
  }
}

export async function generateDeployPackZip(payload: WizardPayload): Promise<Buffer> {
  const packKind = payload.packKind ?? 'deploy-only';

  const workDir = mkdtempSync(join(tmpdir(), 'deploy-pack-'));
  const bundleDir = join(workDir, 'bundle');

  try {
    mkdirSync(bundleDir, { recursive: true });

    if (packKind === 'full-source') {
      prepareFullSourceBundle(bundleDir, payload);
    } else {
      prepareDeployOnlyBundle(bundleDir, { ...payload, packKind: 'deploy-only' });
    }

    const zipPath = join(workDir, 'deploy-pack.zip');
    const zipRootName = packKind === 'full-source' ? 'movie-streamer' : false;

    await new Promise<void>((resolve, reject) => {
      const output = createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      output.on('close', () => resolve());
      archive.on('error', reject);
      archive.pipe(output);
      if (zipRootName) {
        archive.directory(bundleDir, zipRootName);
      } else {
        archive.directory(bundleDir, false);
      }
      void archive.finalize();
    });

    return readFileSync(zipPath);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

export function suggestedPackFilename(payload: WizardPayload): string {
  const slug = payload.siteConfig.identity.siteName.replace(/\s+/g, '-').toLowerCase();
  const suffix = (payload.packKind ?? 'deploy-only') === 'full-source' ? 'full-source' : 'deploy-pack';
  return `${slug}-${suffix}.zip`;
}
