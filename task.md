# MCPFAC BIOTECH — Project Backlog

> Maintained by Enterprise Project Manager. Last updated: 2026-07-21

## Current Phase

**Milestone 1 — Foundation** is complete.  
**Milestone 1.5 — Authentication** is complete (AUTH-9 E2E test remains).  
**Milestone 2 — Product Catalog** is complete.  
**Milestone 2.5 — Legacy Catalog Import** is complete.  
**Milestone 3 — Cart & Quotation Engine** is complete.  
**Milestone 4 — Orders, Invoices & Checkout** is complete.  
**Milestone 5 — Customer Portal** is complete.  
**Milestone 6 — Admin Platform** is in progress (ops + categories/inventory).  
**Milestone 7 — Platform Hardening** is largely complete (CI, envelope, pino, coverage, staging scaffolding).  
**Phase 3 — Design System** is complete (tokens + `components/ui` primitives + showcase).  
**Phase 14 — Payments (manual methods)** is complete.  
**Phase 15 — Shipping methods** is complete (Standard $25 / Priority Express $50).  
**Phase 16 — Administration** is complete at Partial (ops console + inventory/categories).  
**Phase 17 — CMS** is ❌ Deferred (ADM-9c media / blog / documents).  
**Phase 18 — Reporting** is ❌ Deferred (analytics / sales / inventory reports).  
**Phase 21 — Content & Marketing (M8)** is ✅ Complete (CONTENT-0–11).  
**Next focus:** Phase 19 Testing, Phase 20 staging go-live, or un-defer CMS.

---

## Milestone Map

| Milestone | Scope | Status |
|-----------|-------|--------|
| M1 | Monorepo, DB schema, API shell, frontend shell, engineering standards | ✅ Complete |
| M1.5 | Supabase Auth (login, register, forgot-password, middleware, session, profile sync, JWT guard) | ✅ Complete |
| M2 | Product catalog API + UI (list, detail, search, categories) | ✅ Complete |
| M2.5 | Legacy Supabase catalog import (categories/products/images/variants) | ✅ Complete |
| M3 | Cart & quotation engine (live imported catalog) | ✅ Complete |
| M4 | Orders, invoices, checkout | ✅ Complete |
| M5 | Customer portal (account, orders, quotes, downloads) | ✅ Complete |
| M6 | Admin platform (CMS, inventory, reports) | 🔄 In progress (ops + categories/inventory) |
| M7 | Integration, testing, CI/CD, deployment | 🔄 In Progress |
| M8 | Content & marketing pages (reference-driven) | ✅ Complete |

---

### M8 — Content & Marketing (reference: [PH Research](https://www.ph-research.store/) · [Premium Peptides Lab](https://www.premiumpeptideslab.online/))

> **Rule:** Adapt and rebrand for MCPFAC BIOTECH — do not copy competitor text verbatim. Use reference sites for structure, section types, and tone only.

| ID | Task | Layer | Deps | Status |
|----|------|-------|------|--------|
| CONTENT-0 | Content map + shared marketing components (promo bar, stat grid, comparison table, testimonial, process steps, category hub card) | Frontend | Phase 3 | ✅ Done |
| CONTENT-1 | Homepage — hero, trust stats, category grid, featured products, why-us, process, FAQ teaser, research-use banner | Frontend | CONTENT-0 | ✅ Done |
| CONTENT-2 | `/quality` + `/shipping` — enrich with COA/HPLC/cold-chain + checkout shipping tiers ($25/$50, free-ship threshold TBD) | Frontend | CONTENT-0 | ✅ Done |
| CONTENT-3 | `/faq` expand (research-use, purity, COA, payments, returns) + link from home | Frontend | CONTENT-2 | ✅ Done |
| CONTENT-4 | `/research` hub + 4–6 static article pages (BPC-157, TB-500, GLP-1, GHK-Cu, reconstitution basics) | Frontend | CONTENT-0 | ✅ Done |
| CONTENT-5 | **Create** `/coa` (COA library landing + batch lookup UI stub) + wire `/downloads` | Frontend | CONTENT-4 | ✅ Done |
| CONTENT-6 | **Create** `/calculator` (peptide reconstitution calculator) | Frontend | CONTENT-0 | ✅ Done |
| CONTENT-7 | `/about` + `/contact` — align copy, hours, support CTAs with reference patterns | Frontend | — | ✅ Done |
| CONTENT-8 | `/blog` — replace stub with list + 2–3 seed posts (or link to `/research` until CMS) | Frontend | CONTENT-4 | ✅ Done |
| CONTENT-9 | Header/footer nav — add COA, Calculator, FAQ; category hubs from live catalog | Frontend | CONTENT-5,6 | ✅ Done |
| CONTENT-10 | Legal polish — `/terms`, `/privacy`, `/returns`, `/cookies` research-use language | Frontend | — | ✅ Done |
| CONTENT-11 | SEO metadata + internal links audit across marketing pages | Frontend | CONTENT-1–10 | ✅ Done |

