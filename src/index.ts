import { initRedactionEngine, redact } from './redact';
import { initBrowserPatches } from './browser';
import { PurgoOptions } from './types';

/**
 * Main Purgo initialization function
 */
export function purgo(options: PurgoOptions = {}): void {
  // Initialize redaction engine
  initRedactionEngine(options);

  // Initialize browser patches (always apply console patching)
  initBrowserPatches(options);
}

// Auto-initialize with default settings when imported
purgo();

// Export redact function for direct use
export { redact };

// Export types
export * from './types';
