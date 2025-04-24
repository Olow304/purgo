/**
 * Pattern can be a RegExp or a string key for built-in patterns
 */
export type Pattern = RegExp | string;

/**
 * Function to censor matched content
 */
export type CensorFunction = (match: string) => string;

/**
 * Configuration options for Purgo
 */
export interface PurgoOptions {
  /**
   * Targets to patch
   * @default ['console', 'fetch', 'xhr']
   */
  targets?: Array<'console' | 'fetch' | 'xhr'>;
  
  /**
   * Patterns to match for redaction
   * Built-in patterns: 'email', 'phone', 'ssn', 'mrn', 'icd10'
   * @default ['email', 'phone', 'ssn', 'mrn', 'icd10']
   */
  patterns?: Pattern[];
  
  /**
   * Function to censor matched content
   * @default (match) => '***'
   */
  censor?: CensorFunction;
  
  /**
   * Enable SHA-256 hashing of censored tokens for correlation
   * @default false
   */
  hashMode?: boolean;
}

/**
 * Options for Pino redactor
 */
export interface PinoRedactorOptions {
  /**
   * Paths to redact in Pino logs
   */
  paths: string[];
  
  /**
   * Additional patterns beyond the default PHI patterns
   */
  additionalPatterns?: Pattern[];
  
  /**
   * Custom censor function
   */
  censor?: CensorFunction;
}
