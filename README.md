<<<<<<< HEAD
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies
=======
# 🌱 Sirkulo - Circular Economy Marketplace

<div align="center" padding:20px;border-radius:12px;">
  <img src="assets/images/sirkulo-green.png" alt="Sirkulo Logo" width="120" />
</div>
  
  **Transform waste into valuable resources through sustainable commerce**
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.79.5-blue.svg)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-~53.0.20-black.svg)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-~5.8.3-blue.svg)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-0BSD-green.svg)](LICENSE)
</div>

## 🌍 About Sirkulo

Sirkulo is a comprehensive circular economy marketplace that connects
individuals, businesses, and recyclers to transform waste into valuable
resources. Our platform promotes sustainable practices by enabling users to buy,
sell, and exchange eco-friendly products while supporting environmental
conservation.

### 🎯 Mission

To create a sustainable future by making circular economy practices accessible,
profitable, and impactful for everyone.

### 🌟 Vision

A world where waste becomes a resource, and every transaction contributes to
environmental sustainability.

## ✨ Key Features

### 🛍️ **Multi-Mode Platform**

- **Basic Mode**: Browse and purchase eco-friendly products
- **Business Mode**: Manage waste listings, partnerships, and analytics
- **Recycler Mode**: Access job opportunities and waste processing projects

### 🛒 **Sustainable Marketplace**

- **Eco-Products**: Furniture, gardening supplies, and animal feed made from
  recycled materials
- **Smart Cart**: Seamless shopping experience with quantity management
- **Product Categories**: Home Furniture, Gardening, Animal Feed, and more
- **Seller Verification**: Trusted seller system with ratings and reviews

### 💬 **Communication Hub**

- **Real-time Chat**: Direct messaging between buyers and sellers
- **AI Assistant (Ronto)**: Sustainability guidance and product recommendations
- **Multi-language Support**: Indonesian and English language options

### 🏢 **Business Management**

- **Waste Listing**: Create and manage waste material listings
- **Partnership Network**: Connect with other businesses for collaboration
- **Analytics Dashboard**: Track environmental impact and business metrics
- **Project Management**: Oversee recycling and upcycling projects

### ♻️ **Recycler Tools**

- **Job Marketplace**: Find recycling and processing opportunities
- **Waste Browser**: Discover available materials by category and quality
- **Operations Management**: Track processing activities and efficiency
- **Impact Tracking**: Monitor environmental contributions

### 📊 **Analytics & Insights**

- **Environmental Impact**: CO2 reduction, waste diverted from landfills
- **Business Metrics**: Revenue, partnerships, and growth tracking
- **Sustainability Reports**: Comprehensive environmental impact analysis
- **Performance Dashboards**: Real-time business and environmental data

## 🛠️ Technical Stack

### **Frontend**

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **TypeScript**: Type-safe JavaScript development
- **Expo Router**: File-based navigation system

### **State Management**

- **React Context**: Global state management
- **React Hooks**: Component state and lifecycle management
- **Custom Hooks**: Reusable logic components

### **UI/UX**

- **React Native Elements**: UI component library
- **Expo Vector Icons**: Icon system
- **Custom Design System**: Consistent styling and theming
- **Responsive Design**: Optimized for various screen sizes

### **Development Tools**

- **ESLint**: Code linting and quality assurance
- **Prettier**: Code formatting
- **Husky**: Git hooks for code quality
- **TypeScript**: Static type checking
- **Jest**: Testing framework

## 🏗️ Project Structure

