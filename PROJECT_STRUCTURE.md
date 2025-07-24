# Sirkulo - Project Structure Documentation

## 📁 Project Structure

```
sirkulo/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── index.tsx            # Home screen
│   │   ├── cart.tsx             # Cart screen
│   │   ├── messages.tsx         # Messages screen
│   │   ├── profile.tsx          # Profile screen
│   │   └── _layout.tsx          # Tab layout
│   ├── chat/
│   │   └── [id].tsx             # Dynamic chat screen
│   ├── _layout.tsx              # Root layout
│   └── +html.tsx                # Web-specific HTML wrapper
├── src/                          # Source code (organized structure)
│   ├── components/               # Reusable UI components
│   │   ├── ui/                  # Basic UI components
│   │   └── layout/              # Layout components
│   ├── features/                 # Feature-based modules
│   │   ├── home/                # Home feature
│   │   │   ├── HomeHeader.tsx   # Home header component
│   │   │   ├── CraftsSection.tsx # Crafts listing component
│   │   │   ├── GarbageSection.tsx # Garbage listing component
│   │   │   └── index.ts         # Feature exports
│   │   ├── chat/                # Chat feature
│   │   ├── cart/                # Cart feature
│   │   └── profile/             # Profile feature
│   ├── hooks/                    # Custom React hooks
│   │   ├── useColorScheme.ts    # Color scheme hook
│   │   ├── useColorScheme.web.ts # Web-specific color scheme
│   │   ├── useClientOnlyValue.ts # Client-only value hook
│   │   ├── useClientOnlyValue.web.ts # Web-specific client value
│   │   └── index.ts             # Hook exports
│   ├── services/                 # API and external services
│   ├── utils/                    # Utility functions
│   ├── constants/                # Application constants
│   │   ├── crafts.ts            # Craft-related constants and types
│   │   ├── chat.ts              # Chat-related constants and types
│   │   ├── profile.ts           # Profile-related constants and types
│   │   └── index.ts             # Constants exports
│   └── types/                    # TypeScript type definitions
│       ├── images.d.ts          # Image type declarations
│       └── index.ts             # Type exports
├── assets/                       # Static assets
│   ├── images/                  # Image files
│   └── fonts/                   # Font files
├── sirkulo-backend/             # Backend application (separate)
├── android/                     # Android-specific files
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── app.json                    # Expo configuration
```

## 🎯 Key Improvements

### 1. **Feature-Based Organization**
- Components are organized by features rather than types
- Each feature has its own directory with related components
- Easy to locate and maintain feature-specific code

### 2. **Proper Separation of Concerns**
- **Components**: Reusable UI components
- **Features**: Feature-specific components and logic
- **Hooks**: Custom React hooks
- **Constants**: Application constants and mock data
- **Types**: TypeScript type definitions
- **Services**: API calls and external integrations
- **Utils**: Helper functions and utilities

### 3. **TypeScript Integration**
- Proper type definitions for all data structures
- Type-safe constants and interfaces
- Better IntelliSense and error catching

### 4. **Clean Import Structure**
```typescript
// Feature imports
import { HomeHeader, CraftsSection } from '@/src/features/home';

// Hook imports
import { useColorScheme, useClientOnlyValue } from '@/src/hooks';

// Constants imports
import { MOCK_CRAFTS, CraftItem } from '@/src/constants/crafts';

// Type imports
import { UserMode } from '@/src/constants/chat';
```

### 5. **Index Files for Clean Exports**
- Each directory has an `index.ts` file for clean imports
- Reduces import statement complexity
- Better tree-shaking support

## 📋 Data Structure

### Craft Items
```typescript
interface CraftItem {
  id: string;
  name: string;
  category: CraftCategory;
  rating: number;
  ratingCount: number;
  price: string;
  stock: number;
  seller: string;
  details: string;
  image: any;
}
```

### Chat Items
```typescript
interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  online: boolean;
}
```

### User Modes
```typescript
type UserMode = 'Customer' | 'Recycler' | 'Business';
```

## 🔧 Configuration

### TypeScript Paths
```json
{
  "paths": {
    "@/*": ["./*"],
    "@/src/*": ["./src/*"]
  }
}
```

### Import Aliases
- `@/` - Root directory
- `@/src/` - Source directory
- `@/assets/` - Assets directory

## 🚀 Benefits

1. **Maintainability**: Easier to find and modify code
2. **Scalability**: Easy to add new features and components
3. **Type Safety**: Better TypeScript integration
4. **Developer Experience**: Better IntelliSense and autocomplete
5. **Code Reusability**: Clear separation of reusable components
6. **Testing**: Easier to write unit tests for isolated components
7. **Performance**: Better tree-shaking and bundle optimization

## 📝 Development Guidelines

### Adding New Features
1. Create a new directory under `src/features/`
2. Add feature-specific components
3. Create an `index.ts` file for exports
4. Add constants to `src/constants/` if needed
5. Add types to appropriate files

### Adding New Components
1. Determine if it's a reusable UI component or feature-specific
2. Place in appropriate directory (`src/components/ui/` or `src/features/`)
3. Use proper TypeScript typing
4. Export through index files

### Adding New Constants
1. Add to appropriate file in `src/constants/`
2. Include proper TypeScript interfaces
3. Export through `src/constants/index.ts`

This structure provides a solid foundation for scaling the application while maintaining code quality and developer productivity.