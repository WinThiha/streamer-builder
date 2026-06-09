import type { ConnectorKind } from '@movie-streamer/shared';
import { isPrototypeMode } from './mode.js';

const PROTOTYPE_ALLOWED_KINDS: ReadonlySet<ConnectorKind> = new Set(['demo']);

export function isConnectorKindAllowedInPrototype(kind: ConnectorKind): boolean {
  if (!isPrototypeMode()) return true;
  return PROTOTYPE_ALLOWED_KINDS.has(kind);
}

export function prototypeConnectorForbiddenMessage(): string {
  return 'Only demo connectors are allowed in prototype mode';
}
