// Private report of draft preview opens: /draft-views?key=<DRAFT_VIEWS_KEY>
// Add &bots to include link previews/bots. Shows the most recent 500 opens.
// Visiting it also sets a dv_me cookie so your own draft visits aren't logged.

const LIMIT = 500;
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = (t) => new Date(t).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg", dateStyle: "medium", timeStyle: "short" });
const host = (u) => { try { return new URL(u).hostname; } catch { return null; } };

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (!env.DRAFT_VIEWS_KEY || key !== env.DRAFT_VIEWS_KEY) return new Response("Not found", { status: 404 });
  if (!env.DRAFT_VIEWS) return new Response("DRAFT_VIEWS KV binding missing", { status: 500 });

  const keys = [];
  let cursor;
  do {
    const page = await env.DRAFT_VIEWS.list({ prefix: "view:", cursor });
    keys.push(...page.keys.map((k) => k.name));
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
  const recent = keys.reverse().slice(0, LIMIT);
  const views = (await Promise.all(recent.map((k) => env.DRAFT_VIEWS.get(k, "json")))).filter(Boolean);

  const showBots = url.searchParams.has("bots");
  const shown = views.filter((v) => showBots || !v.bot);

  const byPost = {};
  for (const v of shown) {
    const p = (byPost[v.path] ??= { opens: 0, visitors: new Set(), ips: new Set(), names: new Set(), networks: new Set(), countries: new Set(), referers: new Set(), last: v.time });
    p.opens++;
    p.visitors.add(v.visitorId);
    if (v.ip) p.ips.add(v.ip);
    if (v.ref) p.names.add(v.ref);
    if (v.network) p.networks.add(v.network);
    if (v.country) p.countries.add(v.country);
    const rh = host(v.referer);
    if (rh && rh !== url.hostname) p.referers.add(rh);
  }

  const list = (set) => esc([...set].join(", ")) || "—";
  const summary = Object.entries(byPost).map(([path, p]) => `<tr>
    <td>${esc(path)}</td><td>${p.opens}</td><td>${p.visitors.size}</td><td>${p.ips.size}</td>
    <td>${list(p.names)}</td><td>${list(p.countries)}</td><td>${list(p.networks)}</td>
    <td>${p.referers.size ? `<b>${list(p.referers)}</b>` : "—"}</td><td>${fmt(p.last)}</td></tr>`).join("");

  const rows = shown.map((v) => {
    const where = [v.city, v.region, v.country].filter(Boolean).join(", ");
    const device = [v.platform?.replace(/"/g, ""), v.mobile === true ? "mobile" : v.mobile === false ? "desktop" : null].filter(Boolean).join(" · ");
    return `<tr>
      <td>${fmt(v.time)}</td><td>${esc(v.path)}</td>
      <td>${esc(v.ref || "—")}<div class="sub">${esc(v.visitorId)}${v.newVisitor ? " · new" : ""}</div></td>
      <td>${esc(v.ip || "—")}<div class="sub">${esc(v.network || "")}${v.asn ? ` (AS${v.asn})` : ""}</div></td>
      <td>${esc(where || "—")}<div class="sub">${esc(v.timezone || "")}</div></td>
      <td>${esc(device || "—")}<div class="sub">${esc(v.language || "")}</div></td>
      <td>${esc(host(v.referer) || "—")}</td>
      <td><details><summary>${v.bot ? "🤖 " : ""}all</summary><pre>${esc(JSON.stringify(v, null, 2))}</pre></details></td></tr>`;
  }).join("");

  const base = `?key=${encodeURIComponent(key)}`;
  const toggle = showBots ? `<a href="${base}">hide link previews/bots</a>` : `<a href="${base}&bots">show link previews/bots</a>`;

  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Draft views</title>
<style>body{font:14px system-ui,sans-serif;margin:24px auto;max-width:1200px;padding:0 16px;background:#fff;color:#111}
.wrap{overflow-x:auto;margin-bottom:32px}table{border-collapse:collapse;width:100%}td,th{text-align:left;padding:6px 8px;border-bottom:1px solid #8883;vertical-align:top}
.sub{color:#888;font-size:12px}pre{font-size:11px;max-width:420px;white-space:pre-wrap;overflow-wrap:anywhere}
@media(prefers-color-scheme:dark){body{background:#111;color:#ddd}}</style>
<h1>Draft views</h1><p>${shown.length} opens shown (latest ${LIMIT} max) · ${toggle}</p>
<p class="sub">Visitors = separate browsers/devices. Referrers outside this site are in bold: that's where a link was clicked from.</p>
<h2>By post</h2><div class="wrap"><table><tr><th>Post</th><th>Opens</th><th>Visitors</th><th>IPs</th><th>Names</th><th>Countries</th><th>Networks</th><th>Referrers</th><th>Last open</th></tr>
${summary || "<tr><td colspan=9>No views yet</td></tr>"}</table></div>
<h2>Every open</h2><div class="wrap"><table><tr><th>When</th><th>Post</th><th>Name / visitor</th><th>IP / network</th><th>Where</th><th>Device</th><th>Referrer</th><th>Raw</th></tr>${rows}</table></div>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "set-cookie": "dv_me=1; Path=/; Max-Age=31536000; SameSite=Lax; Secure",
    },
  });
}
