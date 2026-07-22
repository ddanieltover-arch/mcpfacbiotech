# MCPFAC BIOTECH — Delivery Walkthrough

> Record of completed work. Maintained by Enterprise Project Manager.  
> Last updated: 2026-07-22

---

## UX Motion & Polish (UX-MOTION-1–5) ✅

**Date:** 2026-07-22  
**Skill:** `motion-ux-enhancement-expert`  
**Milestones:** Phase 3 (Design System) · M8 (Marketing) · M6/M16 (Admin ops restraint)

### Policy

- **Marketing / catalog:** Level 1–2 motion — scroll reveals, hero entrance, page fades, badge pop, accordion animation
- **Ops surfaces** (admin, checkout, account, orders/quotes/invoices): hover/focus only via `data-motion="reduce"` — no entrance, stagger, or press-scale
- Presentation layer only — no business logic, API, or routing changes

### Delivered by priority

| Priority | Scope |
|----------|--------|
| **P0** | `HomeHero` staggered entrance; FAQ `AnimatePresence` height/opacity; `Button` press + hover; `variantsFor` / `staggerFor` / `transitionFor` in `lib/motion.ts` |
| **P1** | `ProductCardGrid` stagger + load-more skeletons; `CountBadge` spring pop (header + mobile nav); `EmptyState` primitive; `AdminTableSkeleton` / `AdminDashboardSkeleton` |
| **P2** | `MarketingSection` header reveals; `ComparisonTable` row stagger; `ProductImageGallery` (hover zoom + thumbnails); `StatGrid` count-up for numeric stats |
| **P3** | Marketing-only page transitions via `(main)/template.tsx` + `PageTransition` (first load instant; no fade on ops routes) |
| **Ops** | `lib/motion-policy.ts` + `OpsSurface` on admin shell, checkout, confirmation, account, portal list/detail pages |

### Key files

| Area | Path |
|------|------|
| Motion primitives | `apps/web/src/lib/motion.ts` |
| Ops policy | `apps/web/src/lib/motion-policy.ts` |
| Page transition | `apps/web/src/components/layout/page-transition.tsx`, `app/(main)/template.tsx` |
| Ops wrapper | `apps/web/src/components/layout/ops-surface.tsx` |
| UI primitives | `components/ui/empty-state.tsx`, `count-badge.tsx` |
| Marketing | `components/marketing/home-hero.tsx`, updated section/grid/table/stat components |
| Catalog | `components/products/product-card-grid.tsx`, `product-card-skeleton.tsx`, `product-image-gallery.tsx` |
| Admin loading | `components/admin/admin-table-skeleton.tsx` |

### Verification

- `pnpm --filter @mcpfac/web type-check` ✅
- Reduced-motion: CSS global rule + Framer `useReducedMotion` on animated components
- Ops routes excluded from `PageTransition` allowlist
- **UX-MOTION-4 QA (2026-07-22):** Playwright `e2e/motion.spec.ts` — 7/7 pass

| Check | Result |
|-------|--------|
| Checkout `data-motion="reduce"` | ✅ Pass |
| Checkout `Place Order` — no press-scale (class override + runtime transform) | ✅ Pass |
| Marketing `/contact` button — `motion-safe:active:scale-[0.98]` present | ✅ Pass |
| `prefers-reduced-motion` — marketing button does not scale on press | ✅ Pass |
| `prefers-reduced-motion` — marketing routes readable on entry (no stuck `opacity: 0`) | ✅ Pass |
| Cart badge pop — header shows count after cart seed | ✅ Pass |
| Cart badge under reduced motion | ✅ Pass |

**Manual spot-check (recommended once in real browser):** Home → About client nav fade with default motion; hero entrance; FAQ accordion. Automated tests cover ops restraint and reduced-motion regressions.

### UX-MOTION-5 — Hero layout (2026-07-22)

