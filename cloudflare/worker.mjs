const DEFAULT_ROOT_DOMAINS = ["katalogweb.my.id"];
const PASSTHROUGH_LABELS = new Set(["www", "localhost"]);
const STATIC_PREFIXES = [
  "/_next/",
  "/demo/",
  "/uploads/",
  "/favicon",
  "/robots.txt",
  "/sitemap.xml",
];

export function extractClientSubdomain(hostname, rootDomains = DEFAULT_ROOT_DOMAINS) {
  const cleanHost = String(hostname || "").toLowerCase().split(":")[0];
  for (const root of rootDomains) {
    const cleanRoot = root.trim().toLowerCase();
    if (!cleanRoot) continue;
    if (cleanHost === cleanRoot || cleanHost === `www.${cleanRoot}`) {
      return null;
    }
    const suffix = `.${cleanRoot}`;
    if (cleanHost.endsWith(suffix)) {
      const label = cleanHost.slice(0, -suffix.length);
      if (!label || label.includes(".") || PASSTHROUGH_LABELS.has(label)) {
        return null;
      }
      if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(label)) {
        return label;
      }
    }
  }
  return null;
}

export function buildSubdomainAssetUrl(requestUrl, rootDomains = DEFAULT_ROOT_DOMAINS) {
  const url = new URL(requestUrl);
  const slug = extractClientSubdomain(url.hostname, rootDomains);
  if (!slug) {
    return null;
  }

  const isStaticAsset =
    STATIC_PREFIXES.some((prefix) => url.pathname.startsWith(prefix)) ||
    (/\.[a-z0-9]+$/i.test(url.pathname) && url.pathname !== "/index.html");

  if (isStaticAsset) {
    return null;
  }

  if (url.pathname === "/" || url.pathname === "/index.html") {
    url.pathname = `/s/${slug}/index.html`;
    return url.toString();
  }

  return null;
}

const worker = {
  async fetch(request, env) {
    const rootDomains = (env.ROOT_DOMAINS || "katalogweb.my.id")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const rewrittenUrl = buildSubdomainAssetUrl(request.url, rootDomains);
    if (rewrittenUrl) {
      return env.ASSETS.fetch(new Request(rewrittenUrl, request));
    }

    return env.ASSETS.fetch(request);
  },
};

export default worker;
