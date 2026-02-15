# NovaBank - Digital Banking Application

## Overview

NovaBank is a full-stack digital banking web application that provides core banking features including account management, fund transfers, card management, loan tracking, and transaction history. It's built as a monorepo with a React frontend and Express backend, using PostgreSQL for data persistence. The app supports multilingual UI (English, French, Arabic), dark/light theme toggling, and session-based authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The project follows a three-directory monorepo pattern:
- `client/` — React SPA (Vite-bundled)
- `server/` — Express API server
- `shared/` — Shared schemas, types, and route definitions used by both client and server

### Frontend (`client/src/`)
- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state; no global client state library
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Forms**: react-hook-form with Zod resolvers for validation
- **Charts**: Recharts for financial data visualization
- **Internationalization**: i18next with browser language detection (English, French, Arabic)
- **Styling**: Tailwind CSS with CSS custom properties for theming (dark/light mode via class toggling)
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

Pages: auth-page, dashboard, accounts, transfers, cards, loans, not-found. All banking pages are wrapped in a `LayoutShell` component providing sidebar navigation.

### Backend (`server/`)
- **Framework**: Express.js with TypeScript, run via `tsx` in development
- **Authentication**: Passport.js with local strategy (email/password), session-based auth using express-session with MemoryStore (should be replaced with connect-pg-simple for production)
- **Password Security**: scrypt hashing with random salts, timing-safe comparison
- **API Design**: RESTful JSON API, all routes prefixed with `/api/`. Route definitions are shared between client and server via `shared/routes.ts`
- **Build**: esbuild for server bundling, Vite for client bundling (orchestrated by `script/build.ts`)
- **Dev Server**: Vite dev server runs as middleware inside Express during development (`server/vite.ts`)
- **Production**: Static files served from `dist/public/`, server runs as `dist/index.cjs`

### Database
- **Database**: PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema location**: `shared/schema.ts` — defines tables for users, accounts, transactions, cards, and loans
- **Migrations**: Drizzle Kit with `db:push` command for schema sync
- **Key tables**:
  - `users` — email, password (hashed), fullName, role (user/admin/employee), KYC status
  - `accounts` — userId, accountNumber, type (savings/checking/business), balance (decimal), currency
  - `transactions` — fromAccountId, toAccountId, amount, type, status, description
  - `cards` — accountId, cardNumber, cardHolderName, expiryDate, isFrozen
  - `loans` — userId, amount, interestRate, durationMonths, monthlyInstallment, remainingBalance, status

### Storage Layer
- `server/storage.ts` defines an `IStorage` interface implemented by `DatabaseStorage` class
- All database operations go through this storage abstraction, making it testable and swappable
- Financial amounts are stored as decimal strings in the database and parsed to numbers on the frontend

### Seed Data
- `server/seed.ts` creates a demo user (demo@bank.com / demo123) with sample account, card, loan, and transactions

### Shared Code (`shared/`)
- `schema.ts` — Drizzle table definitions, insert schemas (via drizzle-zod), TypeScript types
- `routes.ts` — API route contract definitions with paths, methods, Zod input/output schemas. Used by both frontend hooks and backend route handlers for type safety.

## External Dependencies

### Required Services
- **PostgreSQL Database**: Required. Connection string must be provided via `DATABASE_URL` environment variable. Used for all persistent data storage and potentially session storage.

### Key NPM Packages
- **drizzle-orm** + **drizzle-kit**: Database ORM and migration tooling
- **passport** + **passport-local**: Authentication
- **express-session** + **memorystore**: Session management (MemoryStore used currently; connect-pg-simple is available as a dependency for production)
- **zod**: Runtime validation shared between client and server
- **i18next** + **react-i18next**: Internationalization
- **recharts**: Chart rendering
- **date-fns**: Date formatting
- **decimal.js**: Precise decimal arithmetic for financial calculations
- **@tanstack/react-query**: Async server state management on the frontend
- **shadcn/ui ecosystem**: Radix UI primitives, Tailwind CSS, class-variance-authority, clsx, tailwind-merge

### Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required)
- `SESSION_SECRET` — Session encryption secret (has a default fallback, should be set in production)