"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  CaretDown,
  Check,
  Copy,
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

const CATEGORY_FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "Semua", label: "Semua Desain" },
  { value: "Bucin", label: "Kado Pasangan" },
  { value: "Ulang Tahun", label: "Ulang Tahun" },
  { value: "Pernikahan", label: "Pernikahan" },
  { value: "UMKM", label: "Website UMKM" },
];

const HERO_TAB_LABELS: Record<TemplateCatalogItem["id"], string> = {
  "bucin-scrapbook": "Kado Pasangan",
  "ultah-interaktif": "Kejutan Ultah",
  "nikah-garden": "Undangan Nikah",
  "umkm-katalog": "Website UMKM",
};

const STAGE_TINTS: Record<TemplateCatalogItem["id"], string> = {
  "bucin-scrapbook": "#F7EEEE",
  "ultah-interaktif": "#FAF4DC",
  "nikah-garden": "#ECF3EE",
  "umkm-katalog": "#F4EFE9",
};

const ORDER_STEPS = [
  {
    title: "Pilih Desain & Checkout di Shopee",
    description:
      "Tentukan tema yang paling cocok dari katalog di atas, lalu checkout paket pilihanmu.",
  },
  {
    title: "Kirim Foto & Tulisan lewat Chat",
    description:
      "Salin format isi data lalu kirim foto dan catatan yang ingin ditampilkan tanpa perlu paham coding.",
  },
  {
    title: "Website Langsung Jadi + Kartu Dikirim",
    description:
      "Link website nama pilihanmu langsung aktif dan siap sebar. Khusus paket kado fisik, kartu cetak QR dikirim lewat kurir.",
  },
];

