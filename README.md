# MCPFAC BIOTECH

> Enterprise-grade B2B e-commerce platform for biotechnology research products and laboratory supplies.

## Overview

**MCPFAC BIOTECH** is a global biotechnology research laboratory and supplier of peptides, research chemicals, and laboratory products. This monorepo contains the complete platform:

- 🧬 **Website** — Product catalog, quotation engine, customer portal
- 🔬 **API** — NestJS backend powering all business logic
- 🗃️ **Database** — PostgreSQL via Supabase with Prisma ORM

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | NestJS, TypeScript, Prisma, Swagger |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| Auth | Supabase Auth |
| Deployment | Vercel (frontend), TBD (backend) |

## Project Structure

```
mcpfac-biotech/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── shared-types/       # Shared TypeScript interfaces
│   ├── shared-utils/       # Shared utility functions
│   └── shared-validators/  # Shared Zod schemas
├── prisma/
│   ├── schema.prisma       # Generator + datasource
│   └── models/             # Domain-based schema files
└── docs/                   # Documentation
```

## Getting Started

### Prerequisites

- Node.js ≥ 22
- pnpm ≥ 9
- Supabase account

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd mcpfac-biotech

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Fill in your Supabase credentials

# Run database migration
pnpm db:migrate

# Seed initial data
pnpm db:seed

# Start development servers
pnpm dev
```

### Development

```bash
pnpm dev          # Start all apps in dev mode
pnpm build        # Build all apps
pnpm lint         # Run linters
pnpm type-check   # Run TypeScript checks
pnpm test         # Run tests
pnpm db:studio    # Open Prisma Studio
```

## License

UNLICENSED — Proprietary software of MCPFAC BIOTECH.

---

© 2016–2026 MCPFAC BIOTECH. Learn • Understand • Grow.