- **Hero** (`home-hero.tsx`): single-column, centered — eyebrow, headline, tagline, description, CTAs only (no side stat card)
- **Trust strip** (`home-trust-strip.tsx`): thin bordered bar below hero with `StatGrid variant="strip"`; disclaimer footnote retained
- **StatGrid** (`stat-grid.tsx`): new `variant="strip"` — compact typography, divider separators on `sm+`, scroll count-up preserved

### Open / deferred

_None — UX motion v1 complete._

---

## Homepage — Multi-shelf product sections ✅

- Replaced single featured block with `HomeProductShelves`: Featured, Newest, plus one shelf per catalog category
- Shared `ProductShelf` UI; empty shelves omit themselves
- Wired on `/` via `apps/web/src/app/(main)/page.tsx`

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

### AUTH-9 — Auth E2E smoke test (Playwright)

| Item | Path |
|------|------|
| Config | `apps/web/playwright.config.ts` |
| Spec | `apps/web/e2e/auth.spec.ts` |
| Supabase admin helpers | `apps/web/e2e/helpers/supabase-admin.ts` |
| Auth flow helpers | `apps/web/e2e/helpers/auth-flow.ts` |

**Flow:** UI register (`@example.com`) → admin email confirm → login → `/account` welcome → logout → protected-route redirect.

**Notes:** Skips when Supabase env is missing. On anon `signUp` rate limit, provisions user via service role. `E2E_AUTH_CALLBACK_VERIFY=1` optionally exercises `/auth/callback` via magic link.

**Run:** `pnpm test:e2e` (from repo root). First time: `pnpm exec playwright install chromium` from `apps/web`. Use `PLAYWRIGHT_SKIP_WEBSERVER=1` when `pnpm dev` is already running.

### Phase 19 — Commerce E2E (catalog → cart → checkout)

| Item | Path |
|------|------|
| Spec | `apps/web/e2e/commerce.spec.ts` |
| Env helper | `apps/web/e2e/helpers/commerce-env.ts` |

**Flow:** Browse `/products` → add priced item → `/cart` → guest `/checkout` → confirmation page with order reference.

**Notes:** Skips when `DATABASE_URL` is missing or catalog has no priced products. Requires `pnpm dev` (web + API + DB). Guest checkout merges session cart before order creation (see `OrdersService.checkout`).

### Phase 19 — Admin E2E (login → order → status)

| Item | Path |
|------|------|
| Spec | `apps/web/e2e/admin.spec.ts` |
| Setup helper | `apps/web/e2e/helpers/admin-setup.ts` |

**Flow:** Provision ADMINISTRATOR → seed PENDING guest order (Prisma) → UI login → `/admin/orders` → open order → **Set CONFIRMED**.

**Notes:** Skips without Supabase + `DATABASE_URL` + backend. Order seed bypasses slow checkout API. Admin status PATCH uses a 30s Prisma interactive transaction (invoice on confirm). Auth pathname refresh uses `/auth/me` when a profile already exists so navigations do not stampede `/auth/sync`.

**Run:** `PLAYWRIGHT_SKIP_WEBSERVER=1 pnpm --filter @mcpfac/web exec playwright test e2e/admin.spec.ts` (with web on `:3000` and API on `:3001`).

**Verified:** 2026-07-22 — 1/1 pass (~2.8m).

### Phase 19 — Shared package unit tests

| Package | Spec |
|---------|------|
| `@mcpfac/shared-utils` | `packages/shared-utils/src/index.spec.ts` |
| `@mcpfac/shared-validators` | `packages/shared-validators/src/index.spec.ts` |

**Run:** `pnpm test` (API + shared packages via Turbo). API coverage gate: `pnpm --filter @mcpfac/api test:cov`.

### Phase 20 — Production go-live ✅

**Date:** 2026-07-22 (operator-confirmed live)

| Item | Value |
|------|--------|
| Storefront | `https://mcpfacbiotech.site` |
| API | `https://api.mcpfacbiotech.site` |
| Runbook | `docs/DEPLOYMENT.md` |
| Stack | Vercel (web + Nest API) · Supabase (DB/auth) · Resend (email) |

