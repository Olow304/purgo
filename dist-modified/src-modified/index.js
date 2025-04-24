import { initRedactionEngine, redact } from '../src/redact';
import { initBrowserPatches } from '../src/browser';
/**
 * Main Purgo initialization function
 */
export function purgo(options = {}) {
    // Initialize redaction engine
    initRedactionEngine(options);
    // Initialize browser patches (force console patching even in Node.js)
    initBrowserPatches(options);
}
// Auto-initialize with default settings when imported
purgo();
// Export redact function for direct use
export { redact };
// Export types
export * from '../src/types';
