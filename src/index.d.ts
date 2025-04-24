import { PurgoOptions } from './types';

/**
 * Main Purgo initialization function
 */
export function purgo(options?: PurgoOptions): void;

/**
 * Redact values in an object, preserving structure
 */
export function redact<T>(value: T): T;

export * from './types';
