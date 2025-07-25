# Sirkulo Development Workflow

## Daily Development Process

### 1. Starting Development

```bash
# Pull latest changes
git pull origin main

# Install/update dependencies if needed
npm install

# Start development server
npm start
```

### 2. Before Making Changes

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Validate current state
npm run validate
```

### 3. During Development

```bash
# Check types frequently
npm run type-check

# Format code
npm run format

# Fix linting issues
npm run lint:fix
```

### 4. Before Committing

```bash
# Run full validation
npm run validate

# Stage changes
git add .

# Commit (pre-commit hooks will run automatically)
git commit -m "feat(scope): description"
```

### 5. Before Push/PR

```bash
# Final validation
npm run validate

# Run tests
npm test

# Push changes
git push origin feature/your-feature-name
```

## Rule Violation Handling

### Common Issues and Solutions

#### TypeScript Errors

```bash
# Check specific errors
npm run type-check

# Common fixes:
# - Add proper type annotations
# - Fix import paths
# - Update interface definitions
```

#### ESLint Errors

```bash
# See all linting issues
npm run lint

# Auto-fix what's possible
npm run lint:fix

# Manual fixes needed for:
# - Naming convention violations
# - Import order issues
# - React hooks usage
```

#### Prettier Formatting

```bash
# Check formatting
npm run format:check

# Fix formatting
npm run format
```

### Emergency Bypass (Use Sparingly)

```bash
# Skip pre-commit hooks (NOT RECOMMENDED)
git commit --no-verify -m "emergency fix"

# Disable specific ESLint rule for one line
// eslint-disable-next-line rule-name
const problematicCode = something;

# Disable TypeScript check for one line
// @ts-ignore
const temporaryFix = anyValue;
```

## IDE Setup Recommendations

### VS Code Extensions

- ESLint
- Prettier - Code formatter
- TypeScript Importer
- Auto Rename Tag
- Bracket Pair Colorizer

### VS Code Settings (`.vscode/settings.json`)

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Troubleshooting

### Husky Hooks Not Working

```bash
# Reinstall Husky
rm -rf .husky
npm run prepare
```

### ESLint/Prettier Conflicts

```bash
# Check for conflicts
npm run lint
npm run format:check

# Usually resolved by running both
npm run lint:fix
npm run format
```

### TypeScript Path Issues

```bash
# Restart TypeScript server in VS Code
# Ctrl+Shift+P -> "TypeScript: Restart TS Server"

# Check tsconfig.json paths configuration
```

### Performance Issues

```bash
# Clear caches
npm run clean
rm -rf node_modules package-lock.json
npm install
```

## Rule Updates

### Adding New Rules

1. Update `.eslintrc.js` configuration
2. Test with existing codebase
3. Update documentation
4. Communicate changes to team

### Disabling Rules

```javascript
// In .eslintrc.js, add to rules section:
"rule-name": "off"

// For specific files, use overrides:
"overrides": [
  {
    "files": ["specific-file.ts"],
    "rules": {
      "rule-name": "off"
    }
  }
]
```

## Best Practices

1. **Run validation frequently** during development
2. **Fix issues immediately** rather than accumulating technical debt
3. **Use IDE extensions** for real-time feedback
4. **Understand the rules** rather than blindly fixing
5. **Communicate with team** about rule changes or issues
6. **Keep dependencies updated** for latest rule improvements
