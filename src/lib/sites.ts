import { promises as fs } from "node:fs";
import path from "node:path";
import { SiteConfigSchema, type SiteConfig } from "@/lib/schema";

const SITES_DIR = path.join(process.cwd(), "content", "sites");

export async function getAllSites(): Promise<SiteConfig[]> {
  try {
    const entries = await fs.readdir(SITES_DIR, { withFileTypes: true });
    const jsonFiles = entries.filter(
      (entry) => entry.isFile() && entry.name.endsWith(".json")
    );

    const parsed = await Promise.all(
      jsonFiles.map(async (file) => {
        const fullPath = path.join(SITES_DIR, file.name);
        const raw = await fs.readFile(fullPath, "utf-8");
        const data = JSON.parse(raw);
        return SiteConfigSchema.parse(data);
      })
    );

    return parsed.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

export async function getSiteBySlug(slug: string): Promise<SiteConfig | null> {
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, "");
  if (!safeSlug || safeSlug !== slug) return null;

  const fullPath = path.join(SITES_DIR, `${safeSlug}.json`);
  try {
    const raw = await fs.readFile(fullPath, "utf-8");
    const data = JSON.parse(raw);
    return SiteConfigSchema.parse(data);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw err;
  }
}
