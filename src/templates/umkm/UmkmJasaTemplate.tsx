"use client";

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CaretDown,
  Check,
  Clock,
  MapPin,
  Minus,
  Plus,
  Quotes,
  Scissors,
  ShieldCheck,
  Trash,
  User,
  WhatsappLogo,
} from "@phosphor-icons/react";
import type { UmkmSiteConfig } from "@/lib/schema";
import { buildWhatsAppUrl, cn, formatRupiah } from "@/lib/utils";

type UmkmProduct = UmkmSiteConfig["data"]["products"][number];

interface SelectedServiceEntry {
  qty: number;
  option: string;
}

const TIME_SLOTS = [
  "10.00 WIB",
  "13.00 WIB",
  "16.00 WIB",
  "19.30 WIB",
] as const;

const BARBER_SPECIALISTS = [
  { name: "Kapster Bebas", specialty: "Slot tercepat tersedia" },
  { name: "Mas Raka - Fade Specialist", specialty: "Skin fade & crop" },
  { name: "Mas Dito - Classic Scissors", specialty: "Comma hair & scissor cut" },
  { name: "Mas Bima - Hair & Beard", specialty: "Rambut, jenggot & toning" },
] as const;

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

function parseDurationMinutes(unitLabel: string): number {
  const match = unitLabel.match(/(\d+)\s*(?:mnt|menit|min)/i);
  if (match) {
    return Number.parseInt(match[1], 10);
  }
  const hourMatch = unitLabel.match(/(\d+)\s*jam/i);
  if (hourMatch) {
    return Number.parseInt(hourMatch[1], 10) * 60;
  }
  return 0;
}