**Exit criteria met:** Production env vars set; Vercel projects deployed; Supabase auth redirects aligned; smoke verified on live URL.

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

## Milestone 6 — Admin Platform (ops console v1) ✅

**Date:** 2026-07-21

### Scope delivered
- Role-gated admin API (`ADMINISTRATOR`, `SUPER_ADMINISTRATOR`, `SUPPORT`, `CONTENT_EDITOR`, `INVENTORY_MANAGER`)
- Dashboard metrics (products, quotes, orders, customers, low stock)
- Product publish / archive / stock / pricing edits
- Quote review / approve / reject with status history
- Order fulfillment transitions (confirm issues invoice)
- Customer suspend / reactivate
- `/admin` UI shell + pages; header Admin Console link for staff
- `pnpm db:promote-admin` (`ADMIN_EMAIL=...`)

### API
| Method | Path |
|--------|------|
| GET | `/api/v1/admin/dashboard` |
| GET/PATCH | `/api/v1/admin/products`, `/api/v1/admin/products/:id` |
| GET | `/api/v1/admin/quotes`, `/api/v1/admin/quotes/:id` |
| POST | `/api/v1/admin/quotes/:id/review\|approve\|reject` |
| GET | `/api/v1/admin/orders`, `/api/v1/admin/orders/:id` |
| PATCH | `/api/v1/admin/orders/:id/status` |
| GET/PATCH | `/api/v1/admin/customers`, `/api/v1/admin/customers/:id` |

### Deferred
- Full CMS (categories/media/blog), document versioning, analytics/reports, command palette

---

## Milestone 6b — Categories & Inventory Thresholds ✅

**Date:** 2026-07-21

### Scope delivered
- `products.low_stock_threshold` (default 5) + migration
- Admin categories: list / create / update / soft-delete (blocks delete with children)
- Admin inventory: list with `lowStockOnly`, inline stock + threshold edits
- Auto `IN_STOCK` ↔ `LOW_STOCK` when stock crosses threshold
- Dashboard low-stock count uses per-product thresholds
- UI: `/admin/categories`, `/admin/inventory`

### API
| Method | Path |
|--------|------|
| GET/POST | `/api/v1/admin/categories` |
| GET/PATCH/DELETE | `/api/v1/admin/categories/:id` |
| GET | `/api/v1/admin/inventory` |
| PATCH | `/api/v1/admin/inventory/:id` |

### Deferred
- Media library, blog CMS, document versioning, analytics/reports

---

## Milestone 7a — CI + API Envelope ✅

**Date:** 2026-07-21

### Scope delivered
- Wired `ResponseInterceptor` + `GlobalExceptionFilter` in `apps/api/src/main.ts` (Appendix C envelope)
- Unit tests for `GlobalExceptionFilter` (HTTP exceptions, Prisma errors, unknown)
- GitHub Actions CI (`.github/workflows/ci.yml`): install → Prisma generate → type-check → lint (advisory) → API tests → API/web build
- Swagger tag for `admin`

### Still open (M7)
- Harden lint to fail CI (currently `continue-on-error`)
- Follow-on: cart/orders/quotes *service* files to ≥90% lines (controllers already gated)

---

## Milestone 7b — Structured Logging (Pino) ✅

**Date:** 2026-07-21

### Scope delivered
- `nestjs-pino` + `pino-pretty` (dev): `AppLoggerModule` with `LOG_LEVEL` / env-aware defaults
- Request ID via `X-Request-ID` (inbound reuse + response header + envelope `metadata.requestId`)
- Redaction: Authorization, Cookie, passwords/tokens
- Quiet auto-logging for `/health` and `/api/docs`
- Nest bootstrap uses `bufferLogs` + Pino as app logger
- Exception filter emits structured error objects for Pino correlation
- Unit tests: `logger.config.spec.ts` (4) + existing filter tests

