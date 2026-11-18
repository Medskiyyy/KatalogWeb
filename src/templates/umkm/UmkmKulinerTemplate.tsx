"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BowlFood,
  Calculator,
  CalendarCheck,
  CaretDown,
  Check,
  ChefHat,
  Clock,
  CookingPot,
  Fire,
  MagnifyingGlass,
  MapPin,
  Minus,
  Plus,
  Quotes,
  ShoppingBag,
  Trash,
  WhatsappLogo,
  X,
} from "@phosphor-icons/react";
import type { UmkmSiteConfig } from "@/lib/schema";
import {
  buildWhatsAppUrl,
  cn,
  formatRupiah,
  formatUmkmWhatsAppMessage,
} from "@/lib/utils";

type FulfillmentMethod = "Ambil di Tempat" | "Kurir Instan";
type UmkmProduct = UmkmSiteConfig["data"]["products"][number];

interface CateringTier {
  id: string;
  name: string;
  pricePerPortion: number;
  unitLabel: string;
  summary: string;
}

const CATERING_TIERS: CateringTier[] = [
  {
    id: "paket-hemat",
    name: "Paket Hemat",
    pricePerPortion: 29000,
    unitLabel: "box",
    summary: "Nasi putih pulen, rendang atau ayam serundeng, tumisan & kerupuk",
  },
  {
    id: "nasi-liwet-komplit",
    name: "Nasi Liwet Komplit",
    pricePerPortion: 35000,
    unitLabel: "box",
    summary: "Nasi liwet serai, ayam kampung lengkuas, orek tempe & sambal terasi",
  },
  {
    id: "tumpeng-syukuran",
    name: "Tumpeng Syukuran",
    pricePerPortion: 31000,
    unitLabel: "porsi",
    summary: "Nasi kuning gurih komplit ayam bakar rujak, urap, perkedel & balado",
  },
];

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

function makeCartKey(productId: string, option?: string): string {
  return option ? `${productId}::${option}` : productId;
}

