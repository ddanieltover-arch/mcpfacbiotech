# Appendix E — Prisma Schema Standards

Concrete schema-authoring rules underneath Volume 5's database
architecture.

## Base Model Pattern

Every model includes the standard audit fields from Volume 5. Suggested
Prisma shape:

```prisma
model Product {
  id        String    @id @default(uuid()) @db.Uuid
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")
  createdBy String?   @map("created_by") @db.Uuid
  updatedBy String?   @map("updated_by") @db.Uuid

  // domain fields...

  @@map("products")
}
```

- `@id @default(uuid())` on every model — never `@default(autoincrement())`.
- `@map` on every field to keep Prisma's camelCase separate from
  Postgres's snake_case (per Appendix B), and `@@map` on every model to
  the plural snake_case table name.
- Soft delete via `deletedAt`, not a hard `DELETE` — matches Volume 5's
  "soft deletes preferred."

## Relations

- Every relation gets an explicit `@relation(name: "...")` when a model
  has more than one relation to the same target (e.g. `createdBy` and
  `updatedBy` both referencing `Profile` — disambiguate with named
  relations).
- Foreign key scalar field always present explicitly (`productId String
  @db.Uuid`) alongside the relation field — don't rely on Prisma's
  implicit FK-only mode; explicit FKs are required for raw SQL, indexes,
  and clarity.
- `onDelete`/`onUpdate` set per Volume 5's rule: `onUpdate: Cascade`,
  `onDelete: Restrict` by default; only use `Cascade` on delete for true
  ownership relations (e.g. deleting an `Order` cascades to its
  `OrderItem` rows), never for shared/reference data.

## Indexes

- `@@index` on every foreign key column that isn't already covered by a
  unique constraint.
- `@@index` on columns used in `WHERE`/`ORDER BY` for listing endpoints —
  matches Volume 5's search-index list (`sku`, `slug`, `casNumber`,
  `categoryId`, `status`, `visibility`, etc.).
- `@@unique` for natural keys (`sku`, `slug`, `email`) — don't rely on
  application-level uniqueness checks alone; enforce at the DB.
- Composite indexes for common multi-column filters (e.g.
  `@@index([categoryId, status, visibility])` for the product listing
  query).

## Enums

Match the lifecycle states defined in Volumes 5/6 exactly — don't
introduce a new casing or a new set of states in the schema that doesn't
match what the volumes describe:

```prisma
enum ProductStatus {
  DRAFT
  PENDING_REVIEW
  PUBLISHED
  ARCHIVED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  PACKED
  SHIPPED
  DELIVERED
  CANCELLED
  RETURNED
}
```

## Schema File Organization

For a schema this large, split by domain using Prisma's multi-file schema
support (`prismaSchemaFolder` preview feature) mirroring Volume 5's
domains:

```
prisma/
├── schema.prisma        (generator + datasource only)
└── models/
    ├── auth.prisma
    ├── users.prisma
    ├── products.prisma
    ├── categories.prisma
    ├── orders.prisma
    ├── quotes.prisma
    ├── invoices.prisma
    ├── documents.prisma
    ├── support.prisma
    └── ...
```

If multi-file isn't available in the project's Prisma version, keep one
`schema.prisma` but group models under clear `// ==== DOMAIN ====` comment
headers in the same order as Volume 5's domain list.

## Migrations

- One migration per logical change — don't bundle an unrelated model
  change into a migration named for something else.
- Migration names: `<verb>_<what>` — `add_quote_expiry_date`,
  `create_support_tickets_table`, `add_index_products_cas_number`.
- Every migration that touches a table with existing data gets a note in
  the PR description about backward compatibility / backfill needs — per
  Volume 5's "maintain backward compatibility where possible."
- Never hand-edit a generated migration's SQL to "fix" something after
  the fact — generate a new migration instead, so the migration history
  stays an accurate record.

## Row Level Security (RLS)

- RLS policies live in a dedicated SQL migration (Prisma doesn't manage
  RLS directly) — name it clearly, e.g.
  `enable_rls_customer_documents.sql`.
- Every customer-owned table gets a policy scoping `SELECT`/`UPDATE` to
  `auth.uid() = customer_id` (or the equivalent ownership column), plus a
  separate policy for elevated roles (admin/support) per Volume 5's RLS
  section.
- Test RLS policies with both an "owner" and a "non-owner" authenticated
  session, not just as the service role (which bypasses RLS).

## Seeding

- Seed scripts are idempotent (`upsert`, not `create`) so re-running the
  seed doesn't duplicate data — matches Volume 5's seeding strategy.
- Seed data lives in `prisma/seed/` split by domain, run through a single
  `prisma/seed.ts` entrypoint referenced in `package.json`'s `prisma.seed`
  field.