### Still open (M7)
- Harden lint to fail CI (currently `continue-on-error`)
- Follow-on: cart/orders/quotes *service* files to ≥90% lines (controllers already gated)

---

## Milestone 7c — Critical-Path Coverage Gate ✅

**Date:** 2026-07-21

### Scope delivered
- Jest `collectCoverageFrom` scoped to critical auth/guards/pricing/invoices/admin/controllers
- Coverage thresholds enforced: statements/lines/functions ≥85%, branches ≥70%
- New specs: auth service, guards, response interceptor, commerce-pricing, invoices, admin-dashboard, health, critical controllers
- Expanded admin-inventory + admin-orders specs
- CI runs `pnpm --filter @mcpfac/api test:cov`
- Result: **~98% stmts / ~73% branches / 73 tests** on critical path

### Still open (M7)
- Harden lint to fail CI (currently `continue-on-error`)
- Follow-on: cart/orders/quotes *service* files to ≥90% lines (controllers already gated)

---

## Milestone 7d — Staging Deploy Scaffolding ✅ (superseded by production go-live)

**Date:** 2026-07-21

### Scope delivered
- Backend host decision: **Render** (Docker) — `render.yaml` + `apps/api/Dockerfile` (legacy; production uses Vercel API)
- Frontend: **Vercel** — `apps/web/vercel.json` (monorepo install/build)
- Runbook: `docs/DEPLOYMENT.md` (env matrix, Auth redirects, smoke checklist)
- Workflow: `.github/workflows/deploy-staging.yml` (GHCR image push; optional Vercel hook)
- Fixed `pnpm-workspace.yaml` `esbuild` allowBuilds entry
- README deployment row updated

### Production go-live (Phase 20) — 2026-07-22
- Live at `https://mcpfacbiotech.site` + `https://api.mcpfacbiotech.site`
- Operator confirmed env, deploy, and production smoke complete

---

## M8 Sprint 11 — SEO & Links (CONTENT-11) ✅ · M8 Complete

**Date:** 2026-07-21

### Scope delivered
- Fixed duplicate `| MCPFAC BIOTECH` titles (root template already appends brand)
- Home uses `title.absolute` + OG/canonical
- Added `app/sitemap.ts` (static marketing + research/blog slugs)
- Added `app/robots.ts` (disallow admin/account/checkout/cart/commerce private paths)
- `/design-system` noindex layout
- Stronger internal links on `/support` and `/careers`

### M8 exit
Content & marketing milestone complete (CONTENT-0–11).

---

## M8 Sprint 10 — Legal Pages (CONTENT-10) ✅

**Date:** 2026-07-21

### Scope delivered
- `/terms` — research-use clauses, payment/shipping/docs/returns, liability, ResearchUseBanner
- `/privacy` — research-procurement scope, international transfers, cookie cross-link
- `/returns` — 7-day damaged/incorrect window, non-returnable opened materials, support paths
- `/cookies` — essential cart/auth cookies called out for storefront workflows
- Consistent last-updated date + CONTACT_CHANNELS email

### Next
- CONTENT-11: SEO + internal links

---

## M8 Sprint 9 — Navigation (CONTENT-9) ✅

**Date:** 2026-07-21

### Scope delivered
- Shared nav config: `lib/site-navigation.ts`
- Main nav: Products (from `CATEGORY_OPTIONS`) · Solutions · **Resources** (Research, Blog, FAQ, COA, Calculator, Quality, Downloads) · About · Contact
- Top bar: FAQ, COA, Calculator, Shipping, Support
- Footer: Shop / Company / Support / Legal from shared config; contact hours; removed placeholder phone

### Next
- CONTENT-10: legal pages

---

## M8 Sprint 8 — Blog Seed Posts (CONTENT-8) ✅

**Date:** 2026-07-21

### Scope delivered
- Replaced “coming soon” stub with `/blog` list of 3 seed posts
- `/blog/[slug]` static pages via `generateStaticParams`
- Posts: COA-first procurement · shipping tiers · research-use compliance
- Cross-links to Research library (peptide briefs stay under `/research` until CMS)
- Content module: `lib/blog-posts.ts`

