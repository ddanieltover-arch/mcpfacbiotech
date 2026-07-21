# Deployment — MCPFAC BIOTECH (Vercel + Supabase only)

## Architecture

| Layer | Host | Notes |
|-------|------|--------|
| Frontend | **Vercel** project (`apps/web`) | Custom domain: `mcpfacbiotech.site` |
| Backend (Nest API) | **Vercel** project (`apps/api`) | Custom domain: `api.mcpfacbiotech.site` (recommended) |
| Database / Auth / Storage | **Supabase** | Existing project |

No Render/Railway required. NestJS deploys on Vercel as a single Fluid Function (`src/main.ts`).

## 1. Frontend — Vercel

1. [vercel.com/new](https://vercel.com/new) → Import this GitHub repo.
2. **Root Directory:** `apps/web`
3. Framework: Next.js (uses `apps/web/vercel.json`)
4. Environment variables (Production):

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon JWT |
| `NEXT_PUBLIC_APP_URL` | `https://mcpfacbiotech.site` |
| `NEXT_PUBLIC_BACKEND_URL` | `https://api.mcpfacbiotech.site` (or your API `*.vercel.app` URL) |

5. Domains → add `mcpfacbiotech.site` (and `www` if needed).

## 2. Backend — Vercel (second project)

1. [vercel.com/new](https://vercel.com/new) → Import the **same** GitHub repo again.
2. **Root Directory:** `apps/api`
3. Framework: NestJS (zero-config; do not set `framework: null`)
4. Uses `apps/api/vercel.json` install/build for the pnpm monorepo
5. Environment variables (Production):

| Variable | Required |
|----------|----------|
| `DATABASE_URL` | Yes (pooler `6543` + `pgbouncer=true`) |
| `DIRECT_URL` | Yes (session / direct) |
| `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes |
| `FRONTEND_URL` | Yes → `https://mcpfacbiotech.site` |
| `APP_URL` | Recommended → same as site |
| `RESEND_API_KEY` | Yes (email) |
| `RESEND_FROM_EMAIL` | `info@mcpfacbiotech.site` |
| `RESEND_FROM_NAME` | `MCPFAC BIOTECH` |
| `COMPANY_EMAIL` | `info@mcpfacbiotech.site` |
| `NODE_ENV` | `production` |
| `LOG_LEVEL` | `info` |

6. After first deploy, open `https://<api-host>/api/v1/health`.
7. Domains → add `api.mcpfacbiotech.site`, then update the web project's `NEXT_PUBLIC_BACKEND_URL` to that URL.

### What is `NEXT_PUBLIC_BACKEND_URL` on the live site?

It is the **public origin of the Nest API Vercel project**, for example:

```text
https://api.mcpfacbiotech.site
```

or, until the custom domain is attached:

```text
https://<your-api-project>.vercel.app
```

It is **not** `https://mcpfacbiotech.site` (that is the Next.js storefront).

## 3. Supabase Auth

Dashboard → Authentication → URL Configuration:

- **Site URL:** `https://mcpfacbiotech.site`
- **Redirect allow list:** `https://mcpfacbiotech.site/**`, `http://localhost:3000/**`, plus any Vercel preview URLs you use

## Post-deploy checklist

- [ ] `GET https://api.mcpfacbiotech.site/api/v1/health` → healthy
- [ ] Storefront loads products (catalog API via `NEXT_PUBLIC_BACKEND_URL`)
- [ ] Login / register (Supabase + auth sync)
- [ ] Contact / newsletter emails (Resend domain verified for `mcpfacbiotech.site`)
- [ ] CORS: API `FRONTEND_URL` matches the live site exactly

## Optional / legacy

- `render.yaml` and `apps/api/Dockerfile` remain for Docker hosts if you ever need them; they are **not** required for the Vercel + Supabase path.
- GitHub Action `deploy-staging.yml` can deploy both Vercel projects when secrets are set (see workflow comments).
