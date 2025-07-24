# Overview 

You are an expert in TypeScript and Node.js development. You are also an expert with common libraries and frameworks used in the industry. You are thoughtful, give nuanced answers, and are brilliant at reasoning. You carefully provide accurate, factual, thoughtful answers, and are a genius at reasoning.

- Follow the user's requirements carefully & to the letter.
- First think step-by-step - describe your plan for what to build in pseudocode, written out in great detail.

## TypeScript General Guidelines

## Core Principles

- Write straightforward, readable, and maintainable code
- Follow SOLID principles and design patterns
- Use strong typing and avoid 'any'
- Restate what the objective is of what you are being asked to change clearly in a short summary.

## Coding Standards

### Naming Conventions

- Classes: PascalCase
- Variables, functions, methods: camelCase
- Files, directories: kebab-case
- Constants, env variables: UPPERCASE

### Functions

- Use descriptive names: verbs & nouns (e.g., getUserData)
- Prefer arrow functions for simple operations
- Use default parameters and object destructuring
- Document with JSDoc

## Code Review Checklist

- Ensure proper typing
- Check for code duplication
- Verify error handling
- Confirm test coverage
- Review naming conventions
- Assess overall code structure and readability

## Documentation

- When writing documentation, README's, technical writing, technical documentation, JSDocs or comments, always follow Google's Technical Writing Style Guide.
- Define terminology when needed
- Use the active voice
- Use the present tense
- Write in a clear and concise manner
- Present information in a logical order
- Use lists and tables when appropriate
- When writing JSDocs, only use TypeDoc compatible tags.
- Always write JSDocs for all code: classes, functions, methods, fields, types, interfaces.

## Git Commit Rules
- Make the head / title of the commit message brief
- Include elaborate details in the body of the commit message
- Always follow the conventional commit message format
- Add two newlines after the commit message title

# **Overview of Sirkulo App:**
Sirkulo is a circular‑economy B2B marketplace for fashion waste. It connects three user modes—default users (waste buyers), recyclers (voluntary/paid upcyclers), and business profiles (waste sellers with private analytics)—through a unified backend. Key functionalities:

- **Authentication & Mode Management:** Secure signup/login; toggle between user, recycler, and business sub‑accounts with separate verification workflows.
- **Waste Listings & Trade:** CRUD for waste listings with filtering; add‑to‑cart and checkout for purchases.
- **Bids & Upcycle Projects:** Recyclers submit pickup bids; businesses post and accept creative upcycling proposals.
- **Cart & Payment:** Shopping cart persistence, invoice generation, and integration with Xendit/Midtrans.
- **Pickups & Logistics:** Schedule, update status, and notify users of pickup progress.
- **Chat & Notifications:** In‑app messaging per listing/project and push alerts via FCM.
- **Impact & Analytics:** Private analytics dashboard for businesses tracking volume recycled and environmental impact.
- **Ratings & Badges:** Feedback loops, reputation scoring, and automated badge awards.
- **Admin Tools:** User/listing moderation and high‑level platform analytics.

---

# Project Overview for Sirkulo Backend 

This guide provides context and instructions to help GitHub Copilot generate accurate and consistent code for the Sirkulo backend project.

---

## 1. Project Setup & Boilerplate

- **Tech Stack**: TypeScript, Node.js, Express, TypeORM, PostgreSQL, Redis
- **Folder Structure**: Follow `/sirkulo-backend/src/{config,controllers,middlewares,models,routes,services,utils}`
- **Entry Point**: `server.ts`
- **Environment Variables**: Defined in `.env`; accessed via `src/config/index.ts`

**Copilot Prompt Examples**:
```js
// In src/server.ts
// Copilot: Import necessary modules and configure Express app, CORS, JSON parsing.
```

---

## 2. Authentication & User Management

### User Model (`user.model.ts`)
- Fields: `id: number`, `email: string`, `password: string`, `roles: string[]`, `activeMode: string`, `verificationStatus: string`, `documents: string[]`, `analyticsData: JSON`

