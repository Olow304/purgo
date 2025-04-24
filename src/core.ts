import { Pattern, CensorFunction, PurgoOptions } from './types';

// Built-in PHI patterns
const BUILT_IN_PATTERNS: Record<string, RegExp> = {
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // Phone numbers (various formats)
  phone: /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
  
  // Social Security Numbers
  ssn: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g,
  
  // Medical Record Numbers (generic pattern, can be customized)
  mrn: /\b\d{6,10}\b/g,
  
  // ICD-10 codes
  icd10: /\b[A-Z]\d{2}(\.[A-Z0-9]{1,4})?\b/g
};

// Default censor function
const DEFAULT_CENSOR: CensorFunction = () => '***';

// Global configuration
let globalConfig: {
  patterns: RegExp[];
  censor: CensorFunction;
} = {
  patterns: [],
  censor: DEFAULT_CENSOR
};

/**
 * Initialize the redaction engine with patterns and censor function
 */
export function initRedactionEngine(options: PurgoOptions = {}): void {
  const patterns = options.patterns || ['email', 'phone', 'ssn', 'mrn', 'icd10'];
  
  // Convert string patterns to RegExp objects
  const regexPatterns = patterns.map(pattern => {
    if (typeof pattern === 'string') {
      return BUILT_IN_PATTERNS[pattern] || new RegExp(pattern, 'g');
    }
    return pattern;
  });
  
  globalConfig = {
    patterns: regexPatterns,
    censor: options.censor || DEFAULT_CENSOR
  };
}

/**
 * Apply redaction to a string value
 */
export function redactString(value: string): string {
  if (typeof value !== 'string') return value;
  
  let result = value;
  
  for (const patternTemplate of globalConfig.patterns) {
    // Create a fresh copy of the RegExp to avoid lastIndex issues
    const pattern = new RegExp(patternTemplate.source, patternTemplate.flags);
    result = result.replace(pattern, match => globalConfig.censor(match));
  }
  
  return result;
}

/**
 * Redact values in an object, preserving structure
 */
export function redact<T>(value: T): T {
  // Handle primitives
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') {
    return typeof value === 'string' ? redactString(value) as unknown as T : value;
  }
  
  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(item => redact(item)) as unknown as T;
  }
  
  // Handle objects
  const result = {} as Record<string, any>;
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      result[key] = redact((value as Record<string, any>)[key]);
    }
  }
  
  return result as T;
}

// Initialize with default settings
initRedactionEngine();

export { BUILT_IN_PATTERNS };
