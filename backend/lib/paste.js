import { ObjectId } from "mongodb";
import { getDb } from "./db.js";

function getBaseUrl(req) {
  const url = process.env.APP_URL || process.env.VERCEL_URL;
  if (url) {
    const base = url.startsWith("http") ? url : `https://${url}`;
    return base.replace(/\/$/, "");
  }
  if (req && req.get && req.get("host")) {
    const host = req.get("host");
    const proto = req.get("x-forwarded-proto") || "http";
    return `${proto}://${host}`;
  }
  return "";
}

export function getNowMs(req) {
  if (process.env.TEST_MODE === "1" && req && req.get && req.get("x-test-now-ms")) {
    const v = parseInt(req.get("x-test-now-ms"), 10);
    if (!Number.isNaN(v)) return v;
  }
  return Date.now();
}

export function getPasteUrl(id, req) {
  const base = getBaseUrl(req);
  return base ? `${base}/p/${id}` : `/p/${id}`;
}

export async function createPaste(input, req) {
  const now = getNowMs(req);
  const createdAt = new Date(now);
  let expiresAt = null;
  if (input.ttl_seconds != null && input.ttl_seconds >= 1) {
    expiresAt = new Date(now + input.ttl_seconds * 1000);
  }
  const maxViews = input.max_views != null && input.max_views >= 1 ? input.max_views : null;

  const doc = {
    content: input.content,
    createdAt,
    expiresAt,
    maxViews,
    viewCount: 0,
  };

  const db = await getDb();
  const col = db.collection("pastes");
  const { insertedId } = await col.insertOne(doc);

  const id = insertedId.toHexString();
  return { id, url: getPasteUrl(id, req) };
}

export async function fetchAndConsumeView(id, req) {
  const now = getNowMs(req);
  const nowDate = new Date(now);
  const db = await getDb();
  const col = db.collection("pastes");

  const oid = ObjectId.isValid(id) ? new ObjectId(id) : null;
  if (!oid) return null;

  const doc = await col.findOne({ _id: oid });
  if (!doc) return null;

  if (doc.expiresAt && doc.expiresAt <= nowDate) return null;
  if (doc.maxViews != null && doc.viewCount >= doc.maxViews) return null;

  const updateResult = await col.findOneAndUpdate(
    {
      _id: oid,
      $and: [
        { $or: [{ expiresAt: null }, { expiresAt: { $gt: nowDate } }] },
        { $or: [{ maxViews: null }, { $expr: { $lt: ["$viewCount", "$maxViews"] } }] },
      ],
    },
    { $inc: { viewCount: 1 } },
    { returnDocument: "after" }
  );

  if (!updateResult) return null;

  const updated = updateResult;
  const remaining_views =
    updated.maxViews == null ? null : Math.max(0, updated.maxViews - updated.viewCount);
  const expires_at = doc.expiresAt ? doc.expiresAt.toISOString() : null;

  return {
    content: doc.content,
    remaining_views,
    expires_at,
  };
}

export async function getPasteForView(id, req) {
  const result = await fetchAndConsumeView(id, req);
  return result ? { content: result.content } : null;
}

/** Escape HTML to prevent script execution when rendering paste content */
export function escapeHtml(s) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(s).replace(/[&<>"']/g, (c) => map[c] || c);
}
