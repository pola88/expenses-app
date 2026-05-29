# Expense App

Personal finance app for tracking expenses, incomes, and currency exchanges — built for the Argentine context with ARS/USD handling and MEP/blue rate support.

## Features

- Multi-currency wallet (ARS and USD, always separate, never consolidated)
- Expense tracking with categories per household
- Income tracking — recurring (with day-of-month) and one-time
- Currency exchange log with manual rate entry and auto-calculation
- Wallet balance calculated in real time from all movements (never persisted)
- Shared household — multiple users, each movement tracked by who added it

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router + TypeScript |
| Database | PostgreSQL via Prisma |
| Auth | NextAuth v5 — Credentials, JWT, PrismaAdapter |
| Data fetching | TanStack Query |
| Forms | React Hook Form + Zod |
| UI | shadcn/ui + TailwindCSS |
| Money arithmetic | decimal.js (no `number` for amounts, ever) |

## Architecture

```
Repository → Service → API Route → Client Component
```

- **Repositories** — raw Prisma queries, no business logic
- **Services** — business logic + ownership validation before any mutation
- **API Routes** — thin layer using a shared `apiHandler` wrapper (auth + error handling)
- **DTOs** — Zod schemas for all inputs; `householdId` always comes from the JWT session, never from the request body

## Multi-Agent Development System

This project uses a structured AI agent system via Claude Code. Each agent has a specific role and they're orchestrated by a Meta Agent:

```
meta-agent.md       ← orchestrator, decides which agents to invoke
├── product.md      ← MVP validation, feature prioritization
├── architect.md    ← system design, layer boundaries
├── builder.md      ← implementation, production-ready code
├── reviewer.md     ← code review, consistency, maintainability
├── debugger.md     ← root cause analysis, minimal fixes
└── uxui.md         ← user flows, component systems, accessibility
```

The orchestration instructions live in `CLAUDE.md`. The shared project context (decisions, data model, folder structure) lives in `CONTEXT.md`.

This setup ensures consistent decision-making across long sessions — each agent reads the shared context and applies role-specific rules before responding.

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # login, register
│   ├── (app)/            # dashboard, /movimientos, /ingresos, /cambios
│   └── api/              # REST endpoints for all entities
├── services/             # business logic
├── repositories/         # Prisma queries
├── dtos/                 # Zod validation schemas
├── components/
│   ├── dashboard/        # WalletCard, MonthSummary, MovementList
│   ├── quick-add/        # Bottom sheet with ExpenseForm, IncomeForm, ExchangeForm
│   └── layout/           # AppShell, Sidebar (desktop), BottomNav (mobile)
└── lib/                  # prisma client, auth, apiHandler, money utils
```

## Setup

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# DATABASE_URL, AUTH_SECRET, AUTH_URL

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

## Key Design Decisions

- **Wallet is calculated, never stored** — balance is always derived from summing all movements
- **Exchanges are immutable** — no PATCH endpoint; delete and re-enter for traceability
- **Categories are per-household** — no global categories
- **Currency amounts are always separate** — ARS and USD are never merged into a single value

## Status

Core features complete. Remaining work: configuration screens (category CRUD, household member management).
