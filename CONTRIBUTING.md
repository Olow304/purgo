# Contributing to Purgo

Thank you for considering contributing to Purgo! This document outlines the process for contributing to the project.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project.

## How to Contribute

1. Fork the repository
2. Create a new branch for your feature or bugfix
3. Make your changes
4. Run tests to ensure your changes don't break existing functionality
5. Submit a pull request

## Development Setup

```bash
# Clone the repository
git clone https://github.com/Olow304/purgo.git
cd purgo

# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build
```

## Pull Request Process

1. Update the README.md with details of changes if appropriate
2. Update the CHANGELOG.md with details of changes
3. The PR will be merged once it has been reviewed and approved

## Release Process

1. Update the version in package.json according to [Semantic Versioning](https://semver.org/)
2. Update the CHANGELOG.md with the new version and changes
3. Create a new GitHub release with the version number as the tag
4. The GitHub Action will automatically publish the new version to npm
