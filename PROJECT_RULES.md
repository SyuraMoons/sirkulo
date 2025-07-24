# Sirkulo Project Rules and Coding Standards

![Sirkulo Banner](./assets/images/Banner.png)

## 📋 Table of Contents

- [Project Organization](#project-organization)
- [TypeScript Standards](#typescript-standards)
- [Component Development](#component-development)
- [Import/Export Conventions](#importexport-conventions)
- [Styling Guidelines](#styling-guidelines)
- [Git Workflow](#git-workflow)
- [Testing Standards](#testing-standards)
- [Performance Guidelines](#performance-guidelines)

## 🗂️ Project Organization

### Folder Structure Rules

```
src/
├── components/          # Reusable UI components only
│   ├── ui/             # Basic UI elements (Button, Input, Card)
│   └── layout/         # Layout components (Header, Footer)
├── features/           # Feature-based modules
│   ├── home/           # Home feature components
│   ├── chat/           # Chat feature components
│   ├── cart/           # Cart feature components
│   └── profile/        # Profile feature components
├── hooks/              # Custom React hooks
├── constants/          # Application constants and mock data
├── types/              # TypeScript type definitions
├── services/           # API calls and external services
└── utils/              # Helper functions and utilities
```

### File Naming Conventions

- **Components**: `PascalCase.tsx` (e.g., `HomeHeader.tsx`, `CraftsSection.tsx`)
- **Hooks**: `camelCase.ts` starting with 'use' (e.g., `useColorScheme.ts`)
- **Constants**: `camelCase.ts` (e.g., `crafts.ts`, `chat.ts`)
- **Types**: `camelCase.d.ts` (e.g., `images.d.ts`)
- **Services**: `camelCase.ts` (e.g., `apiService.ts`)
- **Utils**: `camelCase.ts` (e.g., `formatters.ts`)

### Index File Requirements

- Every feature directory MUST have an `index.ts` file for clean exports
- Every major directory (components, hooks, constants) MUST have barrel exports
- Use named exports for utilities, default exports for components

## 🔷 TypeScript Standards

### Type Definitions

```typescript
// ✅ Good - Use interfaces for object shapes
interface CraftItem {
  id: string;
  name: string;
  category: CraftCategory;
  rating: number;
}

// ✅ Good - Use const assertions for literal types
export const CRAFT_CATEGORIES = ['All', 'Home Furniture', 'Gardening'] as const;

export type CraftCategory = (typeof CRAFT_CATEGORIES)[number];

// ❌ Bad - Don't use any
const data: any = fetchData();

// ✅ Good - Use proper typing
const data: CraftItem[] = fetchData();
```

### Interface Naming

- **Component Props**: `ComponentNameProps` (e.g., `HomeHeaderProps`)
- **Data Interfaces**: Descriptive names (e.g., `CraftItem`, `ChatMessage`)
- **API Responses**: `ApiResponseType` (e.g., `CraftListResponse`)

### Type Export Rules

- Export types and interfaces from the same file where they're defined
- Use barrel exports in `src/types/index.ts` for commonly used types
- Keep feature-specific types in their respective feature directories

## 🧩 Component Development

### Component Structure Template

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ComponentDependencies } from '@/src/components';
import { useCustomHook } from '@/src/hooks';
import { CONSTANTS } from '@/src/constants';

interface ComponentNameProps {
  title: string;
  onPress?: () => void;
  isActive?: boolean;
}

export default function ComponentName({
  title,
  onPress,
  isActive = false
}: ComponentNameProps) {
  // Hooks at the top
  const customValue = useCustomHook();

  // Event handlers
  const handlePress = () => {
    onPress?.();
  };

  // Render
  return (
    <View style={[styles.container, isActive && styles.active]}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // styles here
  },
  title: {
    // styles here
  },
  active: {
    // styles here
  },
});
```

### Component Rules

1. **Single Responsibility**: Each component should have one clear purpose
2. **Props Interface**: Always define props interface, even for simple
   components
3. **Default Props**: Use default parameters in function signature, not
   defaultProps
4. **Event Handlers**: Prefix with 'handle' (e.g., `handlePress`,
   `handleChange`)
5. **Conditional Styling**: Use array syntax for conditional styles
6. **Export Pattern**: Use default export for components, named exports for
   utilities

### Component Organization

- **Reusable Components**: Place in `src/components/ui/`
- **Feature Components**: Place in respective `src/features/` directory
- **Layout Components**: Place in `src/components/layout/`

## 📦 Import/Export Conventions

### Import Order

```typescript
// 1. React and React Native imports
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Third-party libraries
import { FontAwesome } from '@expo/vector-icons';

// 3. Internal imports (absolute paths)
import { useColorScheme } from '@/src/hooks';
import { CraftItem } from '@/src/constants/crafts';
import { Button } from '@/src/components/ui';

// 4. Relative imports (avoid when possible)
import './styles.css';
```

### Path Rules

- **Always use absolute imports** with `@/src/` prefix for internal modules
- **Avoid relative imports** except for same-directory files
- **Use barrel exports** through index files for clean imports

### Export Patterns

```typescript
// ✅ Good - Feature barrel export
// src/features/home/index.ts
export { default as HomeHeader } from './HomeHeader';
export { default as CraftsSection } from './CraftsSection';
export { default as GarbageSection } from './GarbageSection';

// ✅ Good - Constants barrel export
// src/constants/index.ts
export * from './crafts';
export * from './chat';
export * from './profile';
```

## 🎨 Styling Guidelines

### StyleSheet Rules

1. **Use StyleSheet.create()** for all component styles
2. **Place styles at bottom** of component file
3. **Alphabetical ordering** of style properties when possible
4. **Descriptive naming** for style objects

### Color and Theme Usage

```typescript
// ✅ Good - Use theme constants
import { COLORS, SPACING } from '@/src/constants/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    padding: SPACING.medium,
  },
});

// ❌ Bad - Hardcoded values
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
  },
});
```

### Responsive Design

- Use flexible layouts with `flex`, `flexDirection`, `justifyContent`
- Avoid fixed dimensions when possible
- Test on multiple screen sizes

## 🔄 Git Workflow

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(home): add see all button functionality
fix(chat): resolve message timestamp formatting
docs: update project structure documentation
refactor(components): extract reusable UI components
```

