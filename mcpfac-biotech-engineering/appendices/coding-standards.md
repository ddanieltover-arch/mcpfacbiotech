# Appendix A — Coding Standards

Concrete, enforceable rules underneath the philosophy in Volume 1
(SOLID/DRY/KISS/YAGNI, TypeScript-strict, no placeholders). Use this when
writing or reviewing actual code, not just planning it.

## TypeScript

- `strict: true` in every `tsconfig.json`. No `any` — use `unknown` +
  narrowing, a proper union, or a generic instead.
- No non-null assertions (`!`) except immediately after a runtime check
  that guarantees the value; prefer optional chaining / explicit guards.
- Export types/interfaces next to the code that owns them
  (`product.types.ts` beside `product.service.ts`), not in one giant
  `types/index.ts` dumping ground.
- Prefer `type` for unions/utility compositions, `interface` for object
  shapes that might be extended (e.g. DTOs, entities).
- Enums: use TypeScript `enum` only for values persisted/compared across
  the stack (e.g. `OrderStatus`); otherwise prefer a `const` object +
  derived union type.

## Functions & Modules

- One exported responsibility per file where practical — a service file
  should read as a table of contents of what it does.
- Functions should do one thing; if a function needs a comment to explain
  "step 1 / step 2 / step 3", it's a candidate to split into named
  sub-functions.
- Prefer pure functions in `utils/` — no hidden side effects, no reading
  from global/module state.
- Async functions always `try/catch` at the boundary that can meaningfully
  handle the error (service or controller layer) — don't swallow errors
  silently, and don't let raw driver/ORM errors leak to the API response.

## React / Next.js

- Server Components by default; add `'use client'` only when the
  component needs state, effects, or browser APIs.
- No business logic (pricing math, permission checks, validation rules) in
  components — call a service/hook that encapsulates it.
- Co-locate a component's hooks, types, and tests next to the component
  unless the hook is genuinely shared across features (then it belongs in
  `hooks/`).
- Props: always typed, no implicit `any`; provide sane defaults instead of
  scattering `?? fallback` at every call site.

## NestJS

- Controllers: routing + DTO validation + calling the service. No
  business logic, no direct Prisma calls.
- Services: business logic and orchestration. No direct `req`/`res`
  access.
- Repositories: the only layer that talks to Prisma directly.
- One module per bounded domain (see Volume 4's Core Modules list) —
  don't reach into another module's repository; go through its service.

## Comments & Documentation

- Comment *why*, not *what* — the code should already say what it does.
- Every public service method and controller endpoint gets a short
  docblock (used to seed Swagger descriptions per Volume 4).
- No commented-out code committed. Delete it; Git history is the archive.

## Formatting & Linting

- ESLint + Prettier enforced in CI (see Appendix F / Volume 8 CI
  pipeline). No manual formatting debates — if the linter allows it, it's
  allowed.
- Import order: external packages → internal absolute imports
  (`@/lib/...`) → relative imports → styles. Enforce via
  `eslint-plugin-import` or equivalent.

## Anti-Patterns to Reject in Review

- Duplicated logic across two files "because it was faster" — extract a
  shared util/service instead (Volume 4 & 8: architecture protection).
- Silent `catch {}` blocks.
- Business rules encoded only in the frontend (see Volume 1: "never trust
  frontend calculations").
- God files: a service or component file that keeps growing past ~300
  lines is a signal to split by responsibility.
- Magic numbers/strings for anything that appears in more than one place
  — move to `constants/`.
