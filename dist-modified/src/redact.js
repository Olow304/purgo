// Built-in PHI patterns
const BUILT_IN_PATTERNS = {
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
const DEFAULT_CENSOR = () => '***';
// Global configuration
let globalConfig = {
    patterns: [],
    censor: DEFAULT_CENSOR,
    hashMode: false
};
/**
 * Initialize the redaction engine with patterns and censor function
 */
export function initRedactionEngine(options = {}) {
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
        censor: options.censor || DEFAULT_CENSOR,
        hashMode: options.hashMode || false
    };
}
/**
 * Hash a string using SHA-256 (browser-compatible)
 * This is a simple implementation for demo purposes
 */
async function hashString(str) {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback for environments without crypto
    return str;
}
/**
 * Apply redaction to a string value
 */
function redactString(value) {
    if (typeof value !== 'string')
        return value;
    // Fast path: check if the string might contain PHI before doing replacements
    let hasPotentialPHI = false;
    for (const pattern of globalConfig.patterns) {
        if (pattern.test(value)) {
            hasPotentialPHI = true;
            break;
        }
    }
    if (!hasPotentialPHI) {
        return value;
    }
    // Apply redaction
    let result = value;
    for (const pattern of globalConfig.patterns) {
        // Reset the lastIndex to ensure we start from the beginning
        pattern.lastIndex = 0;
        result = result.replace(pattern, (match) => {
            if (globalConfig.hashMode) {
                // In hash mode, we'd ideally use async/await, but for simplicity
                // we're using a synchronous approach here
                const hash = match.split('').reduce((a, b) => {
                    const hashCode = a.charCodeAt(0) ^ b.charCodeAt(0);
                    return String.fromCharCode(hashCode);
                }, '\0');
                return `[HASH:${hash}]`;
            }
            return globalConfig.censor(match);
        });
    }
    return result;
}
/**
 * Check if an object is a DOM node
 */
function isDOMNode(obj) {
    return typeof Node === 'object'
        ? obj instanceof Node
        : obj && typeof obj === 'object' && typeof obj.nodeType === 'number';
}
/**
 * Redact values in an object, preserving structure
 */
export function redact(value, seen = new WeakSet()) {
    // Fast path for primitives
    if (value === null || value === undefined)
        return value;
    if (typeof value !== 'object') {
        return typeof value === 'string' ? redactString(value) : value;
    }
    // Handle DOM nodes (don't try to traverse them)
    if (isDOMNode(value))
        return value;
    // Handle circular references
    if (seen.has(value))
        return value;
    seen.add(value);
    // Fast path for arrays
    if (Array.isArray(value)) {
        // Quick check for primitive-only arrays (common case)
        let hasCircularRefs = false;
        const length = value.length;
        // For test compatibility, we'll always process arrays with strings
        // This ensures consistent behavior with the tests
        // Process the array
        const result = new Array(length);
        for (let i = 0; i < length; i++) {
            const item = value[i];
            if (item === value) {
                result[i] = null; // Temporary placeholder
            }
            else {
                result[i] = redact(item, seen);
            }
        }
        // Fix circular references
        if (hasCircularRefs) {
            for (let i = 0; i < length; i++) {
                if (value[i] === value) {
                    result[i] = result;
                }
            }
        }
        return result;
    }
    // Quick check for objects with primitive values only
    let hasPrimitiveOnly = true;
    let hasCircularRefs = false;
    let hasPHI = false;
    for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
            const propValue = value[key];
            if (propValue === value) {
                hasCircularRefs = true;
                hasPrimitiveOnly = false;
                break;
            }
            if (propValue !== null && typeof propValue === 'object') {
                hasPrimitiveOnly = false;
                break;
            }
            if (typeof propValue === 'string' && containsPHI(propValue)) {
                hasPHI = true;
                break;
            }
        }
    }
    // If object contains only primitives without PHI, return it as is
    if (hasPrimitiveOnly && !hasPHI) {
        return value;
    }
    // Handle objects
    const result = {};
    const circularKeys = [];
    // First pass: redact all properties
    for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
            const propValue = value[key];
            if (propValue === value) {
                hasCircularRefs = true;
                circularKeys.push(key);
                result[key] = null; // Temporary placeholder
            }
            else {
                result[key] = redact(propValue, seen);
            }
        }
    }
    // Second pass: fix circular references
    if (hasCircularRefs) {
        for (const key of circularKeys) {
            result[key] = result;
        }
    }
    return result;
}
/**
 * Quick check if a string might contain PHI
 */
function containsPHI(value) {
    for (const pattern of globalConfig.patterns) {
        if (pattern.test(value)) {
            return true;
        }
    }
    return false;
}
// Initialize with default settings
initRedactionEngine();
export { BUILT_IN_PATTERNS };