### Next
- CONTENT-9: nav/footer polish

---

## M8 Sprint 7 — About & Contact (CONTENT-7) ✅

**Date:** 2026-07-21

### Scope delivered
- `/about` — highlights strip, WhyUsGrid, wholesale CTA, location + support hours
- `/contact` — email/hours/address cards, quick paths (bulk quote, COA, shipping), form + ResearchUseBanner
- Shared `CONTACT_CHANNELS` + `ABOUT_HIGHLIGHTS` in marketing-content
- Contact form reads `?subject=` for bulk-quote deep link (Suspense-wrapped)

### Next
- CONTENT-8: blog seed content

---

## M8 Sprint 6 — Peptide Calculator (CONTENT-6) ✅

**Date:** 2026-07-21

### Scope delivered
- **Created** `/calculator` with live reconstitution planner
- Math helper: `lib/peptide-calculator.ts` (mg/mL, mcg/mL, draw volume, U-100 units)
- UI: `components/content/peptide-calculator.tsx`
- Links from header, footer, research hub; research guide CTA on page
- Research-use disclaimers (not medical/dosing advice)

### Next
- CONTENT-7: about + contact polish

---

## M8 Sprint 5 — COA Library (CONTENT-5) ✅

**Date:** 2026-07-21

### Scope delivered
- **Created** `/coa` — library landing, illustrative packet, how-to steps, ResearchUseBanner
- Batch lookup stub (`CoaBatchLookup`) → mailto to `info@mcpfacbiotech.site` until CMS search
- `/downloads` CTA + copy wired to COA library
- Home hero secondary CTA → `/coa`
- Header top bar + footer support link for COA

### Next
- CONTENT-6: peptide calculator

---

## M8 Sprint 4 — Research Library (CONTENT-4) ✅

**Date:** 2026-07-21

### Scope delivered
- Content module: `lib/research-articles.ts` (5 articles)
- `/research` hub with card grid + related tools + ResearchUseBanner
- `/research/[slug]` static pages via `generateStaticParams`
- Articles:
  - BPC-157 & repair signalling
  - TB-500 / thymosin beta-4 class
  - GLP-1 receptor pharmacology
  - GHK-Cu & copper peptides
  - Peptide basics: reconstitution & storage
- Educational / research-use framing; not medical advice

### Next
- CONTENT-5: `/coa` library

---

## M8 Sprint 3 — FAQ Expand (CONTENT-3) ✅

**Date:** 2026-07-21

### Scope delivered
- Central `FAQ_ITEMS` (11 Q&As) in `marketing-content.ts`
- Homepage teaser = `FAQ_ITEMS.slice(0, 4)` (always in sync)
- Topics: research-use, purity, COA/MSDS/HPLC, shipping rates, payments, lot verification, returns, quotes, international shipping, tracking, quality link
- `/faq` related-resources links to quality, shipping, downloads, returns

### Next
- CONTENT-4: research hub + articles

---

## M8 Sprint 2 — Quality & Shipping (CONTENT-2) ✅

**Date:** 2026-07-21

### Scope delivered
- `/quality` — COA-first workflow, quality pillars (HPLC/identity/COA/storage), purity list, ComparisonTable, cold-chain notes, ResearchUseBanner
- `/shipping` — live `SHIPPING_METHOD_OPTIONS` cards (Standard $25 / Priority $50), 24–48h dispatch, packaging, customs, links to returns/FAQ/contact
- Shared copy: `QUALITY_PILLARS`, `SHIPPING_EXPECTATIONS` in `marketing-content.ts`
- Free-shipping threshold left as “announced separately” (not wired in checkout)

### Next
- CONTENT-3: expand `/faq`

---

## M8 Sprint 1 — Homepage (CONTENT-1) ✅

**Date:** 2026-07-21

