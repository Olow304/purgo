import { PurgoOptions } from './types';

/**
 * Initialize the redaction engine with patterns and censor function
 */
export function initRedactionEngine(options?: PurgoOptions): void;

/**
 * Redact values in an object, preserving structure
 */
export function redact<T>(value: T): T;

/**
 * Built-in PHI patterns
 */
export const BUILT_IN_PATTERNS: Record<string, RegExp>;
