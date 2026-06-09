import { mkdtempSync, rmSync, readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';

// Run via: node --import tsx src/pack-generator/verify-integration.mjs
const { generateDeployPackZip } = await import('./generate.ts');
const { defaultSiteConfig } = await import('@movie-streamer/shared');

const payload = {
  domain: 'example.com',
  siteConfig: defaultSiteConfig,
  packKind: 'deploy-only',
  imageTag: 'latest',
};

const workDir = mkdtempSync(join(tmpdir(), 'pack-verify-'));
try {
  for (const kind of ['deploy-only', 'full-source']) {
    const buf = await generateDeployPackZip({ ...payload, packKind: kind });
    const zipPath = join(workDir, `${kind}.zip`);
    const extractDir = join(workDir, kind);
    writeFileSync(zipPath, buf);
    mkdirSync(extractDir, { recursive: true });
    execSync(`tar -xf "${zipPath}" -C "${extractDir}"`, { shell: true, stdio: 'pipe' });

    const root = kind === 'full-source' ? join(extractDir, 'movie-streamer') : extractDir;
    const prod = kind === 'full-source' ? join(root, 'docker/production') : root;

    if (kind === 'deploy-only') {
      if (existsSync(join(root, 'docker-compose.build.yml'))) {
        throw new Error('deploy-only: root docker-compose.build.yml present');
      }
      for (const script of ['install.sh', 'update.sh']) {
        const content = readFileSync(join(prod, 'scripts', script), 'utf8');
        if (content.includes('USE_LOCAL_BUILD') || content.includes('docker-compose.build.yml')) {
          throw new Error(`deploy-only: scripts/${script} still references local build`);
        }
      }
      const readme = readFileSync(join(root, 'README.md'), 'utf8');
      const quickstart = readFileSync(join(root, 'QUICKSTART.md'), 'utf8');
      if (readme.includes('USE_LOCAL_BUILD') || quickstart.includes('USE_LOCAL_BUILD')) {
        throw new Error('deploy-only: docs still reference USE_LOCAL_BUILD');
      }
      console.log('deploy-only: OK');
    } else {
      if (!existsSync(join(root, 'docker-compose.build.yml'))) {
        throw new Error('full-source: missing root docker-compose.build.yml');
      }
      if (!existsSync(join(prod, 'docker-compose.build.yml'))) {
        throw new Error('full-source: missing nested docker-compose.build.yml');
      }
      const nested = readFileSync(join(prod, 'docker-compose.build.yml'), 'utf8');
      if (!nested.includes('../../docker-compose.build.yml')) {
        throw new Error('full-source: nested include path wrong');
      }
      console.log('full-source: OK');
    }
  }
  console.log('ALL CHECKS PASSED');
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
