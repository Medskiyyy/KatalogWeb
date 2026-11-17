"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CaretDown,
  Check,
  Copy,
  Globe,
  LinkSimple,
  List,
  QrCode,
  ShoppingBag,
  Sliders,
  WhatsappLogo,
  X,
} from "@phosphor-icons/react";
import { SubdomainLink } from "@/components/SubdomainLink";
import {
  BRAND,
  getSubdomainHost,
  getSubdomainUrl,
  type TemplateCatalogItem,
} from "@/config/brand";
import { toQrSvgDataUri } from "@/lib/qr";
import { buildWhatsAppUrl, cn, formatRupiah } from "@/lib/utils";

type CategoryFilter = "Semua" | TemplateCatalogItem["category"];

const CATEGORY_FILTERS: CategoryFilter[] = [
  "Semua",
  "Bucin",
  "Ulang Tahun",
  "Pernikahan",
  "UMKM",
];

const HERO_TAB_LABELS: Record<TemplateCatalogItem["id"], string> = {
  "bucin-scrapbook": "Bucin",
  "ultah-interaktif": "Ultah",
  "nikah-garden": "Nikah",
  "umkm-katalog": "UMKM",
};

const ORDER_STEPS = [
  {
    number: "01",
    title: "Pilih Tema & Nama Subdomain",
    description:
      "Tentukan desain dari katalog dan siapkan nama subdomain unikmu.",
  },
  {
    number: "02",
    title: "Checkout & Kirim Materi",
    description:
      "Selesaikan order di Shopee lalu kirim foto, teks, atau menu lewat chat/form.",
  },
  {
    number: "03",
    title: "Subdomain Aktif & Kartu Dikirim",
    description:
      "Website aktif di <nama>.katalogweb.my.id; varian kado fisik ikut dikirim lewat kurir dengan kartu QR.",
  },
];

const FAQS = [
  {
    id: "durasi",
    question: "Berapa lama proses pengerjaan sampai website aktif?",
    answer:
      "Setelah checkout di Shopee dan materi foto serta teks lengkap kami terima, website kado atau undangan selesai dalam 1x24 jam. Untuk paket Etalase UMKM, pengerjaan memakan waktu 1 sampai 2 hari kerja tergantung jumlah produk.",
  },
  {
    id: "subdomain",
    question: "Apakah saya perlu membeli domain atau sewa hosting lagi?",
    answer:
      "Tidak perlu. Semua paket sudah termasuk subdomain pilihanmu di katalogweb.my.id (misalnya arka-nisa.katalogweb.my.id) dan server aktif penuh selama 1 tahun tanpa biaya tambahan.",
  },
  {
    id: "kartu-qr",
    question: "Bagaimana sistem paket Bundling Kartu QR dan gratis ongkir Shopee?",
    answer:
      "Pada varian Bundling Kartu Fisik QR, kami mencetak kartu ucapan Polaroid atau minimalis ukuran A6 lengkap dengan kode QR menuju subdomain kado pilihanmu. Paket ini dikirim fisik lewat ekspedisi sehingga kamu bisa memanfaatkan voucher gratis ongkir Shopee.",
  },
  {
    id: "revisi",
    question: "Apakah bisa revisi teks atau ganti foto setelah website jadi?",
    answer:
      "Bisa. Setiap pesanan mendapatkan kuota revisi teks, penyesuaian foto, atau penggantian link musik latar maksimal 2 kali sebelum link resmi kamu sebarkan.",
  },
  {
    id: "umkm",
    question: "Bagaimana cara pesan paket custom untuk katalog UMKM?",
    answer:
      "Salin format chat pada kartu Etalase UMKM Order WA, isi daftar produk beserta harga dan nomor WhatsApp penerima order, lalu checkout paket Katalog Usaha UMKM di Shopee. Kamu juga bisa menyambungkan domain .my.id milik sendiri jika dibutuhkan.",
  },
];

