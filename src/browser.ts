import { redact } from './redact';
import { PurgoOptions } from './types';

// Store original methods
const originalConsole: Record<string, Function> = {};
// We'll store fetch directly in the patchFetch function
const originalXHROpen = typeof XMLHttpRequest !== 'undefined'
  ? XMLHttpRequest.prototype.open
  : undefined;
const originalXHRSend = typeof XMLHttpRequest !== 'undefined'
  ? XMLHttpRequest.prototype.send
  : undefined;

/**
 * Patch console methods to redact PHI
 */
function patchConsole(): void {
  if (typeof console === 'undefined') return;

  // Methods to patch
  const methodsToPatch = [
    'log', 'info', 'warn', 'error', 'debug', 'trace'
  ] as const;

  // Check if we're in a Next.js environment
  const isNextJs = typeof window !== 'undefined' &&
                  (window as any).__NEXT_DATA__ !== undefined;

  // Special handling for Next.js
  if (isNextJs) {
    // In Next.js, we need to be more careful about patching console
    // because it might be used by the framework itself
    console.info('Purgo: Detected Next.js environment, using compatible patching mode');
  }

  methodsToPatch.forEach(method => {
    // Type assertion to handle indexing console with string keys
    if (typeof (console as Record<string, any>)[method] !== 'function') return;

    // Store original method
    originalConsole[method] = (console as Record<string, any>)[method];

    // Replace with redacted version
    (console as Record<string, any>)[method] = function(...args: any[]) {
      try {
        // Skip redaction for internal Next.js logs in development
        if (isNextJs &&
            args.length > 0 &&
            typeof args[0] === 'string' &&
            (args[0].includes('[HMR]') ||
             args[0].includes('[Fast Refresh]') ||
             args[0].includes('[webpack]'))) {
          return originalConsole[method].apply(console, args);
        }

        const redactedArgs = args.map(arg => redact(arg));
        return originalConsole[method].apply(console, redactedArgs);
      } catch (e) {
        // If redaction fails, fall back to original behavior
        console.error('Purgo: Error during redaction, falling back to original behavior', e);
        return originalConsole[method].apply(console, args);
      }
    };
  });
}

/**
 * Patch fetch to redact PHI in requests
 */
function patchFetch(): void {
  if (typeof window === 'undefined' || !window.fetch) return;

  // Check if we're in a Next.js environment
  const isNextJs = typeof window !== 'undefined' &&
                  (window as any).__NEXT_DATA__ !== undefined;

  // Store the original fetch
  const origFetch = window.fetch;

  window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    try {
      // Skip redaction for Next.js internal requests
      if (isNextJs) {
        const inputUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : '';
        if (inputUrl.includes('/_next/') ||
            inputUrl.includes('/__nextjs_original-stack-frame') ||
            inputUrl.includes('/__webpack_hmr') ||
            inputUrl.includes('/_error')) {
          return origFetch.call(window, input, init);
        }
      }

      // Clone and redact the init object if it exists
      let redactedInit: RequestInit | undefined;

      if (init) {
        redactedInit = { ...init };

        // Redact body if it exists
        if (init.body) {
          if (typeof init.body === 'string') {
            redactedInit.body = redact(init.body);
          } else if (init.body instanceof FormData ||
                    init.body instanceof URLSearchParams ||
                    init.body instanceof Blob ||
                    init.body instanceof ArrayBuffer) {
            // For complex types, we'd need more sophisticated handling
            // This is a simplified approach
            redactedInit.body = init.body;
          } else {
            // For other types, try to stringify and redact
            try {
              const bodyStr = JSON.stringify(init.body);
              const redactedBodyStr = redact(bodyStr);
              redactedInit.body = JSON.parse(redactedBodyStr);
            } catch (e) {
              redactedInit.body = init.body;
            }
          }
        }

        // Redact headers if they exist
        if (init.headers) {
          if (init.headers instanceof Headers) {
            redactedInit.headers = new Headers();
            init.headers.forEach((value, key) => {
              (redactedInit!.headers as Headers).append(key, redact(value));
            });
          } else if (Array.isArray(init.headers)) {
            // Ensure we return the correct type for headers array
            redactedInit.headers = init.headers.map(entry => {
              if (entry.length >= 2) {
                const [key, value] = entry;
                return [key, typeof value === 'string' ? redact(value) : value] as [string, string];
              }
              return entry as [string, string];
            });
          } else {
            // Handle record object headers
            redactedInit.headers = {} as Record<string, string>;
            for (const key in init.headers) {
              (redactedInit.headers as Record<string, string>)[key] =
                redact((init.headers as Record<string, string>)[key]);
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
        } catch (e) {
          // If URL parsing fails, use the original
          redactedInput = input;
        }
      }

      // Call original fetch with redacted parameters
      return origFetch.call(window, redactedInput, redactedInit);
    } catch (e) {
      console.error('Purgo: Error during fetch redaction, falling back to original behavior', e);
      return origFetch.call(window, input, init);
    }
  };
}

/**
 * Patch XMLHttpRequest to redact PHI
 */
function patchXHR(): void {
  if (typeof XMLHttpRequest === 'undefined') return;

  // Patch open method to capture URL
  XMLHttpRequest.prototype.open = function(
    method: string,
    url: string | URL,
    async: boolean = true,
    username?: string | null,
    password?: string | null
  ): void {
    // Redact URL if it's a string
    let redactedUrl = url;
    if (typeof url === 'string') {
      try {
        const urlObj = new URL(url, window.location.origin);
        urlObj.search = redact(urlObj.search);
        redactedUrl = urlObj.toString();
      } catch (e) {
        redactedUrl = url;
      }
    }

    return originalXHROpen!.call(
      this,
      method,
      redactedUrl,
      async,
      username,
      password
    );
  };

  // Patch send method to redact request body
  XMLHttpRequest.prototype.send = function(body?: Document | XMLHttpRequestBodyInit | null): void {
    let redactedBody = body;

    if (body) {
      if (typeof body === 'string') {
        redactedBody = redact(body);
      } else if (body instanceof FormData ||
                body instanceof URLSearchParams ||
                body instanceof Blob ||
                body instanceof ArrayBuffer) {
        // For complex types, we'd need more sophisticated handling
        redactedBody = body;
      } else {
        // For other types, try to stringify and redact
        try {
          const bodyStr = JSON.stringify(body);
          const redactedBodyStr = redact(bodyStr);
          redactedBody = JSON.parse(redactedBodyStr);
        } catch (e) {
          redactedBody = body;
        }
      }
    }

    return originalXHRSend!.call(this, redactedBody);
  };
}

/**
 * Initialize browser patches
 */
export function initBrowserPatches(options: PurgoOptions = {}): void {
  const targets = options.targets || ['console', 'fetch', 'xhr'];

  // Always apply console patching if it's in the targets
  if (targets.includes('console')) {
    patchConsole();
  }

  // Only apply fetch and XHR patching in browser environments
  if (typeof window !== 'undefined') {
    if (targets.includes('fetch')) {
      patchFetch();
    }

    if (targets.includes('xhr')) {
      patchXHR();
    }
  }
}