### Branch Naming

- `feature/description` (e.g., `feature/see-all-button`)
- `fix/description` (e.g., `fix/chat-timestamp`)
- `refactor/description` (e.g., `refactor/component-structure`)

### Development Process

1. Create feature branch from main
2. Make changes following coding standards
3. Run type check: `npm run type-check`
4. Commit with proper message format
5. Create pull request with description
6. Code review and merge

## 🧪 Testing Standards

### Test File Organization

- Place test files next to the component: `Component.test.tsx`
- Use `__tests__` folder for complex test suites
- Name test files with `.test.tsx` or `.spec.tsx` extension

### Testing Patterns

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeHeader from '../HomeHeader';

describe('HomeHeader', () => {
  it('should render greeting text', () => {
    const { getByText } = render(
      <HomeHeader mode="Customer" setMode={() => {}} />
    );

    expect(getByText('Good Morning!')).toBeTruthy();
  });

  it('should call setMode when mode is changed', () => {
    const mockSetMode = jest.fn();
    const { getByText } = render(
      <HomeHeader mode="Customer" setMode={mockSetMode} />
    );

    // Test interaction
    fireEvent.press(getByText('Customer'));
    // Add assertions
  });
});
```

### Testing Requirements

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test feature workflows
- **Type Safety**: Ensure TypeScript compilation passes
- **Coverage**: Aim for 80%+ code coverage on critical paths

## ⚡ Performance Guidelines

### Bundle Size Management

- **Lazy Loading**: Use dynamic imports for large components
- **Image Optimization**: Compress images and use appropriate formats
- **Tree Shaking**: Ensure imports don't pull entire libraries

### Memory Management

```typescript
// ✅ Good - Cleanup in useEffect
useEffect(() => {
  const subscription = subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);

// ✅ Good - Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);
```

### Optimization Rules

1. **Avoid inline functions** in render methods
2. **Use useCallback** for event handlers passed to children
3. **Optimize FlatList** with proper keyExtractor and getItemLayout
4. **Monitor bundle size** with each new dependency

## 🔧 Development Tools Configuration

### Required Scripts

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "expo lint",
    "test": "jest --watchAll",
    "clean": "expo r -c"
  }
}
```

### Pre-commit Requirements

- TypeScript compilation must pass
- All tests must pass
- Linting must pass without errors
- No console.log statements in production code

## 📚 Documentation Requirements

### Code Documentation

- **Complex Logic**: Add comments explaining why, not what
- **Public APIs**: Document function parameters and return types
- **Component Props**: Use JSDoc for complex prop interfaces

### README Updates

- Update documentation when adding new features
- Keep examples current with codebase changes
- Document breaking changes and migration steps

---

## 🚀 Getting Started with Rules

1. **Read through all rules** and understand the rationale
2. **Set up development tools** (ESLint, Prettier, TypeScript)
3. **Configure pre-commit hooks** for automatic rule enforcement
4. **Review existing code** and gradually refactor to meet standards
5. **Use this document** as reference during development

These rules are designed to scale with the project and maintain code quality as
the team grows. When in doubt, prioritize consistency and maintainability over
brevity.
