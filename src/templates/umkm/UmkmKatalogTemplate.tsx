"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  CaretDown,
  Check,
  Clock,
  MagnifyingGlass,
  MapPin,
  Minus,
  Plus,
  Quotes,
  ShoppingBag,
  Storefront,
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

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function UmkmKatalogTemplate({
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
  const [cart, setCart] = useState<Record<string, number>>({});
  const [selectedProduct, setSelectedProduct] = useState<UmkmProduct | null>(
    null
  );
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [fulfillment, setFulfillment] =
    useState<FulfillmentMethod>("Ambil di Tempat");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [addressError, setAddressError] = useState(false);

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

  const cartItems = useMemo(() => {
    return data.products
      .map((product) => ({
        product,
        qty: cart[product.id] ?? 0,
      }))
      .filter((entry) => entry.qty > 0);
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
        `Halo ${data.businessName}, saya mau tanya stok menu yang ready hari ini.`
      ),
    [data.businessName, data.whatsappNumber]
  );

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

  function addOne(productId: string) {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] ?? 0) + 1,
    }));
  }

  function decrement(productId: string) {
    setCart((prev) => {
      const nextQty = (prev[productId] ?? 0) - 1;
      if (nextQty <= 0) {
        const rest = { ...prev };
        delete rest[productId];
        return rest;
      }
      return { ...prev, [productId]: nextQty };
    });
  }

  function removeItem(productId: string) {
    setCart((prev) => {
      const rest = { ...prev };
      delete rest[productId];
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
      items: cartItems.map(({ product, qty }) => ({
        name: product.name,
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
  const promoCartQty = promoProduct ? cart[promoProduct.id] ?? 0 : 0;

  return (
    <div
      id="top"
      className="relative min-h-full bg-[#FFFFFF] font-sans text-[#18181B] selection:bg-[#C2410C]/15 selection:text-[#9A3412]"
    >
      <header className="sticky top-0 z-20 h-16 border-b border-[#E7E5E4] bg-[#FFFFFF]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a
            href="#top"
            className="flex min-w-0 items-center gap-2.5 whitespace-nowrap"
          >
            <Storefront
              size={18}
              weight="bold"
              className="shrink-0 text-[#C2410C]"
            />
            <span className="truncate font-archivo text-base font-extrabold tracking-tight text-[#18181B] sm:text-lg">
              {data.businessName}
            </span>
            <span className="hidden border-l border-[#E7E5E4] pl-2.5 text-xs font-medium text-[#57534E] sm:inline">
              {data.cityLabel}
            </span>
          </a>

          <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-6 text-sm font-medium text-[#57534E] md:flex"
          >
            <a
              href="#menu"
              className="whitespace-nowrap transition-colors hover:text-[#18181B]"
            >
              Menu
            </a>
            {data.promoBanner && (
              <a
                href="#paket-hantaran"
                className="whitespace-nowrap transition-colors hover:text-[#18181B]"
              >
                Paket Hantaran
              </a>
            )}
            <a
              href="#keunggulan"
              className="whitespace-nowrap transition-colors hover:text-[#18181B]"
            >
              Keunggulan
            </a>
            <a
              href="#lokasi"
              className="whitespace-nowrap transition-colors hover:text-[#18181B]"
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
                : "border border-[#E7E5E4] bg-[#F5F5F4] text-[#18181B] hover:bg-[#E7E5E4]"
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
            "border-b border-[#E7E5E4] pt-10 pb-12 sm:pt-14 sm:pb-14",
            !embedded && "flex min-h-[100dvh] flex-col justify-between"
          )}
        >
          <div className="mx-auto my-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <motion.div
                initial={
                  prefersReducedMotion ? false : { opacity: 0, y: 10 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.35,
                  ease: EASE_OUT,
                }}
                className="flex flex-wrap items-center gap-x-2.5 gap-y-1 border-b border-[#E7E5E4] pb-3 text-xs text-[#57534E]"
              >
                <Clock
                  size={14}
                  weight="bold"
                  className="shrink-0 text-[#C2410C]"
                />
                <span className="font-semibold text-[#18181B]">
                  {data.categoryLabel}
                </span>
                <span aria-hidden="true">/</span>
                <span>
                  {data.cityLabel} - {data.openHoursLabel}
                </span>
              </motion.div>

              <motion.h1
                initial={
                  prefersReducedMotion ? false : { opacity: 0, y: 14 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.42,
                  delay: prefersReducedMotion ? 0 : 0.06,
                  ease: EASE_OUT,
                }}
                className="mt-6 font-archivo text-3xl font-extrabold leading-[1.08] tracking-tight text-[#18181B] sm:text-4xl lg:text-[3.125rem]"
              >
                {data.tagline}
              </motion.h1>

              <motion.p
                initial={
                  prefersReducedMotion ? false : { opacity: 0, y: 14 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.42,
                  delay: prefersReducedMotion ? 0 : 0.12,
                  ease: EASE_OUT,
                }}
                className="mt-5 max-w-xl text-base leading-relaxed text-[#57534E] sm:text-lg"
              >
                {data.description}
              </motion.p>

              <motion.div
                initial={
                  prefersReducedMotion ? false : { opacity: 0, y: 14 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.42,
                  delay: prefersReducedMotion ? 0 : 0.18,
                  ease: EASE_OUT,
                }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <a
                  href="#menu"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9A3412]"
                >
                  <span>Pilih Menu Sekarang</span>
                  <ArrowRight size={16} weight="bold" />
                </a>
                <a
                  href={directChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D6D3D1] bg-[#FFFFFF] px-5 py-3 text-sm font-semibold text-[#18181B] transition-colors hover:bg-[#F5F5F4]"
                >
                  <WhatsappLogo
                    size={18}
                    weight="bold"
                    className="text-[#C2410C]"
                  />
                  <span>Tanya Kasir via WA</span>
                </a>
              </motion.div>

              <motion.div
                initial={
                  prefersReducedMotion ? false : { opacity: 0, y: 10 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.4,
                  delay: prefersReducedMotion ? 0 : 0.24,
                  ease: EASE_OUT,
                }}
                className="mt-6 flex items-start gap-2 text-xs font-medium text-[#57534E]"
              >
                <MapPin size={15} weight="bold" className="mt-0.5 shrink-0" />
                <span>
                  {data.cityLabel} - {data.address}
                </span>
              </motion.div>
            </div>

            <motion.div
              initial={
                prefersReducedMotion ? false : { opacity: 0, scale: 0.98 }
              }
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.5,
                delay: prefersReducedMotion ? 0 : 0.1,
                ease: EASE_OUT,
              }}
              className="lg:col-span-6"
            >
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#E7E5E4] bg-[#F5F5F4]">
                <img
                  src={data.heroImageUrl}
                  alt={`${data.businessName} - ${data.categoryLabel}`}
                  className="h-full w-full object-cover"
                />
              </div>
            </motion.div>
          </div>

          {stats.length > 0 && (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.45,
                delay: prefersReducedMotion ? 0 : 0.28,
                ease: EASE_OUT,
              }}
              className="mx-auto mt-10 w-full max-w-6xl px-4 sm:px-6"
            >
              <dl className="grid grid-cols-1 divide-y divide-[#E7E5E4] rounded-xl border border-[#E7E5E4] bg-[#F5F5F4]/80 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-baseline justify-between gap-4 px-5 py-4 sm:block sm:px-6 sm:py-5"
                  >
                    <dt className="order-2 text-xs font-medium text-[#57534E] sm:order-none sm:mt-1 sm:text-sm">
                      {stat.label}
                    </dt>
                    <dd className="order-1 font-mono text-xl font-bold tracking-tight text-[#18181B] tabular-nums sm:order-none sm:text-2xl">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          )}
        </section>

        {data.promoBanner && (
          <section
            id="paket-hantaran"
            className="scroll-mt-16 bg-[#18181B] py-14 text-white sm:py-16"
          >
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: "some" }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.45,
                ease: EASE_OUT,
              }}
              className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12"
            >
              <div className="lg:col-span-5">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#27272A] bg-[#27272A]">
                  <img
                    src={promoProduct?.imageUrl ?? "/demo/umkm-hampers.webp"}
                    alt={data.promoBanner.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-7">
                <p className="border-l-2 border-[#C2410C] pl-3 text-xs font-semibold uppercase tracking-widest text-[#FDBA74]">
                  Paket Hantaran &amp; Rapat Kantor
                </p>
                <h2 className="mt-3 font-archivo text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {data.promoBanner.title}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#D6D3D1] sm:text-base">
                  {data.promoBanner.description}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-[#27272A] pt-6">
                  <div>
                    <span className="block text-[11px] font-medium uppercase tracking-wider text-[#A8A29E]">
                      Harga Langsung Kedai
                    </span>
                    <span className="font-mono text-2xl font-bold tabular-nums text-white sm:text-3xl">
                      {data.promoBanner.priceLabel}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
                    {promoProduct && (
                      <button
                        type="button"
                        onClick={() => addOne(promoProduct.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9A3412]"
                      >
                        <Plus size={16} weight="bold" />
                        <span>Tambah Paket ke Keranjang</span>
                      </button>
                    )}

                    {promoCartQty > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsDrawerOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#3F3F46] bg-[#27272A] px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#3F3F46] sm:text-sm"
                      >
                        <span className="font-mono tabular-nums">
                          {promoCartQty} box
                        </span>
                        <span>di keranjang</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        <section
          id="menu"
          className="scroll-mt-16 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#C2410C]">
                  Etalase Kedai
                </p>
                <h2 className="mt-2 font-archivo text-2xl font-extrabold tracking-tight text-[#18181B] sm:text-3xl">
                  Pilih Menu Favoritmu
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#57534E]">
                  Pesan langsung dari etalase kedai dengan harga asli tanpa
                  biaya layanan aplikasi.
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
                  placeholder="Cari kopi aren, matcha, atau croissant..."
                  aria-label="Cari menu"
                  className="w-full rounded-lg border border-[#D6D3D1] bg-[#FFFFFF] py-2.5 pr-9 pl-10 text-sm text-[#18181B] placeholder:text-[#A8A29E] focus:border-[#C2410C] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Hapus pencarian"
                    className="absolute top-1/2 right-2.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#57534E] hover:bg-[#F5F5F4] hover:text-[#18181B]"
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
                        ? "text-[#18181B]"
                        : "text-[#57534E] hover:text-[#18181B]"
                    )}
                  >
                    <span>{category}</span>
                    {isActive && (
                      <motion.span
                        layoutId="umkmCategoryTab"
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
              <div className="mt-10 rounded-xl border border-[#E7E5E4] bg-[#F5F5F4]/60 p-10 text-center">
                <p className="text-base font-semibold text-[#18181B]">
                  Menu tidak ditemukan
                </p>
                <p className="mt-1.5 text-sm text-[#57534E]">
                  Coba kata kunci lain atau pilih kategori Semua untuk melihat
                  seluruh daftar menu.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("Semua");
                  }}
                  className="mt-5 inline-flex items-center rounded-lg border border-[#D6D3D1] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold text-[#18181B] transition-colors hover:bg-[#F5F5F4]"
                >
                  Tampilkan Semua Menu
                </button>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredProducts.map((product, idx) => {
                  const qty = cart[product.id] ?? 0;

                  return (
                    <motion.article
                      key={product.id}
                      initial={
                        prefersReducedMotion ? false : { opacity: 0, y: 12 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: prefersReducedMotion ? 0 : 0.28,
                        delay: prefersReducedMotion
                          ? 0
                          : Math.min(idx * 0.04, 0.24),
                        ease: EASE_OUT,
                      }}
                      className="flex flex-col overflow-hidden rounded-xl border border-[#E7E5E4] bg-[#FFFFFF] transition-colors hover:border-[#D6D3D1]"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(product)}
                        aria-label={`Lihat detail ${product.name}`}
                        className="group aspect-square w-full overflow-hidden bg-[#F5F5F4] text-left"
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </button>

                      <div className="flex flex-1 flex-col p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="font-semibold uppercase tracking-wider text-[#57534E]">
                            {product.category}
                          </span>
                          {product.featured && (
                            <span className="font-semibold text-[#C2410C]">
                              Favorit
                            </span>
                          )}
                        </div>

                        <h3 className="mt-1.5 text-base font-bold leading-snug text-[#18181B]">
                          <button
                            type="button"
                            onClick={() => setSelectedProduct(product)}
                            className="text-left transition-colors hover:text-[#C2410C]"
                          >
                            {product.name}
                          </button>
                        </h3>

                        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-[#57534E]">
                          {product.description}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 border-t border-[#F5F5F4] pt-4">
                          <div className="min-w-0">
                            <span className="block font-mono text-base font-bold tabular-nums text-[#18181B]">
                              {formatRupiah(product.price)}
                            </span>
                            <span className="block text-[11px] text-[#57534E]">
                              per {product.unitLabel}
                            </span>
                          </div>

                          {qty === 0 ? (
                            <button
                              type="button"
                              onClick={() => addOne(product.id)}
                              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#C2410C] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#9A3412]"
                            >
                              <Plus size={14} weight="bold" />
                              <span>Tambah</span>
                            </button>
                          ) : (
                            <div className="inline-flex shrink-0 items-center rounded-lg border border-[#E7E5E4] bg-[#F5F5F4] p-0.5">
                              <button
                                type="button"
                                onClick={() => decrement(product.id)}
                                aria-label={`Kurangi ${product.name}`}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-[#18181B] transition-colors hover:bg-[#FFFFFF]"
                              >
                                <Minus size={14} weight="bold" />
                              </button>
                              <span className="w-7 text-center font-mono text-xs font-semibold tabular-nums text-[#18181B]">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => addOne(product.id)}
                                aria-label={`Tambah ${product.name}`}
                                className="flex h-7 w-7 items-center justify-center rounded-md bg-[#C2410C] text-white transition-colors hover:bg-[#9A3412]"
                              >
                                <Plus size={14} weight="bold" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section
          id="keunggulan"
          className="scroll-mt-16 border-t border-[#E7E5E4] py-16 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#C2410C]">
                Jaminan Rasa &amp; Harga
              </p>
              <h2 className="mt-2 font-archivo text-2xl font-extrabold tracking-tight text-[#18181B] sm:text-3xl">
                Kenapa Pelanggan Langganan di Sini
              </h2>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-12">
              {primaryHighlight && (
                <motion.div
                  initial={
                    prefersReducedMotion ? false : { opacity: 0, y: 16 }
                  }
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: "some" }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.4,
                    ease: EASE_OUT,
                  }}
                  className="flex min-h-[260px] flex-col justify-between rounded-2xl border border-[#E7E5E4] bg-[#F5F5F4] p-7 sm:p-9 md:col-span-6"
                >
                  <span className="font-mono text-xs font-semibold tracking-wider text-[#C2410C] tabular-nums">
                    01
                  </span>
                  <div className="mt-10">
                    <h3 className="font-archivo text-xl font-bold tracking-tight text-[#18181B] sm:text-2xl">
                      {primaryHighlight.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#57534E] sm:text-base">
                      {primaryHighlight.description}
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col gap-6 md:col-span-6">
                {secondaryHighlights.map((item, idx) => (
                  <motion.div
                    key={item.title}
                    initial={
                      prefersReducedMotion ? false : { opacity: 0, y: 16 }
                    }
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: "some" }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.4,
                      delay: prefersReducedMotion ? 0 : (idx + 1) * 0.08,
                      ease: EASE_OUT,
                    }}
                    className="flex flex-1 flex-col justify-between rounded-2xl border border-[#E7E5E4] bg-[#FFFFFF] p-6 sm:p-7"
                  >
                    <span className="font-mono text-xs font-semibold tracking-wider text-[#57534E] tabular-nums">
                      0{idx + 2}
                    </span>
                    <div className="mt-4">
                      <h3 className="font-archivo text-lg font-bold tracking-tight text-[#18181B]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#57534E]">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#E7E5E4] bg-[#F5F5F4]/60 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#C2410C]">
                Testimoni Pembeli
              </p>
              <h2 className="mt-2 font-archivo text-2xl font-extrabold tracking-tight text-[#18181B] sm:text-3xl">
                Kata Mereka yang Udah Coba
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
                    <p className="mt-3 text-sm leading-relaxed text-[#18181B] sm:text-base">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>
                  <footer className="border-t border-[#F5F5F4] pt-4 text-xs text-[#57534E]">
                    <span className="font-semibold text-[#18181B]">
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
                    <h3 className="mt-2 font-archivo text-xl font-extrabold tracking-tight text-[#18181B] sm:text-2xl">
                      Info Pemesanan &amp; Pengiriman
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#57534E]">
                      Cek ketahanan minuman di kulkas, ketentuan pesan rapat
                      kantor, hingga pengiriman kurir instan.
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
                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#F5F5F4]/60 sm:px-6"
                          >
                            <span className="text-sm font-semibold text-[#18181B] sm:text-base">
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
            <div className="grid grid-cols-1 items-center gap-8 rounded-2xl border border-[#E7E5E4] bg-[#F5F5F4] p-6 sm:p-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#C2410C]">
                  Mampir atau Ambil Langsung
                </p>
                <h2 className="mt-2 font-archivo text-2xl font-extrabold tracking-tight text-[#18181B] sm:text-3xl">
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
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D6D3D1] bg-[#FFFFFF] px-5 py-3 text-sm font-semibold text-[#18181B] transition-colors hover:bg-[#F5F5F4]"
                >
                  <WhatsappLogo
                    size={16}
                    weight="bold"
                    className="text-[#C2410C]"
                  />
                  <span>Konsultasi Pesanan via WA</span>
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
            <p className="text-sm font-semibold text-[#18181B]">
              {data.businessName}
            </p>
            <p className="mt-0.5 text-xs text-[#57534E]">
              {data.cityLabel} - {data.openHoursLabel}
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <p className="font-mono text-xs text-[#57534E]">
              Siap pakai domain pribadi: {customDomainHost}
            </p>
            <Link
              href="/"
              className="text-xs font-medium text-[#57534E] transition-colors hover:text-[#18181B]"
            >
              Etalase UMKM oleh KatalogWeb
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
            <div className="flex items-center justify-between gap-4 rounded-xl border border-[#27272A] bg-[#18181B] px-4 py-3 text-white shadow-lg sm:px-5 sm:py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <ShoppingBag
                  size={20}
                  weight="bold"
                  className="shrink-0 text-[#C2410C]"
                />
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
                  <span className="font-mono font-semibold tabular-nums">
                    {totalQty} item
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
                Lihat Pesanan
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
            aria-labelledby="umkm-product-modal-title"
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
                aria-label="Tutup detail produk"
                className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-[#E7E5E4] bg-[#FFFFFF]/95 text-[#18181B] transition-colors hover:bg-[#F5F5F4]"
              >
                <X size={18} weight="bold" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="aspect-square bg-[#F5F5F4] md:col-span-6">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="h-full w-full object-cover"
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
                          Favorit Pelanggan
                        </span>
                      )}
                    </div>

                    <h3
                      id="umkm-product-modal-title"
                      className="mt-2 font-archivo text-2xl font-extrabold tracking-tight text-[#18181B]"
                    >
                      {selectedProduct.name}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-[#57534E]">
                      {selectedProduct.description}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-[#E7E5E4] pt-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-mono text-2xl font-bold tabular-nums text-[#18181B]">
                        {formatRupiah(selectedProduct.price)}
                      </span>
                      <span className="text-xs font-medium text-[#57534E]">
                        per {selectedProduct.unitLabel}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      {(cart[selectedProduct.id] ?? 0) === 0 ? (
                        <button
                          type="button"
                          onClick={() => addOne(selectedProduct.id)}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9A3412]"
                        >
                          <Plus size={16} weight="bold" />
                          <span>Tambah ke Keranjang</span>
                        </button>
                      ) : (
                        <>
                          <div className="inline-flex items-center rounded-lg border border-[#E7E5E4] bg-[#F5F5F4] p-1">
                            <button
                              type="button"
                              onClick={() => decrement(selectedProduct.id)}
                              aria-label={`Kurangi ${selectedProduct.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-[#18181B] transition-colors hover:bg-[#FFFFFF]"
                            >
                              <Minus size={14} weight="bold" />
                            </button>
                            <span className="w-9 text-center font-mono text-sm font-semibold tabular-nums text-[#18181B]">
                              {cart[selectedProduct.id]}
                            </span>
                            <button
                              type="button"
                              onClick={() => addOne(selectedProduct.id)}
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
                            className="flex-1 rounded-lg bg-[#18181B] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#27272A] sm:text-sm"
                          >
                            Buka Keranjang
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
        {isDrawerOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
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
                    id="cart-drawer-title"
                    className="text-base font-bold text-[#18181B]"
                  >
                    Keranjang Pesanan
                  </h2>
                  <span className="rounded-md bg-[#F5F5F4] px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-[#57534E]">
                    {totalQty}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  aria-label="Tutup keranjang"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#57534E] transition-colors hover:bg-[#F5F5F4] hover:text-[#18181B]"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5F5F4] text-[#57534E]">
                    <ShoppingBag size={22} weight="bold" />
                  </div>
                  <p className="mt-4 text-base font-semibold text-[#18181B]">
                    Keranjang masih kosong
                  </p>
                  <p className="mt-1.5 max-w-xs text-sm text-[#57534E]">
                    Pilih kopi botolan, non-kopi, atau croissant favoritmu buat
                    stok kulkas maupun jamuan rapat kantor.
                  </p>
                  <a
                    href="#menu"
                    onClick={() => setIsDrawerOpen(false)}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#C2410C] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9A3412]"
                  >
                    <span>Pilih Menu</span>
                  </a>
                </div>
              ) : (
                <form
                  onSubmit={handleCheckoutSubmit}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <div className="flex-1 space-y-6 overflow-y-auto p-5">
                    <ul className="divide-y divide-[#F5F5F4]">
                      {cartItems.map(({ product, qty }) => (
                        <li
                          key={product.id}
                          className="flex items-start justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#18181B]">
                              {product.name}
                            </p>
                            <p className="mt-0.5 font-mono text-xs tabular-nums text-[#57534E]">
                              {formatRupiah(product.price)} /{" "}
                              {product.unitLabel}
                            </p>
                            <div className="mt-2.5 flex items-center gap-2">
                              <div className="inline-flex items-center rounded-lg border border-[#E7E5E4] bg-[#F5F5F4] p-0.5">
                                <button
                                  type="button"
                                  onClick={() => decrement(product.id)}
                                  aria-label={`Kurangi ${product.name}`}
                                  className="flex h-6 w-6 items-center justify-center rounded-md text-[#18181B] transition-colors hover:bg-[#FFFFFF]"
                                >
                                  <Minus size={12} weight="bold" />
                                </button>
                                <span className="w-7 text-center font-mono text-xs font-semibold tabular-nums text-[#18181B]">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => addOne(product.id)}
                                  aria-label={`Tambah ${product.name}`}
                                  className="flex h-6 w-6 items-center justify-center rounded-md bg-[#C2410C] text-white transition-colors hover:bg-[#9A3412]"
                                >
                                  <Plus size={12} weight="bold" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeItem(product.id)}
                                aria-label={`Hapus ${product.name}`}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-[#57534E] transition-colors hover:bg-[#F5F5F4] hover:text-[#18181B]"
                              >
                                <Trash size={14} weight="bold" />
                              </button>
                            </div>
                          </div>

                          <p className="shrink-0 font-mono text-sm font-bold tabular-nums text-[#18181B]">
                            {formatRupiah(product.price * qty)}
                          </p>
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-4 border-t border-[#E7E5E4] pt-5">
                      <div>
                        <label
                          htmlFor="umkm-customer-name"
                          className="block text-xs font-semibold text-[#18181B]"
                        >
                          Nama Pemesan
                        </label>
                        <input
                          id="umkm-customer-name"
                          type="text"
                          value={customerName}
                          onChange={(event) =>
                            setCustomerName(event.target.value)
                          }
                          placeholder="Contoh: Dimas / Divisi Marketing"
                          className="mt-1.5 w-full rounded-lg border border-[#D6D3D1] bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#18181B] placeholder:text-[#A8A29E] focus:border-[#C2410C] focus:outline-none"
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
                                  "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors",
                                  selected
                                    ? "border-[#C2410C] bg-[#C2410C]/10 text-[#9A3412]"
                                    : "border-[#E7E5E4] bg-[#F5F5F4] text-[#57534E] hover:text-[#18181B]"
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
                            htmlFor="umkm-address"
                            className="block text-xs font-semibold text-[#18181B]"
                          >
                            Alamat Lengkap
                          </label>
                          <textarea
                            id="umkm-address"
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
                              "mt-1.5 w-full rounded-lg border bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#18181B] placeholder:text-[#A8A29E] focus:outline-none",
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
                          htmlFor="umkm-notes"
                          className="block text-xs font-semibold text-[#18181B]"
                        >
                          Catatan (Opsional)
                        </label>
                        <input
                          id="umkm-notes"
                          type="text"
                          value={notes}
                          onChange={(event) => setNotes(event.target.value)}
                          placeholder="Contoh: Less sugar, pisah es, atau kirim jam 10 pagi"
                          className="mt-1.5 w-full rounded-lg border border-[#D6D3D1] bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#18181B] placeholder:text-[#A8A29E] focus:border-[#C2410C] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#E7E5E4] bg-[#F5F5F4] p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#57534E]">
                        Total Harga Kedai
                      </span>
                      <span className="font-mono text-lg font-bold tabular-nums text-[#18181B]">
                        {formatRupiah(subtotal)}
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-[#57534E]">
                      Rincian pesanan langsung terkirim ke WhatsApp kasir,
                      tinggal konfirmasi dan bayar sesuai metode pilihan.
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