**M8 exit criteria:** All public marketing routes populated or created; nav/footer complete; no “coming soon” on primary paths; research-use disclaimer on checkout + footer.

**M8 status:** ✅ Complete (CONTENT-0–11)

---

## Active Backlog


| ID | Task | Layer | Status | Owner |
|----|------|-------|--------|-------|
| P0-1 | Add `typescript` devDependency to `@mcpfac/shared-types`, `@mcpfac/shared-utils`, `@mcpfac/shared-validators` so root `pnpm type-check` passes | Tooling | ✅ Done | Engineering |
| P0-2 | Fix `register()` `emailRedirectTo` — currently builds URL incorrectly (`NEXT_PUBLIC_SUPABASE_URL ? '' : ''`) | Frontend/Auth | ✅ Done | Engineering |
| P0-3 | Create `/reset-password` page (forgot-password flow redirects here but route does not exist) | Frontend/Auth | ✅ Done | Engineering |
| P0-4 | Implement `pnpm db:seed` (referenced in README; no seed script exists) | DB | ✅ Done | Engineering |

### M1.5 — Authentication (close before M2)

| ID | Task | Layer | Deps | Status |
|----|------|-------|------|--------|
| AUTH-1 | Supabase login / register / forgot-password UI + Server Actions | Frontend | — | ✅ Done |
| AUTH-2 | Auth callback route (`/auth/callback`) | Frontend | AUTH-1 | ✅ Done |
| AUTH-3 | Middleware session refresh + route protection | Frontend | AUTH-1 | ✅ Done |
| AUTH-4 | Auth provider + Zustand store + header user menu | Frontend | AUTH-1 | ✅ Done |
| AUTH-5 | Sync Supabase user → Prisma `Profile` + `Customer` on sign-up / first login | Backend/DB | AUTH-1 | ✅ Done |
| AUTH-6 | NestJS auth guard (Supabase JWT validation) + `@CurrentUser()` decorator wiring | Backend | AUTH-5 | ✅ Done |
| AUTH-7 | Role seed data (`roles`, `permissions`, `role_permissions`) | DB | P0-4 | ✅ Done |
| AUTH-8 | Password reset completion page + update-password action | Frontend | P0-3 | ✅ Done |
| AUTH-9 | Auth flow E2E smoke test (register → verify → login → logout) | QA | AUTH-1–8 | ⬜ Open |

**M1.5 exit criteria:** All AUTH tasks done except AUTH-9 (E2E smoke test), builds pass, no broken auth links, profile sync endpoint live.

**M1.5 status:** ✅ Complete (pending AUTH-9 E2E test)

---

### M2 — Product Catalog (next milestone)

