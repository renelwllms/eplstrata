# EdgePoint Strata

WorkflowMax-style multi-tenant SaaS foundations.

## How to Run Locally
1. Install dependencies

```bash
npm install
```

2. Set database connection

```bash
cp .env.example .env
```

Update `DATABASE_URL` in `.env` to point to your PostgreSQL instance.

3. Run migrations

```bash
npm run prisma:migrate
```

4. Seed the database

```bash
npm run prisma:seed
```

5. Start the dev server

```bash
npm run dev
```

## Deployment Runbook
1. Set environment variables
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `SERVER_LOG_LEVEL`
   - `RATE_LIMIT_MAX`
   - `RATE_LIMIT_WINDOW_MS`
2. Install dependencies

```bash
npm install
```

3. Run migrations (production)

```bash
npx prisma migrate deploy
```

4. Build the app

```bash
npm run build
```

5. Start the server

```bash
npm run start
```

6. Verify PWA assets
   - `GET /manifest.webmanifest`
   - service worker present at `/sw.js` (created by `next-pwa` in production)
7. Smoke test
   - Log in
   - Open `/app/billing` and confirm status
   - Create a client and job
   - Create a time entry

## Deployment Checklist
- Database is reachable and `DATABASE_URL` is correct.
- Migrations applied via `prisma migrate deploy`.
- `NEXTAUTH_SECRET` is set and stable.
- `NEXTAUTH_URL` matches public URL.
- Rate limits set for production traffic.
- Seeding is disabled in production (`NODE_ENV=production`).
- PWA assets available in production build.
