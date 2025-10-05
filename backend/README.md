# Appliance Buddy – Backend API

TypeScript Node.js/Express API for managing home appliances, integrated with Supabase for auth and data. Secured with Helmet, CORS, and request rate limiting, and ready for Docker/Railway deployment.

## Features

- RESTful appliance management with Supabase storage
- Supabase Auth: signup/signin, password reset and update
- TypeScript throughout (ES modules)
- Security middleware: Helmet, CORS, rate limiting, compression, morgan
- Centralized error handling and request validation (zod)
- Serves the built frontend from `appliance-buddy/dist` in production

## Tech Stack

- Node.js 18, Express 4
- TypeScript 5, tsx, nodemon
- Supabase JS v2
- Helmet, CORS, express-rate-limit, compression, morgan, zod

## Prerequisites

- Node.js 18+
- npm 9+
- Supabase project with tables: `users`, `appliances`, `support_contacts`, `maintenance_tasks`, `linked_documents`

## Getting Started

1) Install dependencies

```bash
cd backend
npm install
```

2) Configure environment

Create `.env` in `backend/` with at least:

```env
# Server
PORT=3001
NODE_ENV=development

# CORS / Frontend origin
FRONTEND_URL=http://localhost:8080

# Supabase (one of these must be set)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# or
SUPABASE_ANON_KEY=your-anon-key
```

Notes:
- The Supabase URL is currently defined in `src/config/database.ts`. Change it there if you use a different project.
- In development, CORS is permissive. In production, set `FRONTEND_URL` to your deployed frontend.

3) Run in development

```bash
npm run dev
# http://localhost:${PORT:-3001}
```

4) Build and start in production

```bash
npm run build
npm start
```

## Project Structure

```
backend/
├─ src/
│  ├─ app.ts                 # Express app setup, security, CORS, static serving
│  ├─ server.ts              # Bootstraps server and connection test
│  ├─ config/
│  │  └─ database.ts         # Supabase client (URL + key from env)
│  ├─ routes/
│  │  ├─ index.ts            # Route aggregation (/api)
│  │  ├─ appliances.ts       # CRUD + stats (protected)
│  │  └─ auth.ts             # Auth/signup/signin/password flows
│  ├─ controllers/
│  │  └─ ApplianceController.ts
│  ├─ services/
│  │  └─ ApplianceService.ts # Business logic + transformations
│  ├─ middleware/
│  │  ├─ auth.ts             # Bearer token validation via Supabase
│  │  ├─ errorHandler.ts     # Centralized error responses
│  │  └─ validation.ts       # zod-powered request validation
│  ├─ data/
│  │  └─ mockAppliances.ts   # Sample data for seeding
│  └─ types/
│     └─ appliance.ts        # Shared types
├─ scripts/
│  └─ seed.ts                # Seed helper (uses mock data)
├─ Dockerfile
├─ nodemon.json
├─ package.json
└─ tsconfig.json
```

## Environment Variables

| Name                         | Required | Default      | Description |
|------------------------------|----------|--------------|-------------|
| `PORT`                       | No       | 3001         | Server port |
| `NODE_ENV`                   | No       | development  | Node environment |
| `FRONTEND_URL`               | No       | —            | Allowed origin in prod CORS and auth redirects |
| `SUPABASE_SERVICE_ROLE_KEY`  | Yes/No   | —            | Prefer this for server-side; else set `SUPABASE_ANON_KEY` |
| `SUPABASE_ANON_KEY`          | Yes/No   | —            | Used if service role not set |

Supabase URL is currently hardcoded in `src/config/database.ts`. Update it to your project URL when needed.

## Running with Docker

Build and run:

```bash
docker build -t appliance-backend .
docker run --rm -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e FRONTEND_URL=http://localhost:8080 \
  -e SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  appliance-backend
```

The image exposes port 3001 and includes a `/health` Docker healthcheck.

## API Overview

Base URL: `/api`

### Health

- `GET /health` → `{ status: 'OK', timestamp }`

### Auth

- `POST /api/auth/signup` — body: `{ email, password, name? }`
- `POST /api/auth/signin` — body: `{ email, password }` → returns `{ user, session }`
- `POST /api/auth/signout` — requires `Authorization: Bearer <token>`
- `GET  /api/auth/me` — requires Bearer token, returns current user
- `POST /api/auth/refresh` — body: `{ refresh_token }` → returns `{ session }`
- `POST /api/auth/reset-password` — body: `{ email }` (sends reset email)
- `POST /api/auth/update-password` — Bearer token, body: `{ newPassword }`
- `POST /api/auth/verify-reset-token` — body: `{ access_token, refresh_token? }`
- `POST /api/auth/update-password-with-token` — body: `{ newPassword, access_token, refresh_token? }`
- `GET  /api/auth/recovery-callback` — backend bridge that redirects to frontend with tokens

Auth uses Supabase JWT in the `Authorization: Bearer <access_token>` header. Protected routes will return 401/403 if the token is missing/invalid.

### Appliances (protected)

- `GET    /api/appliances` — query: `search?`, `filter?` (`all` | `Active` | `Expiring Soon` | `Expired`)
- `GET    /api/appliances/:id`
- `POST   /api/appliances` — body validated via zod
- `PUT    /api/appliances/:id`
- `DELETE /api/appliances/:id`
- `GET    /api/appliances/stats/overview` — aggregate counts by warranty status

All appliance routes require a valid Bearer token. Data is scoped by `user_id` when available.

## CORS, Security, and Limits

- Helmet enabled with relaxed CSP/COEP for frontend compatibility.
- CORS: permissive in development; in production only `FRONTEND_URL` is allowed.
- Rate limiting: `/api/*` limited to 100 requests per 15 minutes per IP.
- Compression enabled; morgan logging only in development.

## Serving the Frontend (production)

If `appliance-buddy/dist` exists at the repo root, the backend will:
- Serve static assets from that folder
- Respond with `index.html` for non-`/api` and non-`/health` routes (SPA fallback)

## Seeding Data

Use the included seed helper (ensure your Supabase tables exist):

```bash
npx tsx scripts/seed.ts
```

This creates a test user and inserts mock appliances, support contacts, maintenance tasks, and linked documents.

## Error Handling

Errors are returned as JSON: `{ error: string }`. Unknown routes return 404 `{ error: 'Route not found' }`.

## Available npm Scripts

- `dev` — run with nodemon + tsx
- `build` — compile TypeScript to `dist/`
- `start` — start from `dist/`
- `lint`, `lint:fix` — ESLint checks and fixes

## Troubleshooting

- 401/403 on protected routes: ensure `Authorization: Bearer <access_token>` from Supabase is present and valid
- CORS errors: set `FRONTEND_URL` and verify `NODE_ENV=production` on server only when deployed
- Supabase connection: verify the key is set and update the URL in `src/config/database.ts`

## License

MIT — see `LICENSE`.

---

Happy building! 🚀
