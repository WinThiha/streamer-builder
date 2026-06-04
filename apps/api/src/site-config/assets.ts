import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { env } from '../env.js';

export const SITE_LOGO_ASSET_ID = 'logo';
export const SITE_LOGO_PUBLIC_PATH = `/v1/site/assets/${SITE_LOGO_ASSET_ID}`;

const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export function ensureUploadDir(): string {
  const dir = resolve(env.UPLOAD_DIR, 'site');
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function validateLogoMime(mime: string): string | null {
  return ALLOWED_MIME_TO_EXT[mime] ?? null;
}

export function saveLogoFile(buffer: Buffer, ext: string): void {
  const dir = ensureUploadDir();
  const filePath = join(dir, `${SITE_LOGO_ASSET_ID}.${ext}`);
  writeFileSync(filePath, buffer);
}

export function readLogoFile(): { buffer: Buffer; contentType: string } | null {
  const dir = resolve(env.UPLOAD_DIR, 'site');
  for (const ext of ['png', 'jpg', 'webp']) {
    const filePath = join(dir, `${SITE_LOGO_ASSET_ID}.${ext}`);
    if (!existsSync(filePath)) continue;
    const contentType =
      ext === 'png' ? 'image/png' : ext === 'jpg' ? 'image/jpeg' : 'image/webp';
    return { buffer: readFileSync(filePath), contentType };
  }
  return null;
}

export function resolveAssetPath(assetId: string): string | null {
  if (assetId !== SITE_LOGO_ASSET_ID) return null;
  const dir = resolve(env.UPLOAD_DIR, 'site');
  for (const ext of ['png', 'jpg', 'webp']) {
    const filePath = join(dir, `${SITE_LOGO_ASSET_ID}.${ext}`);
    if (existsSync(filePath)) return filePath;
  }
  return null;
}

export function getLogoContentType(filePath: string): string {
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg')) return 'image/jpeg';
  return 'image/webp';
}

export function ensureUploadDirOnBoot(): void {
  mkdirSync(dirname(resolve(env.UPLOAD_DIR)), { recursive: true });
  ensureUploadDir();
}