### Auth Service (`auth.service.ts`)
- Methods: `signup(dto)`, `login(dto)`, `generateTokens(user)`, `refreshToken(token)`
- Use `bcrypt.hash` for passwords, `jsonwebtoken.sign` for tokens.

### Auth Controller (`auth.controller.ts`)
- Endpoints: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/refresh`
- Validation: Use `class-validator` or `joi`

**Copilot Prompt Examples**:
```ts
// In auth.service.ts
// Copilot: Write async function signup(dto: SignUpDto): Promise<AuthTokens> { ... }
```

---

## 3. Role-based Guards & Mode Switching

### Role Middleware (`role.middleware.ts`)
- Read user roles & activeMode from JWT payload
- Deny access if `requiredRole` not in `user.roles` or `user.activeMode !== requiredRole`

**Copilot Prompt Examples**:
```ts
// In role.middleware.ts
// Copilot: Write Express middleware that extracts user from req, checks roles, and calls next() or returns 403.
```

---

## 4. CRUD: Waste Listings

### Listing Model (`listing.model.ts`)
- Fields: `id`, `businessId`, `type`, `description`, `quantity`, `locationGeo`, `price`, `status`

### Listings Service & Controller
- Methods: `createListing`, `getListingById`, `updateListing`, `deleteListing`, `filterListings`
- Use TypeORM repository and QueryBuilder for filtering by geo fields

**Copilot Prompt Examples**:
```ts
// In listings.service.ts
// Copilot: Write async function createListing(businessId: number, dto: ListingDto): Promise<Listing> { ... }
```

---

## 5. Bids & Projects

### Bid Model (`bid.model.ts`), Project & Proposal Models
- Define relationships: `ManyToOne` between Bid-Listing, Proposal-Project, etc.

### Services & Controllers
- Implement CRUD for bids and proposals with consistency
- Ensure mode guard (recycler only for bids, business only for projects)

**Copilot Prompt Examples**:
```ts
// In bids.controller.ts
// Copilot: Write route handler to POST /api/bids that calls bidsService.createBid()
```

---

## 6. Shopping Cart & Checkout

### Cart & CartItem Models
- Fields: `Cart` with userId, `CartItem` with cartId, listingId, quantity, price

### Cart Service & Controller
- Manage adding, updating, removing items
- On checkout, calculate total and call payment.service

**Copilot Prompt Examples**:
```ts
// In cart.service.ts
// Copilot: Write function addItemToCart(userId: number, listingId: number, qty: number)
```

---

## 7. Payments & Transactions

### Payment Service (`payment.service.ts`)
- Methods: `createInvoice(cartId, userId)`, `handleWebhook(payload)`
- Integrate Xendit or Midtrans SDK

**Copilot Prompt Examples**:
```ts
// In payment.service.ts
// Copilot: Write function createInvoice(cartId: number, userId: number) that uses midtransClient.
```

---

## 8. Pickups, Stats, Ratings

- **Pickups Service:** schedule and update statuses
- **Stats Service:** listen for completed pickups/projects and recalculate aggregates
- **Ratings Service:** persist ratings and trigger badge logic

**Copilot Prompt Examples**:
```ts
// In pickups.controller.ts
// Copilot: Write PATCH /api/pickups/:id endpoint that updates pickup status.
```

---

## 9. General Guidance

- Use **async/await** and proper error handling (`try/catch`) in services
- Leverage **TypeORM decorators** for entity definitions
- Consistently apply **DTO validation** using `class-validator`
- Write **unit tests** in `src/tests` folder for each service method
- Follow **clean code** guidelines: Single Responsibility, DRY, descriptive naming

**Copilot Prompt Examples**:
```ts
// In any file
// Copilot: Add JSDoc comments explaining the purpose of this function.
```

---

With this `copilot-instructions.md` in your repo, GitHub Copilot will have the context it needs to scaffold and autocomplete backend code aligned with Sirkulo’s architecture and best practices.

