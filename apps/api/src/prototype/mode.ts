import { env } from '../env.js';

export function isPrototypeMode(): boolean {
  return env.APP_MODE === 'prototype';
}
