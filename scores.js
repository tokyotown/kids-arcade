// Shared all-time leaderboard for Ivy's & Archie's Arcade.
// Storage: Netlify Blobs (no external database, free tier).
// GET  /.netlify/functions/scores          -> returns the whole leaderboard object
// POST /.netlify/functions/scores          -> body {profile, game, name, score}; adds one score
import { getStore } from "@netlify/blobs";

const KEY = "all";                 // single blob holding the leaderboard object
const MAX_PER_LIST = 10;           // keep top 10 per profile+game

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export default async (req) => {
  const store = getStore("arcade-leaderboard");

  if (req.method === "GET") {
    const data = (await store.get(KEY, { type: "json" })) || {};
    return json(data);
  }

  if (req.method === "POST") {
    let payload;
    try { payload = await req.json(); }
    catch { return json({ error: "bad json" }, 400); }

    // sanitise input — never trust the client
    const profile = String(payload.profile || "").toLowerCase().slice(0, 12).replace(/[^a-z0-9_-]/g, "");
    const game    = String(payload.game    || "").toLowerCase().slice(0, 20).replace(/[^a-z0-9_-]/g, "");
    const name    = String(payload.name    || "PLAYER").toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 8) || "PLAYER";
    const score   = Math.max(0, Math.min(10_000_000, Math.floor(Number(payload.score) || 0)));

    if (!profile || !game || score <= 0) return json({ error: "missing fields" }, 400);

    const data = (await store.get(KEY, { type: "json" })) || {};
    const listKey = `${profile}:${game}`;
    const list = data[listKey] || [];
    list.push({ name, score, ts: Date.now() });
    list.sort((a, b) => b.score - a.score);
    data[listKey] = list.slice(0, MAX_PER_LIST);

    await store.setJSON(KEY, data);
    return json({ ok: true, list: data[listKey] });
  }

  return json({ error: "method not allowed" }, 405);
};
