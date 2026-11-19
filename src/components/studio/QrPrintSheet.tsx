"use client";

import { useEffect, useState } from "react";
import { Check, Printer, QrCode } from "@phosphor-icons/react";
import { BRAND, getSubdomainHost, getSubdomainUrl } from "@/config/brand";
import { toQrSvgDataUri } from "@/lib/qr";
import type { SiteConfig } from "@/lib/schema";
import { isExtendedNikahSite } from "@/templates/nikah/themes";

interface QrPrintSheetProps {
  sites: SiteConfig[];
  selectedSlugs: string[];
  onToggleSlug: (slug: string) => void;
}

type CardStyle = "polaroid" | "minimalis";

function getSiteThumbnail(site: SiteConfig): string {
  if (isExtendedNikahSite(site)) {
    return site.data.gallery[0] || site.data.bride.photoUrl;
  }

  switch (site.templateId) {
    case "bucin-scrapbook":
      return site.data.memories[0]?.imageUrl || "/demo/bucin-1.webp";
    case "bucin-chat":
      return site.data.memories[0]?.imageUrl || "/demo/bucin-chat-1.webp";
    case "bucin-playlist":
      return site.data.memories[0]?.imageUrl || "/demo/bucin-vinyl-1.webp";
    case "bucin-magazine":
      return site.data.memories[0]?.imageUrl || "/demo/bucin-mag-1.webp";
    case "ultah-interaktif":
      return site.data.memories[0]?.imageUrl || "/demo/ultah-1.webp";
    case "ultah-balon":
      return site.data.memories[0]?.imageUrl || "/demo/ultah-balon-hero.webp";
    case "ultah-retro":
      return site.data.memories[0]?.imageUrl || "/demo/ultah-retro-hero.webp";
    case "ultah-editorial":
      return site.data.memories[0]?.imageUrl || "/demo/ultah-editorial-hero.webp";
    case "nikah-garden":
    case "nikah-minang":
    case "nikah-jawa":
    case "nikah-sunda":
    case "nikah-motion":
      return site.data.gallery[0] || site.data.bride.photoUrl;
    case "umkm-katalog":
    case "umkm-kuliner":
    case "umkm-fashion":
    case "umkm-jasa":
      return site.data.heroImageUrl || "/demo/umkm-hero.webp";
  }
}

