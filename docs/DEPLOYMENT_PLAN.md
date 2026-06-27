# MentorMe — Deployment Plan

**Target:** user-owned VPS + registered domain `mentorme.ir`
**DNS:** `mentorme.ir` and `www.mentorme.ir` → `185.164.73.133` (already set; confirm it's the target VPS)
**Stack decision:** Docker Compose · Caddy (auto-HTTPS) · Postgres in a container (same server)

---

## Architecture

```
Internet → :443/:80  Caddy (TLS, Let's Encrypt)
                       └─ reverse_proxy → app:3000 (Next.js standalone)
                                            └─ DATABASE_URL → postgres:5432 (volume)
```

All three run as containers via `docker compose`. Postgres data and Caddy certs live on named volumes (persist across restarts/redeploys).

---

## Task checklist

| # | Task | Owner | Blocks on |
|---|------|-------|-----------|
| 1 | Establish SSH access to the VPS (key-based) | user + me | server IP, user, key |
| 2 | Prepare server: Docker + compose, firewall (80/443), deploy dir | me | #1 |
| 3 | Point domain DNS (A record + www) to server IP | user | domain |
| 4 | Add `output: "standalone"`, write Dockerfile + .dockerignore | me | — |
| 5 | Fix build-time DB dependency (force-dynamic sitemap/pages or build with DB up) | me | — |
| 6 | docker-compose.yml: app + postgres (volume) + caddy (volume) | me | #4 |
| 7 | Caddyfile: reverse proxy + auto-HTTPS for the real domain | me | #3 |
| 8 | Production `.env`: new NEXTAUTH_SECRET, real URLs, strong DB pass | me | #3 |
| 9 | Run `prisma migrate deploy` + seed (first deploy); rotate seed passwords | me | #2,#8 |
| 10 | Deploy, smoke-test HTTPS + /admin/login, check logs, hand off | me | all |

Tasks #4–#8 (local file authoring) can proceed in parallel **now**, before SSH is ready.

---

## Information still needed from the user

1. **Server:** IP, SSH username, key (or build one), OS + RAM/CPU, is Docker installed?
2. **Domain:** exact name (with/without `www`), and is the A record already pointing at the server?

> Note: Claude runs bash on the user's **local** machine. Remote work needs key-based SSH
> (interactive password login won't work). Interactive SSH steps (passphrase, first-time
> fingerprint) are run by the user via the `!` prefix in the session.

---

## Known issues to handle during deploy

- `next build` currently fails when Postgres is unreachable because `src/app/sitemap.ts`
  and some `[locale]` pages read the DB at build time. → resolve in task #5.
- `next.config.ts` lacks `output: "standalone"` (needed for a slim runtime image). → task #4.
- Seeded accounts ship with default passwords (`admin@example.com` / `Admin12345!`, etc.).
  **Rotate immediately after first deploy.** → task #9.
