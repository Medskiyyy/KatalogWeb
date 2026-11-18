"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  CaretDown,
  Check,
  Clock,
  MapPin,
  Minus,
  Plus,
  Quotes,
  Ruler,
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
type SizeGuideTab = "measurements" | "height-weight";
type UmkmProduct = UmkmSiteConfig["data"]["products"][number];

interface BagEntry {
  key: string;
  product: UmkmProduct;
  variant: string;
  qty: number;
}

interface SizeSpecRow {
  size: "S" | "M" | "L" | "XL";
  bustCm: string;
  lengthCm: string;
  sleeveCm: string;
  shoulderCm: string;
  heightRange: string;
  weightRange: string;
  fitNote: string;
}

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const LOOKBOOK_SECONDARY_IMAGE = "/demo/umkm-fashion-flatlay.webp";

const SIZE_SPECS: SizeSpecRow[] = [
  {
    size: "S",
    bustCm: "96 cm",
    lengthCm: "68 cm",
    sleeveCm: "55 cm",
    shoulderCm: "40 cm",
    heightRange: "150 - 158 cm",
    weightRange: "42 - 50 kg",
    fitNote: "Jatuh rileks di bahu dengan ruang gerak lengan yang nyaman.",
  },
  {
    size: "M",
    bustCm: "102 cm",
    lengthCm: "70 cm",
    sleeveCm: "56 cm",
    shoulderCm: "42 cm",
    heightRange: "156 - 164 cm",
    weightRange: "51 - 59 kg",
    fitNote: "Potongan seimbang untuk dipakai sendiri maupun dilapis outer.",
  },
  {
    size: "L",
    bustCm: "108 cm",
    lengthCm: "72 cm",
    sleeveCm: "57 cm",
    shoulderCm: "44 cm",
    heightRange: "162 - 170 cm",
    weightRange: "60 - 69 kg",
    fitNote: "Siluet longgar modest yang tetap rapi tanpa terasa kebesaran.",
  },
  {
    size: "XL",
    bustCm: "114 cm",
    lengthCm: "74 cm",
    sleeveCm: "58 cm",
    shoulderCm: "46 cm",
    heightRange: "166 - 176 cm",
    weightRange: "70 - 82 kg",
    fitNote: "Lingkar dada dan lingkar lengan lega untuk aktivitas seharian.",
  },
];

function makeBagKey(productId: string, variant: string): string {
  return `${productId}::${variant}`;
}

function getDefaultVariant(product: UmkmProduct): string {
  return product.options?.[0] ?? "All Size";
}