export function StorefrontLanding() {
  const [activeHeroId, setActiveHeroId] = useState<TemplateCatalogItem["id"]>(
    BRAND.templates[0].id
  );
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("Semua");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQS[0].id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [qrDataUri, setQrDataUri] = useState<string>("");

  const activeTemplate =
    BRAND.templates.find((item) => item.id === activeHeroId) ??
    BRAND.templates[0];

  const filteredTemplates =
    selectedCategory === "Semua"
      ? BRAND.templates
      : BRAND.templates.filter((item) => item.category === selectedCategory);

  useEffect(() => {
    let active = true;
    toQrSvgDataUri(getSubdomainUrl("arka-nisa"))
      .then((uri) => {
        if (active) {
          setQrDataUri(uri);
        }
      })
      .catch(() => {
        if (active) {
          setQrDataUri("");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleCopyBuyerForm(item: TemplateCatalogItem) {
    try {
      await navigator.clipboard.writeText(item.buyerFormTemplate);
      setCopiedId(item.id);
      window.setTimeout(() => {
        setCopiedId((current) => (current === item.id ? null : current));
      }, 2200);
    } catch {
      setCopiedId(null);
    }
  }

  const whatsappConsultUrl = buildWhatsAppUrl(
    BRAND.whatsapp,
    `Halo ${BRAND.name}, saya ingin konsultasi sebelum order website subdomain di Shopee.`
  );

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA] text-[#121212]">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-[#FAFAFA]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 font-sans text-lg font-bold tracking-tight text-[#121212]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#1D4ED8] text-white">
              <Globe size={16} weight="bold" aria-hidden="true" />
            </span>
            <span>{BRAND.name}</span>
          </Link>

          <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-7 md:flex"
          >
            <a
              href="#template"
              className="whitespace-nowrap text-sm font-medium text-[#52525B] transition-colors hover:text-[#121212]"
            >
              Template
            </a>
            <a
              href="#cara-pesan"
              className="whitespace-nowrap text-sm font-medium text-[#52525B] transition-colors hover:text-[#121212]"
            >
              Cara Kerja
            </a>
            <a
              href="#harga"
              className="whitespace-nowrap text-sm font-medium text-[#52525B] transition-colors hover:text-[#121212]"
            >
              Harga
            </a>
            <a
              href="#faq"
              className="whitespace-nowrap text-sm font-medium text-[#52525B] transition-colors hover:text-[#121212]"
            >
              FAQ
            </a>
            <Link
              href="/studio"
              className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-[#52525B] transition-colors hover:text-[#121212]"
            >
              <Sliders size={15} aria-hidden="true" />
              <span>Studio</span>
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={BRAND.shopeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#1D4ED8] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1E40AF] sm:px-4 sm:text-sm"
            >
              <ShoppingBag size={16} weight="bold" aria-hidden="true" />
              <span>Order di Shopee</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-[#121212] transition-colors hover:bg-zinc-100 md:hidden"
            >
              {mobileMenuOpen ? (
                <X size={18} weight="bold" aria-hidden="true" />
              ) : (
                <List size={18} weight="bold" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-zinc-200 bg-white px-4 py-3 md:hidden">
            <nav
              aria-label="Navigasi seluler"
              className="flex flex-col gap-1"
            >
              <a
                href="#template"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#121212] hover:bg-zinc-100"
              >
                Template
              </a>
              <a
                href="#cara-pesan"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#121212] hover:bg-zinc-100"
              >
                Cara Kerja
              </a>
              <a
                href="#harga"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#121212] hover:bg-zinc-100"
              >
                Harga
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#121212] hover:bg-zinc-100"
              >
                FAQ
              </a>
              <Link
                href="/studio"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#121212] hover:bg-zinc-100"
              >
                <Sliders size={16} aria-hidden="true" />
                <span>Studio</span>
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* 1. Asymmetric Split Hero */}
        <section className="flex min-h-[100dvh] items-center border-b border-zinc-200 pt-20 pb-14">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8">
            <div className="flex flex-col items-start gap-6 lg:col-span-6">
              <h1 className="font-sans text-3xl font-bold leading-[1.15] tracking-tight text-[#121212] sm:text-4xl lg:text-[42px]">
                Website Kado, Undangan &amp; UMKM dengan Subdomain Sendiri
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-[#52525B] sm:text-lg">
                Pesan lewat Shopee, pilih nama subdomain impianmu, kirim foto
                dan teks. Halaman langsung aktif dan siap dibagikan.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#template"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1E40AF]"
                >
                  <span>Lihat Katalog Demo</span>
                  <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
                </a>
                <a
                  href={BRAND.shopeeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-[#121212] transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                >
                  <ShoppingBag size={17} weight="bold" aria-hidden="true" />
                  <span>Order di Shopee</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                <div
                  role="tablist"
                  aria-label="Pilih pratinjau template subdomain"
                  className="mb-4 grid grid-cols-4 gap-1.5 rounded-xl bg-zinc-100 p-1"
                >
                  {BRAND.templates.map((item) => {
                    const isActive = item.id === activeTemplate.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveHeroId(item.id)}
                        className={cn(
                          "rounded-lg px-2 py-2 text-xs font-semibold transition-colors sm:text-sm",
                          isActive
                            ? "bg-white text-[#1D4ED8] shadow-xs"
                            : "text-[#52525B] hover:text-[#121212]"
                        )}
                      >
                        {HERO_TAB_LABELS[item.id]}
                      </button>
                    );
                  })}
                </div>

                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-[#FAFAFA]">
                  <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-3.5 py-2.5">
                    <div className="flex items-center gap-1.5" aria-hidden="true">
                      <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                      <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                      <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                    </div>
                    <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md border border-zinc-200 bg-[#FAFAFA] px-3 py-1">
                      <LinkSimple
                        size={13}
                        className="shrink-0 text-[#1D4ED8]"
                        aria-hidden="true"
                      />
                      <span className="truncate font-mono text-xs text-[#121212] tabular-nums">
                        {getSubdomainHost(activeTemplate.demoSlug)}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-xs font-medium text-[#52525B] tabular-nums">
                      {formatRupiah(activeTemplate.price)}
                    </span>
                  </div>

                  <div className="aspect-video w-full overflow-hidden bg-zinc-100">
                    <img
                      src={activeTemplate.thumbnail}
                      alt={activeTemplate.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-[#121212]">
                      {activeTemplate.name}
                    </h2>
                    <p className="truncate text-sm text-[#52525B]">
                      {activeTemplate.tagline}
                    </p>
                  </div>
                  <SubdomainLink
                    slug={activeTemplate.demoSlug}
                    openInNewTab
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#1D4ED8] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1E40AF]"
                  >
                    <span>Buka Demo</span>
                    <ArrowUpRight size={15} weight="bold" aria-hidden="true" />
                  </SubdomainLink>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Filterable Template Catalog */}
        <section id="template" className="border-b border-zinc-200 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <h2 className="font-sans text-2xl font-bold tracking-tight text-[#121212] sm:text-3xl">
                  Katalog Template Siap Pakai
                </h2>
                <p className="mt-2 text-base text-[#52525B]">
                  Coba langsung demo subdomain masing-masing tema, salin format
                  chat order, lalu checkout lewat Shopee.
                </p>
              </div>

              <div
                role="group"
                aria-label="Filter kategori template"
                className="flex flex-wrap gap-2"
              >
                {CATEGORY_FILTERS.map((category) => {
                  const isActive = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={cn(
                        "rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "border-[#1D4ED8] bg-[#EFF6FF] text-[#1D4ED8]"
                          : "border-zinc-200 bg-white text-[#52525B] hover:border-zinc-300 hover:text-[#121212]"
                      )}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
              {filteredTemplates.map((item) => {
                const isCopied = copiedId === item.id;
                return (
                  <article
                    key={item.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                  >
                    <div className="aspect-video w-full overflow-hidden border-b border-zinc-200 bg-zinc-100">
                      <img
                        src={item.thumbnail}
                        alt={`Pratinjau ${item.name}`}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-[#1D4ED8]">
                            {item.category}
                          </span>
                          <span className="font-mono text-xs text-[#52525B] tabular-nums">
                            {getSubdomainHost(item.demoSlug)}
                          </span>
                        </div>
                        <span className="font-mono text-base font-bold text-[#121212] tabular-nums">
                          {formatRupiah(item.price)}
                        </span>
                      </div>

                      <h3 className="mt-4 font-sans text-xl font-bold text-[#121212]">
                        {item.name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#52525B]">
                        {item.tagline}
                      </p>

                      <ul className="mt-5 space-y-2.5 border-t border-zinc-200 pt-5">
                        {item.highlights.map((highlight) => (
                          <li
                            key={highlight}
                            className="flex items-start gap-2.5 text-sm text-[#121212]"
                          >
                            <Check
                              size={17}
                              weight="bold"
                              className="mt-0.5 shrink-0 text-[#1D4ED8]"
                              aria-hidden="true"
                            />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 flex flex-wrap items-center gap-2.5 pt-2">
                        <SubdomainLink
                          slug={item.demoSlug}
                          openInNewTab
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1E40AF]"
                        >
                          <span>Buka Demo</span>
                          <ArrowUpRight
                            size={15}
                            weight="bold"
                            aria-hidden="true"
                          />
                        </SubdomainLink>

                        <button
                          type="button"
                          onClick={() => handleCopyBuyerForm(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-[#121212] transition-colors hover:bg-zinc-50"
                        >
                          {isCopied ? (
                            <>
                              <Check
                                size={15}
                                weight="bold"
                                className="text-[#1D4ED8]"
                                aria-hidden="true"
                              />
                              <span className="text-[#1D4ED8]">
                                Format Tersalin
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy size={15} aria-hidden="true" />
                              <span>Salin Format Chat</span>
                            </>
                          )}
                        </button>

                        <a
                          href={BRAND.shopeeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-[#FAFAFA] px-3.5 py-2 text-sm font-semibold text-[#121212] transition-colors hover:border-zinc-300 hover:bg-zinc-100"
                        >
                          <ShoppingBag size={15} aria-hidden="true" />
                          <span>Order di Shopee</span>
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. Subdomain & Physical Kartu QR Showcase */}
        <section id="cara-pesan" className="border-b border-zinc-200 py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-5">
              <div className="mx-auto max-w-sm rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-100">
                  <img
                    src="/demo/bucin-1.webp"
                    alt="Foto kado Polaroid Arka dan Nisa"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 border-t border-zinc-100 pt-4">
                  <div className="min-w-0">
                    <p className="font-handwriting text-2xl font-bold text-[#121212]">
                      Arka &amp; Nisa - 12 Mei 2024
                    </p>
                    <p className="mt-1 truncate font-mono text-xs text-[#1D4ED8] tabular-nums">
                      {getSubdomainHost("arka-nisa")}
                    </p>
                    <p className="mt-1 text-xs text-[#52525B]">
                      Pindai kode QR untuk membuka kado
                    </p>
                  </div>

                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white p-1.5">
                    {qrDataUri ? (
                      <img
                        src={qrDataUri}
                        alt="Kode QR demo arka-nisa.katalogweb.my.id"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <QrCode
                        size={36}
                        className="text-zinc-400"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <h2 className="font-sans text-2xl font-bold tracking-tight text-[#121212] sm:text-3xl">
                Subdomain Instan Plus Kartu QR Fisik untuk Checkout Shopee
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#52525B]">
                Link kado bisa langsung dibuka sesaat setelah jadi, sementara
                kartu cetak Polaroid berkode QR dikirim lewat ekspedisi agar
                transaksi aman di sistem resi Shopee dan tetap hemat ongkir.
              </p>

              <ol className="mt-8 space-y-5">
                {ORDER_STEPS.map((step) => (
                  <li
                    key={step.number}
                    className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-4"
                  >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] font-mono text-xs font-bold text-[#1D4ED8] tabular-nums">
                      {step.number}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-[#121212]">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#52525B]">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* 4. Pricing Packages */}
        <section id="harga" className="border-b border-zinc-200 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="font-sans text-2xl font-bold tracking-tight text-[#121212] sm:text-3xl">
                Pilihan Paket Harga Transparan
              </h2>
              <p className="mt-2 text-base text-[#52525B]">
                Satu kali bayar untuk masa aktif subdomain 1 tahun penuh tanpa
                biaya hosting bulanan.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              {BRAND.packages.map((pkg) => {
                const isFeatured = pkg.badge === "Paling Laris";
                return (
                  <div
                    key={pkg.id}
                    className={cn(
                      "flex flex-col justify-between rounded-2xl border bg-white p-6 sm:p-7",
                      isFeatured
                        ? "border-[#1D4ED8] ring-1 ring-[#1D4ED8]/15"
                        : "border-zinc-200"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-sans text-xl font-bold text-[#121212]">
                          {pkg.name}
                        </h3>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            isFeatured
                              ? "bg-[#EFF6FF] text-[#1D4ED8]"
                              : "bg-zinc-100 text-[#52525B]"
                          )}
                        >
                          {pkg.badge}
                        </span>
                      </div>

                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="font-mono text-3xl font-bold tracking-tight text-[#121212] tabular-nums">
                          {formatRupiah(pkg.price)}
                        </span>
                        <span className="text-sm text-[#52525B]">/ tahun</span>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-[#52525B]">
                        {pkg.description}
                      </p>

                      <ul className="mt-6 space-y-3 border-t border-zinc-200 pt-5">
                        {pkg.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2.5 text-sm text-[#121212]"
                          >
                            <Check
                              size={17}
                              weight="bold"
                              className="mt-0.5 shrink-0 text-[#1D4ED8]"
                              aria-hidden="true"
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <a
                      href={BRAND.shopeeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors",
                        isFeatured
                          ? "bg-[#1D4ED8] hover:bg-[#1E40AF]"
                          : "bg-[#121212] hover:bg-zinc-800"
                      )}
                    >
                      <ShoppingBag
                        size={17}
                        weight="bold"
                        aria-hidden="true"
                      />
                      <span>Order di Shopee</span>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. FAQ Accordion */}
        <section id="faq" className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="font-sans text-2xl font-bold tracking-tight text-[#121212] sm:text-3xl">
                Pertanyaan yang Sering Ditanyakan
              </h2>
              <p className="mt-2 text-base text-[#52525B]">
                Informasi penting sebelum kamu memilih nama subdomain dan
                melakukan checkout.
              </p>
            </div>

            <div className="mt-8 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
              {FAQS.map((faq) => {
                const isOpen = openFaqId === faq.id;
                const panelId = `faq-panel-${faq.id}`;
                const buttonId = `faq-button-${faq.id}`;
                return (
                  <div key={faq.id} className="px-5 py-4 sm:px-6">
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() =>
                        setOpenFaqId((current) =>
                          current === faq.id ? null : faq.id
                        )
                      }
                      className="flex w-full items-center justify-between gap-4 py-1 text-left"
                    >
                      <span className="text-base font-semibold text-[#121212]">
                        {faq.question}
                      </span>
                      <CaretDown
                        size={18}
                        weight="bold"
                        className={cn(
                          "shrink-0 text-[#52525B] transition-transform duration-200",
                          isOpen && "rotate-180 text-[#1D4ED8]"
                        )}
                        aria-hidden="true"
                      />
                    </button>

                    {isOpen && (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        className="pt-2.5 pb-1 text-sm leading-relaxed text-[#52525B]"
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <footer className="border-t border-zinc-200 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="font-sans text-base font-bold text-[#121212]">
              {BRAND.name}
            </p>
            <p className="mt-0.5 font-mono text-xs text-[#52525B]">
              {BRAND.domain}
            </p>
          </div>

          <nav
            aria-label="Navigasi footer"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#52525B]"
          >
            <a href="#template" className="hover:text-[#121212]">
              Template
            </a>
            <a href="#cara-pesan" className="hover:text-[#121212]">
              Cara Kerja
            </a>
            <a href="#harga" className="hover:text-[#121212]">
              Harga
            </a>
            <Link href="/studio" className="hover:text-[#121212]">
              Studio Kelola
            </Link>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={whatsappConsultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-[#FAFAFA] px-3.5 py-2 text-sm font-medium text-[#121212] transition-colors hover:bg-zinc-100"
            >
              <WhatsappLogo size={16} weight="bold" aria-hidden="true" />
              <span>WhatsApp</span>
            </a>
            <a
              href={BRAND.shopeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1E40AF]"
            >
              <ShoppingBag size={16} weight="bold" aria-hidden="true" />
              <span>Order di Shopee</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
