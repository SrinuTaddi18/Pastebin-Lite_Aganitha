import { useState } from "react";

const API_BASE = "https://pastebin-lite-backend-cx8n.onrender.com"; // same origin when proxied or served by backend

export default function App() {
  const [content, setContent] = useState("");
  const [ttlSeconds, setTtlSeconds] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setUrl("");
    const body = { content: content.trim() };
    const ttl = ttlSeconds.trim() ? parseInt(ttlSeconds, 10) : undefined;
    const max = maxViews.trim() ? parseInt(maxViews, 10) : undefined;
    if (ttl !== undefined) body.ttl_seconds = ttl;
    if (max !== undefined) body.max_views = max;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/pastes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || `Error ${res.status}`);
        return;
      }
      setUrl(data.url ?? "");
      setContent("");
      setTtlSeconds("");
      setMaxViews("");
    } catch (err) {
      setError("Network or server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>Pastebin-Lite</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Create a text paste and share the link. Optional: set expiry (TTL) or view limit.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <div>
          <label
            htmlFor="content"
            style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}
          >
            Content *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            placeholder="Paste your text here..."
            style={{
              width: "100%",
              padding: "0.5rem",
              fontFamily: "ui-monospace, monospace",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <label
              htmlFor="ttl"
              style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}
            >
              TTL (seconds, optional)
            </label>
            <input
              id="ttl"
              type="number"
              min={1}
              value={ttlSeconds}
              onChange={(e) => setTtlSeconds(e.target.value)}
              placeholder="e.g. 60"
              style={{ width: "120px", padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </div>
          <div>
            <label
              htmlFor="maxViews"
              style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}
            >
              Max views (optional)
            </label>
            <input
              id="maxViews"
              type="number"
              min={1}
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              placeholder="e.g. 5"
              style={{ width: "120px", padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.6rem 1rem",
            background: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 500,
          }}
        >
          {loading ? "Creating…" : "Create paste"}
        </button>
      </form>

      {error && (
        <div
          role="alert"
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            background: "#fef2f2",
            color: "#b91c1c",
            borderRadius: "6px",
          }}
        >
          {error}
        </div>
      )}

      {url && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "#f0fdf4",
            borderRadius: "6px",
            border: "1px solid #86efac",
          }}
        >
          <p style={{ margin: "0 0 0.5rem 0", fontWeight: 500 }}>Paste created</p>
          <a href={url} style={{ color: "#059669", wordBreak: "break-all" }}>
            {url}
          </a>
          <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem", color: "#666" }}>
            Share this link to let others view the paste.
          </p>
        </div>
      )}
    </main>
  );
}
