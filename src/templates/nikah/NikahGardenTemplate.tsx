"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowSquareOut,
  CalendarPlus,
  CaretDown,
  CaretUp,
  Check,
  Clock,
  Copy,
  EnvelopeOpen,
  Gift,
  Heart,
  MapPin,
  ShareNetwork,
  Users,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { MusicPlayer } from "@/components/MusicPlayer";
import { getSubdomainUrl } from "@/config/brand";
import type { NikahSiteConfig } from "@/lib/schema";
import { buildWeddingGuestLink, buildWhatsAppUrl, cn } from "@/lib/utils";

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function getInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "R";
}

function padTwo(value: number): string {
  return String(Math.max(0, value)).padStart(2, "0");
}

function buildGoogleCalendarUrl(params: {
  title: string;
  weddingDateIso: string;
  timeLabel: string;
  venueName: string;
  address: string;
  details: string;
}): string {
  const isoMatch = params.weddingDateIso.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/
  );
  const datePart = isoMatch ? `${isoMatch[1]}${isoMatch[2]}${isoMatch[3]}` : "20261220";
  const defaultStart = isoMatch ? `${isoMatch[4]}${isoMatch[5]}00` : "080000";

  const timeRangeMatch = params.timeLabel.match(
    /(\d{1,2})[.:](\d{2})\s*-\s*(\d{1,2})[.:](\d{2})/
  );

  let startTime = defaultStart;
  let endTime = "100000";

  if (timeRangeMatch) {
    startTime = `${padTwo(Number(timeRangeMatch[1]))}${timeRangeMatch[2]}00`;
    endTime = `${padTwo(Number(timeRangeMatch[3]))}${timeRangeMatch[4]}00`;
  } else if (isoMatch) {
    const endHour = Math.min(23, Number(isoMatch[4]) + 2);
    endTime = `${padTwo(endHour)}${isoMatch[5]}00`;
  }

  const query = new URLSearchParams({
    action: "TEMPLATE",
    text: params.title,
    dates: `${datePart}T${startTime}/${datePart}T${endTime}`,
    details: params.details,
    location: `${params.venueName}, ${params.address}`,
    ctz: "Asia/Jakarta",
  });

  return `https://calendar.google.com/calendar/render?${query.toString()}`;
}

