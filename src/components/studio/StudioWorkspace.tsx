"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowSquareOut,
  Check,
  Copy,
  Desktop,
  DeviceMobile,
  DownloadSimple,
  FloppyDisk,
  HardDrives,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  QrCode,
  Trash,
  Warning,
} from "@phosphor-icons/react";
import { BRAND, getSubdomainHost, type TemplateId } from "@/config/brand";
import {
  SiteConfigSchema,
  SlugSchema,
  createDefaultSiteConfig,
  slugifyInput,
  type SiteConfig,
} from "@/lib/schema";
import { SubdomainLink } from "@/components/SubdomainLink";
import { TemplateRenderer } from "@/templates/TemplateRenderer";
import { TemplateDataEditor } from "@/components/studio/TemplateDataEditor";
import { AudioUploadField } from "@/components/studio/AudioUploadField";
import { QrPrintSheet } from "@/components/studio/QrPrintSheet";
import {
  EXTENDED_NIKAH_THEMES,
  type ExtendedNikahTemplateId,
} from "@/templates/nikah/themes";

interface StudioWorkspaceProps {
  initialSites: SiteConfig[];
}

type ActiveTab = "list" | "editor" | "qr";
type PreviewViewport = "mobile" | "desktop";

const MUSIC_PRESETS = [
  { value: "builtin:romance", label: "Piano Romantis (Bawaan)" },
  { value: "builtin:lofi", label: "Lofi Santai Arsip Chat (Bawaan)" },
  { value: "builtin:bossa", label: "Bossa Nova Kafe (Bawaan)" },
  { value: "builtin:indie", label: "Akustik Indie Hangat (Bawaan)" },
  { value: "builtin:birthday", label: "Pesta Ulang Tahun Ceria (Bawaan)" },
  { value: "builtin:wedding", label: "Canon Klasik Pernikahan (Bawaan)" },
  { value: "builtin:nikah-minang", label: "Musik Sambutan Adat Minang (Bawaan)" },
  { value: "builtin:nikah-jawa", label: "Ketawang Gamelan Jawa (Bawaan)" },
  { value: "builtin:nikah-sunda", label: "Kacapi Laras Degung Sunda (Bawaan)" },
  { value: "builtin:classic-valse", label: "Valse Chopin Pesta Istana (Bawaan)" },
  { value: "builtin:classic-waltz-gentle", label: "Waltz Chopin Lembut (Bawaan)" },
  { value: "builtin:nocturne-chopin-c", label: "Nocturne Chopin C Minor (Bawaan)" },
  { value: "builtin:nocturne-chopin-f", label: "Nocturne Chopin F Minor (Bawaan)" },
  { value: "builtin:nocturne-chopin-g", label: "Nocturne Chopin G Mayor (Bawaan)" },
  { value: "none", label: "Tanpa Musik" },
];

const TEMPLATE_META: Record<
  TemplateId,
  { label: string; badgeClass: string }