| ID | Task | Layer | Deps | Status |
|----|------|-------|------|--------|
| PROD-1 | NestJS `ProductsModule` — list, detail by slug, search, filter | Backend | AUTH-6, P0-4 | ✅ Done |
| PROD-2 | NestJS `CategoriesModule` — tree, by slug | Backend | PROD-1 | ✅ Done |
| PROD-3 | Seed categories + sample products (peptides, chemicals, supplies) | DB | P0-4 | ✅ Done |
| PROD-4 | `/products` — paginated catalog with filters | Frontend | PROD-1 | ✅ Done |
| PROD-5 | `/products/[slug]` — product detail (scientific fields, docs, related) | Frontend | PROD-1 | ✅ Done |
| PROD-6 | Wire header navigation (currently links to non-existent routes) | Frontend | PROD-4 | ✅ Done |
| PROD-7 | Product search autocomplete (API + UI) | Full stack | PROD-1 | ✅ Done |
| PROD-8 | Compare & wishlist persistence (stores exist; no API/pages) | Full stack | PROD-1, AUTH-5 | ✅ Done |
| PROD-9 | Product API + component tests | QA | PROD-1–5 | ✅ Done |
| PROD-10 | Homepage hero — replace placeholder with live catalog highlights | Frontend | PROD-3, PROD-4 | ✅ Done |

**M2 exit criteria:** Browse/search/filter products, view detail pages, header nav works, API documented in Swagger, tests green, zero 404s from main nav.

---

### M3 — Cart & Quotation Engine

Depends on **M2.5 live imported catalog** (not `MBT-*` sample seed products).

| ID | Task | Layer | Deps | Status |
|----|------|-------|------|--------|
| CART-1 | NestJS `CartModule` — get/upsert cart, add/update/remove items, notes, clear | Backend | M2.5 | ✅ Done |
| CART-2 | Guest session (`X-Cart-Session`) + merge guest → customer on login | Backend | CART-1 | ✅ Done |
| CART-3 | Server pricing + MOQ/availability validation | Backend | CART-1 | ✅ Done |
| CART-4 | `/cart` page + cart drawer wired to header | Frontend | CART-1 | ✅ Done |
| CART-5 | Commerce API helper + cart store sync | Frontend | CART-2 | ✅ Done |
| QUOTE-1 | NestJS `QuotesModule` — create/update/submit/list/detail | Backend | CART-1, AUTH-5 | ✅ Done |
| QUOTE-2 | Quote number generation + status history | Backend | QUOTE-1 | ✅ Done |
| QUOTE-3 | `/quotes`, `/quotes/[id]`, request-quote from cart / unpriced products | Frontend | QUOTE-1 | ✅ Done |
| QUOTE-4 | Shared validators/types + cart/quote unit tests | Shared/QA | QUOTE-1 | ✅ Done |
| QUOTE-5 | Protect `/quotes` in middleware; update walkthrough | Frontend/Docs | QUOTE-3 | ✅ Done |

**M3 exit criteria:** Guest + auth cart against live catalog, server-side prices, create/submit quotes, list/detail UI, tests green.

**M3 status:** ✅ Complete (PDF / admin approval / convert-to-order deferred)

---

### M4 — Orders, Invoices & Checkout

| ID | Task | Layer | Status |
|----|------|-------|--------|
| ORD-1 | NestJS `OrdersModule` — checkout from cart/quote, list, detail | Backend | ✅ Done |
| ORD-2 | Confirm / cancel pending orders + status history | Backend | ✅ Done |
| INV-1 | Issue invoice on confirm; list/detail invoices | Backend | ✅ Done |
| CHK-1 | `/checkout` shipping + payment method UI | Frontend | ✅ Done |
| ORD-3 | `/orders`, `/orders/[id]` UI | Frontend | ✅ Done |
| INV-2 | `/invoices`, `/invoices/[id]` UI + middleware | Frontend | ✅ Done |

**M4 exit criteria:** Place order from cart or submitted quote → confirm → issued invoice; list/detail pages work.

**M4 status:** ✅ Complete (payment gateways / PDF / fulfillment deferred)

---

### M5 — Customer Portal

| ID | Task | Layer | Status |
|----|------|-------|--------|
| ACCT-1 | NestJS `AccountModule` — dashboard, profile, addresses CRUD | Backend | ✅ Done |
| ACCT-2 | `/account` dashboard with order/quote/invoice widgets | Frontend | ✅ Done |
| ACCT-3 | `/account/profile` + `/account/addresses` | Frontend | ✅ Done |
| ACCT-4 | Account sidebar nav linking orders/quotes/invoices/wishlist | Frontend | ✅ Done |
| ACCT-5 | Settings stub (password reset + downloads note) | Frontend | ✅ Done |

