# Deployment — MCPFAC BIOTECH (one Vercel project + Supabase)

## Architecture

| Layer | Host | Notes |
|-------|------|--------|
| Storefront + API | **One Vercel project** (`apps/web`) | Domain: `mcpfacbiotech.site` — Nest boots inside Next on `/api/v1/*` |
| Database / Auth / Storage | **Supabase** | Existing project |

There is **no** separate `api.mcpfacbiotech.site` project in this setup. One git push → one deploy ships UI and API together.

Locally, `pnpm dev` still runs Nest on `:3001`; the Next `/api/v1` route **proxies** to it. On Vercel (`VERCEL=1`), the same route **embeds** Nest in-process.

## 1. Frontend + API — single Vercel project

1. [vercel.com/new](https://vercel.com/new) → Import this GitHub repo (or update the existing **web** project).
2. **Root Directory:** `apps/web`
3. Framework: Next.js (uses [`apps/web/vercel.json`](../apps/web/vercel.json) — builds shared-types, Nest API, then Next)
4. Environment variables (Production) — put **all** former API secrets on this project:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon JWT |
| `NEXT_PUBLIC_APP_URL` | `https://mcpfacbiotech.site` |
| `APP_URL` | `https://mcpfacbiotech.site` |
| `FRONTEND_URL` | `https://mcpfacbiotech.site` (comma-separate `www` if needed) |
| `DATABASE_URL` | pooler `6543` + `pgbouncer=true` |
| `DIRECT_URL` | session / direct |
| `SUPABASE_URL` | same as public URL (or leave if Nest reads `NEXT_PUBLIC_SUPABASE_URL`) |
| `SUPABASE_SERVICE_ROLE_KEY` | service role |
| `RESEND_API_KEY` | yes |
| `RESEND_FROM_EMAIL` | `info@mcpfacbiotech.site` |
| `RESEND_FROM_NAME` | `MCPFAC BIOTECH` |
| `COMPANY_EMAIL` | `info@mcpfacbiotech.site` |
| `NODE_ENV` | `production` |
| `LOG_LEVEL` | `info` |

**Do not set** `NEXT_PUBLIC_BACKEND_URL` in production. The storefront calls same-origin `/api/v1/...`.

Optional override (legacy / debugging only):

```text
NEXT_PUBLIC_BACKEND_URL=https://some-other-api.example
```

5. Domains → `mcpfacbiotech.site` (and `www` if needed).
6. After deploy: `GET https://mcpfacbiotech.site/api/v1/health`

## 2. Retire the old API project

1. Remove custom domain `api.mcpfacbiotech.site` from the old Nest Vercel project (or delete that project).
2. Clear any DNS CNAME for `api`.
3. Confirm the web project has every env var listed above, then **Redeploy**.

## 3. Supabase Auth

Dashboard → Authentication → URL Configuration:

- **Site URL:** `https://www.mcpfacbiotech.site` (or apex)
- **Redirect allow list:** `https://www.mcpfacbiotech.site/**`, `https://mcpfacbiotech.site/**`, `http://localhost:3000/**`

## Post-deploy checklist

- [ ] `GET https://mcpfacbiotech.site/api/v1/health` → healthy (includes current API deploy stamp when present)
- [ ] Catalog / product detail / add to cart on the main site
- [ ] Login / register (Supabase + auth sync via same origin)
- [ ] Contact / newsletter (Resend)
- [ ] Admin routes still work

## Local development

```bash
pnpm install
pnpm dev   # Next :3000 + Nest :3001 — Next proxies /api/v1 → :3001
```

To force Nest embedding locally (same as Vercel):

```bash
NEST_EMBEDDED=1 pnpm --filter @mcpfac/web dev
```

(Requires a prior `pnpm --filter @mcpfac/api build`.)

## Optional / legacy

- [`apps/api`](../apps/api) remains the Nest source; it is no longer a separate production host.
- `apps/api/vercel.json` / `api.mcpfacbiotech.site` are legacy if you previously used a second project.
- `render.yaml` / Docker remain unused for the Vercel + Supabase path.
