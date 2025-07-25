# Rule Enforcement Configuration

This directory contains configuration files for automated rule enforcement in
the Sirkulo project.

## Files Overview

### ESLint Configuration (`.eslintrc.js`)

- Enforces TypeScript and React Native coding standards
- Validates import order and path conventions
- Checks naming conventions for interfaces, types, and variables
- Prevents common React and React Native anti-patterns

### Prettier Configuration (`.prettierrc`)

- Ensures consistent code formatting
- Configured for TypeScript/React Native best practices
- Maintains readability with appropriate line lengths and spacing

### TypeScript Configuration (`tsconfig.json`)

- Enables strict mode for maximum type safety
- Configures path mapping for clean imports
- Excludes backend and build directories

### Husky Pre-commit Hooks (`.husky/`)

- Automatically runs linting and type checking before commits
- Prevents commits that don't meet code quality standards
- Uses lint-staged for efficient file processing

### Package Scripts

- `npm run validate`: Run all checks (type-check, lint, format)
- `npm run lint`: Check code for rule violations
- `npm run lint:fix`: Automatically fix linting issues
- `npm run format`: Format code with Prettier
- `npm run format:check`: Check if code is properly formatted

## Usage

1. **Install dependencies**: `npm install`
2. **Set up Husky**: `npm run prepare`
3. **Validate code**: `npm run validate`
4. **Fix issues**: `npm run lint:fix && npm run format`

## Rule Enforcement Process

1. **Development**: Rules are checked in real-time by IDE extensions
2. **Pre-commit**: Automatic validation and fixing via Husky hooks
3. **CI/CD**: Validation in continuous integration pipeline
4. **Code Review**: Manual review for rule compliance and best practices
