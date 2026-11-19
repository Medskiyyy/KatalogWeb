import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  BRAND,
  getDevSubdomainUrl,
  getPreviewPath,
  getSubdomainHost,
  getSubdomainUrl,
  type TemplateId,
} from "@/config/brand";
import {
  createDefaultSiteConfig,
  SiteConfigSchema,
  SlugSchema,
  slugifyInput,
} from "@/lib/schema";
import {
  buildWeddingGuestLink,
  buildWhatsAppUrl,
  formatRupiah,
  formatUmkmWhatsAppMessage,
} from "@/lib/utils";
import {
  buildSubdomainAssetUrl,
  extractClientSubdomain,
} from "../cloudflare/worker.mjs";

const ROOT_DIR = path.resolve(__dirname, "..");

describe("Demo JSON configs & Zod schema", () => {
  it("validates every JSON file in content/sites against SiteConfigSchema", async () => {
    const sitesDir = path.join(ROOT_DIR, "content", "sites");
    const entries = await fs.readdir(sitesDir, { withFileTypes: true });
    const jsonFiles = entries.filter(
      (entry) => entry.isFile() && entry.name.endsWith(".json")
    );

    expect(jsonFiles.length).toBeGreaterThanOrEqual(16);

    for (const file of jsonFiles) {
      const raw = await fs.readFile(path.join(sitesDir, file.name), "utf-8");
      const parsedJson = JSON.parse(raw);
      const parsed = SiteConfigSchema.parse(parsedJson);
      expect(`${parsed.slug}.json`).toBe(file.name);
    }
  });

  it("creates valid default configs for all 16 template IDs", () => {
    const templateIds: TemplateId[] = [
      "bucin-scrapbook",
      "bucin-chat",
      "bucin-playlist",
      "bucin-magazine",
      "ultah-interaktif",
      "ultah-balon",
      "ultah-retro",
      "ultah-editorial",
      "nikah-garden",
      "nikah-minang",
      "nikah-jawa",
      "nikah-sunda",
      "nikah-motion",
      "umkm-katalog",
      "umkm-kuliner",
      "umkm-fashion",
      "umkm-jasa",
    ];
    expect(BRAND.templates).toHaveLength(17);
    for (const templateId of templateIds) {
      const config = createDefaultSiteConfig(templateId, `demo-${templateId}`);
      expect(() => SiteConfigSchema.parse(config)).not.toThrow();
    }
  });

  it("validates DNS-safe subdomain slugs and blocks reserved names", () => {
    expect(SlugSchema.safeParse("arka-nisa").success).toBe(true);
    expect(SlugSchema.safeParse("hbd-rani-21").success).toBe(true);
    expect(SlugSchema.safeParse("toko99").success).toBe(true);

    for (const bad of [
      "www",
      "studio",
      "katalogweb",
      "admin",
      "ab",
      "ArkaNisa",
      "arka nisa",
      "-leading",
      "trailing-",
      "a--b.com",
    ]) {
      expect(SlugSchema.safeParse(bad).success).toBe(false);
    }

    expect(slugifyInput("  Arka & Nisa 2026! ")).toBe("arka-nisa-2026");
  });
});

describe("Subdomain helpers & Cloudflare Worker routing", () => {
  it("builds production, local dev, and fallback preview URLs cleanly", () => {
    expect(getSubdomainHost("arka-nisa")).toBe(`arka-nisa.${BRAND.domain}`);
    expect(getSubdomainUrl("arka-nisa")).toBe(`https://arka-nisa.${BRAND.domain}`);
    expect(getDevSubdomainUrl("arka-nisa", 3000)).toBe(
      "http://arka-nisa.localhost:3000"
    );
    expect(getPreviewPath("arka-nisa")).toBe("/s/arka-nisa");
  });

  it("extracts client subdomains and rewrites root paths while preserving query strings", () => {
    expect(extractClientSubdomain("katalogweb.my.id")).toBeNull();
    expect(extractClientSubdomain("www.katalogweb.my.id")).toBeNull();
    expect(extractClientSubdomain("arka-nisa.katalogweb.my.id")).toBe(
      "arka-nisa"
    );
    expect(extractClientSubdomain("deep.sub.katalogweb.my.id")).toBeNull();

    expect(
      buildSubdomainAssetUrl(
        "https://reza-nadia.katalogweb.my.id/?to=Ahmad+Hidayatullah"
      )
    ).toBe(
      "https://reza-nadia.katalogweb.my.id/s/reza-nadia/index.html?to=Ahmad+Hidayatullah"
    );

    expect(
      buildSubdomainAssetUrl("https://katalogweb.my.id/")
    ).toBeNull();

    expect(
      buildSubdomainAssetUrl(
        "https://arka-nisa.katalogweb.my.id/demo/bucin-1.webp"
      )
    ).toBeNull();
  });
});

describe("WhatsApp formatters & guest link builders", () => {
  it("formats Rupiah and UMKM WhatsApp cart receipts", () => {
    expect(formatRupiah(22000)).toBe("Rp22.000");

    const message = formatUmkmWhatsAppMessage({
      businessName: "Kopi Senja",
      items: [
        { name: "Es Kopi Susu Aren", price: 22000, qty: 2, unitLabel: "botol" },
        { name: "Butter Croissant", price: 24000, qty: 1, unitLabel: "pcs" },
      ],
      customerName: "Ahmad",
      fulfillment: "Kurir Instan",
      address: "Jl. Kalimalang No. 10, Bekasi",
      notes: "Es dipisah",
    });

    expect(message).toContain("Kopi Senja");
    expect(message).toContain("Es Kopi Susu Aren (2 botol) - Rp44.000");
    expect(message).toContain("Total Perkiraan: Rp68.000");
    expect(message).toContain("Alamat Antar: Jl. Kalimalang No. 10, Bekasi");

    const waUrl = buildWhatsAppUrl("081234567890", message);
    expect(waUrl.startsWith("https://wa.me/6281234567890?text=")).toBe(true);
  });

  it("builds wedding ?to= guest links cleanly", () => {
    expect(
      buildWeddingGuestLink(
        "https://reza-nadia.katalogweb.my.id",
        "Ahmad Hidayatullah"
      )
    ).toBe("https://reza-nadia.katalogweb.my.id/?to=Ahmad%20Hidayatullah");
  });
});
