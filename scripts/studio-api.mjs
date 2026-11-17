import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const SITES_DIR = path.join(ROOT_DIR, "content", "sites");
const UPLOADS_DIR = path.join(ROOT_DIR, "public", "uploads");

const RESERVED_SLUGS = new Set([
  "www",
  "mail",
  "ftp",
  "api",
  "admin",
  "studio",
  "preview",
  "s",
  "uploads",
  "demo",
  "katalogweb",
  "localhost",
]);

const ALLOWED_EXTENSIONS = new Set([".webp", ".jpg", ".jpeg", ".png", ".mp3"]);

function isValidSlug(slug) {
  return (
    typeof slug === "string" &&
    slug.length >= 3 &&
    slug.length <= 40 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) &&
    !RESERVED_SLUGS.has(slug)
  );
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req, maxBytes = 25 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(new Error("Payload terlalu besar"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf-8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Body JSON tidak valid"));
      }
    });
    req.on("error", reject);
  });
}

async function ensureDirs() {
  await fs.mkdir(SITES_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

export function createStudioServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "/", "http://127.0.0.1:3099");
      const pathname = url.pathname;

      if (req.method === "GET" && pathname === "/__studio/health") {
        return sendJson(res, 200, { ok: true, mode: "local" });
      }

      if (req.method === "GET" && pathname === "/__studio/sites") {
        await ensureDirs();
        const entries = await fs.readdir(SITES_DIR, { withFileTypes: true });
        const sites = [];
        for (const entry of entries) {
          if (entry.isFile() && entry.name.endsWith(".json")) {
            const raw = await fs.readFile(path.join(SITES_DIR, entry.name), "utf-8");
            sites.push(JSON.parse(raw));
          }
        }
        sites.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
        return sendJson(res, 200, { sites });
      }

      if (req.method === "POST" && pathname === "/__studio/sites") {
        await ensureDirs();
        const body = await readJsonBody(req);
        const site = body.site ?? body;
        const previousSlug = body.previousSlug;

        if (!site || !isValidSlug(site.slug)) {
          return sendJson(res, 400, {
            error: "Slug tidak valid atau memakai nama yang dicadangkan sistem.",
          });
        }
        if (!site.templateId || !site.title || !site.data) {
          return sendJson(res, 400, { error: "Data website belum lengkap." });
        }

        const targetPath = path.join(SITES_DIR, `${site.slug}.json`);
        await fs.writeFile(targetPath, JSON.stringify(site, null, 2) + "\n", "utf-8");

        if (previousSlug && previousSlug !== site.slug && isValidSlug(previousSlug)) {
          const oldJson = path.join(SITES_DIR, `${previousSlug}.json`);
          await fs.rm(oldJson, { force: true });

          const oldUploadDir = path.join(UPLOADS_DIR, previousSlug);
          const newUploadDir = path.join(UPLOADS_DIR, site.slug);
          try {
            await fs.access(oldUploadDir);
            await fs.rename(oldUploadDir, newUploadDir);
          } catch {
            // ignore if previous upload folder does not exist
          }
        }

        return sendJson(res, 200, { ok: true, site });
      }

      if (req.method === "DELETE" && pathname.startsWith("/__studio/sites/")) {
        await ensureDirs();
        const slug = decodeURIComponent(pathname.slice("/__studio/sites/".length));
        if (!isValidSlug(slug)) {
          return sendJson(res, 400, { error: "Slug tidak valid." });
        }

        await fs.rm(path.join(SITES_DIR, `${slug}.json`), { force: true });
        await fs.rm(path.join(UPLOADS_DIR, slug), { recursive: true, force: true });
        return sendJson(res, 200, { ok: true, deleted: slug });
      }

      if (req.method === "POST" && pathname === "/__studio/upload") {
        await ensureDirs();
        const body = await readJsonBody(req);
        const { slug, filename, dataBase64 } = body;

        if (!isValidSlug(slug)) {
          return sendJson(res, 400, { error: "Subdomain tujuan tidak valid." });
        }
        if (typeof filename !== "string" || typeof dataBase64 !== "string") {
          return sendJson(res, 400, { error: "File upload tidak lengkap." });
        }

        const ext = path.extname(filename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.has(ext)) {
          return sendJson(res, 400, {
            error: "Format file tidak didukung. Gunakan WebP, JPG, PNG, atau MP3.",
          });
        }

        const baseName = path
          .basename(filename, ext)
          .toLowerCase()
          .replace(/[^a-z0-9-_]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 40);
        const uniqueName = `${baseName || "asset"}-${Date.now().toString(36)}${ext}`;

        const cleanBase64 = dataBase64.includes(",")
          ? dataBase64.split(",").pop() || ""
          : dataBase64;
        const buffer = Buffer.from(cleanBase64, "base64");

        const slugDir = path.join(UPLOADS_DIR, slug);
        await fs.mkdir(slugDir, { recursive: true });
        await fs.writeFile(path.join(slugDir, uniqueName), buffer);

        return sendJson(res, 200, {
          ok: true,
          url: `/uploads/${slug}/${uniqueName}`,
          bytes: buffer.length,
        });
      }

      return sendJson(res, 404, { error: "Endpoint tidak ditemukan." });
    } catch (err) {
      return sendJson(res, 500, {
        error: err instanceof Error ? err.message : "Terjadi kesalahan server lokal.",
      });
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.STUDIO_PORT || 3099);
  const server = createStudioServer();
  server.listen(port, "127.0.0.1", () => {
    console.log(`[studio-api] listening on http://127.0.0.1:${port}`);
  });
}