**M5 exit criteria:** Authenticated `/account` hub with live counts and links into commerce pages.

**M5 status:** ✅ Complete (download center / support messages deferred)

---

### M6 — Admin Platform

| ID | Task | Layer | Status |
|----|------|-------|--------|
| ADM-1 | NestJS `AdminModule` — role-gated dashboard metrics | Backend | ✅ Done |
| ADM-2 | Admin products list/update (status, stock, pricing, featured) | Backend | ✅ Done |
| ADM-3 | Admin quotes list + review/approve/reject | Backend | ✅ Done |
| ADM-4 | Admin orders list + fulfillment status transitions (+ invoice on confirm) | Backend | ✅ Done |
| ADM-5 | Admin customers list + suspend/reactivate | Backend | ✅ Done |
| ADM-6 | `/admin` console UI (dashboard, products, quotes, orders, customers) | Frontend | ✅ Done |
| ADM-7 | Auth profile role in store + Admin Console nav link + middleware | Frontend | ✅ Done |
| ADM-8 | `pnpm db:promote-admin` helper | DB/Tooling | ✅ Done |
| ADM-9a | Admin categories CRUD (list/create/update/soft-delete) | Full stack | ✅ Done |
| ADM-9b | Inventory list + per-product `lowStockThreshold` + auto LOW_STOCK | Full stack | ✅ Done |
| ADM-9c | Document CMS / media library / blog / FAQ / COA workflows | Full stack | ❌ Deferred → Phase 17 |

**M6 exit criteria (v1):** Staff roles can open `/admin`, manage catalog publish/stock, approve quotes, advance orders, suspend customers.

**M6 status:** ✅ Partial complete (ops console + categories/inventory; media/CMS/reports → Phase 17–18)

---

### M7 — Platform Hardening (ongoing, escalate before production)

| ID | Task | Status |
|----|------|--------|
| PLAT-1 | GitHub Actions CI (lint, type-check, test, build) | ✅ Done |
| PLAT-2 | Global exception filter + response interceptor wired in `main.ts` | ✅ Done |
| PLAT-3 | Structured logging (pino) configured | ✅ Done |
| PLAT-4 | Test coverage for critical paths (≥80% controllers, ≥90% services) | ✅ Done (critical-path gate) |
| PLAT-5 | Staging deployment (Vercel frontend + backend host TBD) | ✅ Done (Vercel + Render scaffolding) |

---

## Cross-Stack Dependency Graph (M1.5 → M2)

```
P0-4 (seed) ──► AUTH-7 (roles)
                    │
AUTH-5 (profile sync) ──► AUTH-6 (JWT guard)
                    │
                    └──► PROD-1 (products API)
                              │
                              ├──► PROD-4/5 (catalog UI)
                              └──► PROD-8 (wishlist/compare)
```

---

## Quality Gates (enforced before closing any milestone)

- [ ] `pnpm type-check` passes at monorepo root
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes (web + api)
- [ ] No broken navigation links in header/footer
- [ ] Swagger reflects all shipped endpoints
- [ ] Prisma migration applied and seed data present
- [ ] Auth flows tested manually or via E2E
- [ ] Engineering standards reviewed (relevant volumes + appendices)
- [ ] Completed work recorded in `walkthrough.md`

**Current gate status:** Web + API type-check ✅ | Account unit tests ✅ (2) | Live catalog ✅

---

## Next Action

**Recommended:** Phase 19 Testing or Phase 20 staging go-live (`docs/STAGING.md`).

Alternatives:
- Un-defer Phase 17 CMS v1 (documents + media)
- Carrier tracking on admin fulfill

**Recently closed:** Homepage multi-shelf products · M8 Content & Marketing (CONTENT-0–11) · Phase 16 Administration · Phase 15 shipping.  
**Deferred:** Phase 17 CMS · Phase 18 Reporting.
