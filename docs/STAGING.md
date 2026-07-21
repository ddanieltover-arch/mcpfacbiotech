# Staging Deployment — MCPFAC BIOTECH (PLAT-5)

## Architecture

| Layer | Host | Notes |
|-------|------|--------|
| Frontend | **Vercel** (Preview / Staging project) | Root Directory = `apps/web` |
| Backend | **Render** (Docker web service) | Blueprint: `render.yaml` |
| Database / Auth / Storage | **Supabase** (existing project) | Same project as local; use staging env vars |

Alternative API hosts that accept the same Dockerfile: Railway, Fly.io, any Docker host.

## Prerequisites

1. GitHub repo connected to Vercel and Render.
2. Staging secrets configured (never commit `.env`).
3. Supabase Auth redirect URLs include the staging frontend origin.
4. `FRONTEND_URL` on the API matches the Vercel staging URL (CORS).

## Frontend — Vercel

1. [vercel.com/new](https://vercel.com/new) → Import this repository.
2. **Root Directory:** `apps/web`
3. **Framework Preset:** Next.js (uses `apps/web/vercel.json`)
4. Environment variables (Production + Preview):

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon JWT |
| `NEXT_PUBLIC_BACKEND_URL` | `https://mcpfac-api-staging.onrender.com` |

5. Deploy. Copy the deployment URL → set as `FRONTEND_URL` / `APP_URL` on the API.

### CLI (optional)

```bash
npx vercel link --cwd apps/web
npx vercel env pull --cwd apps/web
npx vercel --cwd apps/web --prod=false
```

## Backend — Render (Docker)

1. [render.com](https://render.com) → **New** → **Blueprint** → select this repo (`render.yaml`).
2. Fill sync:false env vars from `.env.example` / staging secrets:

| Variable | Required |
|----------|----------|
| `DATABASE_URL` | Yes (pooler `6543` + `pgbouncer=true`) |
| `DIRECT_URL` | Yes (direct / session mode) |
| `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (JWT validate) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (admin Auth APIs) |
| `FRONTEND_URL` | Yes (Vercel staging origin) |
| `APP_URL` | Recommended (same as frontend) |
| `LOG_LEVEL` | `info` (default in blueprint) |

3. After first deploy, open `https://<service>/api/v1/health` — expect `database: healthy`.
4. Swagger: `https://<service>/api/docs`

### Local image smoke

```bash
docker build -t mcpfac-api:staging -f apps/api/Dockerfile .
docker run --rm -p 3001:3001 --env-file .env mcpfac-api:staging
```

## GitHub Actions

Workflow: `.github/workflows/deploy-staging.yml`

- **Manual:** Actions → Deploy Staging → Run workflow
- Builds the API Docker image and pushes to `ghcr.io/<owner>/<repo>/api:staging` when `packages: write` is available
- Deploys Vercel when `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets exist
- Triggers Render deploy when `RENDER_DEPLOY_HOOK_URL` secret is set (Render → Service → Deploy Hook)

### Required GitHub secrets (for full automation)

| Secret | Purpose |
|--------|---------|
| `VERCEL_TOKEN` | Vercel deploy |
| `VERCEL_ORG_ID` | Vercel org |
| `VERCEL_PROJECT_ID` | Staging web project |
| `RENDER_DEPLOY_HOOK_URL` | Kick Render rebuild |

Until secrets are set, the workflow still validates the Docker build on `workflow_dispatch`.

## Supabase Auth (staging)

Dashboard → Authentication → URL Configuration:

- Site URL: staging Vercel URL
- Redirect allow list: `https://<vercel-app>/**`, `http://localhost:3000/**`

## Post-deploy checklist

- [ ] `GET /api/v1/health` → 200, database healthy
- [ ] Web loads; login/register against Supabase
- [ ] `POST /api/v1/auth/sync` after login
- [ ] Catalog list / product detail
- [ ] Cart + quote smoke (guest session header)
- [ ] Admin: promote staging admin email, open `/admin`
- [ ] CORS: browser calls API from Vercel origin without errors
- [ ] Logs show Pino request IDs (no Authorization leakage)

## Rollback

- **Web:** Vercel → Deployments → Promote previous
- **API:** Render → Events → Redeploy previous image / clear failed deploy
- **DB:** Prefer forward-fix migrations; use Supabase PITR only if required