### Scope delivered
- Rebuilt `/` with reference-style funnel:
  - PromoBar → hero + trust StatGrid → CategoryHubGrid → featured products
  - WhyUsGrid → ComparisonTable → ProcessSteps → TestimonialGrid
  - FAQ teaser (`HOME_FAQ_TEASER`) → ResearchUseBanner
- Copy/constants in `lib/marketing-content.ts` (`HOME_HERO`, `HOME_FAQ_TEASER`)
- Featured section simplified (category chips removed; hubs own that job)
- Secondary CTA points to `/downloads` until `/coa` (CONTENT-5)

### Next
- CONTENT-2: `/quality` + `/shipping`

---

## M8 Sprint 0 — Marketing Components (CONTENT-0) ✅

**Date:** 2026-07-21

### Scope delivered
- Content map: `apps/web/src/lib/marketing-content.ts` (promo, stats, categories, why-us, process, comparison, testimonials, hero, disclaimer)
- Shared blocks in `apps/web/src/components/marketing/`:
  - `PromoBar`, `StatGrid`, `CategoryHubGrid`, `WhyUsGrid`, `ProcessSteps`
  - `ComparisonTable`, `TestimonialGrid`, `ResearchUseBanner`, `MarketingSection`
- Showcase on `/design-system` (Marketing blocks section)
- Type-check passed

### Next
- CONTENT-1: Assemble homepage from these blocks

---

## Phase 18 — Reporting ❌ Deferred


**Date:** 2026-07-21 (deferred)

### Why deferred
Volume 7 reports/analytics (sales, orders, quotes, downloads, inventory, revenue, conversion) are out of scope until CMS/ops data volume justifies them. Dashboard already exposes basic ops counts (products, low stock, pending quotes/orders, invoices).

### Re-entry scope (when un-deferred)
1. Admin `/admin/reports` with date-range filters
2. Sales / orders / quotes summary APIs + CSV export
3. Inventory movement and low-stock trends
4. Optional: simple revenue chart on dashboard

### Depends on
- Phase 16 ops console (done)
- Meaningful production order volume

---

## Phase 17 — CMS (documents + media + blog/FAQ) ✅

**Date:** 2026-07-22

### Delivered (v1)
1. **Documents CMS** — `AdminDocumentsController/Service` at `/admin/documents`
   - List/filter by type + search (title, file, product SKU)
   - Create/update/soft-delete; approve toggle; attach/detach products by SKU
   - Admin UI: `/admin/documents` + nav entry
2. **Media library** — `AdminMediaController/Service` at `/admin/media`
   - URL registry (fileName, fileUrl, mime, alt, folder); hard delete
   - Admin UI: `/admin/media`
3. **Public COA search** — `GET /api/v1/documents/search` (approved + PUBLIC)
   - `/coa` `CoaBatchLookup` searches COA/HPLC; mailto remains as fallback

### Delivered (v1.1 — CMS-4 blog/FAQ)
1. **Blog CMS** — `AdminBlogController/Service` + public `BlogModule`
   - Admin CRUD/soft-delete + status at `/admin/blog`
   - Public `GET /api/v1/blog`, `GET /api/v1/blog/:slug`
   - Storefront `/blog` + `/blog/[slug]` read from API (static `blog-posts.ts` fallback)
2. **FAQ CMS** — `AdminFaqController/Service` + public `FaqModule`
   - Categories + questions at `/admin/faq`
   - Public `GET /api/v1/faq` (+ `/faq/categories`)
   - `/faq` + homepage FAQ teaser from API (static `FAQ_ITEMS` fallback)
3. **Seed** — `prisma/seed/cms-content.ts` upserts 3 published posts + 11 FAQ items