```
sirkulo/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx            # Home screen
│   │   ├── cart.tsx             # Shopping cart
│   │   ├── messages.tsx         # Chat system
│   │   ├── profile.tsx          # User profile
│   │   └── business-management.tsx # Business dashboard
│   ├── (auth)/                   # Authentication
│   │   ├── login.tsx            # Login screen
│   │   ├── regist.tsx           # Registration
│   │   └── auth.tsx             # Auth wrapper
│   ├── chat/                     # Chat features
│   │   ├── [id].tsx             # Dynamic chat rooms
│   │   └── ai-ronto.tsx         # AI assistant
│   ├── business/                 # Business features
│   │   ├── analytics.tsx        # Business analytics
│   │   └── partnerships.tsx     # Partnership management
│   ├── recycler/                 # Recycler features
│   │   ├── browse-waste.tsx     # Waste discovery
│   │   ├── view-projects.tsx    # Project management
│   │   └── analytics.tsx        # Recycler analytics
│   └── onboarding/              # User onboarding
│       └── onboard.tsx          # Welcome screens
├── src/                          # Source code
│   ├── components/               # Reusable components
│   ├── features/                 # Feature modules
│   ├── constants/                # App constants
│   ├── contexts/                 # React contexts
│   ├── hooks/                    # Custom hooks
│   └── types/                    # TypeScript types
├── assets/                       # Static assets
│   ├── images/                  # Images and icons
│   └── fonts/                   # Custom fonts
└── android/                     # Android configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/sirkulo.git
   cd sirkulo
   ```

2. **Install dependencies**
>>>>>>> dev

   ```bash
   npm install
   ```

<<<<<<< HEAD
2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.


## Collaboration & Contribution Guidelines

### Commit Message Convention
- Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for all commit messages.
- Prefix your commit with one of the following types:
  - `feat`: New feature
  - `fix`: Bug fix
  - `docs`: Documentation only changes
  - `chore`: Maintenance, build, or tooling changes
  - `refactor`: Code change that neither fixes a bug nor adds a feature
  - `test`: Adding or updating tests
  - `style`: Formatting, missing semi colons, etc; no code change
  - `perf`: Performance improvement
- Example:
  ```
  feat(auth): add OAuth login with Google
  fix(product): correct price calculation bug
  docs: update README with setup instructions
  ```

### Branch Naming Convention
- Use the format: `<devname>.<feature>`
- Example: `nafhan.auth`, `alex.product-listing`, `sarah.fix-login`
- Use short, descriptive feature names. Use hyphens for multi-word features: `john.product-table-fix`

### Pull Request (PR) Rules
- PR titles should be clear and reference the main change (e.g., `feat: add Kanban drag-and-drop`)
- Link related issues in the PR description if applicable.
- Provide a concise summary of changes and any special instructions for reviewers.
- Ensure all checks (CI, lint, tests) pass before requesting review.
- Assign at least one reviewer; self-merge is discouraged unless urgent.
- Use draft PRs for work-in-progress.

### General Collaboration Rules
- Sync with the latest `main` before starting new work.
- Keep PRs focused and as small as possible; large PRs should be split if feasible.
- Use code comments for complex logic or non-obvious decisions.
- Document new environment variables or configuration changes in the README.
- Discuss breaking changes or architectural decisions in issues before implementation.
- Be respectful and constructive in code reviews and discussions.

### Push/Pull Workflow

This project uses two main branches:
- **main**: Production branch (deploys to production)
- **dev**: Staging branch (for development and staging/testing)

> **All feature/fix branches must be merged into `dev`, _not_ `main`. Only maintainers should merge `dev` into `main` for production releases.**

#### Step-by-Step Workflow for Contributors
<picture><img alt="Sentry" src=".github/images/git_workflow.png">
        </picture>

1. **Sync your local repository**
   - Make sure you have the latest `dev` branch:
     ```sh
     git checkout dev
     git pull origin dev
     ```
2. **Create your feature/fix branch**
   - Use the branch naming convention:
     ```sh
     git checkout -b <devname>.<feature>
     # Example: git checkout -b nafhan.auth
     ```
