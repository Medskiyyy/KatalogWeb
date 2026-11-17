"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  MapPin,
  Minus,
  Plus,
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

export function UmkmKatalogTemplate({
  site,
  embedded = false,
}: {
  site: UmkmSiteConfig;
  embedded?: boolean;
}) {
  const { data } = site;

  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [cart, setCart] = useState<Record<string, number>>({});
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
    if (activeCategory === "Semua") return data.products;
    return data.products.filter((p) => p.category === activeCategory);
  }, [activeCategory, data.products]);

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
        `Halo ${data.businessName}, saya ingin bertanya seputar menu yang tersedia hari ini.`
      ),
    [data.businessName, data.whatsappNumber]
  );

  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
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
  }, [isDrawerOpen, embedded]);

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

  return (
    <div
      id="top"
      className="relative min-h-full bg-[#FFFFFF] font-sans text-[#18181B] selection:bg-[#C2410C]/15 selection:text-[#9A3412]"
    >
      <header className="sticky top-0 z-20 h-16 border-b border-[#E7E5E4] bg-[#FFFFFF]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a
            href="#top"
            className="flex min-w-0 items-baseline gap-2.5 whitespace-nowrap"
          >
            <span className="truncate text-base font-bold tracking-tight text-[#18181B] sm:text-lg">
              {data.businessName}
            </span>
            <span className="hidden text-xs font-medium text-[#57534E] sm:inline">
              {data.cityLabel}
            </span>
          </a>

          <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-7 text-sm font-medium text-[#57534E] md:flex"
          >
            <a
              href="#menu"
              className="whitespace-nowrap transition-colors hover:text-[#18181B]"
            >
              Menu
            </a>
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
            "pt-16 pb-12",
            !embedded && "flex min-h-[100dvh] items-center"
          )}
        >
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#E7E5E4] bg-[#F5F5F4] px-3.5 py-1.5 text-xs text-[#57534E]">
                <Clock size={14} weight="bold" className="shrink-0 text-[#C2410C]" />
                <span className="font-semibold text-[#18181B]">
                  {data.categoryLabel}
                </span>
                <span aria-hidden="true">/</span>
                <span>{data.openHoursLabel}</span>
              </div>

              <h1 className="mt-6 text-3xl font-bold leading-[1.12] tracking-tight text-[#18181B] sm:text-4xl lg:text-5xl">
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
                  <span>Lihat Katalog</span>
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
                  <span>Chat WhatsApp</span>
                </a>
              </div>

              <div className="mt-6 flex items-start gap-2 text-xs font-medium text-[#57534E]">
                <MapPin size={15} weight="bold" className="mt-0.5 shrink-0" />
                <span>
                  {data.cityLabel} - {data.address}
                </span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#E7E5E4] bg-[#F5F5F4]">
                <img
                  src={data.heroImageUrl}
                  alt={`${data.businessName} - ${data.categoryLabel}`}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section
          id="menu"
          className="scroll-mt-16 border-t border-[#E7E5E4] py-16 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#C2410C]">
                  Katalog Produk
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl">
                  Menu Pilihan Hari Ini
                </h2>
              </div>

              <div
                role="tablist"
                aria-label="Filter kategori menu"
                className="flex flex-wrap gap-2"
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
                        "rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm",
                        isActive
                          ? "border-[#18181B] bg-[#18181B] text-white"
                          : "border-[#E7E5E4] bg-[#F5F5F4] text-[#57534E] hover:border-[#D6D3D1] hover:text-[#18181B]"
                      )}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const qty = cart[product.id] ?? 0;

                return (
                  <article
                    key={product.id}
                    className="flex flex-col overflow-hidden rounded-xl border border-[#E7E5E4] bg-[#FFFFFF]"
                  >
                    <div className="aspect-square w-full overflow-hidden bg-[#F5F5F4]">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold uppercase tracking-wider text-[#57534E]">
                          {product.category}
                        </span>
                        {product.featured && (
                          <span className="font-semibold text-[#C2410C]">
                            Favorit
                          </span>
                        )}
                      </div>

                      <h3 className="mt-1.5 text-lg font-bold leading-snug text-[#18181B]">
                        {product.name}
                      </h3>

                      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-[#57534E]">
                        {product.description}
                      </p>

                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#F5F5F4] pt-4">
                        <div className="min-w-0">
                          <span className="font-mono text-base font-bold tabular-nums text-[#18181B]">
                            {formatRupiah(product.price)}
                          </span>
                          <span className="ml-1 text-xs text-[#57534E]">
                            / {product.unitLabel}
                          </span>
                        </div>

                        {qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => addOne(product.id)}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#C2410C] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#9A3412]"
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
                            <span className="w-8 text-center font-mono text-sm font-semibold tabular-nums text-[#18181B]">
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
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="keunggulan"
          className="scroll-mt-16 border-t border-[#E7E5E4] py-16 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#C2410C]">
                Kenapa Pilih Kami
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl">
                Standar Sajian &amp; Pemesanan
              </h2>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-12">
              {primaryHighlight && (
                <div className="flex min-h-[260px] flex-col justify-between rounded-2xl border border-[#E7E5E4] bg-[#F5F5F4] p-7 sm:p-9 md:col-span-6">
                  <span className="font-mono text-xs font-semibold tracking-wider text-[#C2410C] tabular-nums">
                    01
                  </span>
                  <div className="mt-10">
                    <h3 className="text-xl font-bold tracking-tight text-[#18181B] sm:text-2xl">
                      {primaryHighlight.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#57534E] sm:text-base">
                      {primaryHighlight.description}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-6 md:col-span-6">
                {secondaryHighlights.map((item, idx) => (
                  <div
                    key={item.title}
                    className="flex flex-1 flex-col justify-between rounded-2xl border border-[#E7E5E4] bg-[#FFFFFF] p-6 sm:p-7"
                  >
                    <span className="font-mono text-xs font-semibold tracking-wider text-[#57534E] tabular-nums">
                      0{idx + 2}
                    </span>
                    <div className="mt-4">
                      <h3 className="text-lg font-bold tracking-tight text-[#18181B]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#57534E]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#E7E5E4] bg-[#F5F5F4]/60 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#C2410C]">
                Testimoni Pelanggan
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl">
                Ulasan Pembeli di {data.cityLabel}
              </h2>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {data.testimonials.map((item) => (
                <blockquote
                  key={`${item.author}-${item.role}`}
                  className="flex flex-col justify-between gap-5 rounded-xl border border-[#E7E5E4] bg-[#FFFFFF] p-6"
                >
                  <p className="text-sm leading-relaxed text-[#18181B] sm:text-base">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <footer className="border-t border-[#F5F5F4] pt-4 text-xs text-[#57534E]">
                    <span className="font-semibold text-[#18181B]">
                      {item.author}
                    </span>
                    <span> - {item.role}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
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
                  Lokasi &amp; Jam Buka
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl">
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
                  <span>Tanya Lewat WhatsApp</span>
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
          <Link
            href="/"
            className="text-xs font-medium text-[#57534E] transition-colors hover:text-[#18181B]"
          >
            Etalase UMKM oleh KatalogWeb
          </Link>
        </div>
      </footer>

      {totalQty > 0 && (
        <div
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
        </div>
      )}

      {isDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-drawer-title"
          className={cn(
            "inset-0 z-40 flex justify-end bg-black/45 backdrop-blur-[1px]",
            embedded ? "absolute items-start" : "fixed"
          )}
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
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
                <span className="rounded-full bg-[#F5F5F4] px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-[#57534E]">
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
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F4] text-[#57534E]">
                  <ShoppingBag size={22} weight="bold" />
                </div>
                <p className="mt-4 text-base font-semibold text-[#18181B]">
                  Keranjang masih kosong
                </p>
                <p className="mt-1.5 max-w-xs text-sm text-[#57534E]">
                  Tambahkan menu favoritmu terlebih dahulu untuk menyusun pesanan
                  otomatis ke WhatsApp.
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
                            {formatRupiah(product.price)} / {product.unitLabel}
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
                        placeholder="Contoh: Raka Pratama"
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
                          placeholder="Nama jalan, nomor rumah, patokan, kecamatan"
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
                        placeholder="Contoh: Kurangi es, tanpa gula tambahan"
                        className="mt-1.5 w-full rounded-lg border border-[#D6D3D1] bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#18181B] placeholder:text-[#A8A29E] focus:border-[#C2410C] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#E7E5E4] bg-[#F5F5F4] p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#57534E]">
                      Total Perkiraan
                    </span>
                    <span className="font-mono text-lg font-bold tabular-nums text-[#18181B]">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9A3412]"
                  >
                    <WhatsappLogo size={18} weight="bold" />
                    <span>Kirim Order ke WhatsApp</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