### Key files
| Area | Path |
|------|------|
| Shared types | `packages/shared-types` — blog/FAQ + admin document/media types |
| Admin API | `apps/api/src/modules/admin/admin-documents.*`, `admin-media.*`, `admin-blog.*`, `admin-faq.*` |
| Public API | `apps/api/src/modules/documents/`, `blog/`, `faq/` |
| Admin UI | `apps/web/src/app/(main)/admin/{documents,media,blog,faq}` |
| Public fetch | `apps/web/src/lib/cms-content.ts` |
| Seed | `prisma/seed/cms-content.ts` |

### Deferred
- Research article admin (CMS-5) + swap `research-articles.ts`
- Binary upload via Supabase Storage
- Document versioning / download-log UI

---

## Phase 16 — Administration (Partial) ✅

**Date:** 2026-07-21

### Scope delivered (ops console v1)
- Role-gated `/admin` console: dashboard, products, categories, inventory, quotes, orders, customers
- Fulfillment workspace: payment + shipping on order list/detail, totals breakdown, status transitions, invoice on confirm
- Customer verify + suspend/reactivate
- Empty states on key list/recent panels; dashboard invoice card → `/admin/orders`
- Categories CRUD + inventory thresholds (ADM-9a/9b)
- Documents + media CMS → **Phase 17** (delivered 2026-07-22)

### Explicitly deferred (full admin suite)
- Research article CMS (CMS-5)
- Reports / analytics → **Phase 18**
- Users/roles UI, support tickets, command palette, carrier tracking

---

## Phase 15 — Shipping Methods ✅

**Date:** 2026-07-21

### Scope delivered
- Flat-rate checkout shipping (mockup-aligned radio cards):
  - **Standard Delivery** — 3–5 business days — **$25**
  - **Priority Express** — 1–2 business days — **$50**
- Prisma `OrderShippingMethod` + `orders.shipping_method`
- Checkout summary includes shipping + total
- Order detail / admin show selected method
- Component: `components/checkout/shipping-method-selector.tsx`

### Out of scope (future)
- Carrier API / live rates
- Creating `Shipment` + tracking numbers on fulfill
- International / free-shipping rules

---

## Phase 3 — Design System ✅

**Date:** 2026-07-21

### Scope delivered
- Volume 2 tokens already in `globals.css` (@theme brand/spacing/type/radius/shadow)
- UI primitives in `apps/web/src/components/ui/`: Button, Input, Textarea, Label, Badge, Card, Alert, Separator, Skeleton, Spinner, EmptyState, CountBadge
- Shared motion helpers in `lib/motion.ts` (`fadeIn`, `slideUp`, `scaleIn`, `fadeInDown`, `staggerChildren`, reduced-motion helpers)
- Ops motion policy in `lib/motion-policy.ts` + `OpsSurface` wrapper
- Live showcase: `/design-system`
- Migrated login + checkout + availability badge onto primitives

### Follow-on (optional)
- Roll primitives through register / admin forms
- Dialog / Select / Dropdown Menu (Radix) when needed

---

## Phase 14 — Manual Payment Methods ✅

**Date:** 2026-07-21

### Scope delivered
- Manual checkout payment options (no gateway capture): Bitcoin, USDT, Credit card, Bank transfer, Chime, Cash App
- Prisma `PaymentMethod` enum + `orders.payment_method`
- Shared `PAYMENT_METHOD_OPTIONS` labels/descriptions
- Checkout UI: radio cards; order detail + admin show selected method
- Settlement copy: instructions emailed after order (no online charge)

### Out of scope (future)
- Online card capture / PSP (Stripe etc.)
- Admin CMS for wallet addresses / bank details
- Payment status tracking beyond order PENDING → CONFIRMED

---

## Next Milestone Preview — reporting / research CMS / polish

Phase 18 reporting, CMS-5 research admin, or CI E2E gate.

**M6 smoke closed:** valid `SUPABASE_SERVICE_ROLE_KEY` installed; `mcpfacbiotech@gmail.com` → ADMINISTRATOR; `pnpm db:smoke-admin` 12/12.

**Production live:** `https://mcpfacbiotech.site` · `https://api.mcpfacbiotech.site` (Phase 20 complete).