function formatDurationTotal(totalMinutes: number, nonTimedCount: number): string {
  if (totalMinutes <= 0 && nonTimedCount > 0) {
    return `${nonTimedCount} produk`;
  }
  if (totalMinutes <= 0) {
    return "0 mnt";
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const base =
    hours > 0
      ? mins > 0
        ? `${totalMinutes} mnt (${hours} jam ${mins} mnt)`
        : `${totalMinutes} mnt (${hours} jam)`
      : `${totalMinutes} mnt`;

  if (nonTimedCount > 0) {
    return `${base} + ${nonTimedCount} produk`;
  }
  return base;
}

function getLocalIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const subscribeNoop = () => () => {};

export function UmkmJasaTemplate({
  site,
  embedded = false,
}: {
  site: UmkmSiteConfig;
  embedded?: boolean;
}) {
  const { data } = site;
  const prefersReducedMotion = useReducedMotion();

  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [selectedServices, setSelectedServices] = useState<
    Record<string, SelectedServiceEntry>
  >({});
  const [preferredOptions, setPreferredOptions] = useState<
    Record<string, string>
  >({});

  const clientTodayIso = useSyncExternalStore(
    subscribeNoop,
    getLocalIsoDate,
    () => ""
  );
  const [bookingDateOverride, setBookingDateOverride] = useState<string>("");
  const bookingDate = bookingDateOverride || clientTodayIso;
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[1]);
  const [selectedBarber, setSelectedBarber] = useState<string>(
    BARBER_SPECIALISTS[0].name
  );
  const [customerName, setCustomerName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const urls = Array.from(
      new Set([
        data.heroImageUrl,
        "/demo/umkm-jasa-hero.webp",
        "/demo/umkm-jasa-tools.webp",
        ...data.products.map((product) => product.imageUrl),
      ])
    );
    urls.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [data.heroImageUrl, data.products]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(data.products.map((item) => item.category)));
    return ["Semua", ...unique];
  }, [data.products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "Semua") return data.products;
    return data.products.filter((item) => item.category === activeCategory);
  }, [activeCategory, data.products]);

  const selectedItems = useMemo(() => {
    return data.products
      .map((product) => {
        const entry = selectedServices[product.id];
        if (!entry || entry.qty <= 0) return null;
        return {
          product,
          qty: entry.qty,
          option: entry.option,
          minutes: parseDurationMinutes(product.unitLabel) * entry.qty,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  }, [data.products, selectedServices]);

  const totalSelectedCount = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.qty, 0),
    [selectedItems]
  );

  const totalEstimatedCost = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) => sum + item.product.price * item.qty,
        0
      ),
    [selectedItems]
  );

  const totalDurationMinutes = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.minutes, 0),
    [selectedItems]
  );

  const nonTimedCount = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) =>
          parseDurationMinutes(item.product.unitLabel) === 0
            ? sum + item.qty
            : sum,
        0
      ),
    [selectedItems]
  );

  const formattedTotalDuration = useMemo(
    () => formatDurationTotal(totalDurationMinutes, nonTimedCount),
    [totalDurationMinutes, nonTimedCount]
  );

  const directChatUrl = useMemo(
    () =>
      buildWhatsAppUrl(
        data.whatsappNumber,
        `Halo ${data.businessName}, saya mau tanya ketersediaan slot booking hari ini.`
      ),
    [data.businessName, data.whatsappNumber]
  );

  const promoProduct = useMemo(() => {
    if (!data.promoBanner) return undefined;
    return (
      data.products.find((item) => item.id === data.promoBanner?.productId) ??
      data.products[0]
    );
  }, [data.products, data.promoBanner]);

  function getActiveOptionForProduct(product: UmkmProduct): string {
    const selected = selectedServices[product.id]?.option;
    if (selected) return selected;
    const preferred = preferredOptions[product.id];
    if (preferred) return preferred;
    return product.options?.[0] ?? "";
  }

  function toggleService(product: UmkmProduct) {
    setFormError(null);
    setSelectedServices((prev) => {
      if (prev[product.id]) {
        const rest = { ...prev };
        delete rest[product.id];
        return rest;
      }
      const chosenOption =
        preferredOptions[product.id] ?? product.options?.[0] ?? "";
      return {
        ...prev,
        [product.id]: { qty: 1, option: chosenOption },
      };
    });
  }

  function selectOption(product: UmkmProduct, option: string) {
    setFormError(null);
    setPreferredOptions((prev) => ({
      ...prev,
      [product.id]: option,
    }));
    setSelectedServices((prev) => ({
      ...prev,
      [product.id]: {
        qty: prev[product.id]?.qty ?? 1,
        option,
      },
    }));
  }

  function adjustQty(productId: string, delta: number) {
    setFormError(null);
    setSelectedServices((prev) => {
      const current = prev[productId];
      if (!current) return prev;
      const nextQty = current.qty + delta;
      if (nextQty <= 0) {
        const rest = { ...prev };
        delete rest[productId];
        return rest;
      }
      return {
        ...prev,
        [productId]: { ...current, qty: nextQty },
      };
    });
  }

  function removeService(productId: string) {
    setSelectedServices((prev) => {
      const rest = { ...prev };
      delete rest[productId];
      return rest;
    });
  }

  function handleSelectPromoSlot() {
    if (!promoProduct) return;
    setFormError(null);
    const chosenOption =
      preferredOptions[promoProduct.id] ?? promoProduct.options?.[0] ?? "";
    setSelectedServices((prev) => ({
      ...prev,
      [promoProduct.id]: {
        qty: prev[promoProduct.id]?.qty ?? 1,
        option: prev[promoProduct.id]?.option ?? chosenOption,
      },
    }));
    setSelectedSlot(TIME_SLOTS[0]);
    const panel = document.getElementById("booking-panel");
    if (panel) {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleBookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedItems.length === 0) {
      setFormError(
        "Pilih minimal satu layanan pada daftar harga sebelum mengirim jadwal booking."
      );
      return;
    }

    if (!bookingDate.trim()) {
      setFormError("Silakan pilih tanggal kedatangan terlebih dahulu.");
      return;
    }

    if (!customerName.trim()) {
      setFormError("Mohon isi nama Anda agar kasir dapat mencatat antrean.");
      return;
    }

    setFormError(null);

    const serviceLines = selectedItems.map((entry, idx) => {
      const optionSuffix = entry.option ? ` [${entry.option}]` : "";
      const qtyLabel = entry.qty > 1 ? ` x${entry.qty}` : "";
      const lineTotal = formatRupiah(entry.product.price * entry.qty);
      return `${idx + 1}. ${entry.product.name}${optionSuffix}${qtyLabel} (${entry.product.unitLabel}) - ${lineTotal}`;
    });

    const messageLines = [
      `Halo ${data.businessName}, saya mau booking jadwal studio:`,
      "",
      "Layanan Dipilih:",
      ...serviceLines,
      "",
      `Estimasi Total Durasi: ${formattedTotalDuration}`,
      `Total Estimasi Biaya: ${formatRupiah(totalEstimatedCost)}`,
      "",
      "Detail Jadwal:",
      `- Tanggal Kedatangan: ${bookingDate}`,
      `- Slot Jam: ${selectedSlot}`,
      `- Pilihan Kapster: ${selectedBarber}`,
      `- Atas Nama: ${customerName.trim()}`,
    ];

    if (notes.trim()) {
      messageLines.push(`- Catatan Gaya: ${notes.trim()}`);
    }

    const whatsappUrl = buildWhatsAppUrl(
      data.whatsappNumber,
      messageLines.join("\n")
    );
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  const stats = data.stats ?? [];
  const faqs = data.faqs ?? [];
  const customDomainHost = `${site.slug.replace(/-/g, "")}.my.id`;

  return (
    <div
      id="top"
      className="relative min-h-full bg-[#FFFFFF] font-sans text-[#0F172A] selection:bg-[#0F766E]/15 selection:text-[#0F766E]"
    >
      <header className="sticky top-0 z-20 h-16 border-b border-[#E2E8F0] bg-[#FFFFFF]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a
            href="#top"
            className="flex min-w-0 items-center gap-2.5 whitespace-nowrap"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#E2E8F0] bg-[#F4F6F9] text-[#0F766E]">
              <Scissors size={16} weight="bold" />
            </span>
            <span className="truncate font-archivo text-base font-extrabold tracking-tight text-[#0F172A] sm:text-lg">
              {data.businessName}
            </span>
            <span className="hidden border-l border-[#E2E8F0] pl-2.5 font-mono text-xs text-[#475569] md:inline">
              {data.openHoursLabel}
            </span>
          </a>

          <nav
            aria-label="Navigasi studio"
            className="hidden items-center gap-6 text-sm font-medium text-[#475569] lg:flex"
          >
            <a
              href="#layanan"
              className="whitespace-nowrap transition-colors hover:text-[#0F172A]"
            >
              Layanan &amp; Tarif
            </a>
            <a
              href="#galeri"
              className="whitespace-nowrap transition-colors hover:text-[#0F172A]"
            >
              Galeri Studio
            </a>
            <a
              href="#keunggulan"
              className="whitespace-nowrap transition-colors hover:text-[#0F172A]"
            >
              Standar Steril
            </a>
            <a
              href="#lokasi"
              className="whitespace-nowrap transition-colors hover:text-[#0F172A]"
            >
              Lokasi
            </a>
          </nav>

          <a
            href="#booking-panel"
            className={cn(
              "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm",
              totalSelectedCount > 0
                ? "bg-[#0F766E] text-white hover:bg-[#115E59]"
                : "border border-[#CBD5E1] bg-[#0F172A] text-white hover:bg-[#1E293B]"
            )}
          >
            <Calendar size={16} weight="bold" />
            <span>Booking Jadwal</span>
            {totalSelectedCount > 0 && (
              <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-[11px] tabular-nums">
                {totalSelectedCount}
              </span>
            )}
          </a>
        </div>
      </header>

      <main>
        <section
          className={cn(
            "border-b border-[#E2E8F0] bg-[#FFFFFF] pt-10 pb-12 sm:pt-14 sm:pb-16",
            !embedded && "lg:flex lg:min-h-[calc(100dvh-4rem)] lg:items-center"
          )}
        >
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 border-b border-[#E2E8F0] pb-3 text-xs text-[#475569]">
                <Clock
                  size={14}
                  weight="bold"
                  className="shrink-0 text-[#0F766E]"
                />
                <span className="font-semibold text-[#0F172A]">
                  {data.categoryLabel}
                </span>
                <span aria-hidden="true">/</span>
                <span>{data.cityLabel}</span>
                <span aria-hidden="true">/</span>
                <span className="font-mono tabular-nums">
                  {data.openHoursLabel}
                </span>
              </div>

              <h1 className="mt-6 font-archivo text-3xl font-extrabold leading-[1.08] tracking-tight text-[#0F172A] sm:text-4xl lg:text-[3.125rem]">
                {data.tagline}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#475569] sm:text-lg">
                {data.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#layanan"
                  className="inline-flex items-center gap-2 rounded-md bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#115E59]"
                >
                  <span>Pilih Layanan &amp; Jam Booking</span>
                  <ArrowRight size={16} weight="bold" />
                </a>

                <a
                  href={directChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-[#CBD5E1] bg-[#F4F6F9] px-5 py-3 text-sm font-semibold text-[#0F172A] transition-colors hover:border-[#94A3B8] hover:bg-[#E2E8F0]/60"
                >
                  <WhatsappLogo
                    size={17}
                    weight="bold"
                    className="text-[#0F766E]"
                  />
                  <span>Tanya Slot via WA</span>
                </a>
              </div>

              {stats.length > 0 && (
                <div className="mt-10 grid grid-cols-3 divide-x divide-[#E2E8F0] border-y border-[#E2E8F0] bg-[#F4F6F9]/60">
                  {stats.map((stat) => (
                    <div key={stat.label} className="px-3 py-4 sm:px-5">
                      <p className="font-mono text-lg font-bold tracking-tight text-[#0F172A] tabular-nums sm:text-2xl">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-[#475569] sm:text-xs">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F4F6F9]">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E2E8F0]">
                  <img
                    src={data.heroImageUrl}
                    alt={`${data.businessName} - ${data.categoryLabel}`}
                    loading="eager"
                    className="absolute inset-0 block h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-[#E2E8F0] bg-[#FFFFFF] px-4 py-3 text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                    <ShieldCheck
                      size={15}
                      weight="bold"
                      className="text-[#0F766E]"
                    />
                    <span>Kabinet UV-C &amp; Silet Baru Tiap Sesi</span>
                  </span>
                  <span className="font-mono text-[11px] text-[#475569] tabular-nums">
                    WALK-IN / BOOKING
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="layanan"
          className="scroll-mt-16 border-b border-[#E2E8F0] bg-[#F4F6F9] py-14 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col justify-between gap-6 border-b border-[#E2E8F0] pb-6 md:flex-row md:items-end">
              <div>
                <p className="border-l-2 border-[#0F766E] pl-3 font-mono text-xs font-semibold uppercase tracking-widest text-[#0F766E]">
                  01 / Daftar Layanan &amp; Estimasi
                </p>
                <h2 className="mt-2 font-archivo text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">
                  Pilih Layanan &amp; Hitung Durasi
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#475569]">
                  Centang satu atau lebih layanan di bawah untuk melihat estimasi
                  biaya dan total waktu pengerjaan sebelum mengunci slot
                  kedatangan.
                </p>
              </div>

              <div className="flex items-center gap-4 border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2.5 text-xs">
                <div>
                  <span className="block text-[#64748B]">Dipilih</span>
                  <span className="font-mono text-sm font-bold text-[#0F172A] tabular-nums">
                    {totalSelectedCount} layanan
                  </span>
                </div>
                <span className="h-7 w-px bg-[#E2E8F0]" aria-hidden="true" />
                <div>
                  <span className="block text-[#64748B]">Estimasi Biaya</span>
                  <span className="font-mono text-sm font-bold text-[#0F766E] tabular-nums">
                    {formatRupiah(totalEstimatedCost)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {categories.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                      "rounded-md border px-3.5 py-2 text-xs font-semibold transition-colors",
                      isActive
                        ? "border-[#0F766E] bg-[#0F766E] text-white"
                        : "border-[#CBD5E1] bg-[#FFFFFF] text-[#475569] hover:border-[#0F172A] hover:text-[#0F172A]"
                    )}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-7">
                {filteredProducts.map((product) => {
                  const selectedEntry = selectedServices[product.id];
                  const isSelected = Boolean(selectedEntry);
                  const activeOption = getActiveOptionForProduct(product);

                  return (
                    <div
                      key={product.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onClick={() => toggleService(product)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggleService(product);
                        }
                      }}
                      className={cn(
                        "group cursor-pointer rounded-xl border bg-[#FFFFFF] p-4 transition-colors sm:p-5",
                        isSelected
                          ? "border-[#0F766E] ring-1 ring-[#0F766E]"
                          : "border-[#E2E8F0] hover:border-[#94A3B8]"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                            isSelected
                              ? "border-[#0F766E] bg-[#0F766E] text-white"
                              : "border-[#CBD5E1] bg-[#F4F6F9] text-transparent group-hover:border-[#0F766E]"
                          )}
                          aria-hidden="true"
                        >
                          <Check size={13} weight="bold" />
                        </div>

                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#F4F6F9] sm:h-20 sm:w-20">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            loading="eager"
                            className="absolute inset-0 block h-full w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                                <span className="font-mono font-semibold uppercase tracking-wider text-[#0F766E]">
                                  {product.category}
                                </span>
                                <span
                                  className="text-[#CBD5E1]"
                                  aria-hidden="true"
                                >
                                  /
                                </span>
                                <span className="font-mono text-[#475569] tabular-nums">
                                  {product.unitLabel}
                                </span>
                              </div>
                              <h3 className="mt-1 font-archivo text-base font-bold tracking-tight text-[#0F172A] sm:text-lg">
                                {product.name}
                              </h3>
                            </div>

                            <div className="text-right">
                              <p className="font-mono text-base font-bold text-[#0F172A] tabular-nums sm:text-lg">
                                {formatRupiah(product.price)}
                              </p>
                            </div>
                          </div>

                          <p className="mt-2 text-xs leading-relaxed text-[#475569] sm:text-sm">
                            {product.description}
                          </p>

                          {product.options && product.options.length > 0 && (
                            <div
                              className="mt-3 flex flex-wrap items-center gap-1.5"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <span className="mr-1 font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                                Gaya:
                              </span>
                              {product.options.map((opt) => {
                                const isChosen = activeOption === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => selectOption(product, opt)}
                                    className={cn(
                                      "rounded border px-2.5 py-1 text-[11px] font-medium transition-colors",
                                      isChosen && isSelected
                                        ? "border-[#0F766E] bg-[#0F766E] text-white"
                                        : isChosen
                                          ? "border-[#0F766E]/50 bg-[#F0FDFA] text-[#0F766E]"
                                          : "border-[#E2E8F0] bg-[#F4F6F9] text-[#475569] hover:border-[#94A3B8] hover:text-[#0F172A]"
                                    )}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {isSelected && (
                            <div
                              className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-3"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <span className="font-mono text-xs font-semibold text-[#0F766E]">
                                Masuk daftar booking
                              </span>
                              <div className="inline-flex items-center gap-1 rounded-md border border-[#CBD5E1] bg-[#F4F6F9] p-0.5">
                                <button
                                  type="button"
                                  aria-label={`Kurangi jumlah ${product.name}`}
                                  onClick={() => adjustQty(product.id, -1)}
                                  className="flex h-7 w-7 items-center justify-center rounded text-[#0F172A] transition-colors hover:bg-[#FFFFFF]"
                                >
                                  <Minus size={13} weight="bold" />
                                </button>
                                <span className="min-w-[2rem] text-center font-mono text-xs font-bold text-[#0F172A] tabular-nums">
                                  {selectedEntry.qty}
                                </span>
                                <button
                                  type="button"
                                  aria-label={`Tambah jumlah ${product.name}`}
                                  onClick={() => adjustQty(product.id, 1)}
                                  className="flex h-7 w-7 items-center justify-center rounded text-[#0F172A] transition-colors hover:bg-[#FFFFFF]"
                                >
                                  <Plus size={13} weight="bold" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <aside
                id="booking-panel"
                className="scroll-mt-20 rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] p-5 shadow-sm sm:p-6 lg:sticky lg:top-24 lg:col-span-5"
              >
                <div className="border-b border-[#E2E8F0] pb-4">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#0F766E]">
                    Form Reservasi Jadwal
                  </p>
                  <h3 className="mt-1 font-archivo text-xl font-extrabold tracking-tight text-[#0F172A]">
                    Kunci Slot ke WhatsApp
                  </h3>
                </div>

                <div className="mt-4 border-b border-[#E2E8F0] pb-4">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#475569]">
                    <span>Layanan Dipilih</span>
                    <span className="font-mono tabular-nums">
                      {totalSelectedCount} item
                    </span>
                  </div>

                  {selectedItems.length === 0 ? (
                    <div className="mt-3 rounded-lg border border-dashed border-[#CBD5E1] bg-[#F4F6F9] p-4 text-xs leading-relaxed text-[#475569]">
                      Belum ada layanan dipilih. Klik salah satu baris layanan di
                      sebelah untuk melihat total biaya dan estimasi durasi.
                    </div>
                  ) : (
                    <ul className="mt-3 space-y-2.5">
                      {selectedItems.map((item) => (
                        <li
                          key={item.product.id}
                          className="flex items-start justify-between gap-3 rounded-lg border border-[#E2E8F0] bg-[#F4F6F9] px-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-[#0F172A] sm:text-sm">
                              {item.product.name}
                            </p>
                            <p className="mt-0.5 font-mono text-[11px] text-[#475569] tabular-nums">
                              {item.option ? `${item.option} - ` : ""}
                              {item.qty} x {item.product.unitLabel}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#0F172A] tabular-nums">
                              {formatRupiah(item.product.price * item.qty)}
                            </span>
                            <button
                              type="button"
                              aria-label={`Hapus ${item.product.name}`}
                              onClick={() => removeService(item.product.id)}
                              className="rounded p-1 text-[#64748B] transition-colors hover:bg-[#FFFFFF] hover:text-[#DC2626]"
                            >
                              <Trash size={14} weight="bold" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4 grid grid-cols-2 divide-x divide-[#E2E8F0] rounded-lg border border-[#E2E8F0] bg-[#F4F6F9]">
                    <div className="p-3">
                      <span className="block text-[11px] font-medium text-[#64748B]">
                        Estimasi Total Durasi
                      </span>
                      <span className="mt-0.5 block font-mono text-sm font-bold text-[#0F172A] tabular-nums">
                        {formattedTotalDuration}
                      </span>
                    </div>
                    <div className="p-3">
                      <span className="block text-[11px] font-medium text-[#64748B]">
                        Total Estimasi Biaya
                      </span>
                      <span className="mt-0.5 block font-mono text-sm font-bold text-[#0F766E] tabular-nums">
                        {formatRupiah(totalEstimatedCost)}
                      </span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleBookingSubmit} className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="booking-date"
                      className="block text-xs font-semibold text-[#0F172A]"
                    >
                      Tanggal Kedatangan
                    </label>
                    <input
                      id="booking-date"
                      type="date"
                      min={clientTodayIso || undefined}
                      value={bookingDate}
                      onChange={(event) => {
                        setFormError(null);
                        setBookingDateOverride(event.target.value);
                      }}
                      className="mt-1.5 w-full rounded-md border border-[#CBD5E1] bg-[#FFFFFF] px-3 py-2 font-mono text-sm text-[#0F172A] outline-none transition-colors focus:border-[#0F766E]"
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-[#0F172A]">
                      Slot Jam Tersedia
                    </span>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      {TIME_SLOTS.map((slot) => {
                        const isChosen = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={cn(
                              "rounded-md border px-3 py-2 font-mono text-xs font-semibold tabular-nums transition-colors",
                              isChosen
                                ? "border-[#0F766E] bg-[#0F766E] text-white"
                                : "border-[#CBD5E1] bg-[#F4F6F9] text-[#0F172A] hover:border-[#0F766E]"
                            )}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-[#0F172A]">
                      Pilihan Kapster / Spesialis
                    </span>
                    <div className="mt-1.5 space-y-1.5">
                      {BARBER_SPECIALISTS.map((barber) => {
                        const isChosen = selectedBarber === barber.name;
                        return (
                          <button
                            key={barber.name}
                            type="button"
                            onClick={() => setSelectedBarber(barber.name)}
                            className={cn(
                              "flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left transition-colors",
                              isChosen
                                ? "border-[#0F766E] bg-[#F0FDFA] text-[#0F172A]"
                                : "border-[#E2E8F0] bg-[#FFFFFF] text-[#475569] hover:border-[#CBD5E1]"
                            )}
                          >
                            <span className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
                              <User
                                size={14}
                                weight="bold"
                                className={
                                  isChosen ? "text-[#0F766E]" : "text-[#64748B]"
                                }
                              />
                              <span>{barber.name}</span>
                            </span>
                            <span className="text-[11px] text-[#64748B]">
                              {barber.specialty}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="booking-customer-name"
                      className="block text-xs font-semibold text-[#0F172A]"
                    >
                      Nama Pelanggan
                    </label>
                    <input
                      id="booking-customer-name"
                      type="text"
                      placeholder="Contoh: Ahmad"
                      value={customerName}
                      onChange={(event) => {
                        setFormError(null);
                        setCustomerName(event.target.value);
                      }}
                      className="mt-1.5 w-full rounded-md border border-[#CBD5E1] bg-[#FFFFFF] px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#0F766E]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="booking-notes"
                      className="block text-xs font-semibold text-[#0F172A]"
                    >
                      Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                      id="booking-notes"
                      rows={2}
                      placeholder="Contoh: Samping tipis mid fade, bagian atas dirapikan saja"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      className="mt-1.5 w-full resize-none rounded-md border border-[#CBD5E1] bg-[#FFFFFF] px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#0F766E]"
                    />
                  </div>

                  {formError && (
                    <p
                      role="alert"
                      className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#B91C1C]"
                    >
                      {formError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-[#0F766E] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#115E59]"
                  >
                    <WhatsappLogo size={18} weight="bold" />
                    <span>Kirim Booking via WhatsApp</span>
                  </button>
                </form>
              </aside>
            </div>
          </div>
        </section>

        {data.promoBanner && (
          <section className="border-b border-[#1E293B] bg-[#0F172A] py-14 text-white sm:py-16">
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <p className="border-l-2 border-[#0F766E] pl-3 font-mono text-xs font-semibold uppercase tracking-widest text-[#5EEAD4]">
                  Jadwal Pagi Weekday
                </p>
                <h2 className="mt-3 font-archivo text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {data.promoBanner.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#CBD5E1] sm:text-base">
                  {data.promoBanner.description}
                </p>
              </div>

              <div className="flex flex-col items-start gap-4 rounded-xl border border-[#334155] bg-[#1E293B]/60 p-5 lg:col-span-4 lg:items-end lg:text-right">
                <div>
                  <span className="block font-mono text-xs uppercase tracking-wider text-[#94A3B8]">
                    Tarif Slot 10.00 - 15.00 WIB
                  </span>
                  <span className="mt-1 block font-mono text-3xl font-extrabold text-[#5EEAD4] tabular-nums">
                    {data.promoBanner.priceLabel}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSelectPromoSlot}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#0F766E] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#115E59] lg:w-auto"
                >
                  <span>Pilih Slot Pagi &amp; Booking</span>
                  <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            </div>
          </section>
        )}

        <section
          id="galeri"
          className="scroll-mt-16 border-b border-[#E2E8F0] bg-[#FFFFFF] py-14 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col justify-between gap-4 border-b border-[#E2E8F0] pb-6 sm:flex-row sm:items-end">
              <div>
                <p className="border-l-2 border-[#0F766E] pl-3 font-mono text-xs font-semibold uppercase tracking-widest text-[#0F766E]">
                  02 / Portofolio Studio
                </p>
                <h2 className="mt-2 font-archivo text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">
                  Suasana Kursi Cukur &amp; Peralatan Steril
                </h2>
              </div>
              <p className="max-w-md text-sm text-[#475569]">
                Ruang tunggu nyaman ber-AC dengan pencahayaan detail agar tiap
                garis fade dan potongan gunting presisi.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <figure className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F4F6F9]">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E2E8F0]">
                  <img
                    src="/demo/umkm-jasa-hero.webp"
                    alt="Area kursi cukur utama Potong Rapi Studio"
                    loading="eager"
                    className="absolute inset-0 block h-full w-full object-cover"
                  />
                </div>
                <figcaption className="flex items-center justify-between gap-4 border-t border-[#E2E8F0] bg-[#FFFFFF] px-5 py-3.5 text-xs">
                  <span className="font-semibold text-[#0F172A]">
                    Area Cukur Utama &amp; Pencahayaan Presisi
                  </span>
                  <span className="font-mono text-[#64748B] tabular-nums">
                    01 / STUDIO
                  </span>
                </figcaption>
              </figure>

              <figure className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F4F6F9]">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E2E8F0]">
                  <img
                    src="/demo/umkm-jasa-tools.webp"
                    alt="Peralatan clipper, gunting, dan handuk steril studio"
                    loading="eager"
                    className="absolute inset-0 block h-full w-full object-cover"
                  />
                </div>
                <figcaption className="flex items-center justify-between gap-4 border-t border-[#E2E8F0] bg-[#FFFFFF] px-5 py-3.5 text-xs">
                  <span className="font-semibold text-[#0F172A]">
                    Clipper, Gunting &amp; Perawatan Steril UV-C
                  </span>
                  <span className="font-mono text-[#64748B] tabular-nums">
                    02 / TOOLS
                  </span>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section
          id="keunggulan"
          className="scroll-mt-16 border-b border-[#E2E8F0] bg-[#FFFFFF] py-14 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div>
              <p className="border-l-2 border-[#0F766E] pl-3 font-mono text-xs font-semibold uppercase tracking-widest text-[#0F766E]">
                03 / Standar Layanan
              </p>
              <h2 className="mt-2 font-archivo text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">
                Kenapa Pelanggan Rutin Kembali
              </h2>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {data.highlights.map((pillar, idx) => (
                <div
                  key={pillar.title}
                  className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-[#F4F6F9] p-6"
                >
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                    <span className="font-mono text-xs font-bold tracking-wider text-[#0F766E] tabular-nums">
                      0{idx + 1}
                    </span>
                    <ShieldCheck
                      size={16}
                      weight="bold"
                      className="text-[#0F766E]"
                    />
                  </div>
                  <div className="mt-6">
                    <h3 className="font-archivo text-lg font-bold tracking-tight text-[#0F172A]">
                      {pillar.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-[#475569]">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#E2E8F0] bg-[#F4F6F9] py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div>
              <p className="border-l-2 border-[#0F766E] pl-3 font-mono text-xs font-semibold uppercase tracking-widest text-[#0F766E]">
                04 / Ulasan Pelanggan
              </p>
              <h2 className="mt-2 font-archivo text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">
                Pengalaman Pelanggan di Kursi Kami
              </h2>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              {data.testimonials.map((review) => (
                <blockquote
                  key={`${review.author}-${review.role}`}
                  className="flex flex-col justify-between gap-5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6"
                >
                  <div>
                    <Quotes
                      size={20}
                      weight="fill"
                      className="text-[#0F766E]"
                    />
                    <p className="mt-3 text-sm leading-relaxed text-[#0F172A] sm:text-base">
                      &ldquo;{review.quote}&rdquo;
                    </p>
                  </div>
                  <footer className="border-t border-[#E2E8F0] pt-4 text-xs text-[#475569]">
                    <span className="font-semibold text-[#0F172A]">
                      {review.author}
                    </span>
                    <span> - {review.role}</span>
                  </footer>
                </blockquote>
              ))}
            </div>

            {faqs.length > 0 && (
              <div className="mt-14 border-t border-[#E2E8F0] pt-12">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                  <div className="lg:col-span-4">
                    <p className="border-l-2 border-[#0F766E] pl-3 font-mono text-xs font-semibold uppercase tracking-widest text-[#0F766E]">
                      Tanya Jawab
                    </p>
                    <h3 className="mt-2 font-archivo text-xl font-extrabold tracking-tight text-[#0F172A] sm:text-2xl">
                      Ketentuan Slot &amp; Kedatangan
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                      Informasi singkat soal toleransi keterlambatan, pilihan
                      kapster, dan pembayaran di studio.
                    </p>
                  </div>

                  <div className="divide-y divide-[#E2E8F0] rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] lg:col-span-8">
                    {faqs.map((faq, idx) => {
                      const isOpen = openFaqIndex === idx;
                      return (
                        <div key={faq.question}>
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            onClick={() =>
                              setOpenFaqIndex(isOpen ? null : idx)
                            }
                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#F4F6F9] sm:px-6"
                          >
                            <span className="text-sm font-semibold text-[#0F172A] sm:text-base">
                              {faq.question}
                            </span>
                            <CaretDown
                              size={16}
                              weight="bold"
                              className={cn(
                                "shrink-0 text-[#475569] transition-transform duration-200",
                                isOpen && "rotate-180 text-[#0F766E]"
                              )}
                            />
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={
                                  prefersReducedMotion
                                    ? false
                                    : { height: 0, opacity: 0 }
                                }
                                animate={{ height: "auto", opacity: 1 }}
                                exit={
                                  prefersReducedMotion
                                    ? { opacity: 0 }
                                    : { height: 0, opacity: 0 }
                                }
                                transition={{
                                  duration: prefersReducedMotion ? 0 : 0.2,
                                  ease: EASE_OUT,
                                }}
                                className="overflow-hidden"
                              >
                                <p className="px-5 pb-4 text-sm leading-relaxed text-[#475569] sm:px-6">
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
              </div>
            )}
          </div>
        </section>

        <section
          id="lokasi"
          className="scroll-mt-16 bg-[#FFFFFF] py-14 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-8 rounded-xl border border-[#E2E8F0] bg-[#F4F6F9] p-6 sm:p-10 lg:grid-cols-12">
              <div className="flex flex-col justify-between lg:col-span-7">
                <div>
                  <p className="border-l-2 border-[#0F766E] pl-3 font-mono text-xs font-semibold uppercase tracking-widest text-[#0F766E]">
                    05 / Lokasi Studio
                  </p>
                  <h2 className="mt-2 font-archivo text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">
                    {data.businessName} - {data.cityLabel}
                  </h2>

                  <div className="mt-6 space-y-3 text-sm text-[#475569] sm:text-base">
                    <div className="flex items-start gap-3">
                      <MapPin
                        size={18}
                        weight="bold"
                        className="mt-1 shrink-0 text-[#0F766E]"
                      />
                      <span>{data.address}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock
                        size={18}
                        weight="bold"
                        className="mt-1 shrink-0 text-[#0F766E]"
                      />
                      <span className="font-mono text-sm tabular-nums">
                        {data.openHoursLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#booking-panel"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#115E59]"
                  >
                    <Calendar size={16} weight="bold" />
                    <span>Pilih Jam Kedatangan</span>
                  </a>
                  <a
                    href={directChatUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-[#CBD5E1] bg-[#FFFFFF] px-5 py-3 text-sm font-semibold text-[#0F172A] transition-colors hover:border-[#0F172A]"
                  >
                    <WhatsappLogo
                      size={16}
                      weight="bold"
                      className="text-[#0F766E]"
                    />
                    <span>Chat Admin Studio</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5">
                <a
                  href={data.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col justify-between rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] p-5 transition-colors hover:border-[#0F766E]"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                    <div>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#0F766E]">
                        Google Maps Pin
                      </span>
                      <p className="mt-1 font-archivo text-base font-bold text-[#0F172A]">
                        {data.businessName}
                      </p>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#E2E8F0] bg-[#F4F6F9] text-[#0F766E] transition-colors group-hover:bg-[#0F766E] group-hover:text-white">
                      <ArrowUpRight size={17} weight="bold" />
                    </span>
                  </div>

                  <div className="my-5 rounded-lg border border-[#E2E8F0] bg-[#F4F6F9] p-4">
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-[#0F172A]">
                      <MapPin
                        size={16}
                        weight="fill"
                        className="shrink-0 text-[#0F766E]"
                      />
                      <span>{data.cityLabel}</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-[#475569]">
                      {data.address}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-[#0F766E]">
                    <span>Buka Rute di Google Maps</span>
                    <ArrowRight size={15} weight="bold" />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E2E8F0] bg-[#FFFFFF] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="font-archivo text-sm font-bold text-[#0F172A]">
              {data.businessName}
            </p>
            <p className="mt-0.5 text-xs text-[#475569]">
              {data.cityLabel} - {data.openHoursLabel}
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <p className="font-mono text-xs text-[#475569]">
              Siap pakai domain pribadi: {customDomainHost}
            </p>
            <Link
              href="/"
              className="text-xs font-medium text-[#475569] transition-colors hover:text-[#0F172A]"
            >
              Template Jasa &amp; Booking oleh KatalogWeb
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
