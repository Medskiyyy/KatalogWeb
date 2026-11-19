"use client";

import type { NikahSiteConfig } from "@/lib/schema";
import {
  NikahMotionShell,
  type NikahMotionTheme,
} from "@/templates/nikah/NikahMotionShell";

const GARDEN_THEME: NikahMotionTheme = {
  id: "garden",
  assets: {
    sky: "/demo/motion/garden/sky.webp",
    floralGarland: "/demo/motion/garden/floral-garland.webp",
    floralTree: "/demo/motion/garden/floral-tree.webp",
    leaves: "/demo/motion/garden/leaves.webp",
    guardianLeft: "/demo/motion/garden/guardian-left.webp",
    guardianRight: "/demo/motion/garden/guardian-right.webp",
    butterfly: "/demo/motion/garden/butterfly.webp",
  },
  watermark: "botanical-trellis",
  openSfx: "paper-flip",
  palette: {
    outerBg: "#E3E8DF",
    canvasBg: "#2A4235",
    darkCardBg: "#1D3026",
    lightCardBg: "#F5F3EC",
    creamSurface: "#FAF9F5",
    skyBg: "#EFF4EE",
    borderGold: "#B69B74",
    softBorder: "#DCE0D4",
    accent: "#3E634E",
    accentDark: "#2E4A3B",
    headingDark: "#23392D",
    bodyDark: "#2A3830",
    mutedDark: "#5A6B5F",
    lightText: "#E3ECE5",
    lightAccent: "#DFC8A2",
    watermarkStroke: "#6E8E78",
    selectionBg: "#2E4A3B",
  },
  labels: {
    coverEyebrow: "Garden Botanical Invitation",
    openButton: "Buka Undangan",
    heroEyebrow: "The Wedding Of",
    defaultGuestName: "Tamu Undangan",
    defaultScrollCue: "Geser ke atas",
    continueScrollCue: "Scroll ke bawah",
    brideSectionTitle: "Bride & Groom",
    brideRole: "Mempelai Wanita",
    groomRole: "Mempelai Pria",
    countdownTitle: "Menuju Hari Bahagia",
    eventsEyebrow: "Rangkaian Acara",
    eventsTitle: "Akad Nikah & Resepsi",
    akadTitle: "Akad Nikah",
    resepsiTitle: "Resepsi Pernikahan",
    storyEyebrow: "Love Story",
    storyTitle: "Perjalanan Cinta Kami",
    galleryEyebrow: "Gallery",
    galleryTitle: "Momen Kebersamaan",
    rsvpEyebrow: "Konfirmasi Kehadiran",
    rsvpTitle: "RSVP & Ucapan Doa",
    rsvpWaPrefix: "Halo, saya",
    giftTitle: "Wedding Gift",
    giftNote:
      "Doa restu dan kehadiran Anda merupakan karunia terindah bagi kami. Bila berkenan mengirimkan tanda kasih, dapat melalui rekening di bawah ini:",
    closingNote:
      "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu.",
    venueAlt: "Paviliun Taman Botanical",
  },
  guardianSizeClass: "w-[28%]",
  guardianFlankClass: "h-[33vh]",
};

export function NikahGardenTemplate({
  site,
  embedded = false,
}: {
  site: NikahSiteConfig;
  embedded?: boolean;
}) {
  return <NikahMotionShell site={site} theme={GARDEN_THEME} embedded={embedded} />;
}