export function UmkmKulinerTemplate({
  site,
  embedded = false,
}: {
  site: UmkmSiteConfig;
  embedded?: boolean;
}) {
  const { data } = site;
  const prefersReducedMotion = useReducedMotion();

  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [cart, setCart] = useState<Record<string, number>>({});
  const [selectedProduct, setSelectedProduct] = useState<UmkmProduct | null>(
    null
  );
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [boxCount, setBoxCount] = useState<number>(35);
  const [selectedTierId, setSelectedTierId] = useState<string>(
    CATERING_TIERS[1].id
  );

  const [customerName, setCustomerName] = useState("");
  const [fulfillment, setFulfillment] =
    useState<FulfillmentMethod>("Ambil di Tempat");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [addressError, setAddressError] = useState(false);

  useEffect(() => {
    const urls = Array.from(
      new Set([
        data.heroImageUrl,
        ...data.products.map((product) => product.imageUrl),
      ])
    );

    urls.forEach((src) => {
      if (!src) return;
      const img = new window.Image();
      img.src = src;
    });
  }, [data.heroImageUrl, data.products]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(data.products.map((p) => p.category)));
    return ["Semua", ...unique];
  }, [data.products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return data.products.filter((product) => {
      const matchesCategory =
        activeCategory === "Semua" || product.category === activeCategory;
      if (!matchesCategory) return false;
      if (!normalizedQuery) return true;
      return (
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [activeCategory, data.products, searchQuery]);

  const promoProduct = useMemo(() => {
    if (!data.promoBanner) return undefined;
    return (
      data.products.find((p) => p.id === data.promoBanner?.productId) ??
      data.products[0]
    );
  }, [data.products, data.promoBanner]);

  function getActiveOption(product: UmkmProduct): string | undefined {
    if (!product.options || product.options.length === 0) return undefined;
    return selectedOptions[product.id] ?? product.options[0];
  }

  function setProductOption(productId: string, option: string) {
    setSelectedOptions((prev) => ({
      ...prev,
      [productId]: option,
    }));
  }

  const cartItems = useMemo(() => {
    const productMap = new Map(data.products.map((p) => [p.id, p]));
    return Object.entries(cart)
      .map(([key, qty]) => {
        if (qty <= 0) return null;
        const separatorIdx = key.indexOf("::");
        const productId = separatorIdx === -1 ? key : key.slice(0, separatorIdx);
        const option =
          separatorIdx === -1 ? undefined : key.slice(separatorIdx + 2);
        const product = productMap.get(productId);
        if (!product) return null;
        return {
          key,
          product,
          option,
          qty,
        };
      })
      .filter(
        (
          entry
        ): entry is {
          key: string;
          product: UmkmProduct;
          option: string | undefined;
          qty: number;
        } => entry !== null
      );
  }, [cart, data.products]);

  const totalQty = useMemo(
    () => cartItems.reduce((sum, entry) => sum + entry.qty, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, entry) => sum + entry.product.price * entry.qty,
        0
      ),
    [cartItems]
  );

  const directChatUrl = useMemo(
    () =>
      buildWhatsAppUrl(
        data.whatsappNumber,
        `Halo ${data.businessName}, saya mau tanya menu yang ready hari ini dan jadwal pengiriman.`
      ),
    [data.businessName, data.whatsappNumber]
  );

  const selectedTier = useMemo(
    () =>
      CATERING_TIERS.find((tier) => tier.id === selectedTierId) ??
      CATERING_TIERS[0],
    [selectedTierId]
  );

  const cateringEstimate = useMemo(() => {
    const rawTotal = boxCount * selectedTier.pricePerPortion;
    const hasVolumeDiscount = boxCount >= 50;
    const discountAmount = hasVolumeDiscount ? Math.round(rawTotal * 0.05) : 0;
    const finalTotal = rawTotal - discountAmount;
    return {
      rawTotal,
      hasVolumeDiscount,
      discountAmount,
      finalTotal,
    };
  }, [boxCount, selectedTier]);

  const cateringWhatsAppUrl = useMemo(() => {
    const discountText = cateringEstimate.hasVolumeDiscount
      ? ` (sudah termasuk estimasi potongan katering besar 5% sebesar ${formatRupiah(cateringEstimate.discountAmount)})`
      : "";
    const message = [
      `Halo ${data.businessName}, saya mau tanya ketersediaan jadwal katering:`,
      `- Pilihan Paket: ${selectedTier.name} (${formatRupiah(selectedTier.pricePerPortion)}/${selectedTier.unitLabel})`,
      `- Jumlah Pesanan: ${boxCount} ${selectedTier.unitLabel}`,
      `- Estimasi Total: ${formatRupiah(cateringEstimate.finalTotal)}${discountText}`,
      "",
      "Mohon info slot tanggal antar dan detail lauknya ya.",
    ].join("\n");
    return buildWhatsAppUrl(data.whatsappNumber, message);
  }, [
    boxCount,
    cateringEstimate.discountAmount,
    cateringEstimate.finalTotal,
    cateringEstimate.hasVolumeDiscount,
    data.businessName,
    data.whatsappNumber,
    selectedTier,
  ]);

  const hasActiveOverlay = isDrawerOpen || selectedProduct !== null;

  useEffect(() => {
    if (!hasActiveOverlay) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isDrawerOpen) {
          setIsDrawerOpen(false);
        } else if (selectedProduct) {
          setSelectedProduct(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    if (!embedded) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = prevOverflow;
      };
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasActiveOverlay, isDrawerOpen, selectedProduct, embedded]);

  function addOneByKey(key: string) {
    setCart((prev) => ({
      ...prev,
      [key]: (prev[key] ?? 0) + 1,
    }));
  }

  function decrementByKey(key: string) {
    setCart((prev) => {
      const nextQty = (prev[key] ?? 0) - 1;
      if (nextQty <= 0) {
        const rest = { ...prev };
        delete rest[key];
        return rest;
      }
      return { ...prev, [key]: nextQty };
    });
  }

  function removeItemByKey(key: string) {
    setCart((prev) => {
      const rest = { ...prev };
      delete rest[key];
      return rest;
    });
  }

  function handleCheckoutSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cartItems.length === 0) return;

    if (fulfillment === "Kurir Instan" && !address.trim()) {
      setAddressError(true);
      return;
    }

    setAddressError(false);

    const message = formatUmkmWhatsAppMessage({
      businessName: data.businessName,
      items: cartItems.map(({ product, option, qty }) => ({
        name: option ? `${product.name} (${option})` : product.name,
        price: product.price,
        qty,
        unitLabel: product.unitLabel,
      })),
      customerName,
      fulfillment,
      address,
      notes,
    });

    const whatsappUrl = buildWhatsAppUrl(data.whatsappNumber, message);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  const primaryHighlight = data.highlights[0];
  const secondaryHighlights = data.highlights.slice(1, 3);
  const stats = data.stats ?? [];
  const faqs = data.faqs ?? [];
  const customDomainHost = `${site.slug.replace(/-/g, "")}.my.id`;

  const promoCartQty = useMemo(() => {
    if (!promoProduct) return 0;
    return cartItems
      .filter((item) => item.product.id === promoProduct.id)
      .reduce((sum, item) => sum + item.qty, 0);
  }, [cartItems, promoProduct]);

  const highlightIcons = [Fire, CookingPot, ChefHat];

  return (
    <div
      id="top"
      className="relative min-h-full bg-[#FFFFFF] font-sans text-[#1C1917] selection:bg-[#C2410C]/15 selection:text-[#9A3412]"
    >
      <header className="sticky top-0 z-20 border-b border-[#E7E5E4] bg-[#FFFFFF]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a
            href="#top"
            className="flex min-w-0 items-center gap-2.5 whitespace-nowrap"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF7ED] text-[#C2410C] ring-1 ring-[#FED7AA]">
              <CookingPot size={18} weight="bold" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-archivo text-base font-extrabold tracking-tight text-[#1C1917] sm:text-lg">
                {data.businessName}
              </span>
              <span className="hidden text-[11px] font-medium text-[#57534E] sm:block">
                {data.openHoursLabel}
              </span>
            </span>
          </a>

          <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-6 text-sm font-medium text-[#57534E] md:flex"
          >
            <a
              href="#menu"
              className="whitespace-nowrap transition-colors hover:text-[#1C1917]"
            >
              Buku Menu
            </a>
            <a
              href="#kalkulator"
              className="whitespace-nowrap transition-colors hover:text-[#1C1917]"
            >
              Kalkulator Katering
            </a>
            {data.promoBanner && (
              <a
                href="#paket-tumpeng"
                className="whitespace-nowrap transition-colors hover:text-[#1C1917]"
              >
                Tumpeng &amp; Hantaran
              </a>
            )}
            <a
              href="#lokasi"
              className="whitespace-nowrap transition-colors hover:text-[#1C1917]"
            >
              Lokasi
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm",
              totalQty > 0
                ? "bg-[#C2410C] text-white hover:bg-[#9A3412]"
                : "border border-[#E7E5E4] bg-[#FFF7ED] text-[#1C1917] hover:bg-[#FFEDD5]"
            )}
          >
            <ShoppingBag size={17} weight="bold" />
            <span>
              Keranjang{" "}
              <span className="font-mono tabular-nums">({totalQty})</span>
            </span>
          </button>
        </div>
      </header>

      <main>
        <section
          className={cn(
            "border-b border-[#E7E5E4] bg-gradient-to-b from-[#FFF7ED]/70 via-[#FFFFFF] to-[#FFFFFF] pt-9 pb-12 sm:pt-12 sm:pb-14",
            !embedded && "flex min-h-[calc(100dvh-4rem)] flex-col justify-between"
          )}
        >
          <div className="mx-auto my-auto grid w-full max-w-6xl grid-cols-1 items-center gap-9 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 border-b border-[#E7E5E4] pb-3.5 text-xs text-[#57534E]">
                <span className="inline-flex items-center gap-1.5 rounded-sm border border-[#FED7AA] bg-[#FFF7ED] px-2 py-0.5 font-semibold text-[#9A3412]">
                  <MapPin size={12} weight="bold" />
                  <span>{data.cityLabel}</span>
                </span>
                <span className="font-semibold text-[#1C1917]">
                  {data.categoryLabel}
                </span>
                <span aria-hidden="true">/</span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={13} weight="bold" className="text-[#C2410C]" />
                  <span>{data.openHoursLabel}</span>
                </span>
              </div>

              <h1 className="mt-6 font-archivo text-3xl font-extrabold leading-[1.08] tracking-tight text-[#1C1917] sm:text-4xl lg:text-[3.05rem]">
                {data.tagline}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#57534E] sm:text-lg">
                {data.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#menu"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9A3412]"
                >
                  <span>Lihat Buku Menu</span>
                  <ArrowRight size={16} weight="bold" />
                </a>
                <a
                  href={directChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D6D3D1] bg-[#FFFFFF] px-5 py-3 text-sm font-semibold text-[#1C1917] transition-colors hover:bg-[#FFF7ED]"
                >
                  <WhatsappLogo
                    size={18}
                    weight="bold"
                    className="text-[#C2410C]"
                  />
                  <span>Chat Dapur via WA</span>
                </a>
              </div>

              <div className="mt-6 flex items-start gap-2 text-xs font-medium text-[#57534E]">
                <MapPin
                  size={15}
                  weight="bold"
                  className="mt-0.5 shrink-0 text-[#C2410C]"
                />
                <span>{data.address}</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#FED7AA] bg-[#FFF7ED]">
                <img
                  src={data.heroImageUrl}
                  alt={`${data.businessName} - ${data.categoryLabel}`}
                  loading="eager"
                  className="absolute inset-0 block h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {stats.length > 0 && (
            <div className="mx-auto mt-10 w-full max-w-6xl px-4 sm:px-6">
              <dl className="grid grid-cols-1 divide-y divide-[#FED7AA] rounded-xl border border-[#FED7AA] bg-[#FFF7ED] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-baseline justify-between gap-4 px-5 py-4 sm:block sm:px-6 sm:py-5"
                  >
                    <dt className="order-2 text-xs font-medium text-[#57534E] sm:order-none sm:mt-1 sm:text-sm">
                      {stat.label}
                    </dt>
                    <dd className="order-1 font-mono text-xl font-bold tracking-tight text-[#1C1917] tabular-nums sm:order-none sm:text-2xl">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>

        <section
          id="kalkulator"
          className="scroll-mt-16 border-b border-[#E7E5E4] bg-[#FFF7ED] py-14 sm:py-16"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-5">
                <p className="border-l-2 border-[#C2410C] pl-3 text-xs font-semibold uppercase tracking-widest text-[#C2410C]">
                  Simulasi Acara &amp; Rapat
                </p>
                <h2 className="mt-3 font-archivo text-2xl font-extrabold tracking-tight text-[#1C1917] sm:text-3xl">
                  Kalkulator Estimasi Porsi Katering
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#57534E] sm:text-base">
                  Geser jumlah box atau porsi acara dan pilih paket hidangan di
                  samping untuk langsung melihat perkiraan biaya katering. Pesan
                  mulai 50 box otomatis mendapat potongan harga katering 5%.
                </p>

                <div className="mt-6 space-y-2.5 rounded-xl border border-[#FED7AA] bg-[#FFFFFF] p-4 text-xs text-[#57534E]">
                  <div className="flex items-center gap-2 font-semibold text-[#1C1917]">
                    <CalendarCheck
                      size={16}
                      weight="bold"
                      className="shrink-0 text-[#C2410C]"
                    />
                    <span>Sudah termasuk perlengkapan makan</span>
                  </div>
                  <p className="leading-relaxed">
                    Setiap pemesanan paket kotak sudah lengkap dengan sendok,
                    tisu, label acara bila diperlukan, dan pengemasan dus rapi
                    siap bagikan.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#FED7AA] bg-[#FFFFFF] p-5 shadow-sm sm:p-7 lg:col-span-7">
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <label
                      htmlFor="catering-box-slider"
                      className="text-sm font-bold text-[#1C1917]"
                    >
                      Jumlah Kebutuhan ({selectedTier.unitLabel})
                    </label>
                    <span className="font-mono text-2xl font-bold tabular-nums text-[#C2410C]">
                      {boxCount} {selectedTier.unitLabel}
                    </span>
                  </div>

                  <input
                    id="catering-box-slider"
                    type="range"
                    min={10}
                    max={200}
                    step={5}
                    value={boxCount}
                    onChange={(event) =>
                      setBoxCount(Number(event.target.value))
                    }
                    className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#FFEDD5] accent-[#C2410C]"
                  />

                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-[#57534E] tabular-nums">
                    <span>10</span>
                    <span>50 (Hemat 5%)</span>
                    <span>100</span>
                    <span>150</span>
                    <span>200</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {[15, 30, 50, 100, 150].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBoxCount(preset)}
                        className={cn(
                          "rounded-md border px-2.5 py-1 font-mono text-xs font-semibold tabular-nums transition-colors",
                          boxCount === preset
                            ? "border-[#C2410C] bg-[#C2410C] text-white"
                            : "border-[#E7E5E4] bg-[#FFF7ED] text-[#57534E] hover:border-[#FED7AA] hover:text-[#1C1917]"
                        )}
                      >
                        {preset} {selectedTier.unitLabel}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 border-t border-[#F5F5F4] pt-5">
                  <span className="block text-sm font-bold text-[#1C1917]">
                    Pilih Paket Menu Katering
                  </span>
                  <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    {CATERING_TIERS.map((tier) => {
                      const active = tier.id === selectedTier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setSelectedTierId(tier.id)}
                          className={cn(
                            "flex flex-col justify-between rounded-xl border p-3.5 text-left transition-colors",
                            active
                              ? "border-[#C2410C] bg-[#FFF7ED]"
                              : "border-[#E7E5E4] bg-[#FFFFFF] hover:border-[#FED7AA]"
                          )}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-[#1C1917]">
                                {tier.name}
                              </span>
                              {active && (
                                <Check
                                  size={14}
                                  weight="bold"
                                  className="shrink-0 text-[#C2410C]"
                                />
                              )}
                            </div>
                            <p className="mt-1 text-[11px] leading-snug text-[#57534E]">
                              {tier.summary}
                            </p>
                          </div>
                          <p className="mt-3 font-mono text-xs font-bold tabular-nums text-[#C2410C]">
                            {formatRupiah(tier.pricePerPortion)}/{tier.unitLabel}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-[#E7E5E4] bg-[#FFF7ED]/70 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-[#57534E]">
                        <Calculator
                          size={14}
                          weight="bold"
                          className="text-[#C2410C]"
                        />
                        <span>Estimasi Total Biaya Katering</span>
                      </span>
                      <div className="mt-1 flex flex-wrap items-baseline gap-2.5">
                        <span className="font-mono text-2xl font-bold tabular-nums text-[#1C1917] sm:text-3xl">
                          {formatRupiah(cateringEstimate.finalTotal)}
                        </span>
                        {cateringEstimate.hasVolumeDiscount && (
                          <span className="font-mono text-xs text-[#57534E] line-through tabular-nums">
                            {formatRupiah(cateringEstimate.rawTotal)}
                          </span>
                        )}
                      </div>
                    </div>

                    <a
                      href={cateringWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#9A3412] sm:text-sm"
                    >
                      <WhatsappLogo size={17} weight="bold" />
                      <span>Tanya Jadwal Katering Ini ke WhatsApp</span>
                    </a>
                  </div>

                  <p className="mt-3 border-t border-[#FED7AA] pt-3 text-xs font-medium text-[#9A3412]">
                    {cateringEstimate.hasVolumeDiscount
                      ? `Potongan katering besar 5% aktif (hemat ${formatRupiah(cateringEstimate.discountAmount)}) untuk pemesanan ${boxCount} ${selectedTier.unitLabel}.`
                      : `Tambah hingga 50 ${selectedTier.unitLabel} untuk otomatis mendapatkan potongan harga katering 5%.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="menu" className="scroll-mt-16 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#C2410C]">
                  Buku Menu Kuliner
                </p>
                <h2 className="mt-2 font-archivo text-2xl font-extrabold tracking-tight text-[#1C1917] sm:text-3xl">
                  Pilih Hidangan Favorit Keluarga &amp; Kantor
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#57534E]">
                  Pilih level sambal langsung di kartu menu, atur jumlah porsi,
                  lalu kirim pesanan langsung ke WhatsApp dapur tanpa perantara.
                </p>
              </div>

              <div className="relative w-full lg:w-80">
                <MagnifyingGlass
                  size={17}
                  weight="bold"
                  className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#57534E]"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Cari nasi liwet, tumpeng, atau kue..."
                  aria-label="Cari menu kuliner"
                  className="w-full rounded-lg border border-[#D6D3D1] bg-[#FFFFFF] py-2.5 pr-9 pl-10 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#C2410C] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Hapus pencarian"
                    className="absolute top-1/2 right-2.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#57534E] hover:bg-[#FFF7ED] hover:text-[#1C1917]"
                  >
                    <X size={14} weight="bold" />
                  </button>
                )}
              </div>
            </div>

            <div
              role="tablist"
              aria-label="Filter kategori menu"
              className="mt-7 flex flex-wrap gap-1 border-b border-[#E7E5E4]"
            >
              {categories.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                      "relative px-4 py-2.5 text-xs font-semibold transition-colors sm:text-sm",
                      isActive
                        ? "text-[#1C1917]"
                        : "text-[#57534E] hover:text-[#1C1917]"
                    )}
                  >
                    <span>{category}</span>
                    {isActive && (
                      <motion.span
                        layoutId="kulinerCategoryTab"
                        transition={
                          prefersReducedMotion
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 420, damping: 34 }
                        }
                        className="absolute inset-x-1 bottom-0 h-0.5 bg-[#C2410C]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="mt-10 rounded-xl border border-[#E7E5E4] bg-[#FFF7ED]/70 p-10 text-center">
                <p className="text-base font-semibold text-[#1C1917]">
                  Menu tidak ditemukan
                </p>
                <p className="mt-1.5 text-sm text-[#57534E]">
                  Coba kata kunci lain atau pilih kategori Semua untuk melihat
                  seluruh daftar menu dapur.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("Semua");
                  }}
                  className="mt-5 inline-flex items-center rounded-lg border border-[#D6D3D1] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold text-[#1C1917] transition-colors hover:bg-[#FFF7ED]"
                >
                  Tampilkan Semua Menu
                </button>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                {filteredProducts.map((product) => {
                  const activeOption = getActiveOption(product);
                  const cartKey = makeCartKey(product.id, activeOption);
                  const qty = cart[cartKey] ?? 0;

                  return (
                    <article
                      key={product.id}
                      className="flex flex-col overflow-hidden rounded-2xl border border-[#E7E5E4] bg-[#FFFFFF] transition-colors hover:border-[#FED7AA] sm:flex-row"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(product)}
                        aria-label={`Lihat detail ${product.name}`}
                        className="group relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#FFF7ED] text-left sm:aspect-auto sm:w-48 md:w-52"
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          loading="eager"
                          className="absolute inset-0 block h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </button>

                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div>
                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <span className="font-semibold uppercase tracking-wider text-[#57534E]">
                              {product.category}
                            </span>
                            {product.featured && (
                              <span className="font-semibold text-[#C2410C]">
                                Favorit Dapur
                              </span>
                            )}
                          </div>

                          <h3 className="mt-1.5 font-archivo text-lg font-bold leading-snug text-[#1C1917]">
                            <button
                              type="button"
                              onClick={() => setSelectedProduct(product)}
                              className="text-left transition-colors hover:text-[#C2410C]"
                            >
                              {product.name}
                            </button>
                          </h3>

                          <p className="mt-1.5 text-sm leading-relaxed text-[#57534E]">
                            {product.description}
                          </p>

                          {product.options && product.options.length > 0 && (
                            <div className="mt-3.5">
                              <span className="block text-[11px] font-semibold text-[#57534E]">
                                Pilihan Varian:
                              </span>
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {product.options.map((option) => {
                                  const isSelected = activeOption === option;
                                  return (
                                    <button
                                      key={option}
                                      type="button"
                                      onClick={() =>
                                        setProductOption(product.id, option)
                                      }
                                      className={cn(
                                        "rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                                        isSelected
                                          ? "border-[#C2410C] bg-[#FFF7ED] text-[#9A3412]"
                                          : "border-[#E7E5E4] bg-[#FFFFFF] text-[#57534E] hover:border-[#FED7AA] hover:text-[#1C1917]"
                                      )}
                                    >
                                      {option}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#F5F5F4] pt-4">
                          <div className="min-w-0">
                            <span className="block font-mono text-base font-bold tabular-nums text-[#1C1917]">
                              {formatRupiah(product.price)}
                            </span>
                            <span className="block text-[11px] text-[#57534E]">
                              per {product.unitLabel}
                            </span>
                          </div>

                          {qty === 0 ? (
                            <button
                              type="button"
                              onClick={() => addOneByKey(cartKey)}
                              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#C2410C] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#9A3412]"
                            >
                              <Plus size={14} weight="bold" />
                              <span>Tambah</span>
                            </button>
                          ) : (
                            <div className="inline-flex shrink-0 items-center rounded-lg border border-[#FED7AA] bg-[#FFF7ED] p-0.5">
                              <button
                                type="button"
                                onClick={() => decrementByKey(cartKey)}
                                aria-label={`Kurangi ${product.name}`}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-[#1C1917] transition-colors hover:bg-[#FFFFFF]"
                              >
                                <Minus size={14} weight="bold" />
                              </button>
                              <span className="w-7 text-center font-mono text-xs font-semibold tabular-nums text-[#1C1917]">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => addOneByKey(cartKey)}
                                aria-label={`Tambah ${product.name}`}
                                className="flex h-7 w-7 items-center justify-center rounded-md bg-[#C2410C] text-white transition-colors hover:bg-[#9A3412]"
                              >
                                <Plus size={14} weight="bold" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {data.promoBanner && (
          <section
            id="paket-tumpeng"
            className="scroll-mt-16 bg-[#1C1917] py-14 text-white sm:py-16"
          >
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#44403C] bg-[#292524]">
                  <img
                    src={promoProduct?.imageUrl ?? "/demo/umkm-kuliner-hero.webp"}
                    alt={data.promoBanner.title}
                    loading="eager"
                    className="absolute inset-0 block h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-7">
                <p className="border-l-2 border-[#C2410C] pl-3 text-xs font-semibold uppercase tracking-widest text-[#FDBA74]">
                  Paket Tumpeng &amp; Hantaran Acara
                </p>
                <h2 className="mt-3 font-archivo text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {data.promoBanner.title}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#D6D3D1] sm:text-base">
                  {data.promoBanner.description}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-[#292524] pt-6">
                  <div>
                    <span className="block text-[11px] font-medium uppercase tracking-wider text-[#A8A29E]">
                      Harga Langsung Dapur
                    </span>
                    <span className="font-mono text-2xl font-bold tabular-nums text-white sm:text-3xl">
                      {data.promoBanner.priceLabel}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
                    {promoProduct && (
                      <button
                        type="button"
                        onClick={() => {
                          const option = getActiveOption(promoProduct);
                          addOneByKey(makeCartKey(promoProduct.id, option));
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9A3412]"
                      >
                        <Plus size={16} weight="bold" />
                        <span>Tambah ke Keranjang</span>
                      </button>
                    )}

                    {promoCartQty > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsDrawerOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#44403C] bg-[#292524] px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#44403C] sm:text-sm"
                      >
                        <span className="font-mono tabular-nums">
                          {promoCartQty} porsi
                        </span>
                        <span>di keranjang</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section
          id="keunggulan"
          className="scroll-mt-16 border-t border-[#E7E5E4] py-16 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#C2410C]">
                Standar Dapur Kami
              </p>
              <h2 className="mt-2 font-archivo text-2xl font-extrabold tracking-tight text-[#1C1917] sm:text-3xl">
                Kenapa Pelanggan Percayakan Acara di Sini
              </h2>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-12">
              {primaryHighlight && (
                <div className="flex min-h-[260px] flex-col justify-between rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] p-7 sm:p-9 md:col-span-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold tracking-wider text-[#C2410C] tabular-nums">
                      01
                    </span>
                    <Fire size={22} weight="bold" className="text-[#C2410C]" />
                  </div>
                  <div className="mt-10">
                    <h3 className="font-archivo text-xl font-bold tracking-tight text-[#1C1917] sm:text-2xl">
                      {primaryHighlight.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#57534E] sm:text-base">
                      {primaryHighlight.description}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-6 md:col-span-6">
                {secondaryHighlights.map((item, idx) => {
                  const IconComponent = highlightIcons[idx + 1] ?? BowlFood;
                  return (
                    <div
                      key={item.title}
                      className="flex flex-1 flex-col justify-between rounded-2xl border border-[#E7E5E4] bg-[#FFFFFF] p-6 sm:p-7"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold tracking-wider text-[#57534E] tabular-nums">
                          0{idx + 2}
                        </span>
                        <IconComponent
                          size={20}
                          weight="bold"
                          className="text-[#C2410C]"
                        />
                      </div>
                      <div className="mt-4">
                        <h3 className="font-archivo text-lg font-bold tracking-tight text-[#1C1917]">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#57534E]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#E7E5E4] bg-[#FFF7ED]/60 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#C2410C]">
                Testimoni Pelanggan
              </p>
              <h2 className="mt-2 font-archivo text-2xl font-extrabold tracking-tight text-[#1C1917] sm:text-3xl">
                Cerita dari Acara &amp; Meja Makan Mereka
              </h2>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              {data.testimonials.map((item) => (
                <blockquote
                  key={`${item.author}-${item.role}`}
                  className="flex flex-col justify-between gap-5 rounded-xl border border-[#E7E5E4] bg-[#FFFFFF] p-6"
                >
                  <div>
                    <Quotes
                      size={20}
                      weight="fill"
                      className="text-[#C2410C]/80"
                    />
                    <p className="mt-3 text-sm leading-relaxed text-[#1C1917] sm:text-base">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>
                  <footer className="border-t border-[#F5F5F4] pt-4 text-xs text-[#57534E]">
                    <span className="font-semibold text-[#1C1917]">
                      {item.author}
                    </span>
                    <span> - {item.role}</span>
                  </footer>
                </blockquote>
              ))}
            </div>

            {faqs.length > 0 && (
              <div className="mt-14 border-t border-[#E7E5E4] pt-12">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                  <div className="lg:col-span-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#C2410C]">
                      Tanya Jawab
                    </p>
                    <h3 className="mt-2 font-archivo text-xl font-extrabold tracking-tight text-[#1C1917] sm:text-2xl">
                      Info Katering &amp; Pengiriman
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#57534E]">
                      Ketentuan minimal box, jadwal antar subuh, pembagian level
                      pedas, hingga metode pembayaran.
                    </p>
                  </div>

                  <div className="divide-y divide-[#E7E5E4] rounded-xl border border-[#E7E5E4] bg-[#FFFFFF] lg:col-span-8">
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
                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#FFF7ED]/70 sm:px-6"
                          >
                            <span className="text-sm font-semibold text-[#1C1917] sm:text-base">
                              {faq.question}
                            </span>
                            <CaretDown
                              size={16}
                              weight="bold"
                              className={cn(
                                "shrink-0 text-[#57534E] transition-transform duration-200",
                                isOpen && "rotate-180 text-[#C2410C]"
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
                                  duration: prefersReducedMotion ? 0 : 0.22,
                                  ease: EASE_OUT,
                                }}
                                className="overflow-hidden"
                              >
                                <p className="px-5 pb-4 text-sm leading-relaxed text-[#57534E] sm:px-6">
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
          className="scroll-mt-16 border-t border-[#E7E5E4] py-16 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 items-center gap-8 rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] p-6 sm:p-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#C2410C]">
                  Lokasi Dapur &amp; Ambil Pesanan
                </p>
                <h2 className="mt-2 font-archivo text-2xl font-extrabold tracking-tight text-[#1C1917] sm:text-3xl">
                  {data.businessName} - {data.cityLabel}
                </h2>

                <div className="mt-6 space-y-3 text-sm text-[#57534E] sm:text-base">
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={18}
                      weight="bold"
                      className="mt-1 shrink-0 text-[#C2410C]"
                    />
                    <span>{data.address}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock
                      size={18}
                      weight="bold"
                      className="mt-1 shrink-0 text-[#C2410C]"
                    />
                    <span>{data.openHoursLabel}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:flex-col lg:items-end">
                <a
                  href={data.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9A3412]"
                >
                  <MapPin size={16} weight="bold" />
                  <span>Buka Google Maps</span>
                </a>
                <a
                  href={directChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D6D3D1] bg-[#FFFFFF] px-5 py-3 text-sm font-semibold text-[#1C1917] transition-colors hover:bg-[#FFF7ED]"
                >
                  <WhatsappLogo
                    size={16}
                    weight="bold"
                    className="text-[#C2410C]"
                  />
                  <span>Konsultasi Menu Acara via WA</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer
        className={cn(
          "border-t border-[#E7E5E4] bg-[#FFFFFF] py-10",
          totalQty > 0 && "pb-24"
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="text-sm font-semibold text-[#1C1917]">
              {data.businessName}
            </p>
            <p className="mt-0.5 text-xs text-[#57534E]">
              {data.cityLabel} - {data.openHoursLabel}
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <p className="font-mono text-xs text-[#57534E]">
              Siap pakai alamat web sendiri: {customDomainHost}
            </p>
            <Link
              href="/"
              className="text-xs font-medium text-[#57534E] transition-colors hover:text-[#1C1917]"
            >
              Etalase Kuliner oleh KatalogWeb
            </Link>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {totalQty > 0 && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.24,
              ease: EASE_OUT,
            }}
            className={cn(
              "z-30 mx-auto max-w-6xl px-4 sm:px-6",
              embedded ? "sticky bottom-4 pb-4" : "fixed inset-x-0 bottom-4"
            )}
          >
            <div className="flex items-center justify-between gap-4 rounded-xl border border-[#44403C] bg-[#1C1917] px-4 py-3 text-white shadow-lg sm:px-5 sm:py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <ShoppingBag
                  size={20}
                  weight="bold"
                  className="shrink-0 text-[#FDBA74]"
                />
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
                  <span className="font-mono font-semibold tabular-nums">
                    {totalQty} menu
                  </span>
                  <span className="text-[#A8A29E]" aria-hidden="true">
                    /
                  </span>
                  <span className="font-mono font-bold tabular-nums text-white">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="shrink-0 rounded-lg bg-[#C2410C] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#9A3412] sm:text-sm"
              >
                Lihat Keranjang
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="kuliner-product-modal-title"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
            className={cn(
              "inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]",
              embedded ? "absolute" : "fixed"
            )}
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, scale: 0.97, y: 10 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.97, y: 10 }
              }
              transition={{
                duration: prefersReducedMotion ? 0 : 0.22,
                ease: EASE_OUT,
              }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#E7E5E4] bg-[#FFFFFF] shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                aria-label="Tutup detail menu"
                className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-[#E7E5E4] bg-[#FFFFFF]/95 text-[#1C1917] transition-colors hover:bg-[#FFF7ED]"
              >
                <X size={18} weight="bold" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="relative aspect-square bg-[#FFF7ED] md:col-span-6">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    loading="eager"
                    className="absolute inset-0 block h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-col justify-between p-6 md:col-span-6">
                  <div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-semibold uppercase tracking-wider text-[#57534E]">
                        {selectedProduct.category}
                      </span>
                      {selectedProduct.featured && (
                        <span className="font-semibold text-[#C2410C]">
                          Favorit Dapur
                        </span>
                      )}
                    </div>

                    <h3
                      id="kuliner-product-modal-title"
                      className="mt-2 font-archivo text-2xl font-extrabold tracking-tight text-[#1C1917]"
                    >
                      {selectedProduct.name}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-[#57534E]">
                      {selectedProduct.description}
                    </p>

                    {selectedProduct.options &&
                      selectedProduct.options.length > 0 && (
                        <div className="mt-4">
                          <span className="block text-xs font-semibold text-[#1C1917]">
                            Pilih Varian / Level Sambal
                          </span>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {selectedProduct.options.map((option) => {
                              const currentOpt =
                                getActiveOption(selectedProduct);
                              const active = currentOpt === option;
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() =>
                                    setProductOption(selectedProduct.id, option)
                                  }
                                  className={cn(
                                    "rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors",
                                    active
                                      ? "border-[#C2410C] bg-[#FFF7ED] text-[#9A3412]"
                                      : "border-[#E7E5E4] bg-[#FFFFFF] text-[#57534E] hover:border-[#FED7AA]"
                                  )}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </div>

                  {(() => {
                    const activeOpt = getActiveOption(selectedProduct);
                    const modalKey = makeCartKey(selectedProduct.id, activeOpt);
                    const modalQty = cart[modalKey] ?? 0;

                    return (
                      <div className="mt-6 border-t border-[#E7E5E4] pt-5">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="font-mono text-2xl font-bold tabular-nums text-[#1C1917]">
                            {formatRupiah(selectedProduct.price)}
                          </span>
                          <span className="text-xs font-medium text-[#57534E]">
                            per {selectedProduct.unitLabel}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                          {modalQty === 0 ? (
                            <button
                              type="button"
                              onClick={() => addOneByKey(modalKey)}
                              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9A3412]"
                            >
                              <Plus size={16} weight="bold" />
                              <span>Tambah ke Keranjang</span>
                            </button>
                          ) : (
                            <>
                              <div className="inline-flex items-center rounded-lg border border-[#FED7AA] bg-[#FFF7ED] p-1">
                                <button
                                  type="button"
                                  onClick={() => decrementByKey(modalKey)}
                                  aria-label={`Kurangi ${selectedProduct.name}`}
                                  className="flex h-8 w-8 items-center justify-center rounded-md text-[#1C1917] transition-colors hover:bg-[#FFFFFF]"
                                >
                                  <Minus size={14} weight="bold" />
                                </button>
                                <span className="w-9 text-center font-mono text-sm font-semibold tabular-nums text-[#1C1917]">
                                  {modalQty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => addOneByKey(modalKey)}
                                  aria-label={`Tambah ${selectedProduct.name}`}
                                  className="flex h-8 w-8 items-center justify-center rounded-md bg-[#C2410C] text-white transition-colors hover:bg-[#9A3412]"
                                >
                                  <Plus size={14} weight="bold" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProduct(null);
                                  setIsDrawerOpen(true);
                                }}
                                className="flex-1 rounded-lg bg-[#1C1917] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#292524] sm:text-sm"
                              >
                                Buka Keranjang
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="kuliner-cart-drawer-title"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className={cn(
              "inset-0 z-40 flex justify-end bg-black/45 backdrop-blur-[1px]",
              embedded ? "absolute items-start" : "fixed"
            )}
            onClick={() => setIsDrawerOpen(false)}
          >
            <motion.div
              initial={prefersReducedMotion ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.26,
                ease: EASE_OUT,
              }}
              className={cn(
                "flex w-full max-w-md flex-col bg-[#FFFFFF] shadow-2xl",
                embedded ? "sticky top-0 h-[100dvh] max-h-full" : "h-full"
              )}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#E7E5E4] px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag
                    size={20}
                    weight="bold"
                    className="text-[#C2410C]"
                  />
                  <h2
                    id="kuliner-cart-drawer-title"
                    className="text-base font-bold text-[#1C1917]"
                  >
                    Keranjang Pesanan
                  </h2>
                  <span className="rounded-md bg-[#FFF7ED] px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-[#9A3412]">
                    {totalQty}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  aria-label="Tutup keranjang"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#57534E] transition-colors hover:bg-[#FFF7ED] hover:text-[#1C1917]"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF7ED] text-[#C2410C]">
                    <ShoppingBag size={22} weight="bold" />
                  </div>
                  <p className="mt-4 text-base font-semibold text-[#1C1917]">
                    Keranjang masih kosong
                  </p>
                  <p className="mt-1.5 max-w-xs text-sm text-[#57534E]">
                    Pilih nasi liwet, paket rapat kantor, tumpeng mini, atau kue
                    basah untuk langsung kirim rincian ke WhatsApp dapur.
                  </p>
                  <a
                    href="#menu"
                    onClick={() => setIsDrawerOpen(false)}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#C2410C] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9A3412]"
                  >
                    <span>Pilih Menu Dapur</span>
                  </a>
                </div>
              ) : (
                <form
                  onSubmit={handleCheckoutSubmit}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <div className="flex-1 space-y-6 overflow-y-auto p-5">
                    <ul className="divide-y divide-[#F5F5F4]">
                      {cartItems.map(({ key, product, option, qty }) => (
                        <li
                          key={key}
                          className="flex items-start justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#1C1917]">
                              {product.name}
                            </p>
                            {option && (
                              <p className="mt-0.5 text-xs font-medium text-[#C2410C]">
                                {option}
                              </p>
                            )}
                            <p className="mt-0.5 font-mono text-xs tabular-nums text-[#57534E]">
                              {formatRupiah(product.price)} /{" "}
                              {product.unitLabel}
                            </p>
                            <div className="mt-2.5 flex items-center gap-2">
                              <div className="inline-flex items-center rounded-lg border border-[#FED7AA] bg-[#FFF7ED] p-0.5">
                                <button
                                  type="button"
                                  onClick={() => decrementByKey(key)}
                                  aria-label={`Kurangi ${product.name}`}
                                  className="flex h-6 w-6 items-center justify-center rounded-md text-[#1C1917] transition-colors hover:bg-[#FFFFFF]"
                                >
                                  <Minus size={12} weight="bold" />
                                </button>
                                <span className="w-7 text-center font-mono text-xs font-semibold tabular-nums text-[#1C1917]">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => addOneByKey(key)}
                                  aria-label={`Tambah ${product.name}`}
                                  className="flex h-6 w-6 items-center justify-center rounded-md bg-[#C2410C] text-white transition-colors hover:bg-[#9A3412]"
                                >
                                  <Plus size={12} weight="bold" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeItemByKey(key)}
                                aria-label={`Hapus ${product.name}`}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-[#57534E] transition-colors hover:bg-[#FFF7ED] hover:text-[#1C1917]"
                              >
                                <Trash size={14} weight="bold" />
                              </button>
                            </div>
                          </div>

                          <p className="shrink-0 font-mono text-sm font-bold tabular-nums text-[#1C1917]">
                            {formatRupiah(product.price * qty)}
                          </p>
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-4 border-t border-[#E7E5E4] pt-5">
                      <div>
                        <label
                          htmlFor="kuliner-customer-name"
                          className="block text-xs font-semibold text-[#1C1917]"
                        >
                          Nama Pemesan
                        </label>
                        <input
                          id="kuliner-customer-name"
                          type="text"
                          value={customerName}
                          onChange={(event) =>
                            setCustomerName(event.target.value)
                          }
                          placeholder="Contoh: Ibu Ratna / Divisi Operasional"
                          className="mt-1.5 w-full rounded-lg border border-[#D6D3D1] bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#C2410C] focus:outline-none"
                        />
                      </div>

                      <div>
                        <span className="block text-xs font-semibold text-[#1C1917]">
                          Metode Pengambilan
                        </span>
                        <div className="mt-1.5 grid grid-cols-2 gap-2">
                          {(
                            ["Ambil di Tempat", "Kurir Instan"] as const
                          ).map((option) => {
                            const selected = fulfillment === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  setFulfillment(option);
                                  if (option === "Ambil di Tempat") {
                                    setAddressError(false);
                                  }
                                }}
                                className={cn(
                                  "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors",
                                  selected
                                    ? "border-[#C2410C] bg-[#FFF7ED] text-[#9A3412]"
                                    : "border-[#E7E5E4] bg-[#FFFFFF] text-[#57534E] hover:text-[#1C1917]"
                                )}
                              >
                                {selected && <Check size={13} weight="bold" />}
                                <span>{option}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {fulfillment === "Kurir Instan" && (
                        <div>
                          <label
                            htmlFor="kuliner-address"
                            className="block text-xs font-semibold text-[#1C1917]"
                          >
                            Alamat Lengkap
                          </label>
                          <textarea
                            id="kuliner-address"
                            rows={2}
                            value={address}
                            onChange={(event) => {
                              setAddress(event.target.value);
                              if (addressError && event.target.value.trim()) {
                                setAddressError(false);
                              }
                            }}
                            placeholder="Jalan, nomor rumah/gedung kantor, patokan, kecamatan"
                            className={cn(
                              "mt-1.5 w-full rounded-lg border bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none",
                              addressError
                                ? "border-[#C2410C]"
                                : "border-[#D6D3D1] focus:border-[#C2410C]"
                            )}
                          />
                          {addressError && (
                            <p className="mt-1 text-xs font-medium text-[#C2410C]">
                              Isi alamat lengkap untuk pengiriman kurir instan.
                            </p>
                          )}
                        </div>
                      )}

                      <div>
                        <label
                          htmlFor="kuliner-notes"
                          className="block text-xs font-semibold text-[#1C1917]"
                        >
                          Catatan Jam Antar / Acara (Opsional)
                        </label>
                        <input
                          id="kuliner-notes"
                          type="text"
                          value={notes}
                          onChange={(event) => setNotes(event.target.value)}
                          placeholder="Contoh: Kirim jam 11.30 WIB, sambal dipisah plastik"
                          className="mt-1.5 w-full rounded-lg border border-[#D6D3D1] bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#C2410C] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#E7E5E4] bg-[#FFF7ED] p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#57534E]">
                        Total Harga Dapur
                      </span>
                      <span className="font-mono text-lg font-bold tabular-nums text-[#1C1917]">
                        {formatRupiah(subtotal)}
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-[#57534E]">
                      Rincian pesanan langsung terkirim ke WhatsApp admin dapur
                      untuk konfirmasi jadwal masak &amp; pembayaran.
                    </p>

                    <button
                      type="submit"
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9A3412]"
                    >
                      <WhatsappLogo size={18} weight="bold" />
                      <span>Kirim Pesanan ke WhatsApp</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
