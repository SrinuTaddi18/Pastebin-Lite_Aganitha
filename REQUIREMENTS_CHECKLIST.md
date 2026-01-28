# Assignment PDF — Requirements Checklist

Vadi ichina PDF lo **Required Routes** anni chesama leda, point-by-point verify chesanu. Sab OK ante ✅, gap unte ⚠️ and fix mention.

---

## 1. Health check — GET /api/healthz

| Requirement | Status | Implementation |
|-------------|--------|-----------------|
| Must return **HTTP 200** | ✅ | `res.status(200)` (index.js line 36) |
| Must return **JSON** | ✅ | `res.set("Content-Type", "application/json").json({ ok })` |
| Must respond **quickly** | ✅ | Only `healthCheck()` → DB ping, no heavy logic |
| Should reflect whether app can access **persistence layer** | ✅ | `healthCheck()` pings MongoDB; returns `false` if no MONGODB_URI or connection fails (db.js lines 20–29) |
| Example response `{ "ok": true }` | ✅ | Success case: `json({ ok: true })`; DB fail: `json({ ok: false })` |

**Verdict:** ✅ **Anni cover ayayi.**

---

## 2. Create a paste — POST /api/pastes

| Requirement | Status | Implementation |
|-------------|--------|-----------------|
| Request body **JSON**: `content`, `ttl_seconds?`, `max_views?` | ✅ | `req.body` use chestam; content required, ttl_seconds / max_views optional |
| **content** required, non‑empty string | ✅ | `content.trim()`; `!content` → 400 + `"content is required and must be a non-empty string"` (index.js 42–47) |
| **ttl_seconds** optional; if present, integer ≥ 1 | ✅ | `typeof ttl === "number" && Number.isInteger(ttl) && ttl >= 1`; fail → 400 + `"ttl_seconds must be an integer >= 1"` (49–56) |
| **max_views** optional; if present, integer ≥ 1 | ✅ | Same check for max_views; fail → 400 + `"max_views must be an integer >= 1"` (58–66) |
| Response **JSON, 2xx** | ✅ | `res.status(201).json(result)` (72) |
| Response shape `{ "id": "string", "url": "..." }` | ✅ | `createPaste()` returns `{ id, url }`; url = `getPasteUrl(id, req)` → `baseUrl + "/p/" + id` (paste.js 50–51) |
| **Invalid input** → **4xx** with **JSON error body** | ✅ | 400 + `res.json({ error: "..." })` for content / ttl_seconds / max_views (44–66) |

**Verdict:** ✅ **Anni cover ayayi.**

---

## 3. Fetch a paste (API) — GET /api/pastes/:id

| Requirement | Status | Implementation |
|-------------|--------|-----------------|
| Successful response **JSON, 200** | ✅ | `res.status(200).json(result)` (index.js 90) |
| Response: `content`, `remaining_views`, `expires_at` | ✅ | `fetchAndConsumeView()` returns `{ content, remaining_views, expires_at }` (paste.js 88–92) |
| **remaining_views** may be **null** if unlimited | ✅ | `updated.maxViews == null ? null : Math.max(0, ...)` (84–85) |
| **expires_at** may be **null** if no TTL | ✅ | `doc.expiresAt ? doc.expiresAt.toISOString() : null` (86) |
| **Each successful API fetch counts as a view** | ✅ | `fetchAndConsumeView` does `findOneAndUpdate(..., { $inc: { viewCount: 1 } })` before returning (69–79) |
| **Unavailable**: missing paste | ✅ | `findOne` no doc → null → 404 + JSON (83–89) |
| **Unavailable**: expired paste | ✅ | `doc.expiresAt && doc.expiresAt <= nowDate` → null → 404 (66–67) |
| **Unavailable**: view limit exceeded | ✅ | `doc.viewCount >= doc.maxViews` → null; or findOneAndUpdate no match → null → 404 (67, 81) |
| All unavailable → **HTTP 404** + **JSON response** | ✅ | `res.status(404).set("Content-Type", "application/json").json({ error: "Paste not found or unavailable" })` (85–89) |

**Verdict:** ✅ **Anni cover ayayi.**

---

## 4. View a paste (HTML) — GET /p/:id

| Requirement | Status | Implementation |
|-------------|--------|-----------------|
| Returns **HTML (200)** containing the paste content | ✅ | `res.status(200).set("Content-Type", "text/html").send(...)` with `<pre>${safe}</pre>` (index.js 107–111) |
| If paste **unavailable** → **HTTP 404** | ✅ | `!paste` → `res.status(404).send(...)` HTML (97–104) |
| Paste content must be **rendered safely (no script execution)** | ✅ | `escapeHtml(paste.content)` before putting in HTML; `& < > " '` → entities (paste.js 102–105); `<script>` etc. render avvavu |

**Verdict:** ✅ **Anni cover ayayi.**

---

# Summary

| Route | PDF requirements | Status |
|-------|------------------|--------|
| **GET /api/healthz** | 200, JSON, quick, reflects DB | ✅ Done |
| **POST /api/pastes** | Body rules, 2xx { id, url }, 4xx + JSON on invalid input | ✅ Done |
| **GET /api/pastes/:id** | 200 JSON { content, remaining_views, expires_at }, nulls, view counts, 404 + JSON when unavailable | ✅ Done |
| **GET /p/:id** | HTML 200 with content, 404 when unavailable, safe rendering | ✅ Done |

**Overall:** ✅ **Vadi PDF lo Required Routes lo cheppina anni points implementation lo cover ayayi.**

---

# Code references (quick verify)

- **GET /api/healthz:** `backend/index.js` ~34–37, `backend/lib/db.js` healthCheck  
- **POST /api/pastes:** `backend/index.js` ~39–80, `backend/lib/paste.js` createPaste, getPasteUrl  
- **GET /api/pastes/:id:** `backend/index.js` ~83–91, `backend/lib/paste.js` fetchAndConsumeView  
- **GET /p/:id:** `backend/index.js` ~95–113, `backend/lib/paste.js` getPasteForView, escapeHtml  

Ee checklist repu submission mundu or interview lo "requirements anni meet avuthunda?" adigithe, andulo nundi point-by-point cheppagalavu.
