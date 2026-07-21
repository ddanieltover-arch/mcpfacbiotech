# MCPFAC BIOTECH — Delivery Walkthrough

> Record of completed work. Maintained by Enterprise Project Manager.  
> Last updated: 2026-07-20

---

## Project Summary

Enterprise B2B e-commerce platform for biotechnology research products.  
Stack: Next.js 16 + React 19 (frontend), NestJS 11 (API), PostgreSQL/Prisma/Supabase (data + auth).

---

## Milestone 1 — Monorepo Foundation ✅

**Commit:** `977d6ec` — `feat: scaffold monorepo foundation (Milestone 1)`  
**Commit:** `95db5d3` — `fix: resolve frontend and backend build errors`

### Delivered

#### Monorepo & Tooling
- pnpm workspace with Turbo orchestration
- Root scripts: `dev`, `build`, `lint`, `type-check`, `test`, `db:*`
- Shared TypeScript base config
- Prettier + ESLint setup

#### Database (Prisma — 10 domains)
Schema files under `prisma/`:
- `auth.prisma` — profiles, roles, permissions, addresses
- `products.prisma` — products, images, specs, reviews, wishlist, compare
- `categories.prisma` — hierarchical categories
- `customers.prisma` — customer records, groups
- `cart.prisma` — shopping cart
- `quotes.prisma` — quotation engine
- `orders.prisma` — orders, order items
- `invoices.prisma` — invoicing
- `documents.prisma` — COA, MSDS, HPLC, etc.
- `shipping.prisma` — shipments
- `support.prisma` — support tickets
- `blog.prisma` — research articles

**Commit:** `4c6161f` — `feat(db): apply initial prisma migration for all 10 domains to Supabase`  
- Migration `20260720091439_init` applied to Supabase PostgreSQL

#### Backend API Shell (`apps/api`)
- NestJS bootstrap with URI versioning (`/api/v1/...`)
- Swagger at `/api/docs` with tags for all planned modules
- Global validation pipe, CORS, rate limiting (100/min default, 10/min auth)
- `DatabaseModule` + `PrismaService`
- `HealthModule` — health check endpoint
- Common infrastructure: decorators (`@Public`, `@Roles`, `@CurrentUser`), pagination DTO, response interceptor, global exception filter (not yet wired in `main.ts`)

#### Frontend Shell (`apps/web`)
- Next.js App Router with route groups `(main)` and `(auth)`
- Brand design tokens in `globals.css` (MCPFAC green palette)
- Layout components: `Header` (full nav, cart badge, user menu), `Footer`
- Client stores (Zustand): cart, wishlist, compare, auth
- Providers: React Query, auth, toast (Sonner)
- API client stub (`lib/api-client.ts`)
- Supabase client helpers (browser + server)
- Placeholder homepage with “Platform Under Development” badge

#### Shared Packages
- `@mcpfac/shared-types` — API envelope, product/order/quote/cart interfaces
- `@mcpfac/shared-utils` — utility functions
- `@mcpfac/shared-validators` — Zod schemas

#### Engineering Standards
- `mcpfac-biotech-engineering/` — 8 reference volumes + 6 appendices + prompt library + SKILL.md

### Verification (2026-07-20)
- `apps/web` build: ✅
- `apps/api` build: ✅
- Root `pnpm type-check`: ❌ (shared packages missing `typescript` devDependency)

---

## Milestone 1.5 — Authentication ✅

**Commits:** `9501fe6` (frontend auth) + 2026-07-20 (P0 blockers, profile sync, JWT guard)

### Delivered

