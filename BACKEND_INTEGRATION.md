# NeuroSafe backend integration

The React frontend in `frontend/` expects the existing Express backend to continue owning all `/api/*` and `/health` routes.

## Development

Run:

```bash
npm install
npm run dev
```

Vite runs on `5173` and proxies `/api` and `/health` to Express on `3000`.

## Production

Run:

```bash
npm run build
npm start
```

The Vite build is written to:

```text
frontend/dist/
```

The existing Express server should serve that directory for non-API frontend requests while leaving `/api/*` and `/health` untouched.

## Important

Do not replace the existing backend feature implementations.

The React service layer uses these existing routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/demo`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/profile/customize`
- `POST /api/profile/suggest`
- `POST /api/profile/approve`
- `POST /api/read`
- `POST /api/camera/capture`
- `POST /api/camera/describe`
- `POST /api/camera/analyze`
- `POST /api/explain`
- `POST /api/say`
- `GET /api/calm`
- `GET /api/habits`
- `POST /api/habits`
- `POST /api/habits/:id/toggle`
- `DELETE /api/habits/:id`
- `POST /api/habits/reset`
- `POST /api/habits/suggest`
- `POST /api/tasks/breakdown`
- `POST /api/route`
- `POST /api/route/alternative`
- `POST /api/sos`
- `GET /health`

These were mapped from the supplied existing frontend code. Verify them against the actual backend before deployment.
