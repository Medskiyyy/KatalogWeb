import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BRAND } from "@/config/brand";

const ROOT_DIR = path.resolve(__dirname, "..");

async function walkFiles(dir: string, extensions: Set<string>): Promise<string[]> {
  const results: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkFiles(fullPath, extensions)));
    } else if (entry.isFile() && extensions.has(path.extname(entry.name))) {
      results.push(fullPath);
    }
  }
  return results;
}

function collectDemoPaths(value: unknown, out: Set<string>): void {
  if (typeof value === "string") {
    if (value.startsWith("/demo/")) {
      out.add(value);
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectDemoPaths(item, out);
    }
    return;
  }
  if (value && typeof value === "object") {
    for (const entry of Object.values(value)) {
      collectDemoPaths(entry, out);
    }
  }
}

describe("Anti-slop & asset integrity checks", () => {
  it("enforces zero em/en dashes, zero animate-ping, zero lucide-react, and zero Gemini Sparkle icons/glyphs across src and content", async () => {
    const srcFiles = await walkFiles(
      path.join(ROOT_DIR, "src"),
      new Set([".ts", ".tsx", ".css"])
    );
    const contentFiles = await walkFiles(
      path.join(ROOT_DIR, "content"),
      new Set([".json"])
    );

    const allFiles = [...srcFiles, ...contentFiles];
    expect(allFiles.length).toBeGreaterThan(0);

    for (const filePath of allFiles) {
      const content = await fs.readFile(filePath, "utf-8");
      const rel = path.relative(ROOT_DIR, filePath);

      expect(content, `${rel} contains em-dash`).not.toContain("\u2014");
      expect(content, `${rel} contains en-dash`).not.toContain("\u2013");
      expect(content, `${rel} uses animate-ping`).not.toContain("animate-ping");
      expect(content, `${rel} imports lucide-react`).not.toContain(
        "lucide-react"
      );
      expect(content, `${rel} uses Sparkle icon`).not.toMatch(/\bSparkles?\b/);
      expect(content, `${rel} uses 4-point star glyph`).not.toMatch(
        /[\u2726\u2727\u2728]/
      );
    }
  });

  it("keeps StorefrontLanding free of technical subdomain jargon and generic SaaS blue", async () => {
    const landingPath = path.join(
      ROOT_DIR,
      "src",
      "components",
      "storefront",
      "StorefrontLanding.tsx"
    );
    const content = await fs.readFile(landingPath, "utf-8");

    expect(content, "StorefrontLanding mentions subdomain word").not.toMatch(
      /\bsubdomain\b/i
    );
    expect(content, "StorefrontLanding uses generic SaaS blue").not.toMatch(
      /#1d4ed8|#eff6ff|\bblue-/i
    );
  });

  it("ensures all referenced /demo/ images exist on disk under public/", async () => {
    const referenced = new Set<string>();
    collectDemoPaths(BRAND, referenced);

    const sitesDir = path.join(ROOT_DIR, "content", "sites");
    const entries = await fs.readdir(sitesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".json")) {
        const raw = await fs.readFile(path.join(sitesDir, entry.name), "utf-8");
        collectDemoPaths(JSON.parse(raw), referenced);
      }
    }

    expect(referenced.size).toBeGreaterThanOrEqual(25);

    for (const assetUrl of referenced) {
      const diskPath = path.join(ROOT_DIR, "public", assetUrl.replace(/^\//, ""));
      await expect(
        fs.access(diskPath),
        `Missing asset ${assetUrl}`
      ).resolves.toBeUndefined();
    }
  });
});