3. **Work on your changes**
   - Commit using the [conventional commit](#commit-message-convention) format.
4. **Sync with `dev` before pushing**
   - Before pushing, always pull the latest `dev` to avoid conflicts:
     ```sh
     git checkout dev
     git pull origin dev
     git checkout <your-branch>
     git merge dev
     # Resolve any conflicts if needed
     ```
5. **Push your branch**
   ```sh
   git push origin <your-branch>
   ```
6. **Open a Pull Request**
   - Target the `dev` branch (not `main`).
   - Fill out the PR template, link issues if applicable, and request review.
=======
3. **Start the development server**

   ```bash
   npm start
   ```

4. **Run on specific platform**

   ```bash
   # Android
   npm run android

   # iOS
   npm run ios

   # Web
   npm run web
   ```

### Available Scripts

```bash
# Development
npm start                 # Start Expo development server
npm run android          # Run on Android device/emulator
npm run ios              # Run on iOS device/simulator
npm run web              # Run on web browser

# Quality Assurance
npm run type-check       # TypeScript type checking
npm run lint             # ESLint code linting
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run validate         # Run all quality checks

# Testing
npm test                 # Run Jest tests
npm run test:ci          # Run tests in CI mode

# Maintenance
npm run clean            # Clean Expo cache
```

## 🎨 Design System

### Color Palette

- **Primary**: `#386B5F` - Main brand color
- **Secondary**: `#E6F3EC` - Light accent
- **Success**: `#4CAF50` - Success states
- **Warning**: `#FF9800` - Warning states
- **Error**: `#F44336` - Error states
- **Background**: `#FFFFFF` - Main background
- **Surface**: `#F5F6F8` - Card backgrounds

### Typography

- **Headers**: Bold, 18-24px
- **Body**: Regular, 14-16px
- **Captions**: Regular, 12-14px
- **Buttons**: Semi-bold, 14-16px

## 📱 User Experience

### **Onboarding Flow**

1. **Welcome Screen**: Introduction to Sirkulo's mission
2. **Feature Overview**: Discover eco-products and sustainability
3. **Community Connection**: Learn about trading and networking
4. **Mode Selection**: Choose between Basic, Business, or Recycler

### **Navigation Structure**

- **Tab Navigation**: Home, Cart, Messages, Profile
- **Modal Navigation**: Authentication, Product Details, Chat
- **Stack Navigation**: Feature-specific flows

### **Key User Journeys**

1. **Product Discovery**: Browse → Filter → View Details → Add to Cart →
   Purchase
2. **Business Management**: Dashboard → Create Listing → Manage Partnerships →
   View Analytics
3. **Recycler Operations**: Browse Waste → Apply for Jobs → Track Projects →
   View Impact

## 🌱 Environmental Impact

### **Sustainability Metrics**

- **CO2 Reduction**: Track carbon footprint reduction
- **Waste Diverted**: Monitor materials diverted from landfills
- **Circular Economy**: Measure contribution to circular practices
- **Resource Recovery**: Track materials recovered and reused

### **Impact Categories**

- **Material Recovery**: Plastic, Metal, Paper, Electronics, Organic, Textile,
  Glass
- **Quality Grades**: Premium, Standard, Low-grade, Contaminated
- **Processing Types**: Recycling, Upcycling, Composting, Refurbishment

## 🤝 Contributing

We welcome contributions to make Sirkulo even better! Please follow these
guidelines:

### **Development Process**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Code Standards**

- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

### **Issue Reporting**

- Use GitHub Issues for bug reports and feature requests
- Provide detailed reproduction steps
- Include screenshots for UI issues
- Tag issues appropriately

## 📄 License

This project is licensed under the 0BSD License - see the [LICENSE](LICENSE)
file for details.

## 🙏 Acknowledgments

- **Expo Team**: For the amazing development platform
- **React Native Community**: For continuous innovation
- **Environmental Organizations**: For inspiration and guidance
- **Open Source Contributors**: For their valuable contributions

## 📞 Support

- **Documentation**:
  [Project Wiki](https://github.com/your-username/sirkulo/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/sirkulo/issues)
- **Discussions**:
  [GitHub Discussions](https://github.com/your-username/sirkulo/discussions)
- **Email**: support@sirkulo.com

## 🔮 Roadmap

### **Phase 1: Foundation** ✅

- [x] Multi-mode platform architecture
- [x] Basic marketplace functionality
- [x] User authentication system
- [x] Chat and messaging features

### **Phase 2: Enhancement** 🚧

- [ ] Advanced analytics dashboard
- [ ] Payment integration
- [ ] Push notifications
- [ ] Offline functionality

### **Phase 3: Expansion** 📋

- [ ] AI-powered recommendations
- [ ] Blockchain integration for transparency
- [ ] IoT device integration
- [ ] Global marketplace expansion

---

<div align="center">
  <p><strong>Made with ❤️ for a sustainable future</strong></p>
  <p>© 2024 Sirkulo. All rights reserved.</p>
</div>
>>>>>>> dev
