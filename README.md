# Purgo

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Olow304/purgo/main/dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Olow304/purgo/main/light.svg">
    <img alt="Purgo Logo" src="https://raw.githubusercontent.com/Olow304/purgo/main/Purgo.png" width="500" height="200">
  </picture>
</p>

[![npm version](https://img.shields.io/npm/v/purgo.svg)](https://www.npmjs.com/package/purgo)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/purgo)](https://bundlephobia.com/package/purgo)
[![Tests Passing](https://img.shields.io/badge/tests-passing-brightgreen)](https://github.com/Olow304/purgo/actions)
[![CI](https://github.com/Olow304/purgo/actions/workflows/ci.yml/badge.svg)](https://github.com/Olow304/purgo/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dm/purgo.svg)](https://www.npmjs.com/package/purgo)

**Purgo** is a zero-config, client-side log-scrubbing library that prevents Protected Health Information (PHI) from leaking into browser consoles, DevTools, and network debuggers.

- 🔒 **HIPAA-Friendly**: Automatically redacts PHI from logs and network requests
- 🪶 **Lightweight**: < 7 kB gzip
- ⚡ **Fast**: < 3% runtime overhead
- 🔌 **Zero-Config**: Works out-of-the-box with React, Next.js, Vue, and vanilla JS
- 🧩 **Extensible**: Add custom patterns and redaction strategies

## Installation

```bash
npm install purgo
# or
yarn add purgo
# or
pnpm add purgo
```

## Quick Start

### Browser (Zero-Config)

```js
// Just import it - that's it!
import 'purgo';

// Now all console logs and network requests will be automatically scrubbed
console.log('Patient email: patient@example.com'); // Outputs: "Patient email: ***"
```

### Custom Configuration

```js
import { purgo } from 'purgo';

purgo({
  targets: ['console', 'fetch', 'xhr'],
  patterns: ['email', 'ssn', /\b\d{7,8}-[A-Z]{2}\b/], // Built-in + custom patterns
  censor: (match) => '[REDACTED]' + match.slice(-2)   // Custom redaction
});
```

### Direct Redaction Helper

```js
import { redact } from 'purgo';

const patientData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  ssn: '123-45-6789'
};

const safeData = redact(patientData);
// Result: { name: 'John Doe', email: '***', ssn: '***' }
```

### Core Module (No Auto-Patching)

If you want just the redaction functionality without any automatic patching of global objects:

```js
import { redact, initRedactionEngine } from 'purgo/core';

// Optional: customize the redaction engine
initRedactionEngine({
  patterns: ['email', 'phone', 'ssn', /\b[A-Z]{2}-\d{6}\b/g],
  censor: (match) => `[REDACTED-${match.slice(-2)}]`
});

// Explicitly redact values
const email = "patient@example.com";
console.log(redact(email)); // Outputs: "[REDACTED-om]"
```

### Node.js Support

```js
// Auto-patch process.stdout
import 'purgo/node';

// Direct use with console.log or process.stdout.write
console.log('Patient email: patient@example.com'); // Outputs: "Patient email: ***"
process.stdout.write('SSN: 123-45-6789\n');       // Outputs: "SSN: ***"
```

#### Node.js with Custom Configuration

For more control, you can combine the auto-patching with custom configuration:

```js
// Use the Node.js module for auto-patching
import 'purgo/node';
// Import the core module for custom configuration
import { initRedactionEngine } from 'purgo/core';

// Configure the redaction engine with custom patterns and redaction style
initRedactionEngine({
  patterns: ['email', 'ssn', /\b\d{7,8}-[A-Z]{2}\b/], // Built-in + custom patterns
  censor: (match) => '[REDACTED]' + match.slice(-2)   // Custom redaction style
});

// Test with various sensitive data
const email = 'test@test.com';
const ssn = '123456789';

console.log("Email: ", email);  // Outputs: "Email: [REDACTED]om"
console.log("SSN: ", ssn);      // Outputs: "SSN: [REDACTED]89"
```

### Express Integration

```js
// app.js
import express from 'express';
import 'purgo/node';
import { initRedactionEngine } from 'purgo/core';

// Configure Purgo with custom patterns and redaction
initRedactionEngine({
  patterns: ['email', 'ssn', 'phone', /\b\d{7,8}-[A-Z]{2}\b/],
  censor: (match) => '[REDACTED]' + match.slice(-2)
});

const app = express();
app.use(express.json());

// Example route that handles PHI
app.post('/api/patient', (req, res) => {
  // PHI in request body will be automatically redacted in logs
  console.log('Received patient data:', req.body);

  // Process the data (using the original, unredacted data)
  const patientId = savePatient(req.body);

  // Log with PHI (will be automatically redacted)
  console.log(`Created patient with email ${req.body.email}`);

  res.json({ success: true, patientId });
});

// Server logs will show:
// Received patient data: { name: 'Jane Doe', email: '[REDACTED]om', ssn: '[REDACTED]21' }
// Created patient with email [REDACTED]om
```

### Pino Logger Integration

[Pino](https://github.com/pinojs/pino) is a popular structured logger for Node.js that's commonly used in healthcare applications. Purgo provides a dedicated integration:

```js
import { pinoRedactor } from 'purgo/node';
import pino from 'pino';

const logger = pino({
  redact: pinoRedactor({
    paths: ['req.body.ssn', 'req.body.email', 'patient.mrn']
  })
});

// Logs will have PHI automatically redacted
logger.info({
  req: { body: { email: 'patient@example.com' } }
});
```

## Framework Integration Examples

### React

```jsx
// In your entry file (e.g., main.jsx or index.jsx)
import 'purgo';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Next.js 14

```jsx
// app/layout.tsx
import 'purgo';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Purgo v0.1.2+ includes special handling for Next.js environments to ensure compatibility with the App Router and Server Components architecture.

### Vue 3

```js
// main.js
import 'purgo';
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
```

### Vanilla JS (via script tag)

```html
<script src="https://unpkg.com/purgo/dist/index.global.js"></script>
<script>
  // Purgo is automatically initialized
  console.log('Patient SSN: 123-45-6789'); // Outputs: "Patient SSN: ***"
</script>
```

## API Reference

### `purgo(options?)`

Initializes Purgo with custom options.

```ts
interface PurgoOptions {
  targets?: Array<'console' | 'fetch' | 'xhr'>;
  patterns?: Array<RegExp | string>;
  censor?: (match: string) => string;
  hashMode?: boolean;
}
```

> **Note**: When using ES modules, we recommend using the auto-patching import (`import 'purgo'`) or the combined approach with `import 'purgo/node'` and `import { initRedactionEngine } from 'purgo/core'` rather than the named import (`import { purgo } from 'purgo'`), which may cause issues in some environments.

- **targets**: Array of targets to patch (default: `['console', 'fetch', 'xhr']`)
- **patterns**: Array of built-in pattern names or custom RegExp objects (default: `['email', 'phone', 'ssn', 'mrn', 'icd10']`)
- **censor**: Function to transform matched content (default: `() => '***'`)
- **hashMode**: Enable SHA-256 hashing of censored tokens for correlation (default: `false`)

### Built-in Patterns

- **email**: Email addresses
- **phone**: Phone numbers in various formats
- **ssn**: Social Security Numbers
- **mrn**: Medical Record Numbers
- **icd10**: ICD-10 diagnosis codes

### `redact(value)`

Redacts PHI from any value while preserving structure.

```ts
function redact<T>(value: T): T;
```

### Core Module: `import from 'purgo/core'`

The core module provides just the redaction functionality without any automatic patching of global objects.

```ts
import { redact, initRedactionEngine } from 'purgo/core';
```

This is useful when:

- You want more control over what gets redacted
- You want to avoid patching global objects
- You're using a framework that doesn't work well with patched globals
- You need to customize the redaction behavior extensively

As of v0.1.2, all modules include full TypeScript declarations for improved developer experience.

### Node.js: `pinoRedactor(options)`

Creates a redactor for use with Pino logger.

```ts
interface PinoRedactorOptions {
  paths: string[];
  additionalPatterns?: Array<RegExp | string>;
  censor?: (match: string) => string;
}
```

## Performance

Purgo is designed to be lightweight and fast:

- **Bundle Size**: < 7 kB gzip
- **Runtime Overhead**: < 3% compared to raw operations
- **Redaction Speed**: ≤ 40 µs to redact a 5 kB string on M1 2.8 GHz

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute to this project.

## License

MIT License - see [LICENSE](./LICENSE) for details.

A ready-to-sign Business Associate Agreement (BAA) template is available in the [legal](./legal) directory.
