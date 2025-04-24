import { redact, initRedactionEngine, BUILT_IN_PATTERNS } from './redact';
import { PurgoOptions, PinoRedactorOptions, Pattern } from './types';

// Store original write method
let originalStdoutWrite: Function | null = null;

/**
 * Patch process.stdout to redact PHI
 */
function patchStdout(): void {
  if (typeof process === 'undefined' || !process.stdout) return;
  
  // Store original write method
  originalStdoutWrite = process.stdout.write;
  
  // Replace with redacted version
  process.stdout.write = function(
    buffer: string | Uint8Array, 
    encoding?: BufferEncoding | ((err?: Error) => void), 
    callback?: (err?: Error) => void
  ): boolean {
    // Handle different function signatures
    if (typeof encoding === 'function') {
      callback = encoding;
      encoding = undefined;
    }
    
    // Redact the buffer if it's a string
    let redactedBuffer: string | Uint8Array = buffer;
    if (typeof buffer === 'string') {
      redactedBuffer = redact(buffer);
    }
    
    // Call original write with redacted buffer
    return originalStdoutWrite!.call(
      process.stdout, 
      redactedBuffer, 
      encoding as BufferEncoding, 
      callback
    );
  };
}

/**
 * Create a Pino redactor function
 */
export function pinoRedactor(options: PinoRedactorOptions): {
  paths: string[];
  censor: (value: any) => any;
} {
  const { paths, additionalPatterns = [], censor } = options;
  
  // Combine built-in patterns with additional patterns
  const allPatterns: Pattern[] = [
    'email', 'phone', 'ssn', 'mrn', 'icd10',
    ...additionalPatterns
  ];
  
  // Initialize redaction engine with combined patterns
  initRedactionEngine({
    patterns: allPatterns,
    censor
  });
  
  return {
    paths,
    censor: (value: any) => redact(value)
  };
}

/**
 * Initialize Node.js patches
 */
export function initNodePatches(options: PurgoOptions = {}): void {
  // Initialize redaction engine
  initRedactionEngine(options);
  
  // Patch stdout
  patchStdout();
}

// Auto-initialize when imported
initNodePatches();

export { redact };