| Component | Path | Notes |
|-----------|------|-------|
| Login page | `apps/web/src/app/(auth)/login/page.tsx` | Email/password, error states, password reset success message |
| Register page | `apps/web/src/app/(auth)/register/page.tsx` | Profile metadata (name, org, country) |
| Forgot password | `apps/web/src/app/(auth)/forgot-password/page.tsx` | Reset email trigger |
| Reset password | `apps/web/src/app/(auth)/reset-password/page.tsx` | Set new password after email link |
| Server Actions | `apps/web/src/app/(auth)/actions.ts` | login, register, forgotPassword, resetPassword, logout |
| Auth callback | `apps/web/src/app/auth/callback/route.ts` | Code exchange + backend profile sync |
| Middleware | `apps/web/src/middleware.ts` | Session refresh; protects `/account`, `/checkout`, `/orders` |
| Auth provider | `components/providers/auth-provider.tsx` | Session listener |
| Auth store | `stores/auth.store.ts` | User state + automatic backend profile sync |
| Profile sync client | `lib/auth-sync.ts` | Calls `POST /api/v1/auth/sync` |
| Auth module | `apps/api/src/modules/auth/` | sync + me endpoints |
| Supabase JWT guard | `apps/api/src/common/guards/supabase-auth.guard.ts` | Global auth; `@Public()` bypass |
| Roles guard | `apps/api/src/common/guards/roles.guard.ts` | `@Roles()` enforcement |
| DB seed | `prisma/seed.ts` | Roles, permissions, role-permission mappings |

### Backend Endpoints

- `POST /api/v1/auth/sync` — Upserts Profile + Customer from Supabase JWT (no profile required)
- `GET /api/v1/auth/me` — Returns authenticated user from Prisma profile

### Remaining

- AUTH-9: Auth flow E2E smoke test

---

## What Exists vs. What Is Planned

| Area | Shipped | Planned (not built) |
|------|---------|---------------------|
| API modules | Health | Products, Categories, Cart, Quotes, Orders, Invoices, Documents, Customers, Blog, Support |
| Frontend pages | `/`, login, register, forgot-password | Products, account, checkout, admin, content pages |
| Auth | Supabase frontend flow | Backend JWT guard, profile sync, RBAC enforcement |
| Data | Schema + migration | Seed data, RLS policies |
| CI/CD | — | GitHub Actions pipeline |
| Tests | Jest configured in API | No test files written |

---

## Regression Checklist (pre-M2)

Before starting Milestone 2, confirm:

- [ ] Login → logout cycle works with Supabase credentials
- [ ] Email verification callback completes without error
- [ ] Protected routes redirect unauthenticated users to `/login`
- [ ] Authenticated users redirected away from `/login`
- [ ] Profile row created in `profiles` table after registration
- [ ] Root `pnpm type-check` passes
- [ ] Seed script populates roles + sample categories/products

---

## Milestone 2 — Product Catalog ✅

**Date:** 2026-07-20

### Backend API

| Module | Endpoints |
|--------|-----------|
| `ProductsModule` | `GET /products`, `GET /products/featured`, `GET /products/search/suggest`, `GET /products/batch`, `GET /products/:slug` |
| `CategoriesModule` | `GET /categories`, `GET /categories/:slug` |
| `WishlistModule` | `GET/POST/DELETE /wishlist`, `POST /wishlist/sync` |
| `CompareModule` | `GET/POST/DELETE /compare`, `POST /compare/sync` |

All catalog routes are public (`@Public()`). Wishlist/compare require authentication.

### Database Seed

- `prisma/seed/categories.ts` — 4 top-level categories
- `prisma/seed/products.ts` — 10 sample products with images, specs, documents
- Seed entrypoint updated in `prisma/seed.ts`

Run: `pnpm db:seed`

### Frontend

| Route | Description |
|-------|-------------|
| `/products` | Paginated catalog with sidebar filters |
| `/products/[slug]` | Product detail with specs, docs, related products |
| `/wishlist` | Saved products (local store + batch API fetch) |
| `/compare` | Side-by-side comparison table (max 4) |
| `/` | Live hero + featured products section |

### Components

- `ProductCard`, `ProductFilters`, `ProductGrid`, `ProductSearch`, `ProductActions`
- Header wired with search autocomplete, wishlist, and compare badges

### Tests

- `apps/api/src/modules/products/products.service.spec.ts` — 3 unit tests passing

### Verification

- API + Web type-check ✅
- API + Web build ✅
- Jest product service tests ✅

---

## Milestone 2.5 — Legacy Catalog Import ✅