> = {
  "bucin-scrapbook": {
    label: "Bucin Scrapbook",
    badgeClass: "border-rose-200 bg-rose-50 text-rose-800",
  },
  "bucin-chat": {
    label: "Arsip Chat & Photobox",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  "bucin-playlist": {
    label: "Mixtape & Vinyl",
    badgeClass: "border-red-200 bg-red-50 text-red-800",
  },
  "bucin-magazine": {
    label: "Majalah Anniversary",
    badgeClass: "border-pink-200 bg-pink-50 text-pink-800",
  },
  "ultah-interaktif": {
    label: "Ultah Tiup Lilin",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-800",
  },
  "ultah-balon": {
    label: "Pesta Balon & Kapsul",
    badgeClass: "border-sky-200 bg-sky-50 text-sky-800",
  },
  "ultah-retro": {
    label: "Arcade Retro 90an",
    badgeClass: "border-lime-200 bg-lime-50 text-lime-800",
  },
  "ultah-editorial": {
    label: "Jurnal Ultah Elegan",
    badgeClass: "border-rose-200 bg-rose-50 text-rose-800",
  },
  "nikah-garden": {
    label: "Nikah Garden",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  "nikah-minang": {
    label: "Nikah Adat Padang",
    badgeClass: "border-red-200 bg-red-50 text-red-900",
  },
  "nikah-jawa": {
    label: "Nikah Adat Jawa",
    badgeClass: "border-amber-300 bg-amber-50 text-amber-900",
  },
  "nikah-sunda": {
    label: "Nikah Adat Sunda",
    badgeClass: "border-teal-200 bg-teal-50 text-teal-800",
  },
  "nikah-motion": {
    label: "Nikah Motion Bunga",
    badgeClass: "border-rose-300 bg-rose-50 text-rose-900",
  },
  ...(Object.fromEntries(
    EXTENDED_NIKAH_THEMES.map((item) => [
      item.id,
      { label: item.shortLabel, badgeClass: item.badgeClass },
    ])
  ) as Record<ExtendedNikahTemplateId, { label: string; badgeClass: string }>),
  "umkm-katalog": {
    label: "UMKM Kedai Kopi",
    badgeClass: "border-sky-200 bg-sky-50 text-sky-800",
  },
  "umkm-kuliner": {
    label: "UMKM Kuliner & Katering",
    badgeClass: "border-orange-200 bg-orange-50 text-orange-800",
  },
  "umkm-fashion": {
    label: "UMKM Butik Fashion",
    badgeClass: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800",
  },
  "umkm-jasa": {
    label: "UMKM Jasa & Booking",
    badgeClass: "border-cyan-200 bg-cyan-50 text-cyan-800",
  },
};

function createUniqueDuplicateSlug(baseSlug: string, sites: SiteConfig[]): string {
  const existing = new Set(sites.map((s) => s.slug));
  const root = baseSlug.slice(0, 32).replace(/-+$/, "");
  let candidate = `${root}-copy`;
  let counter = 2;
  while (existing.has(candidate)) {
    const suffix = `-${counter}`;
    candidate = `${root.slice(0, 40 - suffix.length)}${suffix}`;
    counter += 1;
  }
  return candidate;
}

export function StudioWorkspace({ initialSites }: StudioWorkspaceProps) {
  const [sites, setSites] = useState<SiteConfig[]>(initialSites);
  const [studioConnected, setStudioConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [templateFilter, setTemplateFilter] = useState<"all" | TemplateId>(
    "all"
  );
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(() =>
    initialSites.slice(0, 2).map((site) => site.slug)
  );
  const [draft, setDraft] = useState<SiteConfig | null>(
    initialSites[0] ?? null
  );
  const [editingOriginalSlug, setEditingOriginalSlug] = useState<string | null>(
    initialSites[0]?.slug ?? null
  );
  const [previewViewport, setPreviewViewport] =
    useState<PreviewViewport>("mobile");
  const [statusMessage, setStatusMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTemplateId, setNewTemplateId] =
    useState<TemplateId>("bucin-scrapbook");
  const [newSlugInput, setNewSlugInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function connectStudio() {
      try {
        const healthRes = await fetch("/__studio/health", {
          cache: "no-store",
        });
        if (!healthRes.ok) return;
        const healthData = (await healthRes.json()) as { ok?: boolean };
        if (!healthData.ok || cancelled) return;

        setStudioConnected(true);

        const sitesRes = await fetch("/__studio/sites", {
          cache: "no-store",
        });
        if (!sitesRes.ok || cancelled) return;
        const sitesData = (await sitesRes.json()) as { sites?: unknown[] };
        if (!Array.isArray(sitesData.sites) || cancelled) return;

        const validSites: SiteConfig[] = [];
        for (const raw of sitesData.sites) {
          const parsed = SiteConfigSchema.safeParse(raw);
          if (parsed.success) {
            validSites.push(parsed.data);
          }
        }
        if (!cancelled) {
          setSites(validSites);
        }
      } catch {
        // Static preview mode when local studio server is not running
      }
    }

    connectStudio();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSites = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return sites.filter((site) => {
      if (templateFilter !== "all" && site.templateId !== templateFilter) {
        return false;
      }
      if (!query) return true;
      return (
        site.slug.toLowerCase().includes(query) ||
        site.title.toLowerCase().includes(query) ||
        (site.orderNote || "").toLowerCase().includes(query)
      );
    });
  }, [searchQuery, sites, templateFilter]);

  const toggleSelectedSlug = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]
    );
  };

  const handleOpenEditor = (site: SiteConfig) => {
    setDraft(structuredClone(site));
    setEditingOriginalSlug(site.slug);
    setStatusMessage(null);
    setActiveTab("editor");
  };

  const handleDuplicateSite = (site: SiteConfig) => {
    const nextSlug = createUniqueDuplicateSlug(site.slug, sites);
    const cloned: SiteConfig = {
      ...structuredClone(site),
      slug: nextSlug,
      createdAt: new Date().toISOString().slice(0, 10),
      orderNote: site.orderNote ? `${site.orderNote} (Salinan)` : "Salinan baru",
    };
    setDraft(cloned);
    setEditingOriginalSlug(null);
    setStatusMessage({
      type: "ok",
      text: `Draft duplikat dibuat dengan subdomain "${nextSlug}". Klik Simpan Subdomain untuk menyimpan.`,
    });
    setActiveTab("editor");
  };

  const handleCreateNewDraft = () => {
    const cleaned = slugifyInput(newSlugInput) || "order-baru";
    const freshSite = createDefaultSiteConfig(newTemplateId, cleaned);
    setDraft(freshSite);
    setEditingOriginalSlug(null);
    setNewSlugInput("");
    setIsNewModalOpen(false);
    setStatusMessage({
      type: "ok",
      text: `Draft template ${TEMPLATE_META[newTemplateId].label} siap diedit.`,
    });
    setActiveTab("editor");
  };

  const handleDeleteSite = async (slug: string) => {
    if (!studioConnected) {
      setStatusMessage({
        type: "error",
        text: "Mode Preview Statis: jalankan npm.cmd run dev untuk menghapus subdomain.",
      });
      return;
    }

    try {
      const res = await fetch(`/__studio/sites/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      const payload = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !payload.ok) {
        throw new Error(payload.error || "Gagal menghapus subdomain.");
      }

      setSites((prev) => prev.filter((item) => item.slug !== slug));
      setSelectedSlugs((prev) => prev.filter((item) => item !== slug));
      if (editingOriginalSlug === slug) {
        setDraft(null);
        setEditingOriginalSlug(null);
      }
      setStatusMessage({
        type: "ok",
        text: `Subdomain ${slug}.${BRAND.domain} berhasil dihapus.`,
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menghapus subdomain.",
      });
    }
  };

  const handleSaveDraft = async () => {
    if (!draft) return;

    const validated = SiteConfigSchema.safeParse(draft);
    if (!validated.success) {
      const firstIssue = validated.error.issues[0];
      const pathText = firstIssue?.path.length
        ? `${firstIssue.path.join(".")}: `
        : "";
      setStatusMessage({
        type: "error",
        text: `Data belum valid (${pathText}${firstIssue?.message || "Periksa semua kolom wajib"}).`,
      });
      return;
    }

    if (!studioConnected) {
      setStatusMessage({
        type: "error",
        text: "Mode Preview Statis: jalankan npm.cmd run dev untuk menyimpan file, atau gunakan Export JSON.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/__studio/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site: validated.data,
          previousSlug: editingOriginalSlug,
        }),
      });
      const payload = (await res.json()) as {
        ok?: boolean;
        site?: SiteConfig;
        error?: string;
      };
      if (!res.ok || !payload.ok) {
        throw new Error(payload.error || "Gagal menyimpan subdomain.");
      }

      const savedSite = validated.data;
      setSites((prev) => {
        const withoutOld = prev.filter(
          (item) =>
            item.slug !== savedSite.slug && item.slug !== editingOriginalSlug
        );
        return [savedSite, ...withoutOld].sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt)
        );
      });

      if (editingOriginalSlug && editingOriginalSlug !== savedSite.slug) {
        setSelectedSlugs((prev) =>
          prev.map((item) =>
            item === editingOriginalSlug ? savedSite.slug : item
          )
        );
      }

      setDraft(savedSite);
      setEditingOriginalSlug(savedSite.slug);
      setStatusMessage({
        type: "ok",
        text: `Tersimpan ke content/sites/${savedSite.slug}.json`,
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menyimpan data.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyBuyerForm = async () => {
    if (!draft) return;
    const item = BRAND.templates.find((tpl) => tpl.id === draft.templateId);
    if (!item) return;

    try {
      await navigator.clipboard.writeText(item.buyerFormTemplate);
      setStatusMessage({
        type: "ok",
        text: `Format form pembeli untuk ${item.name} disalin ke clipboard.`,
      });
    } catch {
      setStatusMessage({
        type: "error",
        text: "Gagal menyalin ke clipboard. Periksa izin browser.",
      });
    }
  };

  const handleExportJson = () => {
    if (!draft) return;
    const jsonString = JSON.stringify(draft, null, 2) + "\n";
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${draft.slug || "site"}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatusMessage({
      type: "ok",
      text: `File ${draft.slug || "site"}.json diunduh.`,
    });
  };

  const draftSlugValidation = draft ? SlugSchema.safeParse(draft.slug) : null;
  const newSlugCleaned = slugifyInput(newSlugInput);
  const newSlugValidation = newSlugInput.trim()
    ? SlugSchema.safeParse(newSlugCleaned)
    : null;

  const isCustomMusic =
    draft !== null &&
    !MUSIC_PRESETS.some((preset) => preset.value === draft.musicTrack);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="no-print sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
            >
              <ArrowLeft size={14} weight="bold" />
              <span>Kembali ke Katalog</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-bold tracking-tight text-zinc-900">
                KatalogWeb Studio
              </h1>
              {studioConnected ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                  <HardDrives size={13} weight="bold" />
                  <span>Studio Lokal Aktif</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                  <Warning size={13} weight="bold" />
                  <span>Mode Preview Statis</span>
                </span>
              )}
            </div>
          </div>

          <nav className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-100 p-1">
            {(
              [
                ["list", "Daftar Subdomain"],
                ["editor", "Editor & Preview"],
                ["qr", "Cetak Kartu QR"],
              ] as const
            ).map(([tabKey, tabLabel]) => (
              <button
                key={tabKey}
                type="button"
                onClick={() => setActiveTab(tabKey)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === tabKey
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {tabLabel}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {statusMessage ? (
          <div
            className={`no-print mb-5 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs font-medium ${
              statusMessage.type === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-rose-200 bg-rose-50 text-rose-900"
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === "ok" ? (
                <Check size={16} weight="bold" className="shrink-0" />
              ) : (
                <Warning size={16} weight="bold" className="shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-xs font-semibold underline-offset-2 hover:underline"
            >
              Tutup
            </button>
          </div>
        ) : null}

        {activeTab === "list" ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="flex flex-1 flex-wrap items-center gap-2.5">
                <div className="relative min-w-[220px] flex-1">
                  <MagnifyingGlass
                    size={16}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari subdomain, judul, atau catatan order..."
                    className="h-10 w-full rounded-lg border border-zinc-300 bg-white pr-3 pl-9 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                <select
                  value={templateFilter}
                  onChange={(e) =>
                    setTemplateFilter(e.target.value as "all" | TemplateId)
                  }
                  className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
                >
                  <option value="all">Semua Template</option>
                  {BRAND.templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("qr")}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3.5 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-50"
                >
                  <QrCode size={16} weight="bold" />
                  <span>Cetak QR ({selectedSlugs.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsNewModalOpen((prev) => !prev)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white transition-colors hover:bg-zinc-800"
                >
                  <Plus size={16} weight="bold" />
                  <span>Buat Subdomain Baru</span>
                </button>
              </div>
            </div>

            {isNewModalOpen ? (
              <section className="space-y-4 rounded-2xl border border-zinc-300 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900">
                      Buat Subdomain Baru
                    </h2>
                    <p className="text-xs text-zinc-600">
                      Pilih template lalu ketik nama subdomain yang diminta pembeli.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(false)}
                    className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                  >
                    Batal
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="block text-xs font-medium text-zinc-700">
                      Pilih Template
                    </span>
                    <select
                      value={newTemplateId}
                      onChange={(e) =>
                        setNewTemplateId(e.target.value as TemplateId)
                      }
                      className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
                    >
                      {BRAND.templates.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name} ({tpl.priceLabel})
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-700">
                      Nama Subdomain
                    </label>
                    <div className="flex items-center overflow-hidden rounded-lg border border-zinc-300 bg-white focus-within:border-zinc-900">
                      <input
                        type="text"
                        value={newSlugInput}
                        onChange={(e) => setNewSlugInput(e.target.value)}
                        placeholder="contoh: dimas-alya"
                        className="h-10 min-w-0 flex-1 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                      />
                      <span className="border-l border-zinc-200 bg-zinc-50 px-3 py-2.5 font-mono text-xs text-zinc-600">
                        .{BRAND.domain}
                      </span>
                    </div>
                    {newSlugValidation && !newSlugValidation.success ? (
                      <p className="text-xs text-rose-600">
                        {newSlugValidation.error.issues[0]?.message}
                      </p>
                    ) : newSlugCleaned ? (
                      <p className="font-mono text-xs text-emerald-700">
                        Pratinjau: {getSubdomainHost(newSlugCleaned)}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCreateNewDraft}
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white transition-colors hover:bg-zinc-800"
                  >
                    <Plus size={15} weight="bold" />
                    <span>Buat &amp; Buka Editor</span>
                  </button>
                </div>
              </section>
            ) : null}

            {filteredSites.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
                <p className="text-sm font-semibold text-zinc-900">
                  Tidak ada subdomain yang cocok
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  Coba ubah kata kunci pencarian atau buat subdomain baru.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-600">
                        <th className="w-12 px-4 py-3 text-center">QR</th>
                        <th className="px-4 py-3">Subdomain &amp; Judul</th>
                        <th className="px-4 py-3">Template</th>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Catatan Order</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredSites.map((site) => {
                        const meta = TEMPLATE_META[site.templateId];
                        const isChecked = selectedSlugs.includes(site.slug);
                        return (
                          <tr
                            key={site.slug}
                            className="transition-colors hover:bg-zinc-50/70"
                          >
                            <td className="px-4 py-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectedSlug(site.slug)}
                                aria-label={`Pilih ${site.slug} untuk cetak QR`}
                                className="h-4 w-4 rounded border-zinc-300 text-zinc-900"
                              />
                            </td>
                            <td className="px-4 py-3.5">
                              <p className="font-mono text-xs font-semibold text-zinc-900">
                                {getSubdomainHost(site.slug)}
                              </p>
                              <p className="mt-0.5 text-xs text-zinc-600">
                                {site.title}
                              </p>
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.badgeClass}`}
                              >
                                {meta.label}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-zinc-600 tabular-nums">
                              {site.createdAt}
                            </td>
                            <td className="px-4 py-3.5 text-xs text-zinc-600">
                              {site.orderNote || "-"}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditor(site)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-100"
                                >
                                  <PencilSimple size={14} weight="bold" />
                                  <span>Edit</span>
                                </button>

                                <SubdomainLink
                                  slug={site.slug}
                                  openInNewTab
                                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-100"
                                >
                                  <ArrowSquareOut size={14} weight="bold" />
                                  <span>Buka</span>
                                </SubdomainLink>

                                <button
                                  type="button"
                                  onClick={() => handleDuplicateSite(site)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-100"
                                >
                                  <Copy size={14} weight="bold" />
                                  <span>Duplikat</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteSite(site.slug)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100"
                                >
                                  <Trash size={14} weight="bold" />
                                  <span>Hapus</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {activeTab === "editor" ? (
          draft ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      TEMPLATE_META[draft.templateId].badgeClass
                    }`}
                  >
                    {TEMPLATE_META[draft.templateId].label}
                  </span>
                  <span className="font-mono text-xs text-zinc-600">
                    {editingOriginalSlug
                      ? `Mengedit: ${editingOriginalSlug}`
                      : "Subdomain baru (belum disimpan)"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyBuyerForm}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-50"
                  >
                    <Copy size={14} weight="bold" />
                    <span>Salin Format Form Pembeli</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-50"
                  >
                    <DownloadSimple size={14} weight="bold" />
                    <span>Export JSON</span>
                  </button>

                  <SubdomainLink
                    slug={draft.slug}
                    openInNewTab
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-50"
                  >
                    <ArrowSquareOut size={14} weight="bold" />
                    <span>Buka Live</span>
                  </SubdomainLink>

                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FloppyDisk size={15} weight="bold" />
                    <span>
                      {isSaving ? "Menyimpan..." : "Simpan Subdomain"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-5">
                  <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
                    <div className="border-b border-zinc-100 pb-2.5">
                      <h3 className="text-sm font-semibold text-zinc-900">
                        Pengaturan Subdomain &amp; Metadata
                      </h3>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-zinc-700">
                        Alamat Subdomain
                      </label>
                      <div className="flex items-center overflow-hidden rounded-lg border border-zinc-300 bg-white focus-within:border-zinc-900">
                        <input
                          type="text"
                          value={draft.slug}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              slug: e.target.value.toLowerCase().trim(),
                            })
                          }
                          className="h-10 min-w-0 flex-1 px-3 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                        />
                        <span className="border-l border-zinc-200 bg-zinc-50 px-3 py-2.5 font-mono text-xs text-zinc-600">
                          .{BRAND.domain}
                        </span>
                      </div>

                      {draftSlugValidation ? (
                        draftSlugValidation.success ? (
                          <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                            <Check size={13} weight="bold" />
                            <span>Subdomain valid</span>
                          </p>
                        ) : (
                          <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
                            <Warning size={13} weight="bold" />
                            <span>
                              {draftSlugValidation.error.issues[0]?.message}
                            </span>
                          </p>
                        )
                      ) : null}
                    </div>

                    <label className="block space-y-1.5">
                      <span className="block text-xs font-medium text-zinc-700">
                        Judul Website
                      </span>
                      <input
                        type="text"
                        value={draft.title}
                        onChange={(e) =>
                          setDraft({ ...draft, title: e.target.value })
                        }
                        className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
                      />
                    </label>

                    <label className="block space-y-1.5">
                      <span className="block text-xs font-medium text-zinc-700">
                        Deskripsi Singkat (SEO / Share Link)
                      </span>
                      <textarea
                        rows={2}
                        value={draft.seoDescription}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            seoDescription: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
                      />
                    </label>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="block space-y-1.5">
                        <span className="block text-xs font-medium text-zinc-700">
                          Tanggal Order
                        </span>
                        <input
                          type="date"
                          value={draft.createdAt}
                          onChange={(e) =>
                            setDraft({ ...draft, createdAt: e.target.value })
                          }
                          className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
                        />
                      </label>

                      <label className="block space-y-1.5">
                        <span className="block text-xs font-medium text-zinc-700">
                          Catatan Order (Internal)
                        </span>
                        <input
                          type="text"
                          value={draft.orderNote || ""}
                          onChange={(e) =>
                            setDraft({ ...draft, orderNote: e.target.value })
                          }
                          placeholder="Mis. Order Shopee #1024"
                          className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
                        />
                      </label>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-zinc-700">
                        Musik Latar
                      </label>
                      <select
                        value={isCustomMusic ? "custom" : draft.musicTrack}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "custom") {
                            setDraft({
                              ...draft,
                              musicTrack: isCustomMusic
                                ? draft.musicTrack
                                : "/uploads/musik.mp3",
                            });
                          } else {
                            setDraft({ ...draft, musicTrack: val });
                          }
                        }}
                        className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
                      >
                        {MUSIC_PRESETS.map((preset) => (
                          <option key={preset.value} value={preset.value}>
                            {preset.label}
                          </option>
                        ))}
                        <option value="custom">Custom MP3 URL / Path</option>
                      </select>

                      {isCustomMusic ? (
                        <div className="mt-2">
                          <AudioUploadField
                            label="Upload atau URL MP3 Custom"
                            value={draft.musicTrack}
                            slug={draft.slug}
                            studioConnected={studioConnected}
                            placeholder="/uploads/slug/lagu.mp3 atau https://..."
                            onChange={(nextUrl) =>
                              setDraft({ ...draft, musicTrack: nextUrl })
                            }
                          />
                        </div>
                      ) : null}
                    </div>
                  </section>

                  <TemplateDataEditor
                    site={draft}
                    studioConnected={studioConnected}
                    onChange={setDraft}
                  />
                </div>

                <div className="lg:col-span-7">
                  <div className="sticky top-20 space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                      <div>
                        <p className="text-xs font-semibold text-zinc-900">
                          Live Preview
                        </p>
                        <p className="font-mono text-[11px] text-zinc-500">
                          https://{getSubdomainHost(draft.slug || "preview")}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-1">
                        <button
                          type="button"
                          onClick={() => setPreviewViewport("mobile")}
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                            previewViewport === "mobile"
                              ? "bg-white text-zinc-900 shadow-xs"
                              : "text-zinc-600 hover:text-zinc-900"
                          }`}
                        >
                          <DeviceMobile size={14} weight="bold" />
                          <span>Mobile (390px)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewViewport("desktop")}
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                            previewViewport === "desktop"
                              ? "bg-white text-zinc-900 shadow-xs"
                              : "text-zinc-600 hover:text-zinc-900"
                          }`}
                        >
                          <Desktop size={14} weight="bold" />
                          <span>Desktop</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-center overflow-x-auto rounded-xl bg-zinc-100 p-3">
                      <div
                        className={`w-full overflow-y-auto rounded-2xl border border-zinc-300 bg-white shadow-sm transition-all ${
                          previewViewport === "mobile"
                            ? "max-w-[390px]"
                            : "max-w-full"
                        }`}
                        style={{ maxHeight: "76vh" }}
                      >
                        <TemplateRenderer
                          key={`${draft.templateId}-${draft.slug}`}
                          site={draft}
                          embedded
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
              <p className="text-sm font-semibold text-zinc-900">
                Belum ada subdomain yang dibuka di editor
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                Pilih salah satu subdomain dari Daftar Subdomain atau buat subdomain baru.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white hover:bg-zinc-800"
              >
                <span>Lihat Daftar Subdomain</span>
              </button>
            </div>
          )
        ) : null}

        {activeTab === "qr" ? (
          <QrPrintSheet
            sites={sites}
            selectedSlugs={selectedSlugs}
            onToggleSlug={toggleSelectedSlug}
          />
        ) : null}
      </main>
    </div>
  );
}
