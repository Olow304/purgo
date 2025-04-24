# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.4] - 2024-04-24

### Added

- Added badges to README: Tests Passing, TypeScript support, and npm downloads
- Added GitHub Actions for CI/CD
- Added contributing guidelines and templates

## [0.1.3] - 2024-04-24

### Documentation

- Express integration example in README
- Expanded Node.js documentation with combined approach using `purgo/node` and `initRedactionEngine`
- Added note about named import issues and recommended approaches

## [0.1.2] - 2024-04-23

### Improvements

- Full TypeScript declaration files for all modules, including core
- Improved Next.js compatibility with special handling for App Router and Server Components
- Better error handling and fallbacks for edge cases

### Fixed

- Fixed issues with fetch patching in Next.js environments
- Improved console patching to avoid conflicts with framework internals

## [0.1.1] - 2024-04-22

### Changes

- Published package to npm
- Added core module exports

## [0.1.0] - 2024-04-20

### Initial Release

- Initial release of Purgo.js
- Core redaction engine with built-in PHI patterns (email, phone, SSN, MRN, ICD-10)
- Browser patches for console methods, fetch, and XMLHttpRequest
- Node.js adapter with process.stdout patching and Pino integration
- TypeScript definitions and ESM/CJS dual package support
- Comprehensive test suite with Vitest
- Performance benchmarking tools
