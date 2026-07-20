# Appendix B — Naming Conventions

A single naming standard across frontend, backend, and database so nothing
needs to be "translated" between layers.

## Files

| Type | Convention | Example |
|---|---|---|
| React component | PascalCase | `ProductCard.tsx` |
| React hook | camelCase, `use` prefix | `useProductFilters.ts` |
| NestJS controller | kebab-case + `.controller.ts` | `products.controller.ts` |
| NestJS service | kebab-case + `.service.ts` | `products.service.ts` |
| NestJS DTO | kebab-case + `.dto.ts` | `create-product.dto.ts` |
| NestJS entity | kebab-case + `.entity.ts` | `product.entity.ts` |
| Utility | kebab-case | `format-currency.ts` |
| Type-only file | kebab-case + `.types.ts` | `product.types.ts` |
| Test file | mirrors source + `.spec.ts` / `.test.ts` | `products.service.spec.ts` |

## Variables & Functions (TS/JS)

- `camelCase` for variables, functions, instance properties.
- `PascalCase` for classes, types, interfaces, enums, React components.
- `SCREAMING_SNAKE_CASE` for true constants (`MAX_UPLOAD_SIZE_MB`).
- Booleans read as a question: `isPublished`, `hasDiscount`,
  `canDownload` — not `published`, `discount`, `download`.
- Async functions that fetch: `fetchX` (network) vs `getX` (local/derived,
  synchronous) — don't mix the two meanings.
- Event handlers: `handleX` inside a component, `onX` for the prop that
  receives the handler (`onSubmit`, `handleSubmit`).

## Database (Prisma / PostgreSQL)

- Table names: `snake_case`, plural — `products`, `order_items`,
  `customer_documents` (matches Volume 5's table list exactly).
- Column names: `snake_case` — `created_at`, `cas_number`,
  `minimum_order_quantity`.
- Prisma model names: `PascalCase` singular — `model Product`, Prisma maps
  it to the `products` table via `@@map("products")`.
- Foreign key columns: `<singular_table>_id` — `product_id`,
  `customer_id`, `order_id`.
- Join/pivot tables: both names alphabetized, singular, underscore-joined
  — `product_category` (not `category_product`).
- Enums: `PascalCase` type name, `SCREAMING_SNAKE_CASE` or descriptive
  values matching the lifecycle states in Volume 5/6 — e.g.
  `enum OrderStatus { PENDING CONFIRMED PROCESSING ... }`.

## API Routes

- Versioned, plural nouns, kebab-case for multi-word resources:
  `/api/v1/products`, `/api/v1/support-tickets`,
  `/api/v1/customer-documents`.
- Nested resources reflect real ownership only (not every relation):
  `/api/v1/orders/:orderId/items`, not deep chains beyond 2 levels.
- Actions that aren't pure CRUD use a verb sub-route:
  `/api/v1/quotes/:id/convert-to-order`,
  `/api/v1/orders/:id/cancel`.

## Environment Variables

- `SCREAMING_SNAKE_CASE`, grouped by prefix: `SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_HOST`, `SMTP_PORT`, `APP_URL`,
  `FRONTEND_URL`, `BACKEND_URL` (matches Volume 4's required config list).

## Branches & Commits

See Appendix F (Git Workflow) for branch/commit naming — kept separate
since it has its own detailed conventions.

## Consistency Rule

If a concept has a name at one layer (e.g. `cas_number` in the DB), the
same concept keeps that name's camelCase equivalent (`casNumber`) all the
way up through the Prisma model, DTO, API response, and frontend type —
never renamed mid-stack (e.g. don't become `casId` in the frontend).
