# Pastebin-Lite

A small Pastebin-like application. Users can create a text paste and share a link to view it. Pastes may have optional time-based expiry (TTL) and/or view-count limits.

**Stack:** **MERN** — **M**ongoDB, **E**xpress, **R**eact, **N**ode.js.

- **Backend:** Node.js + Express (REST API) + MongoDB  
- **Frontend:** React (Vite)  
- **Persistence:** MongoDB (e.g. MongoDB Atlas)

## Running locally

1. **Prerequisites:** Node.js 18+ and a MongoDB database (e.g. [MongoDB Atlas](https://cloud.mongodb.com) free tier).

2. **Clone and install:**
   ```bash
   git clone <your-repo-url>
   cd pastebin-lite
   npm run install:all
   ```
   Or install root, then `npm install` in `backend/` and `frontend/` separately.

3. **Environment:** Create `.env.local` in the project root (or copy from `.env.example`) and set your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/pastebin?retryWrites=true&w=majority
   ```
   Do not commit `.env.local` or any real credentials.

4. **Start the app (development):**
   ```bash
   npm run dev
   ```
   - **Backend** (Express) runs on **http://localhost:5000**
   - **Frontend** (React) runs on **http://localhost:3000** and proxies `/api` and `/p` to the backend.

   Open http://localhost:3000. Create pastes from the home page. Shared links open at `http://localhost:5000/p/<id>` (or same host in production).

5. **Production build (single server):**
   ```bash
   npm run build
   npm run start --prefix backend
   ```
   Express serves the React build and all API/HTML routes on port 5000 (or `PORT` env).

6. **If you see "address already in use" (EADDRINUSE):** Port 5000 (or 3000) is taken by another process. Close any other terminal where `npm run dev` is running, or free the port. On Windows PowerShell:
   ```powershell
   Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
   ```
   Or run on another port: `$env:PORT=5001; npm run start --prefix backend`

## Project structure (Frontend / Backend separate)

```
pastebin-lite/
│
├── frontend/                 # React (Vite) — UI only
│   ├── src/
│   │   ├── App.jsx           # Create-paste form, API calls
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js        # Dev proxy to backend
│   └── package.json
│
├── backend/                  # Node + Express — API + MongoDB
│   ├── lib/
│   │   ├── db.js             # MongoDB connection, healthCheck
│   │   └── paste.js          # createPaste, fetchAndConsumeView, getPasteForView, escapeHtml
│   ├── index.js              # Express app, routes, serves frontend build in prod
│   └── package.json
│
├── .env.example
├── .env.local                # (create this, do not commit)
├── package.json              # Root scripts: dev, build, start
└── README.md
```

## Persistence layer

**MongoDB** is used as the persistence layer. The backend uses the official `mongodb` driver and a single collection `pastes`. Documents include:

- `content`, `createdAt`, `expiresAt` (optional), `maxViews` (optional), `viewCount`

For deployment, use a managed MongoDB service such as **MongoDB Atlas** and set `MONGODB_URI` in the environment. The backend loads `.env.local` or `.env` from the project root.

## Design decisions

- **MERN split:** Backend (Express) serves the REST API and the HTML view for `/p/:id`. Frontend (React) is the UI for creating pastes; in production the backend also serves the built frontend from `frontend/dist`.
- **View counting:** Each successful fetch (API or HTML view) consumes one view. `findOneAndUpdate` with conditions (not expired, under view limit) is used so the update is atomic under concurrent load.
- **Deterministic expiry (TEST_MODE):** When `TEST_MODE=1`, the `x-test-now-ms` request header (milliseconds since epoch) is used as “now” for expiry checks only.
- **Safety:** Paste content in the HTML view is escaped (`escapeHtml`) so no script execution is possible.
- **Base URL:** Paste URLs use `APP_URL` or `VERCEL_URL` when set, or `Host` / `X-Forwarded-Proto` from the request, so shared links use the correct domain in production.

## Required routes

| Route | Description |
|-------|-------------|
| `GET /api/healthz` | Health check; returns `{ "ok": true }` when the app can reach MongoDB. |
| `POST /api/pastes` | Create paste. Body: `{ "content", "ttl_seconds?", "max_views?" }`. Returns `{ "id", "url" }`. |
| `GET /api/pastes/:id` | Fetch paste (counts as one view). Returns `{ "content", "remaining_views", "expires_at" }` or 404. |
| `GET /p/:id` | HTML page that shows the paste content or 404. |

## Deploying

- **Backend:** Deploy the Node/Express server (e.g. Railway, Render, or Vercel with a serverless adapter). Set `MONGODB_URI` and, if needed, `APP_URL`.
- **Frontend:** In production, the backend serves the built frontend from `frontend/dist` when `NODE_ENV=production`, so a single deployment of the backend is enough. No manual DB migrations or shell access are required.