export function QrPrintSheet({
  sites,
  selectedSlugs,
  onToggleSlug,
}: QrPrintSheetProps) {
  const [cardStyle, setCardStyle] = useState<CardStyle>("polaroid");
  const [giftNote, setGiftNote] = useState(
    "Scan kode QR ini untuk membuka halaman spesial buatan khusus untukmu."
  );
  const [qrMap, setQrMap] = useState<Record<string, string>>({});

  const selectedSites = sites.filter((site) => selectedSlugs.includes(site.slug));

  useEffect(() => {
    const missing = selectedSites.filter((site) => !qrMap[site.slug]);
    if (missing.length === 0) return;

    let cancelled = false;

    async function generateMissingQrs() {
      const entries = await Promise.all(
        missing.map(async (site) => {
          const dataUri = await toQrSvgDataUri(getSubdomainUrl(site.slug));
          return [site.slug, dataUri] as const;
        })
      );

      if (cancelled) return;
      setQrMap((prev) => {
        const next = { ...prev };
        for (const [slug, uri] of entries) {
          next[slug] = uri;
        }
        return next;
      });
    }

    generateMissingQrs();

    return () => {
      cancelled = true;
    };
  }, [qrMap, selectedSites]);

  return (
    <div className="space-y-6">
      <div className="no-print space-y-4 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Cetak Kartu QR A4 (2 Kolom)
            </h2>
            <p className="text-xs text-zinc-600">
              Pilih subdomain yang ingin dicetak, atur gaya kartu, lalu simpan PDF atau cetak langsung ke kertas A4.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            disabled={selectedSites.length === 0}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Printer size={16} weight="bold" />
            <span>Cetak / Simpan PDF (A4)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-zinc-100 pt-4 lg:grid-cols-2">
          <div className="space-y-2">
            <span className="block text-xs font-medium text-zinc-700">
              Gaya Kartu Cetak
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCardStyle("polaroid")}
                className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                  cardStyle === "polaroid"
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                Polaroid Kado
              </button>
              <button
                type="button"
                onClick={() => setCardStyle("minimalis")}
                className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                  cardStyle === "minimalis"
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                Kartu Minimalis + Thank You Shopee
              </button>
            </div>
          </div>

          <label className="block space-y-2">
            <span className="block text-xs font-medium text-zinc-700">
              Catatan Kado / Pesan Kartu
            </span>
            <input
              type="text"
              value={giftNote}
              onChange={(e) => setGiftNote(e.target.value)}
              placeholder="Tulis catatan singkat di bawah QR..."
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
            />
          </label>
        </div>

        <div className="space-y-2 border-t border-zinc-100 pt-4">
          <span className="block text-xs font-medium text-zinc-700">
            Pilih Subdomain ({selectedSites.length} dipilih)
          </span>
          {sites.length === 0 ? (
            <p className="text-xs text-zinc-500">
              Belum ada data subdomain yang tersedia.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sites.map((site) => {
                const active = selectedSlugs.includes(site.slug);
                return (
                  <button
                    key={site.slug}
                    type="button"
                    onClick={() => onToggleSlug(site.slug)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-300 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    {active ? <Check size={12} weight="bold" /> : null}
                    <span>{site.slug}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedSites.length === 0 ? (
        <div className="no-print flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <QrCode size={32} className="text-zinc-400" />
          <p className="mt-3 text-sm font-semibold text-zinc-900">
            Belum ada subdomain yang dipilih
          </p>
          <p className="mt-1 max-w-md text-xs text-zinc-600">
            Klik salah satu chip subdomain di atas untuk menampilkan kartu QR siap cetak A4.
          </p>
        </div>
      ) : (
        <div className="print-sheet grid grid-cols-1 gap-6 sm:grid-cols-2 print:grid-cols-2">
          {selectedSites.map((site) => {
            const qrUri = qrMap[site.slug];
            const hostLabel = getSubdomainHost(site.slug);

            if (cardStyle === "polaroid") {
              const thumb = getSiteThumbnail(site);
              return (
                <article
                  key={site.slug}
                  className="print-card flex flex-col justify-between rounded-xl border border-dashed border-zinc-400 bg-white p-6"
                >
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                      <img
                        src={thumb}
                        alt={site.title}
                        className="h-44 w-full object-cover"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                          {BRAND.name} Polaroid
                        </p>
                        <h3 className="truncate text-base font-bold text-zinc-900">
                          {site.title}
                        </h3>
                        <p className="truncate font-mono text-[11px] text-zinc-700">
                          {hostLabel}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-lg border border-zinc-200 bg-white p-1.5">
                        {qrUri ? (
                          <img
                            src={qrUri}
                            alt={`QR ${hostLabel}`}
                            className="h-24 w-24"
                          />
                        ) : (
                          <div className="flex h-24 w-24 items-center justify-center bg-zinc-50 text-[10px] text-zinc-400">
                            Memuat QR
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 border-t border-zinc-200 pt-3 text-xs leading-relaxed text-zinc-700">
                    {giftNote.trim() ||
                      "Scan kode QR untuk membuka halaman spesialmu."}
                  </p>
                </article>
              );
            }

            return (
              <article
                key={site.slug}
                className="print-card flex flex-col items-center justify-between rounded-xl border border-dashed border-zinc-400 bg-white p-6 text-center"
              >
                <div className="w-full space-y-1 border-b border-zinc-200 pb-3">
                  <p className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">
                    {BRAND.name} Official
                  </p>
                  <h3 className="text-base font-bold text-zinc-900">
                    {site.title}
                  </h3>
                </div>

                <div className="my-5 flex flex-col items-center space-y-2.5">
                  <div className="rounded-xl border border-zinc-200 bg-white p-2.5">
                    {qrUri ? (
                      <img
                        src={qrUri}
                        alt={`QR ${hostLabel}`}
                        className="h-36 w-36"
                      />
                    ) : (
                      <div className="flex h-36 w-36 items-center justify-center bg-zinc-50 text-xs text-zinc-400">
                        Memuat QR
                      </div>
                    )}
                  </div>
                  <p className="font-mono text-xs font-semibold text-zinc-800">
                    {hostLabel}
                  </p>
                </div>

                <div className="w-full space-y-1 border-t border-zinc-200 pt-3">
                  <p className="text-xs font-semibold text-zinc-900">
                    Terima kasih sudah memesan di toko kami
                  </p>
                  <p className="text-[11px] leading-relaxed text-zinc-600">
                    Jika berkenan, bantu dukung kami dengan memberi ulasan bintang 5 di Shopee setelah paket diterima.
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
