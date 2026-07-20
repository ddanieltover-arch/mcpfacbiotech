# Appendix F — Git Workflow

Fills in the day-to-day mechanics behind Volume 8's Git Strategy and
Commit Convention.

## Branch Model

- `main` — always production-ready and deployed. Protected: no direct
  pushes, requires PR + passing CI.
- `develop` — integration branch for the next release. Protected the same
  way.
- `feature/<scope>` — branched from `develop`, merged back into `develop`
  via PR. Scope names match Volume 4/6's module names:
  `feature/quotes-approval-workflow`, `feature/product-comparison`.
- `fix/<scope>` — same flow as `feature/`, for non-urgent bug fixes:
  `fix/order-validation`, `fix/product-search-cas-number`.
- `hotfix/<scope>` — branched from `main` for urgent production fixes,
  merged into **both** `main` and `develop`: `hotfix/payment-error`.
- `release/vX.Y.Z` — cut from `develop` when preparing a release; only
  bugfixes and release-prep changes (changelog, version bump) land here;
  merged into `main` and back into `develop` on release.

## Commit Messages

Conventional Commits, exactly as in Volume 8:

```
<type>(<scope>): <short summary, imperative mood, no trailing period>

[optional body — the "why", not a restatement of the diff]

[optional footer — BREAKING CHANGE: ..., Closes #123]
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`,
`style`, `ci`, `build`. Scope matches a module from Volume 4/6 (`products`,
`quotes`, `cart`, `downloads`, `api`, `database`, `ci`).

- One logical change per commit — don't bundle a feature and an unrelated
  refactor in the same commit.
- Breaking changes get a `BREAKING CHANGE:` footer explaining the impact
  and migration path, and bump the API version per Appendix C if the
  contract changes.

## Pull Requests

A PR description should cover, matching Volume 8's Output Standard:

1. **Objective** — what and why.
2. **Architectural impact** — new modules, schema changes, anything that
   affects other parts of the system.
3. **Files changed** — grouped as new / modified / deleted (large PRs
   only; small PRs can skip this if the diff is self-evident).
4. **Testing** — what was tested and how.
5. **Migration notes** — if the PR includes a Prisma migration, per
   Appendix E.
6. **Screenshots** — for any UI change.

PR size: prefer several small, reviewable PRs over one large one. If a
feature genuinely needs to land as one PR (e.g. a new module end-to-end),
say so explicitly and structure the PR description by layer (DB → backend
→ frontend) so a reviewer can review it layer by layer.

## Code Review Gate

Before merge, per Volume 8's Code Review Standards and Quality Gates:
- CI green (lint, type-check, unit + integration tests, build).
- At least one approval.
- No unresolved review comments.
- Migration reviewed separately if present (Appendix E).

## Release Checklist

On cutting a `release/vX.Y.Z` branch:

1. Bump version number.
2. Update changelog / release notes (features, fixes, breaking changes).
3. Confirm all migrations in the release have rollback notes.
4. Run full regression suite against staging.
5. Merge to `main`, tag `vX.Y.Z`, deploy.
6. Merge `main` back into `develop` to keep history aligned.
7. Post-deployment smoke test per Volume 8's CI/CD pipeline.

## Rollback

- Application rollback: redeploy the previous tagged release on Vercel /
  the backend host.
- Database rollback: use the migration's documented rollback strategy
  (Appendix E / Volume 5) — never attempt to "guess" a reverse migration
  under pressure during an incident; it should already be written.
- Any rollback gets an incident note per Volume 8's Disaster Recovery
  section: what broke, what was rolled back, follow-up fix plan.
