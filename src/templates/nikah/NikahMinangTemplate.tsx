"use client";

import type { NikahSiteConfig } from "@/lib/schema";
import {
  NikahMotionShell,
  type NikahMotionTheme,
} from "@/templates/nikah/NikahMotionShell";

const MINANG_THEME: NikahMotionTheme = {
  id: "minang",
  assets: {
    sky: "/demo/motion/minang/sky.webp",
    floralGarland: "/demo/motion/minang/floral-garland.webp",
    floralTree: "/demo/motion/minang/floral-tree.webp",
    leaves: "/demo/motion/minang/leaves.webp",
    guardianLeft: "/demo/motion/minang/guardian-left.webp",
    guardianRight: "/demo/motion/minang/guardian-right.webp",
    butterfly: "/demo/motion/minang/butterfly.webp",
  },
  watermark: "pucuk-rebung",
  openSfx: "paper-flip",
  palette: {
    outerBg: "#E6D8C2",
    canvasBg: "#5B0F16",
    darkCardBg: "#3D080D",
    lightCardBg: "#F4EAD8",
    creamSurface: "#FAF3E8",
    skyBg: "#EFE3CC",
    borderGold: "#C68B2C",
    softBorder: "#E0CEA9",
    accent: "#8E1D24",
    accentDark: "#6E1118",
    headingDark: "#4B0B10",
    bodyDark: "#361816",
    mutedDark: "#6B433B",
    lightText: "#F5DEC8",
    lightAccent: "#E8BA6B",
    watermarkStroke: "#9E6D28",
    selectionBg: "#7F1D1D",
  },
  labels: {
    coverEyebrow: "Ondangan Baralek Gadang",
    openButton: "Buka Undangan Baralek",
    heroEyebrow: "Aleka Anak Daro & Marapulai",
    defaultGuestName: "Dunsanak & Tamu Undangan",
    defaultScrollCue: "Geser ke atas",
    continueScrollCue: "Lihat Jadwal Baralek",
    brideSectionTitle: "Anak Daro & Marapulai",
    brideRole: "Anak Daro",
    groomRole: "Marapulai",
    countdownTitle: "Manuju Hari Baralek Gadang",
    eventsEyebrow: "Rangkaian Prosesi Adat",
    eventsTitle: "Akad Nikah & Baralek Gadang",
    akadTitle: "Akad Nikah",
    resepsiTitle: "Baralek Gadang",
    storyEyebrow: "Carito Cinto",
    storyTitle: "Langkah Menuju Pelaminan",
    galleryEyebrow: "Galeri Aleka",
    galleryTitle: "Momen Baralek Adat Minang",
    rsvpEyebrow: "Konfirmasi Hadir",
    rsvpTitle: "RSVP & Doa Dunsanak",
    rsvpWaPrefix: "Assalamu'alaikum, saya",
    giftTitle: "Tando Kasih & Amplop Digital",
    giftNote:
      "Doa restu serta kehadiran dunsanak sadonyo merupakan karunia terbesar bagi kami. Jika ingin menitipkan tanda kasih, dapat melalui rekening berikut:",
    closingNote:
      "Atas kehadiran dan doa restu Bapak/Ibu/Dunsanak sadonyo, kami ucapkan tarimo kasih sabanyak-banyaknyo.",
    venueAlt: "Rumah Gadang Adat Minangkabau",
  },
  guardianSizeClass: "w-[28%]",
  guardianFlankClass: "h-[31vh]",
};

export function NikahMinangTemplate({
  site,
  embedded = false,
}: {
  site: NikahSiteConfig;
  embedded?: boolean;
}) {
  return <NikahMotionShell site={site} theme={MINANG_THEME} embedded={embedded} />;
}
