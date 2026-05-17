# Running TWDist Desktop locally

This guide explains how to run the app against a **local backend** or a **remote production-like API**, using the web dev server or the Electron shell.

## Prerequisites

- [Bun](https://bun.sh) or Node.js 20+ and npm
- Dependencies installed: `bun install`
- A running **TWDist backend** (local JAR on port `8080`, or a deployed Cloud Run URL)
- For Electron: native build tools may be required on Linux (`rpm`, `dpkg`, etc.) when packaging only

## Runtime configuration (Electron)

Electron does **not** bake the API URL into the Angular bundle. Settings come from a JSON file at runtime:

| File | Committed? | Used when |
|------|------------|-----------|
| `electron/config.example.json` | Yes | Template — copy this |
| `electron/config.local.json` | **No** (gitignored) | Local dev & preview on your machine |
| `electron/config.packaged.json` | **No** (gitignored) | Generated before `electron:build` |
| `resources/config.json` (inside installer) | N/A | Packaged app at install time |

Create your local config once:

```bash
cp electron/config.example.json electron/config.local.json
```

Example for a **local backend**:

```json
{
  "apiBaseUrl": "http://localhost:8080/api",
  "useBearerAuth": true
}
```

Example for a **remote / production API** (test prod from your machine):

```json
{
  "apiBaseUrl": "https://YOUR_CLOUD_RUN_HOST.run.app/api",
  "useBearerAuth": true
}
```

Use an **absolute** `http://` or `https://` URL in Electron preview and packaged builds. The dev-server proxy (`/api`) only applies when Angular runs on `http://localhost:4200`.

---

## Quick reference

| Goal | Command | API config | Auth |
|------|---------|------------|------|
| Web UI + local API | `bunx ng serve` | `proxy.conf.json` → `localhost:8080` | Cookies (browser) |
| Electron + hot reload | `bun run start` | `electron/config.local.json` | Bearer tokens |
| Electron, packaged-like UI | `bun run electron:preview` | `electron/config.local.json` | Bearer tokens |
| Installer / AppImage locally | See [Packaged build](#packaged-build-production-api-locally) | `TWDIST_API_BASE_URL` env | Bearer tokens |

---

## 1. Web app + local backend (browser)

Best for UI work with cookie-based auth (same as classic web deployment).

1. Start the backend on `http://localhost:8080`.
2. From this repo:

   ```bash
   bunx ng serve
   ```

3. Open `http://localhost:4200`.

Requests to `/api/*` are proxied to the backend via `proxy.conf.json`. No `config.local.json` is required.

**Do not** commit changes to `src/app/shared/config/environment.ts` that hardcode a production URL; keep `apiBaseUrl: '/api'` for this mode.

---

## 2. Electron dev (hot reload)

Default `bun run start` runs the Angular dev server and opens an Electron window pointed at `http://localhost:4200`.

1. Ensure `electron/config.local.json` exists (see above).
2. Start the backend (local or remote, matching `apiBaseUrl` in your config).
3. Run:

   ```bash
   bun run start
   ```

Electron injects config via preload (`__electronRuntimeConfig`). HTTP calls use the URL from config; SSE resolves `/api` against `http://localhost:4200` when the dev server is used.

**Tip:** After changing `config.local.json`, restart `bun run start`.

---

## 3. Electron preview (production-like shell)

Simulates the packaged app (`app://` protocol, production Angular build, Bearer auth). Use this before opening a PR that touches Electron or auth.

1. Set `electron/config.local.json` with an **absolute** `apiBaseUrl`.
2. Run:

   ```bash
   bun run electron:preview
   ```

This runs `ng build --configuration=electron-local`, compiles Electron TypeScript, and starts Electron with `NODE_ENV=production`.

**Checklist:**

- Login works
- Reload keeps the session (refresh token flow)
- Project list and SSE (user/project events) connect without console errors

---

## 4. Local app against production API

To debug against the **live backend** without deploying the desktop app:

1. Copy `electron/config.example.json` → `electron/config.local.json` if needed.
2. Set `apiBaseUrl` to your production API base (including `/api` path), e.g.  
   `https://twdist-back-….run.app/api`
3. Keep `"useBearerAuth": true`.
4. Run either:
   - `bun run start` — faster iteration (dev server + Electron), or
   - `bun run electron:preview` — closer to what users install

**Security:** Do not commit `config.local.json` or paste production secrets into the repo. The URL alone is usually enough; auth uses your normal login.

**Backend:** Production must issue `accessToken` / `refreshToken` on login and refresh (Bearer flow). Cookie-only auth is not sufficient for packaged Electron.

---

## 5. Packaged build (production API locally)

To build an `.AppImage` / `.deb` / `.exe` on your machine pointing at a specific API:

```bash
export TWDIST_API_BASE_URL="https://YOUR_API_HOST.run.app/api"
bun run electron:build
```

`electron:config` writes `electron/config.packaged.json` (gitignored). `electron-builder` bundles it as `resources/config.json` inside the installer.

Artifacts appear under `release/`.

**CI note:** GitHub Actions release workflow should set `TWDIST_API_BASE_URL` from a repository secret and run `bun run electron:config` before `electron-builder` so installers include the correct API URL. That secret is not stored in git.

---

## Auth behavior by mode

| Mode | Session storage | Refresh on 401 |
|------|-----------------|----------------|
| `ng serve` (browser) | HTTP-only cookies + `has_session` hint | Cookie refresh |
| Electron (`useBearerAuth: true`) | `localStorage` access/refresh tokens | `POST /auth/refresh` with refresh token body |

---

## Verification before a PR

```bash
# Unit tests + lint (same as CI)
bunx ng test --watch=false
bun run lint
bunx ng build --configuration=production --progress=false

# Optional: full CI locally
act -W .github/workflows/ci.yml -j build-and-test
```

Manually verify the path you changed (browser dev, `electron:preview`, or both).

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Immediate redirect to login after reload | Session bootstrap / refresh; ensure `config.local.json` is loaded and backend returns tokens on refresh |
| `SSE requires an absolute API base URL` | Electron preview without config, or missing `apiBaseUrl` in `config.local.json` |
| `API base URL is not configured` | No `config.local.json` for Electron preview/packaged build |
| Login works in browser but not Electron | Backend Bearer tokens disabled or wrong `apiBaseUrl` |
| CORS errors in browser | Backend CORS / proxy; use `ng serve` proxy, not a hardcoded remote URL in `environment.ts` |

---

## Related files

- `proxy.conf.json` — web dev proxy
- `src/app/shared/config/environment.ts` — web defaults (`/api`)
- `src/app/shared/config/environment.electron-local.ts` — Electron preview build flags
- `src/app/shared/config/environment.prod.ts` — packaged Angular build (empty `apiBaseUrl`; filled at runtime)
- `scripts/write-electron-config.mjs` — generates packaged config from `TWDIST_API_BASE_URL`
