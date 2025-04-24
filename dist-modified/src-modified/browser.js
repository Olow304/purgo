import { redact } from '../src/redact';
// Store original methods
const originalConsole = {};
const originalFetch = typeof window !== 'undefined' ? window.fetch : undefined;
const originalXHROpen = typeof XMLHttpRequest !== 'undefined'
    ? XMLHttpRequest.prototype.open
    : undefined;
const originalXHRSend = typeof XMLHttpRequest !== 'undefined'
    ? XMLHttpRequest.prototype.send
    : undefined;
/**
 * Patch console methods to redact PHI
 */
function patchConsole() {
    if (typeof console === 'undefined')
        return;
    // Methods to patch
    const methodsToPatch = [
        'log', 'info', 'warn', 'error', 'debug', 'trace'
    ];
    methodsToPatch.forEach(method => {
        // Type assertion to handle indexing console with string keys
        if (typeof console[method] !== 'function')
            return;
        // Store original method
        originalConsole[method] = console[method];
        // Replace with redacted version
        console[method] = function (...args) {
            const redactedArgs = args.map(arg => redact(arg));
            return originalConsole[method].apply(console, redactedArgs);
        };
    });
}
/**
 * Patch fetch to redact PHI in requests
 */
function patchFetch() {
    if (typeof window === 'undefined' || !window.fetch)
        return;
    window.fetch = function (input, init) {
        // Clone and redact the init object if it exists
        let redactedInit;
        if (init) {
            redactedInit = { ...init };
            // Redact body if it exists
            if (init.body) {
                if (typeof init.body === 'string') {
                    redactedInit.body = redact(init.body);
                }
                else if (init.body instanceof FormData ||
                    init.body instanceof URLSearchParams ||
                    init.body instanceof Blob ||
                    init.body instanceof ArrayBuffer) {
                    // For complex types, we'd need more sophisticated handling
                    // This is a simplified approach
                    redactedInit.body = init.body;
                }
                else {
                    // For other types, try to stringify and redact
                    try {
                        const bodyStr = JSON.stringify(init.body);
                        const redactedBodyStr = redact(bodyStr);
                        redactedInit.body = JSON.parse(redactedBodyStr);
                    }
                    catch (e) {
                        redactedInit.body = init.body;
                    }
                }
            }
            // Redact headers if they exist
            if (init.headers) {
                if (init.headers instanceof Headers) {
                    redactedInit.headers = new Headers();
                    init.headers.forEach((value, key) => {
                        redactedInit.headers.append(key, redact(value));
                    });
                }
                else if (Array.isArray(init.headers)) {
                    // Ensure we return the correct type for headers array
                    redactedInit.headers = init.headers.map(entry => {
                        if (entry.length >= 2) {
                            const [key, value] = entry;
                            return [key, typeof value === 'string' ? redact(value) : value];
                        }
                        return entry;
                    });
                }
                else {
                    // Handle record object headers
                    redactedInit.headers = {};
                    for (const key in init.headers) {
                        redactedInit.headers[key] =
                            redact(init.headers[key]);
                    }
                }
            }
        }
        // Handle URL redaction if it's a string
        let redactedInput = input;
        if (typeof input === 'string') {
            try {
                const url = new URL(input, window.location.origin);
                url.search = redact(url.search);
                redactedInput = url.toString();
            }
            catch (e) {
                // If URL parsing fails, use the original
                redactedInput = input;
            }
        }
        // Call original fetch with redacted parameters
        return originalFetch.call(window, redactedInput, redactedInit);
    };
}
/**
 * Patch XMLHttpRequest to redact PHI
 */
function patchXHR() {
    if (typeof XMLHttpRequest === 'undefined')
        return;
    // Patch open method to capture URL
    XMLHttpRequest.prototype.open = function (method, url, async = true, username, password) {
        // Redact URL if it's a string
        let redactedUrl = url;
        if (typeof url === 'string') {
            try {
                const urlObj = new URL(url, window.location.origin);
                urlObj.search = redact(urlObj.search);
                redactedUrl = urlObj.toString();
            }
            catch (e) {
                redactedUrl = url;
            }
        }
        return originalXHROpen.call(this, method, redactedUrl, async, username, password);
    };
    // Patch send method to redact request body
    XMLHttpRequest.prototype.send = function (body) {
        let redactedBody = body;
        if (body) {
            if (typeof body === 'string') {
                redactedBody = redact(body);
            }
            else if (body instanceof FormData ||
                body instanceof URLSearchParams ||
                body instanceof Blob ||
                body instanceof ArrayBuffer) {
                // For complex types, we'd need more sophisticated handling
                redactedBody = body;
            }
            else {
                // For other types, try to stringify and redact
                try {
                    const bodyStr = JSON.stringify(body);
                    const redactedBodyStr = redact(bodyStr);
                    redactedBody = JSON.parse(redactedBodyStr);
                }
                catch (e) {
                    redactedBody = body;
                }
            }
        }
        return originalXHRSend.call(this, redactedBody);
    };
}
/**
 * Initialize browser patches
 */
export function initBrowserPatches(options = {}) {
    const targets = options.targets || ['console', 'fetch', 'xhr'];
    if (targets.includes('console')) {
        patchConsole();
    }
    if (targets.includes('fetch') && typeof window !== 'undefined') {
        patchFetch();
    }
    if (targets.includes('xhr') && typeof XMLHttpRequest !== 'undefined') {
        patchXHR();
    }
}
