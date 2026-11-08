// Logs opens of draft previews (/draft/<slug>/) to the DRAFT_VIEWS KV namespace.
// Each open records IP, location, network, device and referrer details, plus a per-browser
// visitor ID cookie so separate devices can be counted. Optionally add ?r=<name> to a link
// to label who it was sent to (remembered in a cookie).
// Your own visits are skipped once you've opened /draft-views (it sets a dv_me cookie).

const BOT = /bot|crawl|spider|preview|facebookexternalhit|slack|whatsapp|telegram|discord|twitter|linkedin|embedly|curl|wget|headless|python|go-http|axios|node-fetch/i;

const cookie = (cookies, name) => (cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`)) || [])[1];

export async function onRequest(context) {
  const { request, env, waitUntil } = context;
  const response = await context.next();
  const url = new URL(request.url);
  const cookies = request.headers.get("cookie") || "";

  const isPage = request.method === "GET" && url.pathname.endsWith("/") &&
    (request.headers.get("accept") || "").includes("text/html");
  if (!isPage || !env.DRAFT_VIEWS || cookie(cookies, "dv_me") === "1") return response;

  const h = (name, max = 200) => (request.headers.get(name) || "").slice(0, max) || null;
  const cf = request.cf || {};
  const refParam = url.searchParams.get("r");
  const ref = decodeURIComponent(refParam || cookie(cookies, "dv_ref") || "").slice(0, 40).replace(/[^\w .-]/g, "") || null;
  const existingId = cookie(cookies, "dv_id");
  const visitorId = existingId || crypto.randomUUID().slice(0, 12);
  const ua = h("user-agent", 400) || "";

  const view = {
    time: new Date().toISOString(),
    path: url.pathname,
    query: url.search.slice(0, 200) || null,
    ref,
    visitorId,
    newVisitor: !existingId,
    bot: BOT.test(ua) || cf.botManagement?.verifiedBot || false,
    botScore: cf.botManagement?.score ?? null,
    // network
    ip: h("cf-connecting-ip", 64),
    asn: cf.asn ?? null,
    network: cf.asOrganization || null,
    colo: cf.colo || null,
    httpProtocol: cf.httpProtocol || null,
    tlsVersion: cf.tlsVersion || null,
    rttMs: cf.clientTcpRtt ?? null,
    // location (approximate, from IP)
    city: cf.city || null,
    region: cf.region || null,
    postalCode: cf.postalCode || null,
    country: cf.country || null,
    continent: cf.continent || null,
    isEU: cf.isEUCountry === "1",
    latitude: cf.latitude || null,
    longitude: cf.longitude || null,
    timezone: cf.timezone || null,
    // browser / device
    ua,
    platform: h("sec-ch-ua-platform", 40),
    mobile: h("sec-ch-ua-mobile", 4) === "?1" ? true : h("sec-ch-ua-mobile", 4) === "?0" ? false : null,
    browserBrands: h("sec-ch-ua"),
    language: h("accept-language", 100),
    dnt: h("dnt", 4) === "1" || h("sec-gpc", 4) === "1",
    // where the link was clicked from
    referer: h("referer", 300),
    secFetchSite: h("sec-fetch-site", 20),
  };

  const key = `view:${view.time}:${crypto.randomUUID().slice(0, 8)}`;
  waitUntil(env.DRAFT_VIEWS.put(key, JSON.stringify(view)));

  const setCookies = [];
  if (!existingId) setCookies.push(`dv_id=${visitorId}; Path=/draft/; Max-Age=31536000; SameSite=Lax; Secure; HttpOnly`);
  if (refParam && ref) setCookies.push(`dv_ref=${encodeURIComponent(ref)}; Path=/draft/; Max-Age=31536000; SameSite=Lax; Secure; HttpOnly`);
  if (!setCookies.length) return response;

  const res = new Response(response.body, response);
  for (const c of setCookies) res.headers.append("set-cookie", c);
  return res;
}