export function NikahGardenTemplate({
  site,
  embedded = false,
}: {
  site: NikahSiteConfig;
  embedded?: boolean;
}) {
  const { data } = site;
  const [isOpened, setIsOpened] = useState(false);
  const [guestName, setGuestName] = useState("Tamu Undangan");
  const [countdown, setCountdown] = useState<CountdownState | null>(null);

  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  const [rsvpName, setRsvpName] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState<"Hadir" | "Berhalangan">("Hadir");
  const [rsvpCount, setRsvpCount] = useState("2");
  const [rsvpWish, setRsvpWish] = useState("");
  const [rsvpError, setRsvpError] = useState("");

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [guestListInput, setGuestListInput] = useState(
    "Ahmad Hidayatullah\nKeluarga Bapak Budi Santoso\nRina & Partner"
  );
  const [copiedGuestLink, setCopiedGuestLink] = useState<string | null>(null);
  const guestCopyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const toParam = params.get("to")?.trim();
      if (toParam) {
        setGuestName(toParam);
        setRsvpName((prev) => (prev ? prev : toParam));
      }
      if (params.get("share") === "1") {
        setIsShareOpen(true);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const targetMs = new Date(data.weddingDateIso).getTime();

    const updateCountdown = () => {
      if (Number.isNaN(targetMs)) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: false,
        });
        return;
      }

      const diff = targetMs - Date.now();
      if (diff <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
        });
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      setCountdown({
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        isPast: false,
      });
    };

    const initialTimer = window.setTimeout(updateCountdown, 0);
    const interval = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [data.weddingDateIso]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      if (guestCopyTimerRef.current !== null) {
        window.clearTimeout(guestCopyTimerRef.current);
      }
    };
  }, []);

  const coupleTitle = `${data.groom.nickname} & ${data.bride.nickname}`;
  const coverImage = data.gallery[0] ?? "/demo/nikah-couple.webp";
  const baseSubdomainUrl = getSubdomainUrl(site.slug);

  const akadCalendarUrl = useMemo(
    () =>
      buildGoogleCalendarUrl({
        title: `Akad Nikah ${coupleTitle}`,
        weddingDateIso: data.weddingDateIso,
        timeLabel: data.akad.timeLabel,
        venueName: data.akad.venueName,
        address: data.akad.address,
        details: `Undangan Akad Nikah ${data.groom.fullName} & ${data.bride.fullName}.`,
      }),
    [
      coupleTitle,
      data.akad.address,
      data.akad.timeLabel,
      data.akad.venueName,
      data.bride.fullName,
      data.groom.fullName,
      data.weddingDateIso,
    ]
  );

  const resepsiCalendarUrl = useMemo(
    () =>
      buildGoogleCalendarUrl({
        title: `Resepsi Pernikahan ${coupleTitle}`,
        weddingDateIso: data.weddingDateIso,
        timeLabel: data.resepsi.timeLabel,
        venueName: data.resepsi.venueName,
        address: data.resepsi.address,
        details: `Undangan Resepsi Pernikahan ${data.groom.fullName} & ${data.bride.fullName}.`,
      }),
    [
      coupleTitle,
      data.bride.fullName,
      data.groom.fullName,
      data.resepsi.address,
      data.resepsi.timeLabel,
      data.resepsi.venueName,
      data.weddingDateIso,
    ]
  );

  const generatedGuestLinks = useMemo(() => {
    const names = guestListInput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    return names.map((name) => ({
      name,
      url: buildWeddingGuestLink(baseSubdomainUrl, name),
    }));
  }, [baseSubdomainUrl, guestListInput]);

  const handleCopyAccount = async (accountNumber: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopiedAccount(accountNumber);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopiedAccount(null);
      }, 2000);
    } catch {
      setCopiedAccount(null);
    }
  };

  const handleCopyGuestLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedGuestLink(url);
      if (guestCopyTimerRef.current !== null) {
        window.clearTimeout(guestCopyTimerRef.current);
      }
      guestCopyTimerRef.current = window.setTimeout(() => {
        setCopiedGuestLink(null);
      }, 2000);
    } catch {
      setCopiedGuestLink(null);
    }
  };

  const handleRsvpSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanedName = rsvpName.trim();
    if (!cleanedName) {
      setRsvpError("Mohon isi nama tamu terlebih dahulu.");
      return;
    }

    setRsvpError("");
    const lines = [
      `Halo ${coupleTitle}, saya ingin konfirmasi kehadiran:`,
      "",
      `Nama Tamu: ${cleanedName}`,
      `Kehadiran: ${rsvpStatus}`,
    ];

    if (rsvpStatus === "Hadir") {
      lines.push(`Jumlah Tamu: ${rsvpCount || "1"} orang`);
    }

    if (rsvpWish.trim()) {
      lines.push(`Ucapan & Doa: ${rsvpWish.trim()}`);
    }

    const whatsappUrl = buildWhatsAppUrl(data.rsvpWhatsapp, lines.join("\n"));
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={cn(
        "font-jakarta bg-white text-[#1F2937] antialiased selection:bg-[#132A20] selection:text-white",
        embedded && "relative min-h-[760px] overflow-hidden"
      )}
    >
      {/* Personalized Cover Gate */}
      {!isOpened && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Sampul Undangan ${coupleTitle}`}
          className={cn(
            embedded ? "absolute inset-0 z-30" : "fixed inset-0 z-30",
            "flex flex-col justify-between overflow-y-auto bg-[#132A20] text-white"
          )}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <img
              src={coverImage}
              alt={`Foto sampul pernikahan ${coupleTitle}`}
              className="h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#132A20]/90 via-[#132A20]/85 to-[#132A20]" />
          </div>

          <div className="relative z-10 mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-between px-6 py-12 text-center sm:py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#9A7B3E]/60 bg-[#132A20]/70 font-serif-editorial text-lg tracking-widest text-[#E5D3A8]">
                {getInitial(data.groom.nickname)}&amp;{getInitial(data.bride.nickname)}
              </div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#D7C49E]">
                The Wedding Celebration
              </p>
            </div>

            <div className="my-10 space-y-5">
              <h1 className="font-serif-editorial text-5xl font-medium italic leading-[1.15] pb-1 text-white sm:text-6xl md:text-7xl">
                {coupleTitle}
              </h1>
              <p className="text-sm tracking-wide text-white/80">
                {data.akad.dateLabel}
              </p>
            </div>

            <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/5 px-6 py-6 backdrop-blur-sm">
              <p className="text-xs tracking-wide text-white/75">
                Kepada Yth. Bapak/Ibu/Saudara/i
              </p>
              <p className="mt-2 font-serif-editorial text-2xl font-medium italic leading-[1.15] pb-1 text-[#F4E9D2] sm:text-3xl">
                {guestName}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                Tanpa mengurangi rasa hormat, kami mengundang Anda untuk menghadiri hari bahagia kami.
              </p>
              <button
                type="button"
                onClick={() => setIsOpened(true)}
                className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#132A20] transition-colors hover:bg-[#F2F6F3] active:scale-[0.99]"
              >
                <EnvelopeOpen size={18} weight="regular" />
                <span>Buka Undangan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>
        {/* 1. Asymmetric Hero & Blessing Quote */}
        <section className="border-b border-[#132A20]/10 bg-white">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 sm:px-10 lg:grid-cols-12 lg:gap-12 lg:py-24">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#9A7B3E]">
                Undangan Pernikahan
              </p>
              <h2 className="mt-4 font-serif-editorial text-5xl font-medium italic leading-[1.15] pb-1 text-[#132A20] sm:text-6xl lg:text-7xl">
                {coupleTitle}
              </h2>
              <p className="mt-3 text-base font-medium text-[#1F2937]/80">
                {data.akad.dateLabel} - {data.akad.venueName}
              </p>

              <blockquote className="mt-8 border-l-2 border-[#9A7B3E] pl-5">
                <p className="text-sm leading-relaxed text-[#1F2937] sm:text-base">
                  &ldquo;{data.blessingQuote.text}&rdquo;
                </p>
                <footer className="mt-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7B3E]">
                  {data.blessingQuote.source}
                </footer>
              </blockquote>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#jadwal-acara"
                  className="inline-flex items-center gap-2 rounded-full bg-[#132A20] px-5 py-2.5 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-[#1C3D2F]"
                >
                  <CalendarPlus size={16} weight="regular" />
                  <span>Lihat Jadwal Acara</span>
                </a>
                <a
                  href="#rsvp-ucapan"
                  className="inline-flex items-center gap-2 rounded-full border border-[#132A20]/25 bg-white px-5 py-2.5 text-xs font-semibold tracking-wide text-[#132A20] transition-colors hover:bg-[#F2F6F3]"
                >
                  <WhatsappLogo size={16} weight="regular" />
                  <span>Konfirmasi RSVP</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-[#132A20]/10 bg-[#F2F6F3] p-2.5">
                <div className="aspect-[4/5] overflow-hidden rounded-xl">
                  <img
                    src={coverImage}
                    alt={`Potret pasangan ${data.groom.fullName} dan ${data.bride.fullName}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Mempelai Profiles (Split Editorial 2-Column) */}
        <section className="border-b border-[#132A20]/10 bg-[#F2F6F3] py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-6 sm:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#9A7B3E]">
                Mempelai Berbahagia
              </p>
              <h2 className="mt-3 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#132A20] sm:text-5xl">
                Dengan Memohon Rahmat Tuhan
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#1F2937]/80 sm:text-base">
                Kami bermaksud menyelenggarakan ikatan suci pernikahan putra-putri kami yang tercinta.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
              <article className="rounded-2xl border border-[#132A20]/10 bg-white p-6 sm:p-8">
                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-[#F2F6F3]">
                  <img
                    src={data.groom.photoUrl}
                    alt={`Potret mempelai pria ${data.groom.fullName}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-6 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9A7B3E]">
                    Mempelai Pria
                  </p>
                  <h3 className="mt-2 font-serif-editorial text-3xl font-medium italic leading-[1.15] pb-1 text-[#132A20] sm:text-4xl">
                    {data.groom.nickname}
                  </h3>
                  <p className="mt-1 text-base font-semibold text-[#1F2937]">
                    {data.groom.fullName}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#1F2937]/75">
                    {data.groom.parents}
                  </p>
                </div>
              </article>

              <article className="rounded-2xl border border-[#132A20]/10 bg-white p-6 sm:p-8">
                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-[#F2F6F3]">
                  <img
                    src={data.bride.photoUrl}
                    alt={`Potret mempelai wanita ${data.bride.fullName}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-6 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9A7B3E]">
                    Mempelai Wanita
                  </p>
                  <h3 className="mt-2 font-serif-editorial text-3xl font-medium italic leading-[1.15] pb-1 text-[#132A20] sm:text-4xl">
                    {data.bride.nickname}
                  </h3>
                  <p className="mt-1 text-base font-semibold text-[#1F2937]">
                    {data.bride.fullName}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#1F2937]/75">
                    {data.bride.parents}
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 3. Countdown & Akad/Resepsi Schedule */}
        <section
          id="jadwal-acara"
          className="border-b border-[#132A20]/10 bg-white py-16 sm:py-24"
        >
          <div className="mx-auto max-w-5xl px-6 sm:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#9A7B3E]">
                Menuju Hari Bahagia
              </p>
              <h2 className="mt-3 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#132A20] sm:text-5xl">
                Rangkaian Acara
              </h2>
            </div>

            {/* Countdown Tiles */}
            <div className="mx-auto mt-10 max-w-xl">
              {countdown?.isPast ? (
                <div className="rounded-2xl border border-[#132A20]/15 bg-[#F2F6F3] px-6 py-5 text-center">
                  <p className="font-serif-editorial text-2xl font-medium italic leading-[1.15] pb-1 text-[#132A20]">
                    Hari Bahagia Telah Tiba
                  </p>
                  <p className="mt-1 text-xs text-[#1F2937]/75">
                    Terima kasih atas doa restu dan kehadiran Anda.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3 sm:gap-4">
                  {[
                    {
                      label: "Hari",
                      value: countdown ? padTwo(countdown.days) : "--",
                    },
                    {
                      label: "Jam",
                      value: countdown ? padTwo(countdown.hours) : "--",
                    },
                    {
                      label: "Menit",
                      value: countdown ? padTwo(countdown.minutes) : "--",
                    },
                    {
                      label: "Detik",
                      value: countdown ? padTwo(countdown.seconds) : "--",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-[#132A20]/15 bg-[#F2F6F3] px-3 py-4 text-center sm:py-5"
                    >
                      <p className="tabular-nums font-serif-editorial text-3xl font-semibold text-[#132A20] sm:text-4xl">
                        {item.value}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A7B3E]">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Akad & Resepsi Cards */}
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              {[
                {
                  key: "akad",
                  title: "Akad Nikah",
                  event: data.akad,
                  calendarUrl: akadCalendarUrl,
                },
                {
                  key: "resepsi",
                  title: "Resepsi Pernikahan",
                  event: data.resepsi,
                  calendarUrl: resepsiCalendarUrl,
                },
              ].map((card) => (
                <article
                  key={card.key}
                  className="flex flex-col justify-between rounded-2xl border border-[#132A20]/15 bg-[#F2F6F3]/60 p-6 sm:p-8"
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9A7B3E]">
                      Jadwal Utama
                    </p>
                    <h3 className="mt-2 font-serif-editorial text-3xl font-medium italic leading-[1.15] pb-1 text-[#132A20]">
                      {card.title}
                    </h3>

                    <dl className="mt-6 space-y-3 border-t border-[#132A20]/10 pt-5 text-sm text-[#1F2937]">
                      <div className="flex items-start gap-3">
                        <CalendarPlus
                          size={18}
                          weight="regular"
                          className="mt-0.5 shrink-0 text-[#9A7B3E]"
                        />
                        <div>
                          <dt className="sr-only">Tanggal</dt>
                          <dd className="font-semibold text-[#132A20]">
                            {card.event.dateLabel}
                          </dd>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock
                          size={18}
                          weight="regular"
                          className="mt-0.5 shrink-0 text-[#9A7B3E]"
                        />
                        <div>
                          <dt className="sr-only">Waktu</dt>
                          <dd className="tabular-nums">{card.event.timeLabel}</dd>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin
                          size={18}
                          weight="regular"
                          className="mt-0.5 shrink-0 text-[#9A7B3E]"
                        />
                        <div>
                          <dt className="sr-only">Lokasi</dt>
                          <dd className="font-semibold text-[#132A20]">
                            {card.event.venueName}
                          </dd>
                          <dd className="mt-0.5 leading-relaxed text-[#1F2937]/80">
                            {card.event.address}
                          </dd>
                        </div>
                      </div>
                    </dl>
                  </div>

                  <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                    <a
                      href={card.event.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#132A20] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1C3D2F]"
                    >
                      <MapPin size={15} weight="regular" />
                      <span>Buka Google Maps</span>
                      <ArrowSquareOut size={14} weight="regular" />
                    </a>
                    <a
                      href={card.calendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#132A20]/25 bg-white px-4 py-2.5 text-xs font-semibold text-[#132A20] transition-colors hover:bg-[#F2F6F3]"
                    >
                      <CalendarPlus size={15} weight="regular" />
                      <span>Simpan ke Google Calendar</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Cerita Singkat & Galeri Foto */}
        <section className="border-b border-[#132A20]/10 bg-[#F2F6F3] py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-6 sm:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#9A7B3E]">
                Perjalanan Kami
              </p>
              <h2 className="mt-3 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#132A20] sm:text-5xl">
                Cerita Singkat
              </h2>
            </div>

            <div className="mx-auto mt-12 max-w-2xl">
              <ol className="relative space-y-8 border-l border-[#132A20]/20 pl-7 sm:pl-9">
                {data.storyTimeline.map((item) => (
                  <li key={`${item.year}-${item.title}`} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[33px] top-1.5 h-2.5 w-2.5 rounded-full border border-[#9A7B3E] bg-white sm:-left-[41px]"
                    />
                    <div className="rounded-2xl border border-[#132A20]/10 bg-white p-6">
                      <p className="tabular-nums text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7B3E]">
                        {item.year}
                      </p>
                      <h3 className="mt-1.5 font-serif-editorial text-2xl font-medium italic leading-[1.15] pb-1 text-[#132A20]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#1F2937]/85">
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="border-b border-[#132A20]/10 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-6 sm:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#9A7B3E]">
                Momen Kebersamaan
              </p>
              <h2 className="mt-3 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#132A20] sm:text-5xl">
                Galeri Foto
              </h2>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {data.gallery.map((photoUrl, index) => (
                <figure
                  key={`${photoUrl}-${index}`}
                  className="overflow-hidden rounded-2xl border border-[#132A20]/10 bg-[#F2F6F3] p-2"
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-xl">
                    <img
                      src={photoUrl}
                      alt={`Momen prewedding ${data.groom.nickname} dan ${data.bride.nickname} foto ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Amplop Digital */}
        <section className="border-b border-[#132A20]/10 bg-[#F2F6F3] py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-6 sm:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#9A7B3E]/40 bg-white text-[#9A7B3E]">
                <Gift size={20} weight="regular" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.26em] text-[#9A7B3E]">
                Tanda Kasih
              </p>
              <h2 className="mt-2 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#132A20] sm:text-5xl">
                Amplop Digital
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#1F2937]/80 sm:text-base">
                Doa restu Anda merupakan karunia terindah bagi kami. Namun apabila hendak memberikan tanda kasih, dapat melalui rekening berikut.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
              {data.digitalEnvelopes.map((envelope) => {
                const isCopied = copiedAccount === envelope.accountNumber;
                return (
                  <div
                    key={`${envelope.bankName}-${envelope.accountNumber}`}
                    className="flex flex-col justify-between rounded-2xl border border-[#132A20]/15 bg-white p-6"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7B3E]">
                        Bank {envelope.bankName}
                      </p>
                      <p className="tabular-nums mt-3 text-2xl font-semibold tracking-tight text-[#132A20]">
                        {envelope.accountNumber}
                      </p>
                      <p className="mt-1 text-sm text-[#1F2937]/80">
                        a.n. {envelope.accountHolder}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyAccount(envelope.accountNumber)}
                      className={cn(
                        "mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors",
                        isCopied
                          ? "border-[#132A20] bg-[#132A20] text-white"
                          : "border-[#132A20]/25 bg-[#F2F6F3] text-[#132A20] hover:bg-[#132A20] hover:text-white"
                      )}
                    >
                      {isCopied ? (
                        <>
                          <Check size={15} weight="bold" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy size={15} weight="regular" />
                          <span>Salin Nomor Rekening</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. RSVP & Ucapan WhatsApp + Collapsible Generator Link Tamu */}
        <section id="rsvp-ucapan" className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-6 sm:px-10">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#9A7B3E]">
                Konfirmasi &amp; Doa
              </p>
              <h2 className="mt-3 font-serif-editorial text-4xl font-medium italic leading-[1.15] pb-1 text-[#132A20] sm:text-5xl">
                RSVP &amp; Ucapan
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#1F2937]/80 sm:text-base">
                Konfirmasikan kehadiran Anda dan kirimkan doa terbaik langsung ke WhatsApp kami.
              </p>
            </div>

            <form
              onSubmit={handleRsvpSubmit}
              className="mt-10 rounded-2xl border border-[#132A20]/15 bg-[#F2F6F3]/60 p-6 sm:p-8"
            >
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="rsvp-guest-name"
                    className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#132A20]"
                  >
                    Nama Tamu
                  </label>
                  <input
                    id="rsvp-guest-name"
                    type="text"
                    value={rsvpName}
                    onChange={(event) => {
                      setRsvpName(event.target.value);
                      if (rsvpError) setRsvpError("");
                    }}
                    placeholder="Masukkan nama lengkap Anda"
                    className="mt-2 w-full rounded-xl border border-[#132A20]/25 bg-white px-4 py-3 text-sm text-[#1F2937] placeholder:text-[#1F2937]/45 focus:border-[#132A20] focus:outline-none"
                  />
                  {rsvpError && (
                    <p className="mt-1.5 text-xs font-medium text-red-700">
                      {rsvpError}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#132A20]">
                      Status Kehadiran
                    </span>
                    <div className="mt-2 grid grid-cols-2 gap-2.5">
                      {(["Hadir", "Berhalangan"] as const).map((status) => {
                        const active = rsvpStatus === status;
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setRsvpStatus(status)}
                            className={cn(
                              "cursor-pointer rounded-xl border px-3 py-3 text-xs font-semibold transition-colors",
                              active
                                ? "border-[#132A20] bg-[#132A20] text-white"
                                : "border-[#132A20]/25 bg-white text-[#132A20] hover:bg-[#F2F6F3]"
                            )}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="rsvp-guest-count"
                      className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#132A20]"
                    >
                      Jumlah Tamu
                    </label>
                    <div className="relative mt-2">
                      <Users
                        size={16}
                        weight="regular"
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#132A20]/60"
                      />
                      <select
                        id="rsvp-guest-count"
                        value={rsvpCount}
                        disabled={rsvpStatus === "Berhalangan"}
                        onChange={(event) => setRsvpCount(event.target.value)}
                        className="w-full rounded-xl border border-[#132A20]/25 bg-white py-3 pl-10 pr-4 text-sm text-[#1F2937] focus:border-[#132A20] focus:outline-none disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
                      >
                        <option value="1">1 Orang</option>
                        <option value="2">2 Orang</option>
                        <option value="3">3 Orang</option>
                        <option value="4">4 Orang</option>
                        <option value="5">5 Orang</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="rsvp-wish"
                    className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#132A20]"
                  >
                    Ucapan &amp; Doa
                  </label>
                  <textarea
                    id="rsvp-wish"
                    rows={3}
                    value={rsvpWish}
                    onChange={(event) => setRsvpWish(event.target.value)}
                    placeholder="Tuliskan ucapan hangat atau doa untuk kedua mempelai"
                    className="mt-2 w-full rounded-xl border border-[#132A20]/25 bg-white px-4 py-3 text-sm text-[#1F2937] placeholder:text-[#1F2937]/45 focus:border-[#132A20] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#132A20] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1C3D2F] active:scale-[0.99]"
                >
                  <WhatsappLogo size={18} weight="regular" />
                  <span>Kirim Konfirmasi via WhatsApp</span>
                </button>
              </div>
            </form>

            {/* Collapsible Guest Link Generator */}
            <div className="mt-8 rounded-2xl border border-[#132A20]/15 bg-white">
              <button
                type="button"
                aria-expanded={isShareOpen}
                onClick={() => setIsShareOpen((prev) => !prev)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F2F6F3] text-[#132A20]">
                    <ShareNetwork size={18} weight="regular" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#132A20]">
                      Buat Link Undangan Khusus Tamu
                    </p>
                    <p className="text-xs text-[#1F2937]/70">
                      Siapkan link personal dengan nama tamu otomatis untuk dibagikan ke WhatsApp.
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-[#132A20]">
                  {isShareOpen ? (
                    <CaretUp size={18} weight="bold" />
                  ) : (
                    <CaretDown size={18} weight="bold" />
                  )}
                </span>
              </button>

              {isShareOpen && (
                <div className="border-t border-[#132A20]/10 px-6 py-6">
                  <label
                    htmlFor="guest-link-generator-input"
                    className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#132A20]"
                  >
                    Daftar Nama Tamu (1 Nama per Baris)
                  </label>
                  <textarea
                    id="guest-link-generator-input"
                    rows={4}
                    value={guestListInput}
                    onChange={(event) => setGuestListInput(event.target.value)}
                    placeholder={"Ahmad Hidayatullah\nKeluarga Bapak Budi Santoso\nRina & Partner"}
                    className="mt-2 w-full rounded-xl border border-[#132A20]/25 bg-white px-4 py-3 text-sm text-[#1F2937] placeholder:text-[#1F2937]/45 focus:border-[#132A20] focus:outline-none"
                  />

                  {generatedGuestLinks.length > 0 && (
                    <div className="mt-5 space-y-2.5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A7B3E]">
                        Link Siap Bagikan ({generatedGuestLinks.length})
                      </p>
                      <ul className="space-y-2.5">
                        {generatedGuestLinks.map((item, idx) => {
                          const isCopied = copiedGuestLink === item.url;
                          return (
                            <li
                              key={`${item.name}-${idx}`}
                              className="flex flex-col justify-between gap-3 rounded-xl border border-[#132A20]/10 bg-[#F2F6F3] p-3.5 sm:flex-row sm:items-center"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#132A20]">
                                  {item.name}
                                </p>
                                <p className="truncate text-xs text-[#1F2937]/75">
                                  {item.url}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyGuestLink(item.url)}
                                className={cn(
                                  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                                  isCopied
                                    ? "border-[#132A20] bg-[#132A20] text-white"
                                    : "border-[#132A20]/25 bg-white text-[#132A20] hover:bg-[#132A20] hover:text-white"
                                )}
                              >
                                {isCopied ? (
                                  <>
                                    <Check size={14} weight="bold" />
                                    <span>Tersalin</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={14} weight="regular" />
                                    <span>Salin Link</span>
                                  </>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#132A20]/10 bg-[#F2F6F3] px-6 py-10 text-center">
        <div className="mx-auto max-w-xl">
          <div className="inline-flex items-center gap-2 text-[#9A7B3E]">
            <Heart size={16} weight="fill" />
            <span className="font-serif-editorial text-xl font-medium italic leading-[1.15] pb-1 text-[#132A20]">
              {coupleTitle}
            </span>
          </div>
          <p className="mt-3 text-xs text-[#1F2937]/70">
            Undangan digital dibuat lewat{" "}
            <Link
              href="/"
              className="font-semibold text-[#132A20] underline decoration-[#9A7B3E]/60 underline-offset-4 transition-colors hover:text-[#9A7B3E]"
            >
              KatalogWeb
            </Link>
          </p>
        </div>
      </footer>

      <MusicPlayer
        track={site.musicTrack}
        autoPlayTrigger={isOpened}
        className={embedded ? "absolute right-4 bottom-4 z-20" : undefined}
      />
    </div>
  );
}
