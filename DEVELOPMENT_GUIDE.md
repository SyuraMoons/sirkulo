# Sirkulo Development Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g @expo/cli`
- React Native development environment set up

### Installation

```bash
cd sirkulo
npm install
```

### Development Commands

```bash
# Start development server
npm start

# Run on specific platforms
npm run android    # Android device/emulator
npm run ios        # iOS simulator (macOS only)
npm run web        # Web browser

# Development tools
npm run type-check # TypeScript type checking
npm run test       # Run tests in watch mode
npm run lint       # Code linting
npm run clean      # Clear Expo cache
```

## 📁 Project Organization

### Adding New Features

1. **Create feature directory**: `src/features/your-feature/`
2. **Add components**: Create React components in the feature directory
3. **Export components**: Add exports to `src/features/your-feature/index.ts`
4. **Add constants**: If needed, add to `src/constants/your-feature.ts`
5. **Update types**: Add TypeScript interfaces as needed

### Example: Adding a "Notifications" Feature

```bash
# Create feature structure
mkdir src/features/notifications
touch src/features/notifications/NotificationList.tsx
touch src/features/notifications/NotificationItem.tsx
touch src/features/notifications/index.ts

# Add constants if needed
touch src/constants/notifications.ts
```

```typescript
// src/features/notifications/index.ts
export { default as NotificationList } from './NotificationList';
export { default as NotificationItem } from './NotificationItem';

// src/constants/notifications.ts
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  // ... notification data
];
```

### Component Guidelines

1. **Use TypeScript**: All components should have proper typing
2. **Export pattern**: Use default exports for components, named exports for
   utilities
3. **Props interface**: Define props interface for each component
4. **Constants**: Extract hardcoded data to constants files

```typescript
// Good component structure
interface HomeHeaderProps {
  title: string;
  onMenuPress: () => void;
}

export default function HomeHeader({ title, onMenuPress }: HomeHeaderProps) {
  // Component implementation
}
```

## 🎯 Code Standards

### Import Order

```typescript
// 1. React and React Native imports
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Third-party libraries
import { FontAwesome } from '@expo/vector-icons';

// 3. Internal imports (features, components, hooks)
import { useColorScheme } from '@/src/hooks';
import { CraftItem } from '@/src/constants/crafts';

// 4. Relative imports
import './styles.css';
```

### File Naming

- **Components**: PascalCase (e.g., `HomeHeader.tsx`)
- **Hooks**: camelCase starting with 'use' (e.g., `useColorScheme.ts`)
- **Constants**: camelCase (e.g., `crafts.ts`)
- **Types**: camelCase (e.g., `images.d.ts`)

### TypeScript Best Practices

1. **Define interfaces** for all data structures
2. **Use type assertions** sparingly
3. **Prefer interfaces** over types for object shapes
4. **Export types** from constants files when applicable

## 🧪 Testing Strategy

### Unit Tests

- Test individual components in isolation
- Mock external dependencies
- Focus on component behavior and props

### Integration Tests

- Test feature workflows
- Test navigation between screens
- Test data flow between components

### Running Tests

```bash
npm test                    # Run all tests in watch mode
npm test -- --coverage     # Run with coverage report
npm test -- --watchAll=false  # Run once without watch mode
```

## 📱 Platform-Specific Development

### Android

```bash
npm run android
# Requires Android Studio and Android SDK
```

### iOS

```bash
npm run ios
# Requires Xcode (macOS only)
```

### Web

```bash
npm run web
# Runs in browser at http://localhost:8081
```

## 🔧 Troubleshooting

### Common Issues

1. **TypeScript Errors**

   ```bash
   npm run type-check
   # Fix any type errors before committing
   ```

2. **Cache Issues**

   ```bash
   npm run clean
   npm start
   ```

3. **Dependency Issues**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Metro Bundler Issues**
   ```bash
   npx expo start --clear
   ```

### Development Tips

1. **Use TypeScript strict mode** for better type safety
2. **Run type-check** before committing code
3. **Use absolute imports** with `@/src/` prefix
4. **Keep components small** and focused on single responsibility
5. **Extract reusable logic** into custom hooks
6. **Use constants** instead of hardcoded values

## 📋 Checklist for New Features

- [ ] Feature directory created in `src/features/`
- [ ] Components have proper TypeScript interfaces
- [ ] Constants extracted to appropriate files
- [ ] Exports added to index files
- [ ] Import paths use absolute imports
- [ ] TypeScript compilation passes (`npm run type-check`)
- [ ] Tests written for new functionality
- [ ] Documentation updated if needed

## 🚢 Deployment

### Building for Production

```bash
# Build for web
npx expo export --platform web

# Build for Android
npx expo build:android

# Build for iOS
npx expo build:ios
```

### Environment Configuration

- Development: Uses Expo development server
- Production: Uses optimized bundles
- Staging: Can be configured with environment variables

This guide should help maintain code quality and consistency as the project
grows!
