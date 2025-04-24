import { PurgoOptions, PinoRedactorOptions } from './types';

/**
 * Initialize Node.js patches
 */
export function initNodePatches(options?: PurgoOptions): void;

/**
 * Create a Pino redactor function
 */
export function pinoRedactor(options: PinoRedactorOptions): {
  paths: string[];
  censor: (value: any) => any;
};

/**
 * Redact values in an object, preserving structure
 */
export function redact<T>(value: T): T;
