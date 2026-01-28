import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import express from "express";
import cors from "cors";
import { healthCheck } from "./lib/db.js";
import {
  createPaste,
  fetchAndConsumeView,
  getPasteForView,
  escapeHtml,
} from "./lib/paste.js";

const app = express();

app.use(cors());
app.use(express.json());

//const isProd = process.env.NODE_ENV === "production";
//const frontendBuild = path.join(__dirname, "..", "frontend", "dist");

/** URL of the create-paste page (frontend). In dev set FRONTEND_URL in .env.local. */
function getCreatePastePageUrl() {
  const u = process.env.FRONTEND_URL;
  return u ? u.replace(/\/$/, "") : "";
}

// ----- API routes -----

app.get("/api/healthz", async (_req, res) => {
  const ok = await healthCheck();
  res.set("Content-Type", "application/json").status(200).json({ ok });
});

app.post("/api/pastes", async (req, res) => {
  try {
    const body = req.body || {};
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content) {
      return res
        .status(400)
        .set("Content-Type", "application/json")
        .json({ error: "content is required and must be a non-empty string" });
    }

    const ttl = body.ttl_seconds;
    if (ttl !== undefined && (typeof ttl !== "number" || !Number.isInteger(ttl) || ttl < 1)) {
      return res
        .status(400)
        .set("Content-Type", "application/json")
        .json({ error: "ttl_seconds must be an integer >= 1" });
    }

    const maxViews = body.max_views;
    if (
      maxViews !== undefined &&
      (typeof maxViews !== "number" || !Number.isInteger(maxViews) || maxViews < 1)
    ) {
      return res
        .status(400)
        .set("Content-Type", "application/json")
        .json({ error: "max_views must be an integer >= 1" });
    }

    const result = await createPaste(
      { content, ttl_seconds: ttl, max_views: maxViews },
      req
    );
    return res.status(201).set("Content-Type", "application/json").json(result);
  } catch (err) {
    console.error("createPaste error", err);
    return res
      .status(500)
      .set("Content-Type", "application/json")
      .json({ error: "Internal server error" });
  }
});

app.get("/api/pastes/:id", async (req, res) => {
  const result = await fetchAndConsumeView(req.params.id, req);
  if (!result) {
    return res
      .status(404)
      .set("Content-Type", "application/json")
      .json({ error: "Paste not found or unavailable" });
  }
  res.set("Content-Type", "application/json").status(200).json(result);
});

// ----- HTML view: GET /p/:id -----
app.get("/p/:id", async (req, res) => {
  const paste = await getPasteForView(req.params.id, req);
  if (!paste) {
    const homeUrl = getCreatePastePageUrl() || "/";
    return res.status(404).set("Content-Type", "text/html").send(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Not found</title></head><body>
      <h1>Paste not found or unavailable</h1>
      <p>It may have expired, reached its view limit, or never existed.</p>
      <a href="${homeUrl}">Create a new paste</a></body></html>`
    );
  }
  const safe = escapeHtml(paste.content);
  res.status(200).set("Content-Type", "text/html").send(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Paste</title>
    <style>body{font-family:ui-monospace,monospace;padding:1rem;max-width:800px;margin:0 auto;}
    pre{white-space:pre-wrap;word-break:break-word;background:#f5f5f5;padding:1rem;border-radius:6px;}</style>
    </head><body><pre>${safe}</pre></body></html>`
  );
});

// ----- Root path: redirect to frontend in dev, serve React in prod -----
app.get("/", (req, res) => {
  const frontendUrl = getCreatePastePageUrl();
  if (frontendUrl) {
    return res.redirect(302, frontendUrl + "/");
  }
  if (isProd) {
    return res.sendFile(path.join(frontendBuild, "index.html"));
  }
  res.status(404).set("Content-Type", "text/html").send(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Not found</title></head><body>
    <h1>Cannot GET /</h1>
    <p>In development, set <code>FRONTEND_URL</code> in <code>.env.local</code> to your React dev server URL (e.g. the port Vite shows) and restart the backend. Then &quot;Create a new paste&quot; from paste view will take you back to the form.</p></body></html>`
  );
});

// ----- Serve React build in production -----
// if (isProd) {
//   app.use(express.static(frontendBuild));
//   app.get("*", (_req, res) => {
//     res.sendFile(path.join(frontendBuild, "index.html"));
//   });
// }
app.get("/", (_req, res) => {
  res.status(200).json({ status: "Backend running" });
});


const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\nPort ${PORT} is already in use. Either:`);
    console.error(`  1. Close the other app using port ${PORT}, or`);
    console.error(`  2. Set PORT=5001 (or another free port) and run again.`);
    console.error(`\nOn Windows PowerShell, to free the port:`);
    console.error(`  Get-NetTCPConnection -LocalPort ${PORT} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }\n`);
    process.exit(1);
  }
  throw err;
});

export default app;