**Date:** 2026-07-20

### Source
CSV exports from legacy Supabase (no `SOURCE_DATABASE_URL`):
- `prisma/migrate-legacy/data/categories_rows.csv`
- `prisma/migrate-legacy/data/products_rows.csv`
- `prisma/migrate-legacy/data/images_rows.csv`
- `prisma/migrate-legacy/data/variants_rows.csv`

### Imported

| Entity | Count |
|--------|------:|
| Categories | 20 |
| Products | 234 |
| Category pivots | 234 |
| Images | 235 |
| Variants | 242 |
| Errors | 0 |

### Notes
- Upsert keyed by `slug` (legacy has no SKU; SKU generated from slug)
- `product_variants` table added for size/packaging + price modifiers
- Import uses `DIRECT_URL` (pooler hung on bulk writes)
- Sample `MBT-*` seed products removed when `LEGACY_REPLACE_SAMPLE_PRODUCTS=true`
- Image URLs still point at legacy Supabase storage bucket

### Command
```bash
pnpm db:migrate-legacy
```

---

## Milestone 3 — Cart & Quotation Engine ✅

**Date:** 2026-07-20

### Scope delivered
- Server-authoritative cart (guest `X-Cart-Session` + authenticated customer carts)
- Merge guest → customer cart on login
- Quotes: create from cart or items, draft edit, submit, list, detail + status history
- UI: cart drawer, `/cart`, `/quotes`, `/quotes/[id]`
- Commerce uses **live imported catalog** (not sample `MBT-*` seed products)

### API
| Method | Path | Notes |
|--------|------|-------|
| GET/PATCH/DELETE | `/api/v1/cart` | Guest or auth |
| POST/PATCH/DELETE | `/api/v1/cart/items` | Server pricing + MOQ |
| POST | `/api/v1/cart/merge` | Auth required |
| GET/POST | `/api/v1/quotes` | Auth required |
| GET/PATCH | `/api/v1/quotes/:id` | Draft edits only |
| POST | `/api/v1/quotes/:id/submit` | Clears cart on submit |

### Tests
- `cart.service.spec.ts` — 4 tests
- `quotes.service.spec.ts` — 3 tests

### Deferred
- Quote PDF, admin approve/reject UI, convert-to-order (M4/M6)

---

## Milestone 4 — Orders, Invoices & Checkout ✅

**Date:** 2026-07-20

### Scope delivered
- Checkout from cart or SUBMITTED/APPROVED quote → `PENDING` order
- Confirm order → `CONFIRMED` + `ISSUED` invoice (bank transfer / PO placeholder)
- Cancel pending orders
- Quote marked `CONVERTED` on checkout from quote
- UI: `/checkout`, `/orders`, `/orders/[id]`, `/invoices`, `/invoices/[id]`

### API
| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/v1/orders/checkout` | fromCart or quoteId |
| GET | `/api/v1/orders`, `/orders/:id` | Customer scoped |
| POST | `/api/v1/orders/:id/confirm` | Issues invoice |
| POST | `/api/v1/orders/:id/cancel` | Pending only |
| GET | `/api/v1/invoices`, `/invoices/:id` | Customer scoped |

### Deferred
- Payment gateways, invoice PDF, shipping/fulfillment automation

---

## Milestone 5 — Customer Portal ✅

**Date:** 2026-07-21

### Scope delivered
- Account dashboard with live counts + recent orders/quotes/invoices
- Profile edit (name, phone, org, department, country)
- Address book CRUD (default address support)
- Sidebar nav to orders, quotes, invoices, wishlist
- Settings stub (password reset link; downloads deferred)

### API
| Method | Path |
|--------|------|
| GET | `/api/v1/account/dashboard` |
| GET/PATCH | `/api/v1/account/profile` |
| GET/POST | `/api/v1/account/addresses` |
| PATCH/DELETE | `/api/v1/account/addresses/:id` |

### Deferred
- Document download center, support tickets/messages

---

## Next Milestone Preview — M6 Admin Platform

CMS, inventory, quote/order admin tools, reporting.