const FAQS = [
  {
    id: "durasi",
    question: "Berapa lama proses pengerjaan sampai website jadi?",
    answer:
      "Setelah checkout Shopee dan semua foto beserta tulisan kami terima, website kado atau undangan selesai dalam 1x24 jam. Untuk website katalog UMKM, pengerjaan memakan waktu 1 sampai 2 hari kerja tergantung jumlah produk.",
  },
  {
    id: "link",
    question: "Apakah saya perlu beli domain atau bayar server lagi tiap bulan?",
    answer:
      "Tidak perlu. Paket kado dan undangan sudah termasuk link website dengan nama pilihanmu sendiri (contoh: arka-nisa.katalogweb.my.id) yang aktif penuh selama 1 tahun tanpa biaya bulanan. Khusus Paket Website UMKM, kami juga bantu sambungkan ke domain nama usahamu sendiri (.my.id atau .com).",
  },
  {
    id: "kartu-qr",
    question: "Bagaimana sistem Paket Kado + Kartu Cetak QR di Shopee?",
    answer:
      "Kamu tetap terima link website lebih dulu lewat chat agar langsung bisa dicek, lalu kami kirim kartu cetak foto Polaroid ukuran A6 berkode QR lewat kurir. Karena ada pengiriman fisik resmi, kamu bisa checkout menggunakan voucher gratis ongkir Shopee.",
  },
  {
    id: "revisi",
    question: "Apakah bisa minta perbaikan tulisan atau ganti foto setelah jadi?",
    answer:
      "Bisa. Setiap pesanan mendapat gratis revisi tulisan, urutan foto, atau penggantian musik latar maksimal 2 kali sebelum link resmi dibagikan ke penerima.",
  },
  {
    id: "umkm",
    question: "Untuk website UMKM, apakah pesanan pembeli langsung masuk ke WhatsApp saya?",
    answer:
      "Ya. Pembeli cukup pilih menu atau produk, masukkan nama dan catatan, lalu keranjang otomatis menyusun rincian pesanan beserta total Rupiah langsung ke nomor WhatsApp usahamu tanpa potongan komisi.",
  },
];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function StorefrontLanding() {
  const prefersReducedMotion = useReducedMotion();
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
        if (active) setQrDataUri(uri);
      })
      .catch(() => {
        if (active) setQrDataUri("");
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
    `Halo ${BRAND.name}, saya mau tanya-tanya sebelum pesan website di Shopee.`
  );

  return (
    <div className="min-h-[100dvh] bg-white text-[#121212] selection:bg-emerald-500/15 selection:text-[#121212]">
      {/* Sticky Single-Line Header */}
      <header className="sticky top-0 z-40 border-b border-[#E5E5E1] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="shrink-0 font-archivo text-lg font-bold tracking-tight text-[#121212]"
          >
            {BRAND.name}
          </Link>

          <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-7 md:flex"
          >
            <a
              href="#template"
              className="whitespace-nowrap text-sm font-medium text-[#575753] transition-colors hover:text-[#121212]"
            >
              Koleksi Desain
            </a>
            <a
              href="#cara-pesan"
              className="whitespace-nowrap text-sm font-medium text-[#575753] transition-colors hover:text-[#121212]"
            >
              Kartu Kado QR
            </a>
            <a
              href="#harga"
              className="whitespace-nowrap text-sm font-medium text-[#575753] transition-colors hover:text-[#121212]"
            >
              Daftar Harga
            </a>
            <a
              href="#faq"
              className="whitespace-nowrap text-sm font-medium text-[#575753] transition-colors hover:text-[#121212]"
            >
              Tanya Jawab
            </a>
            <Link
              href="/studio"
              className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-[#575753] transition-colors hover:text-[#121212]"
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
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-[#121212] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 sm:px-4 sm:text-sm"
            >
              <ShoppingBag size={15} weight="bold" aria-hidden="true" />
              <span>Pesan di Shopee</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#E5E5E1] bg-white text-[#121212] transition-colors hover:bg-[#F6F6F4] md:hidden"
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
          <div className="border-t border-[#E5E5E1] bg-white px-4 py-3 md:hidden">
            <nav aria-label="Navigasi seluler" className="flex flex-col gap-1">
              <a
                href="#template"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-[#121212] hover:bg-[#F6F6F4]"
              >
                Koleksi Desain
              </a>
              <a
                href="#cara-pesan"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-[#121212] hover:bg-[#F6F6F4]"
              >
                Kartu Kado QR
              </a>
              <a
                href="#harga"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-[#121212] hover:bg-[#F6F6F4]"
              >
                Daftar Harga
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-[#121212] hover:bg-[#F6F6F4]"
              >
                Tanya Jawab
              </a>
              <Link
                href="/studio"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#121212] hover:bg-[#F6F6F4]"
              >
                <Sliders size={15} aria-hidden="true" />
                <span>Studio</span>
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* 1. Editorial Split Hero + Tinted Browser Stage */}
        <section className="flex min-h-[100dvh] items-center border-b border-[#E5E5E1] bg-white pt-16 pb-14 lg:pt-20">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="lg:col-span-5"
            >
              <p className="text-sm font-medium text-[#575753]">
                Jasa pembuatan website terima beres via Shopee
              </p>

              <h1 className="mt-4 font-archivo text-4xl font-bold leading-[1.06] tracking-[-0.03em] text-[#121212] sm:text-5xl">
                Bikin Web Kado, Undangan &amp; Jualan Tanpa Ribet.
              </h1>

              <p className="mt-5 max-w-md text-base leading-relaxed text-[#575753] sm:text-lg">
                Cukup pilih desain, kirim foto dan ucapan lewat chat, lalu
                bagikan link nama pilihanmu ke pasangan, tamu, atau pelanggan.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#template"
                  className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-md bg-[#121212] px-5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 active:scale-[0.99]"
                >
                  <span>Lihat Koleksi Desain</span>
                  <ArrowRight size={16} weight="bold" aria-hidden="true" />
                </a>
                <a
                  href={BRAND.shopeeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-md border border-[#E5E5E1] bg-white px-5 text-sm font-semibold text-[#121212] transition-colors hover:bg-[#F6F6F4] active:scale-[0.99]"
                >
                  <ShoppingBag size={16} weight="bold" aria-hidden="true" />
                  <span>Pesan di Shopee</span>
                </a>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-[#E5E5E1] pt-5 text-sm">
                <div>
                  <p className="font-mono text-xs font-semibold text-[#121212] tabular-nums">
                    1-24 Jam
                  </p>
                  <p className="mt-0.5 text-xs text-[#575753]">Proses pengerjaan</p>
                </div>
                <div>
                  <p className="font-mono text-xs font-semibold text-[#121212] tabular-nums">
                    Rp29.000
                  </p>
                  <p className="mt-0.5 text-xs text-[#575753]">Mulai dari harga</p>
                </div>
                <div>
                  <p className="font-mono text-xs font-semibold text-[#121212] tabular-nums">
                    1 Tahun
                  </p>
                  <p className="mt-0.5 text-xs text-[#575753]">Masa aktif penuh</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: EASE_OUT }}
              className="lg:col-span-7"
            >
              <div className="flex flex-wrap items-center gap-1 border-b border-[#E5E5E1]">
                {BRAND.templates.map((item) => {
                  const isActive = item.id === activeTemplate.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveHeroId(item.id)}
                      className={cn(
                        "relative cursor-pointer px-3.5 py-3 text-xs font-semibold whitespace-nowrap transition-colors sm:px-4 sm:text-sm",
                        isActive
                          ? "text-[#121212]"
                          : "text-[#575753] hover:text-[#121212]"
                      )}
                    >
                      {HERO_TAB_LABELS[item.id]}
                      {isActive && (
                        <motion.span
                          layoutId="heroStageTabLine"
                          transition={
                            prefersReducedMotion
                              ? { duration: 0.1 }
                              : { type: "spring", stiffness: 380, damping: 32 }
                          }
                          className="absolute right-0 bottom-0 left-0 h-0.5 bg-[#059669]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div
                style={{ backgroundColor: STAGE_TINTS[activeTemplate.id] }}
                className="mt-4 overflow-hidden rounded-2xl px-5 pt-6 transition-colors duration-300 sm:px-8 sm:pt-8"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTemplate.id}
                    initial={
                      prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }
                    }
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                    className="overflow-hidden rounded-t-xl border border-b-0 border-black/10 bg-white shadow-[0_24px_48px_-24px_rgba(0,0,0,0.28)]"
                  >
                    <div className="flex h-9 items-center justify-between border-b border-[#E5E5E1] bg-white px-3.5">
                      <div className="flex items-center gap-1.5" aria-hidden="true">
                        <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                        <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                        <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                      </div>
                      <span className="truncate font-mono text-xs text-[#575753] tabular-nums">
                        {getSubdomainHost(activeTemplate.demoSlug)}
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#121212] tabular-nums">
                        {formatRupiah(activeTemplate.price)}
                      </span>
                    </div>

                    <div className="aspect-[16/10] w-full overflow-hidden bg-zinc-100">
                      <img
                        src={activeTemplate.thumbnail}
                        alt={activeTemplate.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h2 className="font-archivo text-base font-bold text-[#121212]">
                    {activeTemplate.name}
                  </h2>
                  <p className="truncate text-sm text-[#575753]">
                    {activeTemplate.tagline}
                  </p>
                </div>
                <SubdomainLink
                  slug={activeTemplate.demoSlug}
                  openInNewTab
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-[#121212] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
                >
                  <span>Buka Demo</span>
                  <ArrowUpRight size={15} weight="bold" aria-hidden="true" />
                </SubdomainLink>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. Alternating Editorial Template Showcase */}
        <section id="template" className="border-b border-[#E5E5E1] bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="font-archivo text-3xl font-bold tracking-tight text-[#121212] sm:text-4xl">
                Koleksi Desain Siap Pakai
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#575753]">
                Klik langsung contoh website yang sudah jadi, lihat animasinya,
                lalu salin format chat untuk dikirim saat pesan di Shopee.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-1 border-b border-[#E5E5E1]">
              {CATEGORY_FILTERS.map((category) => {
                const isActive = selectedCategory === category.value;
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setSelectedCategory(category.value)}
                    className={cn(
                      "relative cursor-pointer px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                      isActive
                        ? "font-semibold text-[#121212]"
                        : "text-[#575753] hover:text-[#121212]"
                    )}
                  >
                    {category.label}
                    {isActive && (
                      <motion.span
                        layoutId="catalogFilterLine"
                        transition={
                          prefersReducedMotion
                            ? { duration: 0.1 }
                            : { type: "spring", stiffness: 380, damping: 32 }
                        }
                        className="absolute right-0 bottom-0 left-0 h-0.5 bg-[#059669]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-12 space-y-16 md:space-y-20">
              {filteredTemplates.map((item, index) => {
                const flip = index % 2 === 1;
                const isCopied = copiedId === item.id;
                return (
                  <motion.article
                    key={item.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: "some" }}
                    transition={{ duration: 0.45, ease: EASE_OUT }}
                    className="group grid grid-cols-1 items-center gap-8 md:grid-cols-[1.15fr_1fr] md:gap-14"
                  >
                    <SubdomainLink
                      slug={item.demoSlug}
                      openInNewTab
                      className={cn("block", flip && "md:order-2")}
                    >
                      <div
                        style={{ backgroundColor: STAGE_TINTS[item.id] }}
                        className="flex items-end justify-center overflow-hidden rounded-2xl px-5 pt-6 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:-translate-y-1 sm:px-8 sm:pt-8"
                      >
                        <div className="w-full overflow-hidden rounded-t-xl border border-b-0 border-black/10 bg-white shadow-[0_24px_48px_-24px_rgba(0,0,0,0.28)]">
                          <div className="flex h-8 items-center justify-between border-b border-[#E5E5E1] px-3.5">
                            <div className="flex items-center gap-1.5" aria-hidden="true">
                              <span className="h-2 w-2 rounded-full bg-zinc-200" />
                              <span className="h-2 w-2 rounded-full bg-zinc-200" />
                              <span className="h-2 w-2 rounded-full bg-zinc-200" />
                            </div>
                            <span className="truncate font-mono text-[11px] text-[#575753]">
                              {getSubdomainHost(item.demoSlug)}
                            </span>
                            <span className="w-8" aria-hidden="true" />
                          </div>
                          <div className="aspect-video w-full overflow-hidden bg-zinc-100">
                            <img
                              src={item.thumbnail}
                              alt={`Pratinjau ${item.name}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </SubdomainLink>

                    <div className={cn(flip && "md:order-1")}>
                      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[#E5E5E1] pb-3 text-sm">
                        <span className="font-medium text-[#575753]">
                          {item.category}
                        </span>
                        <span className="font-mono text-base font-bold text-[#121212] tabular-nums">
                          {formatRupiah(item.price)}
                        </span>
                      </div>

                      <h3 className="mt-4 font-archivo text-2xl font-bold tracking-tight text-[#121212] sm:text-3xl">
                        {item.name}
                      </h3>

                      <p className="mt-3 text-base leading-relaxed text-[#575753]">
                        {item.tagline}
                      </p>

                      <ul className="mt-5 space-y-2.5">
                        {item.highlights.map((highlight) => (
                          <li
                            key={highlight}
                            className="flex items-start gap-2.5 text-sm text-[#121212]"
                          >
                            <Check
                              size={16}
                              weight="bold"
                              className="mt-0.5 shrink-0 text-[#059669]"
                              aria-hidden="true"
                            />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 flex flex-wrap items-center gap-2.5">
                        <SubdomainLink
                          slug={item.demoSlug}
                          openInNewTab
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-[#121212] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
                        >
                          <span>Buka Demo</span>
                          <ArrowUpRight size={15} weight="bold" aria-hidden="true" />
                        </SubdomainLink>

                        <button
                          type="button"
                          onClick={() => handleCopyBuyerForm(item)}
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-[#E5E5E1] bg-white px-4 py-2.5 text-sm font-medium text-[#121212] transition-colors hover:bg-[#F6F6F4]"
                        >
                          {isCopied ? (
                            <>
                              <Check
                                size={15}
                                weight="bold"
                                className="text-[#059669]"
                                aria-hidden="true"
                              />
                              <span className="text-[#059669]">Format Tersalin</span>
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
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-[#E5E5E1] bg-[#F6F6F4] px-4 py-2.5 text-sm font-semibold text-[#121212] transition-colors hover:bg-zinc-200/70"
                        >
                          <ShoppingBag size={15} aria-hidden="true" />
                          <span>Pesan di Shopee</span>
                        </a>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. Physical QR Gift Card & Order Flow */}
        <section id="cara-pesan" className="border-b border-[#E5E5E1] bg-[#F6F6F4] py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: "some" }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              className="lg:col-span-5"
            >
              <div className="mx-auto max-w-sm -rotate-1 rounded-sm border border-[#E5E5E1] bg-white p-4 pb-5 shadow-[0_18px_40px_-18px_rgba(18,18,18,0.16)] transition-transform duration-300 hover:rotate-0">
                <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                  <img
                    src="/demo/bucin-1.webp"
                    alt="Contoh kartu Polaroid QR kado pasangan"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#E5E5E1] pt-4">
                  <div className="min-w-0">
                    <p className="font-handwriting text-2xl font-bold text-[#121212]">
                      Arka &amp; Nisa - 12 Mei 2024
                    </p>
                    <p className="mt-1 truncate font-mono text-xs text-[#575753] tabular-nums">
                      {getSubdomainHost("arka-nisa")}
                    </p>
                    <p className="mt-1 text-xs text-[#575753]">
                      Scan QR dengan kamera HP
                    </p>
                  </div>

                  <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-[#E5E5E1] bg-white p-1.5">
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
            </motion.div>

            <div className="lg:col-span-7">
              <h2 className="font-archivo text-3xl font-bold tracking-tight text-[#121212] sm:text-4xl">
                Bisa Terima Link Saja atau Plus Kartu Cetak QR
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#575753]">
                Selain langsung mengirim link lewat WhatsApp, kamu juga bisa
                pesan varian Kartu Cetak QR Polaroid untuk diselipkan ke kotak
                kado dan dikirim memakai ekspedisi gratis ongkir Shopee.
              </p>

              <ol className="mt-8 divide-y divide-[#E5E5E1] border-y border-[#E5E5E1] bg-white">
                {ORDER_STEPS.map((step, index) => (
                  <li
                    key={step.title}
                    className="flex items-start gap-5 px-5 py-5"
                  >
                    <span className="mt-0.5 font-mono text-xs font-bold text-[#059669] tabular-nums">
                      0{index + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-[#121212]">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#575753]">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* 4. Architectural Ledger Pricing Grid */}
        <section id="harga" className="border-b border-[#E5E5E1] bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="font-archivo text-3xl font-bold tracking-tight text-[#121212] sm:text-4xl">
                Daftar Paket &amp; Harga Jelas
              </h2>
              <p className="mt-3 text-base text-[#575753]">
                Sekali bayar untuk masa aktif penuh satu tahun. Tanpa biaya
                perawatan bulanan yang membingungkan.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 divide-y divide-[#E5E5E1] border border-[#E5E5E1] md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-4">
              {BRAND.packages.map((pkg) => {
                const isSpotlight = pkg.id === "kado-kartu-qr";
                return (
                  <div
                    key={pkg.id}
                    className={cn(
                      "flex flex-col justify-between p-6",
                      isSpotlight
                        ? "bg-[#121212] text-white"
                        : "bg-white text-[#121212]"
                    )}
                  >
                    <div>
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          isSpotlight ? "text-[#10B981]" : "text-[#059669]"
                        )}
                      >
                        {pkg.badge}
                      </p>

                      <h3 className="mt-2 font-archivo text-xl font-bold">
                        {pkg.name}
                      </h3>

                      <div className="mt-4 flex items-baseline gap-1.5">
                        <span className="font-mono text-3xl font-bold tracking-tight tabular-nums">
                          {formatRupiah(pkg.price)}
                        </span>
                        <span
                          className={cn(
                            "text-xs",
                            isSpotlight ? "text-zinc-400" : "text-[#575753]"
                          )}
                        >
                          / tahun
                        </span>
                      </div>

                      <p
                        className={cn(
                          "mt-3 text-sm leading-relaxed",
                          isSpotlight ? "text-zinc-300" : "text-[#575753]"
                        )}
                      >
                        {pkg.description}
                      </p>

                      <ul
                        className={cn(
                          "mt-6 space-y-2.5 border-t pt-5",
                          isSpotlight ? "border-zinc-800" : "border-[#E5E5E1]"
                        )}
                      >
                        {pkg.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2.5 text-sm"
                          >
                            <Check
                              size={15}
                              weight="bold"
                              className={cn(
                                "mt-0.5 shrink-0",
                                isSpotlight ? "text-[#10B981]" : "text-[#059669]"
                              )}
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
                        "mt-7 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-3 text-sm font-semibold transition-colors",
                        isSpotlight
                          ? "bg-white text-[#121212] hover:bg-zinc-200"
                          : "bg-[#121212] text-white hover:bg-zinc-800"
                      )}
                    >
                      <ShoppingBag size={15} weight="bold" aria-hidden="true" />
                      <span>Pesan di Shopee</span>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. Animated FAQ Disclosure */}
        <section id="faq" className="bg-white py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="font-archivo text-3xl font-bold tracking-tight text-[#121212] sm:text-4xl">
                Pertanyaan yang Sering Ditanyakan
              </h2>
              <p className="mt-2 text-base text-[#575753]">
                Jawaban singkat seputar pengerjaan, kartu cetak QR, dan domain
                khusus usaha UMKM.
              </p>
            </div>

            <div className="mt-8 divide-y divide-[#E5E5E1] border-y border-[#E5E5E1]">
              {FAQS.map((faq) => {
                const isOpen = openFaqId === faq.id;
                const panelId = `faq-panel-${faq.id}`;
                const buttonId = `faq-button-${faq.id}`;
                return (
                  <div key={faq.id} className="py-4">
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
                      className="flex w-full cursor-pointer items-center justify-between gap-4 py-1 text-left"
                    >
                      <span className="text-base font-semibold text-[#121212]">
                        {faq.question}
                      </span>
                      <CaretDown
                        size={18}
                        weight="bold"
                        className={cn(
                          "shrink-0 text-[#575753] transition-transform duration-200",
                          isOpen && "rotate-180 text-[#059669]"
                        )}
                        aria-hidden="true"
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          initial={
                            prefersReducedMotion
                              ? { opacity: 1 }
                              : { opacity: 0, height: 0 }
                          }
                          animate={
                            prefersReducedMotion
                              ? { opacity: 1 }
                              : { opacity: 1, height: "auto" }
                          }
                          exit={
                            prefersReducedMotion
                              ? { opacity: 0 }
                              : { opacity: 0, height: 0 }
                          }
                          transition={{ duration: 0.2, ease: EASE_OUT }}
                          className="overflow-hidden"
                        >
                          <p className="pt-2.5 pb-1 text-sm leading-relaxed text-[#575753]">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* 6. Clean Footer */}
      <footer className="border-t border-[#E5E5E1] bg-[#F6F6F4] py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="font-archivo text-base font-bold text-[#121212]">
              {BRAND.name}
            </p>
            <p className="mt-0.5 font-mono text-xs text-[#575753]">
              {BRAND.domain}
            </p>
          </div>

          <nav
            aria-label="Navigasi footer"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#575753]"
          >
            <a href="#template" className="hover:text-[#121212]">
              Koleksi Desain
            </a>
            <a href="#cara-pesan" className="hover:text-[#121212]">
              Kartu Kado QR
            </a>
            <a href="#harga" className="hover:text-[#121212]">
              Daftar Harga
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
              className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E1] bg-white px-3.5 py-2 text-sm font-medium text-[#121212] transition-colors hover:bg-zinc-100"
            >
              <WhatsappLogo size={16} weight="bold" aria-hidden="true" />
              <span>WhatsApp</span>
            </a>
            <a
              href={BRAND.shopeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-[#121212] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              <ShoppingBag size={16} weight="bold" aria-hidden="true" />
              <span>Pesan di Shopee</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