function SizeGuidePanel({
  activeTab,
  onTabChange,
  recommendedSize,
  onSelectRecommendedSize,
}: {
  activeTab: SizeGuideTab;
  onTabChange: (tab: SizeGuideTab) => void;
  recommendedSize: "S" | "M" | "L" | "XL";
  onSelectRecommendedSize: (size: "S" | "M" | "L" | "XL") => void;
}) {
  const activeSpec =
    SIZE_SPECS.find((row) => row.size === recommendedSize) ?? SIZE_SPECS[1];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Pilihan tampilan panduan ukuran"
        className="inline-flex border border-[#E4E4E0] bg-[#F8F8F7] p-1 rounded-xs"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "measurements"}
          onClick={() => onTabChange("measurements")}
          className={cn(
            "px-3.5 py-2 text-xs font-semibold tracking-wide transition-colors rounded-xs",
            activeTab === "measurements"
              ? "bg-[#18181B] text-white"
              : "text-[#52525B] hover:text-[#18181B]"
          )}
        >
          Tabel Ukuran (cm)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "height-weight"}
          onClick={() => onTabChange("height-weight")}
          className={cn(
            "px-3.5 py-2 text-xs font-semibold tracking-wide transition-colors rounded-xs",
            activeTab === "height-weight"
              ? "bg-[#18181B] text-white"
              : "text-[#52525B] hover:text-[#18181B]"
          )}
        >
          Saran Tinggi &amp; Berat Badan
        </button>
      </div>

      {activeTab === "measurements" ? (
        <div className="mt-5">
          <div className="overflow-x-auto border border-[#E4E4E0] rounded-xs">
            <table className="w-full min-w-[460px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#E4E4E0] bg-[#F8F8F7] text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                  <th className="px-4 py-3">Ukuran</th>
                  <th className="px-4 py-3">Lingkar Dada</th>
                  <th className="px-4 py-3">Panjang Baju</th>
                  <th className="px-4 py-3">Panjang Lengan</th>
                  <th className="px-4 py-3">Lebar Bahu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E0] bg-[#FFFFFF]">
                {SIZE_SPECS.map((row) => (
                  <tr
                    key={row.size}
                    className="transition-colors hover:bg-[#F8F8F7]"
                  >
                    <td className="px-4 py-3 font-semibold text-[#881337]">
                      {row.size}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums text-[#18181B]">
                      {row.bustCm}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums text-[#18181B]">
                      {row.lengthCm}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums text-[#18181B]">
                      {row.sleeveCm}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums text-[#52525B]">
                      {row.shoulderCm}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[#52525B]">
            Toleransi jahitan 1 - 2 cm karena proses pemotongan kain linen rami
            secara manual di studio.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-[#52525B]">
              Pilih perkiraan ukuranmu:
            </span>
            {SIZE_SPECS.map((row) => {
              const active = recommendedSize === row.size;
              return (
                <button
                  key={row.size}
                  type="button"
                  onClick={() => onSelectRecommendedSize(row.size)}
                  className={cn(
                    "border px-3 py-1.5 text-xs font-semibold transition-colors rounded-xs",
                    active
                      ? "border-[#881337] bg-[#881337] text-white"
                      : "border-[#E4E4E0] bg-[#FFFFFF] text-[#18181B] hover:border-[#18181B]"
                  )}
                >
                  Size {row.size}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-3 border border-[#E4E4E0] bg-[#F8F8F7] p-4 rounded-xs sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Saran Tinggi Badan
              </p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-[#18181B]">
                {activeSpec.heightRange}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Saran Berat Badan
              </p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-[#18181B]">
                {activeSpec.weightRange}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Lingkar Dada Pola
              </p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-[#881337]">
                {activeSpec.bustCm}
              </p>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-[#52525B]">
            <strong className="font-semibold text-[#18181B]">
              Catatan Fit Size {activeSpec.size}:
            </strong>{" "}
            {activeSpec.fitNote} Jika berada di antara dua rentang dan suka
            jatuh lebih longgar, pilih satu tingkat di atasnya.
          </p>
        </div>
      )}
    </div>
  );
}

export function UmkmFashionTemplate({
  site,
  embedded = false,
}: {
  site: UmkmSiteConfig;
  embedded?: boolean;
}) {
  const { data } = site;
  const prefersReducedMotion = useReducedMotion();

  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [bagEntries, setBagEntries] = useState<Record<string, BagEntry>>({});
  const [selectedProduct, setSelectedProduct] = useState<UmkmProduct | null>(
    null
  );
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [sizeGuideTab, setSizeGuideTab] =
    useState<SizeGuideTab>("measurements");
  const [recommendedSize, setRecommendedSize] = useState<"S" | "M" | "L" | "XL">(
    "M"
  );
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [fulfillment, setFulfillment] =
    useState<FulfillmentMethod>("Ambil di Tempat");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [addressError, setAddressError] = useState(false);

  useEffect(() => {
    const urls = new Set<string>([
      data.heroImageUrl,
      LOOKBOOK_SECONDARY_IMAGE,
      ...data.products.map((product) => product.imageUrl),
    ]);

    urls.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [data.heroImageUrl, data.products]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(data.products.map((p) => p.category)));
    return ["Semua", ...unique];
  }, [data.products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "Semua") return data.products;
    return data.products.filter(
      (product) => product.category === activeCategory
    );
  }, [activeCategory, data.products]);

  const promoProduct = useMemo(() => {
    if (!data.promoBanner) return undefined;
    return (
      data.products.find((p) => p.id === data.promoBanner?.productId) ??
      data.products[0]
    );
  }, [data.products, data.promoBanner]);

  const bagList = useMemo(
    () => Object.values(bagEntries).filter((entry) => entry.qty > 0),
    [bagEntries]
  );

  const totalQty = useMemo(
    () => bagList.reduce((sum, entry) => sum + entry.qty, 0),
    [bagList]
  );

  const subtotal = useMemo(
    () =>
      bagList.reduce(
        (sum, entry) => sum + entry.product.price * entry.qty,
        0
      ),
    [bagList]
  );

  const directChatUrl = useMemo(
    () =>
      buildWhatsAppUrl(
        data.whatsappNumber,
        `Halo ${data.businessName}, saya mau konsultasi stok ukuran dan warna koleksi terbaru.`
      ),
    [data.businessName, data.whatsappNumber]
  );

  const hasActiveOverlay =
    isDrawerOpen || selectedProduct !== null || isSizeGuideOpen;

  useEffect(() => {
    if (!hasActiveOverlay) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isDrawerOpen) {
          setIsDrawerOpen(false);
        } else if (isSizeGuideOpen) {
          setIsSizeGuideOpen(false);
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
  }, [embedded, hasActiveOverlay, isDrawerOpen, isSizeGuideOpen, selectedProduct]);

  function openProductQuickView(product: UmkmProduct) {
    setSelectedProduct(product);
    setSelectedVariant(getDefaultVariant(product));
  }

  function addBagItem(product: UmkmProduct, variant: string) {
    const cleanVariant = variant || getDefaultVariant(product);
    const key = makeBagKey(product.id, cleanVariant);
    setBagEntries((prev) => {
      const existing = prev[key];
      return {
        ...prev,
        [key]: {
          key,
          product,
          variant: cleanVariant,
          qty: (existing?.qty ?? 0) + 1,
        },
      };
    });
  }

  function decrementBagItem(key: string) {
    setBagEntries((prev) => {
      const existing = prev[key];
      if (!existing) return prev;
      const nextQty = existing.qty - 1;
      if (nextQty <= 0) {
        const rest = { ...prev };
        delete rest[key];
        return rest;
      }
      return {
        ...prev,
        [key]: {
          ...existing,
          qty: nextQty,
        },
      };
    });
  }

  function removeBagItem(key: string) {
    setBagEntries((prev) => {
      const rest = { ...prev };
      delete rest[key];
      return rest;
    });
  }

  function handleCheckoutSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (bagList.length === 0) return;

    if (fulfillment === "Kurir Instan" && !address.trim()) {
      setAddressError(true);
      return;
    }

    setAddressError(false);

    const message = formatUmkmWhatsAppMessage({
      businessName: data.businessName,
      items: bagList.map(({ product, variant, qty }) => ({
        name: `${product.name} (Varian/Size: ${variant})`,
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

  const stats = data.stats ?? [];
  const faqs = data.faqs ?? [];
  const selectedProductKey = selectedProduct
    ? makeBagKey(selectedProduct.id, selectedVariant || getDefaultVariant(selectedProduct))
    : "";
  const selectedVariantQty = selectedProductKey
    ? bagEntries[selectedProductKey]?.qty ?? 0
    : 0;

  return (
    <div
      id="top"
      className="relative min-h-full bg-[#FFFFFF] font-jakarta text-[#18181B] selection:bg-[#881337]/15 selection:text-[#881337]"
    >
      <header className="sticky top-0 z-20 border-b border-[#E4E4E0] bg-[#FFFFFF]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <a
            href="#top"
            className="flex min-w-0 items-baseline gap-2.5 whitespace-nowrap"
          >
            <span className="truncate font-serif-editorial text-xl font-semibold tracking-tight text-[#18181B] sm:text-2xl">
              {data.businessName}
            </span>
            <span className="hidden border-l border-[#E4E4E0] pl-2.5 text-xs font-medium text-[#52525B] sm:inline">
              {data.cityLabel}
            </span>
          </a>

          <nav
            aria-label="Navigasi koleksi"
            className="hidden items-center gap-5 text-xs font-medium tracking-wide text-[#52525B] lg:flex"
          >
            {categories.map((category) => {
              const isSelected = activeCategory === category;
              return (
                <a
                  key={category}
                  href="#koleksi"
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "whitespace-nowrap border-b pb-0.5 transition-colors",
                    isSelected
                      ? "border-[#881337] text-[#18181B]"
                      : "border-transparent hover:border-[#E4E4E0] hover:text-[#18181B]"
                  )}
                >
                  {category}
                </a>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(true)}
              className="inline-flex items-center gap-1.5 border border-[#E4E4E0] bg-[#FFFFFF] px-3 py-2 text-xs font-semibold text-[#18181B] transition-colors hover:border-[#18181B] hover:bg-[#F8F8F7] rounded-xs"
            >
              <Ruler size={15} weight="bold" className="text-[#881337]" />
              <span>Panduan Ukuran</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="inline-flex items-center gap-2 border border-[#18181B] bg-[#18181B] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:border-[#881337] hover:bg-[#881337] rounded-xs"
            >
              <ShoppingBag size={15} weight="bold" />
              <span className="tabular-nums">Tas Belanja ({totalQty})</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-[#E4E4E0] bg-[#F8F8F7] py-12 sm:py-16 lg:py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#881337]">
                {data.categoryLabel}
              </p>

              <h1 className="mt-4 font-serif-editorial text-4xl font-semibold leading-[1.08] tracking-tight text-[#18181B] sm:text-5xl lg:text-[3.25rem]">
                {data.tagline}
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#52525B] sm:text-base">
                {data.description}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#koleksi"
                  className="inline-flex items-center gap-2 bg-[#881337] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#6D0E2B] rounded-xs sm:text-sm"
                >
                  <span>Jelajahi Koleksi</span>
                  <ArrowRight size={15} weight="bold" />
                </a>

                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="inline-flex items-center gap-2 border border-[#E4E4E0] bg-[#FFFFFF] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#18181B] transition-colors hover:border-[#18181B] rounded-xs sm:text-sm"
                >
                  <Ruler size={15} weight="bold" className="text-[#881337]" />
                  <span>Cek Panduan Ukuran</span>
                </button>
              </div>

              {stats.length > 0 && (
                <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-[#E4E4E0] pt-6">
                  {stats.map((stat) => (
                    <div key={stat.label}>
                      <dt className="text-[11px] font-medium uppercase tracking-wider text-[#52525B]">
                        {stat.label}
                      </dt>
                      <dd className="mt-1 font-serif-editorial text-2xl font-semibold text-[#18181B] sm:text-3xl">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-12 items-end gap-4">
                <figure className="col-span-7 overflow-hidden border border-[#E4E4E0] bg-[#FFFFFF] p-2 rounded-xs">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#F8F8F7]">
                    <img
                      src={data.heroImageUrl}
                      alt={`${data.businessName} lookbook utama`}
                      loading="eager"
                      className="block h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="flex items-center justify-between pt-2.5 text-[11px] font-medium text-[#52525B]">
                    <span>Look 01 - Siluet Linen</span>
                    <span className="font-mono text-[#18181B]">S - XL</span>
                  </figcaption>
                </figure>

                <figure className="col-span-5 -mt-6 overflow-hidden border border-[#E4E4E0] bg-[#FFFFFF] p-2 rounded-xs sm:mb-8">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#F8F8F7]">
                    <img
                      src={LOOKBOOK_SECONDARY_IMAGE}
                      alt={`Detail tekstur kain dan aksesori ${data.businessName}`}
                      loading="eager"
                      className="block h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="pt-2.5 text-[11px] font-medium text-[#52525B]">
                    Look 02 - Tekstur &amp; Detail
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        <section
          id="koleksi"
          className="scroll-mt-16 bg-[#FFFFFF] py-14 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col gap-5 border-b border-[#E4E4E0] pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#881337]">
                  Koleksi Terkurasi
                </p>
                <h2 className="mt-2 font-serif-editorial text-3xl font-semibold tracking-tight text-[#18181B] sm:text-4xl">
                  Lookbook &amp; Katalog Studio
                </h2>
              </div>

              <div
                role="tablist"
                aria-label="Filter kategori produk"
                className="flex flex-wrap items-center gap-2"
              >
                {categories.map((category) => {
                  const active = activeCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveCategory(category)}
                      className={cn(
                        "border px-3.5 py-2 text-xs font-semibold tracking-wide transition-colors rounded-xs",
                        active
                          ? "border-[#881337] bg-[#881337] text-white"
                          : "border-[#E4E4E0] bg-[#FFFFFF] text-[#52525B] hover:border-[#18181B] hover:text-[#18181B]"
                      )}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const variantOptions = product.options ?? [];
                return (
                  <article
                    key={product.id}
                    className="group flex flex-col border border-[#E4E4E0] bg-[#FFFFFF] transition-colors hover:border-[#18181B] rounded-xs"
                  >
                    <button
                      type="button"
                      onClick={() => openProductQuickView(product)}
                      className="relative aspect-[3/4] w-full overflow-hidden bg-[#F8F8F7] text-left"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="block h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      />
                    </button>

                    <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-5">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#881337]">
                            {product.category}
                          </span>
                          {product.featured && (
                            <span className="text-[11px] font-medium text-[#52525B]">
                              Favorit Studio
                            </span>
                          )}
                        </div>

                        <h3 className="mt-1.5 font-serif-editorial text-lg font-semibold leading-snug text-[#18181B] sm:text-xl">
                          {product.name}
                        </h3>

                        <p className="mt-1.5 font-mono text-sm font-semibold tabular-nums text-[#18181B]">
                          {formatRupiah(product.price)}
                        </p>

                        {variantOptions.length > 0 && (
                          <div
                            aria-label={`Pilihan tersedia untuk ${product.name}`}
                            className="mt-3 flex flex-wrap gap-1.5"
                          >
                            {variantOptions.map((option) => (
                              <span
                                key={option}
                                className="border border-[#E4E4E0] bg-[#F8F8F7] px-2 py-0.5 text-[11px] font-medium text-[#52525B] rounded-xs"
                              >
                                {option}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => openProductQuickView(product)}
                        className="mt-4 flex w-full items-center justify-center gap-1.5 border border-[#18181B] bg-[#FFFFFF] px-3 py-2.5 text-xs font-semibold text-[#18181B] transition-colors hover:border-[#881337] hover:bg-[#881337] hover:text-white rounded-xs"
                      >
                        <span>Pilih Ukuran &amp; Pesan</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="panduan-ukuran"
          className="scroll-mt-16 border-t border-[#E4E4E0] bg-[#F8F8F7] py-14 sm:py-18"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#881337]">
                  Fit &amp; Sizing
                </p>
                <h2 className="mt-2 font-serif-editorial text-3xl font-semibold tracking-tight text-[#18181B]">
                  Panduan Ukuran (Size Chart)
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#52525B]">
                  Pola kami dirancang longgar modest untuk kenyamanan tropis.
                  Bandingkan ukuran sentimeter pakaian atau cek saran tinggi
                  dan berat badan sebelum memilih ukuran.
                </p>
              </div>

              <div className="border border-[#E4E4E0] bg-[#FFFFFF] p-5 rounded-xs sm:p-6 lg:col-span-8">
                <SizeGuidePanel
                  activeTab={sizeGuideTab}
                  onTabChange={setSizeGuideTab}
                  recommendedSize={recommendedSize}
                  onSelectRecommendedSize={setRecommendedSize}
                />
              </div>
            </div>
          </div>
        </section>

        {data.promoBanner && promoProduct && (
          <section
            id="lookbook-set"
            className="scroll-mt-16 border-t border-[#E4E4E0] bg-[#FFFFFF] py-14 sm:py-20"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="grid grid-cols-1 items-center gap-8 border border-[#E4E4E0] bg-[#F8F8F7] p-5 rounded-xs sm:p-8 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-5">
                  <div className="relative aspect-[3/4] overflow-hidden border border-[#E4E4E0] bg-[#FFFFFF] rounded-xs">
                    <img
                      src={promoProduct.imageUrl}
                      alt={data.promoBanner.title}
                      loading="lazy"
                      className="block h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#881337]">
                    Lookbook Set Pilihan
                  </p>
                  <h2 className="mt-3 font-serif-editorial text-3xl font-semibold leading-tight text-[#18181B] sm:text-4xl">
                    {data.promoBanner.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#52525B] sm:text-base">
                    {data.promoBanner.description}
                  </p>

                  <div className="mt-6 flex flex-wrap items-baseline gap-4 border-y border-[#E4E4E0] py-4">
                    <div>
                      <span className="block text-[11px] font-medium uppercase tracking-wider text-[#52525B]">
                        Harga Set Lengkap
                      </span>
                      <span className="font-serif-editorial text-3xl font-semibold text-[#881337]">
                        {data.promoBanner.priceLabel}
                      </span>
                    </div>
                    <span className="text-xs text-[#52525B]">
                      Tersedia ukuran atasan S, M, L, dan XL
                    </span>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openProductQuickView(promoProduct)}
                      className="inline-flex items-center gap-2 bg-[#881337] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#6D0E2B] rounded-xs sm:text-sm"
                    >
                      <span>Pilih Ukuran Setelan</span>
                      <ArrowRight size={15} weight="bold" />
                    </button>
                    <a
                      href={directChatUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border border-[#E4E4E0] bg-[#FFFFFF] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#18181B] transition-colors hover:border-[#18181B] rounded-xs sm:text-sm"
                    >
                      <WhatsappLogo
                        size={16}
                        weight="bold"
                        className="text-[#881337]"
                      />
                      <span>Padu Padan via WA</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section
          id="janji-atelier"
          className="scroll-mt-16 border-t border-[#E4E4E0] bg-[#FFFFFF] py-14 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#881337]">
                Standar Studio
              </p>
              <h2 className="mt-2 font-serif-editorial text-3xl font-semibold tracking-tight text-[#18181B] sm:text-4xl">
                Dirancang untuk Dipakai Berulang Kali
              </h2>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {data.highlights.map((highlight, index) => (
                <div
                  key={highlight.title}
                  className="border border-[#E4E4E0] bg-[#F8F8F7] p-6 rounded-xs"
                >
                  <span className="font-mono text-xs font-semibold text-[#881337]">
                    0{index + 1}
                  </span>
                  <h3 className="mt-3 font-serif-editorial text-2xl font-semibold text-[#18181B]">
                    {highlight.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#52525B]">
                    {highlight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[#E4E4E0] bg-[#F8F8F7] py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#881337]">
                Cerita Pemakai
              </p>
              <h2 className="mt-2 font-serif-editorial text-3xl font-semibold tracking-tight text-[#18181B] sm:text-4xl">
                Kesan Pelanggan
              </h2>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {data.testimonials.map((item) => (
                <figure
                  key={`${item.author}-${item.role}`}
                  className="flex flex-col justify-between border border-[#E4E4E0] bg-[#FFFFFF] p-6 rounded-xs"
                >
                  <div>
                    <Quotes
                      size={20}
                      weight="fill"
                      className="text-[#881337]/75"
                    />
                    <blockquote className="mt-3 text-sm leading-relaxed text-[#18181B]">
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>
                  </div>
                  <figcaption className="mt-5 border-t border-[#E4E4E0] pt-4">
                    <p className="font-serif-editorial text-lg font-semibold text-[#18181B]">
                      {item.author}
                    </p>
                    <p className="text-xs text-[#52525B]">{item.role}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {faqs.length > 0 && (
          <section className="border-t border-[#E4E4E0] bg-[#FFFFFF] py-14 sm:py-20">
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#881337]">
                  Informasi Pemesanan
                </p>
                <h2 className="mt-2 font-serif-editorial text-3xl font-semibold tracking-tight text-[#18181B]">
                  Pertanyaan yang Sering Diajukan
                </h2>
              </div>

              <div className="divide-y divide-[#E4E4E0] border-y border-[#E4E4E0] lg:col-span-8">
                {faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div key={faq.question}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() =>
                          setOpenFaqIndex(isOpen ? null : index)
                        }
                        className="flex w-full items-center justify-between gap-4 py-4 text-left"
                      >
                        <span className="text-sm font-semibold text-[#18181B] sm:text-base">
                          {faq.question}
                        </span>
                        <CaretDown
                          size={16}
                          weight="bold"
                          className={cn(
                            "shrink-0 text-[#52525B] transition-transform duration-200",
                            isOpen && "rotate-180 text-[#881337]"
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
                            <p className="pb-5 text-sm leading-relaxed text-[#52525B]">
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
        )}

        <section
          id="lokasi"
          className="scroll-mt-16 border-t border-[#E4E4E0] bg-[#F8F8F7] py-14 sm:py-18"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 items-center gap-8 border border-[#E4E4E0] bg-[#FFFFFF] p-6 rounded-xs sm:p-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#881337]">
                  Kunjungi Studio Fitting
                </p>
                <h2 className="mt-2 font-serif-editorial text-3xl font-semibold tracking-tight text-[#18181B]">
                  {data.businessName} - {data.cityLabel}
                </h2>

                <div className="mt-5 space-y-3 text-sm text-[#52525B] sm:text-base">
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={18}
                      weight="bold"
                      className="mt-0.5 shrink-0 text-[#881337]"
                    />
                    <span>{data.address}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock
                      size={18}
                      weight="bold"
                      className="mt-0.5 shrink-0 text-[#881337]"
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
                  className="inline-flex items-center justify-center gap-2 bg-[#18181B] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#881337] rounded-xs sm:text-sm"
                >
                  <MapPin size={15} weight="bold" />
                  <span>Buka Google Maps</span>
                </a>
                <a
                  href={directChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-[#E4E4E0] bg-[#FFFFFF] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#18181B] transition-colors hover:border-[#18181B] rounded-xs sm:text-sm"
                >
                  <WhatsappLogo
                    size={16}
                    weight="bold"
                    className="text-[#881337]"
                  />
                  <span>Tanya Stok via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer
        className={cn(
          "border-t border-[#E4E4E0] bg-[#FFFFFF] py-10",
          totalQty > 0 && "pb-24"
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="font-serif-editorial text-lg font-semibold text-[#18181B]">
              {data.businessName}
            </p>
            <p className="mt-0.5 text-xs text-[#52525B]">
              {data.cityLabel} - {data.openHoursLabel}
            </p>
          </div>

          <div className="flex flex-col items-start gap-1 sm:items-end">
            <Link
              href="/"
              className="text-xs font-medium text-[#52525B] transition-colors hover:text-[#18181B]"
            >
              Lookbook Butik oleh KatalogWeb
            </Link>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {totalQty > 0 && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.22,
              ease: EASE_OUT,
            }}
            className={cn(
              "z-30 mx-auto max-w-6xl px-4 sm:px-6",
              embedded ? "sticky bottom-4 pb-4" : "fixed inset-x-0 bottom-4"
            )}
          >
            <div className="flex items-center justify-between gap-4 border border-[#18181B] bg-[#18181B] px-4 py-3 text-white shadow-lg rounded-xs sm:px-5 sm:py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <ShoppingBag
                  size={18}
                  weight="bold"
                  className="shrink-0 text-[#F8F8F7]"
                />
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 text-sm">
                  <span className="font-mono font-semibold tabular-nums">
                    {totalQty} item
                  </span>
                  <span className="text-[#A1A1AA]" aria-hidden="true">
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
                className="shrink-0 bg-[#881337] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#6D0E2B] rounded-xs"
              >
                Buka Tas Belanja
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
            aria-labelledby="fashion-product-modal-title"
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
                  : { opacity: 0, scale: 0.98, y: 8 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.98, y: 8 }
              }
              transition={{
                duration: prefersReducedMotion ? 0 : 0.22,
                ease: EASE_OUT,
              }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-2xl overflow-hidden border border-[#E4E4E0] bg-[#FFFFFF] shadow-2xl rounded-xs"
            >
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                aria-label="Tutup detail produk"
                className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center border border-[#E4E4E0] bg-[#FFFFFF]/95 text-[#18181B] transition-colors hover:bg-[#F8F8F7] rounded-xs"
              >
                <X size={18} weight="bold" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="relative aspect-[3/4] bg-[#F8F8F7] md:col-span-6">
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
                      <span className="font-semibold uppercase tracking-[0.16em] text-[#881337]">
                        {selectedProduct.category}
                      </span>
                      {selectedProduct.featured && (
                        <span className="font-medium text-[#52525B]">
                          Favorit Studio
                        </span>
                      )}
                    </div>

                    <h3
                      id="fashion-product-modal-title"
                      className="mt-2 font-serif-editorial text-2xl font-semibold leading-tight text-[#18181B] sm:text-3xl"
                    >
                      {selectedProduct.name}
                    </h3>

                    <p className="mt-2 font-mono text-lg font-bold tabular-nums text-[#18181B]">
                      {formatRupiah(selectedProduct.price)}
                      <span className="ml-1.5 font-jakarta text-xs font-normal text-[#52525B]">
                        / {selectedProduct.unitLabel}
                      </span>
                    </p>

                    <p className="mt-3 text-sm leading-relaxed text-[#52525B]">
                      {selectedProduct.description}
                    </p>

                    <div className="mt-5 border-t border-[#E4E4E0] pt-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#18181B]">
                          Pilih Ukuran / Varian
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsSizeGuideOpen(true)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#881337] underline underline-offset-4 hover:text-[#6D0E2B]"
                        >
                          <Ruler size={13} weight="bold" />
                          <span>Panduan Ukuran</span>
                        </button>
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {(
                          selectedProduct.options ?? ["All Size"]
                        ).map((option) => {
                          const isSelected = selectedVariant === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setSelectedVariant(option)}
                              className={cn(
                                "min-w-[2.75rem] border px-3 py-2 text-xs font-semibold transition-colors rounded-xs",
                                isSelected
                                  ? "border-[#881337] bg-[#881337] text-white"
                                  : "border-[#E4E4E0] bg-[#FFFFFF] text-[#18181B] hover:border-[#18181B]"
                              )}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-[#E4E4E0] pt-5">
                    <div className="flex items-center gap-3">
                      {selectedVariantQty === 0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            addBagItem(selectedProduct, selectedVariant)
                          }
                          className="flex w-full items-center justify-center gap-2 bg-[#881337] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#6D0E2B] rounded-xs"
                        >
                          <Plus size={15} weight="bold" />
                          <span>
                            Tambah ke Tas ({selectedVariant || "All Size"})
                          </span>
                        </button>
                      ) : (
                        <>
                          <div className="inline-flex items-center border border-[#E4E4E0] bg-[#F8F8F7] p-1 rounded-xs">
                            <button
                              type="button"
                              onClick={() =>
                                decrementBagItem(selectedProductKey)
                              }
                              aria-label={`Kurangi ${selectedProduct.name} ${selectedVariant}`}
                              className="flex h-8 w-8 items-center justify-center text-[#18181B] transition-colors hover:bg-[#FFFFFF] rounded-xs"
                            >
                              <Minus size={14} weight="bold" />
                            </button>
                            <span className="w-9 text-center font-mono text-sm font-semibold tabular-nums text-[#18181B]">
                              {selectedVariantQty}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                addBagItem(selectedProduct, selectedVariant)
                              }
                              aria-label={`Tambah ${selectedProduct.name} ${selectedVariant}`}
                              className="flex h-8 w-8 items-center justify-center bg-[#881337] text-white transition-colors hover:bg-[#6D0E2B] rounded-xs"
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
                            className="flex-1 bg-[#18181B] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#27272A] rounded-xs"
                          >
                            Buka Tas Belanja
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSizeGuideOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="fashion-size-guide-title"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
            className={cn(
              "inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]",
              embedded ? "absolute" : "fixed"
            )}
            onClick={() => setIsSizeGuideOpen(false)}
          >
            <motion.div
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, scale: 0.98, y: 8 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.98, y: 8 }
              }
              transition={{
                duration: prefersReducedMotion ? 0 : 0.22,
                ease: EASE_OUT,
              }}
              onClick={(event) => event.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[#E4E4E0] bg-[#FFFFFF] p-6 shadow-2xl rounded-xs sm:p-7"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[#E4E4E0] pb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#881337]">
                    {data.businessName}
                  </p>
                  <h3
                    id="fashion-size-guide-title"
                    className="mt-1 font-serif-editorial text-2xl font-semibold text-[#18181B]"
                  >
                    Panduan Ukuran (Size Chart)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(false)}
                  aria-label="Tutup panduan ukuran"
                  className="flex h-8 w-8 items-center justify-center border border-[#E4E4E0] text-[#52525B] transition-colors hover:border-[#18181B] hover:text-[#18181B] rounded-xs"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>

              <div className="mt-5">
                <SizeGuidePanel
                  activeTab={sizeGuideTab}
                  onTabChange={setSizeGuideTab}
                  recommendedSize={recommendedSize}
                  onSelectRecommendedSize={setRecommendedSize}
                />
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
            aria-labelledby="fashion-bag-drawer-title"
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
                "flex w-full max-w-md flex-col border-l border-[#E4E4E0] bg-[#FFFFFF] shadow-2xl",
                embedded ? "sticky top-0 h-[100dvh] max-h-full" : "h-full"
              )}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#E4E4E0] px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag
                    size={18}
                    weight="bold"
                    className="text-[#881337]"
                  />
                  <h2
                    id="fashion-bag-drawer-title"
                    className="font-serif-editorial text-xl font-semibold text-[#18181B]"
                  >
                    Tas Belanja
                  </h2>
                  <span className="border border-[#E4E4E0] bg-[#F8F8F7] px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-[#52525B] rounded-xs">
                    {totalQty}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  aria-label="Tutup tas belanja"
                  className="flex h-8 w-8 items-center justify-center text-[#52525B] transition-colors hover:bg-[#F8F8F7] hover:text-[#18181B] rounded-xs"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              {bagList.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center border border-[#E4E4E0] bg-[#F8F8F7] text-[#52525B] rounded-xs">
                    <ShoppingBag size={22} weight="bold" />
                  </div>
                  <p className="mt-4 font-serif-editorial text-xl font-semibold text-[#18181B]">
                    Tas belanja masih kosong
                  </p>
                  <p className="mt-1.5 max-w-xs text-sm text-[#52525B]">
                    Pilih pakaian linen, pashmina silk matte, atau aksesori
                    beserta ukurannya dari koleksi studio.
                  </p>
                  <a
                    href="#koleksi"
                    onClick={() => setIsDrawerOpen(false)}
                    className="mt-6 inline-flex items-center gap-2 bg-[#881337] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#6D0E2B] rounded-xs"
                  >
                    <span>Lihat Koleksi</span>
                  </a>
                </div>
              ) : (
                <form
                  onSubmit={handleCheckoutSubmit}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <div className="flex-1 space-y-6 overflow-y-auto p-5">
                    <ul className="divide-y divide-[#E4E4E0]">
                      {bagList.map((entry) => (
                        <li
                          key={entry.key}
                          className="flex items-start justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-serif-editorial text-base font-semibold text-[#18181B]">
                              {entry.product.name}
                            </p>
                            <p className="mt-0.5 text-xs font-medium text-[#881337]">
                              Ukuran / Varian: {entry.variant}
                            </p>
                            <p className="mt-0.5 font-mono text-xs tabular-nums text-[#52525B]">
                              {formatRupiah(entry.product.price)} /{" "}
                              {entry.product.unitLabel}
                            </p>

                            <div className="mt-2.5 flex items-center gap-2">
                              <div className="inline-flex items-center border border-[#E4E4E0] bg-[#F8F8F7] p-0.5 rounded-xs">
                                <button
                                  type="button"
                                  onClick={() => decrementBagItem(entry.key)}
                                  aria-label={`Kurangi ${entry.product.name} ${entry.variant}`}
                                  className="flex h-6 w-6 items-center justify-center text-[#18181B] transition-colors hover:bg-[#FFFFFF] rounded-xs"
                                >
                                  <Minus size={12} weight="bold" />
                                </button>
                                <span className="w-7 text-center font-mono text-xs font-semibold tabular-nums text-[#18181B]">
                                  {entry.qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    addBagItem(entry.product, entry.variant)
                                  }
                                  aria-label={`Tambah ${entry.product.name} ${entry.variant}`}
                                  className="flex h-6 w-6 items-center justify-center bg-[#881337] text-white transition-colors hover:bg-[#6D0E2B] rounded-xs"
                                >
                                  <Plus size={12} weight="bold" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeBagItem(entry.key)}
                                aria-label={`Hapus ${entry.product.name} ${entry.variant}`}
                                className="flex h-7 w-7 items-center justify-center text-[#52525B] transition-colors hover:bg-[#F8F8F7] hover:text-[#18181B] rounded-xs"
                              >
                                <Trash size={14} weight="bold" />
                              </button>
                            </div>
                          </div>

                          <p className="shrink-0 font-mono text-sm font-bold tabular-nums text-[#18181B]">
                            {formatRupiah(entry.product.price * entry.qty)}
                          </p>
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-4 border-t border-[#E4E4E0] pt-5">
                      <div>
                        <label
                          htmlFor="fashion-customer-name"
                          className="block text-xs font-semibold text-[#18181B]"
                        >
                          Nama Pemesan
                        </label>
                        <input
                          id="fashion-customer-name"
                          type="text"
                          value={customerName}
                          onChange={(event) =>
                            setCustomerName(event.target.value)
                          }
                          placeholder="Contoh: Nadia Putri"
                          className="mt-1.5 w-full border border-[#E4E4E0] bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:border-[#881337] focus:outline-none rounded-xs"
                        />
                      </div>

                      <div>
                        <span className="block text-xs font-semibold text-[#18181B]">
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
                                  "flex items-center justify-center gap-1.5 border px-3 py-2.5 text-xs font-semibold transition-colors rounded-xs",
                                  selected
                                    ? "border-[#881337] bg-[#881337]/10 text-[#881337]"
                                    : "border-[#E4E4E0] bg-[#F8F8F7] text-[#52525B] hover:text-[#18181B]"
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
                            htmlFor="fashion-address"
                            className="block text-xs font-semibold text-[#18181B]"
                          >
                            Alamat Lengkap Pengiriman
                          </label>
                          <textarea
                            id="fashion-address"
                            rows={2}
                            value={address}
                            onChange={(event) => {
                              setAddress(event.target.value);
                              if (addressError && event.target.value.trim()) {
                                setAddressError(false);
                              }
                            }}
                            placeholder="Jalan, nomor rumah/kantor, patokan, kecamatan"
                            className={cn(
                              "mt-1.5 w-full border bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none rounded-xs",
                              addressError
                                ? "border-[#881337]"
                                : "border-[#E4E4E0] focus:border-[#881337]"
                            )}
                          />
                          {addressError && (
                            <p className="mt-1 text-xs font-medium text-[#881337]">
                              Isi alamat lengkap untuk pengiriman kurir instan.
                            </p>
                          )}
                        </div>
                      )}

                      <div>
                        <label
                          htmlFor="fashion-notes"
                          className="block text-xs font-semibold text-[#18181B]"
                        >
                          Catatan Pesanan (Opsional)
                        </label>
                        <input
                          id="fashion-notes"
                          type="text"
                          value={notes}
                          onChange={(event) => setNotes(event.target.value)}
                          placeholder="Contoh: Bungkus kado atau kirim sore"
                          className="mt-1.5 w-full border border-[#E4E4E0] bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:border-[#881337] focus:outline-none rounded-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#E4E4E0] bg-[#F8F8F7] p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#52525B]">
                        Subtotal Koleksi
                      </span>
                      <span className="font-mono text-lg font-bold tabular-nums text-[#18181B]">
                        {formatRupiah(subtotal)}
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-[#52525B]">
                      Rincian produk beserta ukuran yang dipilih akan langsung
                      dikirim ke WhatsApp admin studio untuk konfirmasi stok.
                    </p>

                    <button
                      type="submit"
                      className="mt-4 flex w-full items-center justify-center gap-2 bg-[#881337] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#6D0E2B] rounded-xs sm:text-sm"
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
