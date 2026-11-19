"use client";

import type { NikahSiteConfig } from "@/lib/schema";
import {
  NikahMotionShell,
  type NikahMotionTheme,
} from "@/templates/nikah/NikahMotionShell";

const JAWA_THEME: NikahMotionTheme = {
  id: "jawa",
  assets: {
    sky: "/demo/motion/jawa/sky.webp",
    floralGarland: "/demo/motion/jawa/floral-garland.webp",
    floralTree: "/demo/motion/jawa/floral-tree.webp",
    leaves: "/demo/motion/jawa/leaves.webp",
    guardianLeft: "/demo/motion/jawa/guardian-left.webp",
    guardianRight: "/demo/motion/jawa/guardian-right.webp",
    butterfly: "/demo/motion/jawa/butterfly.webp",
  },
  watermark: "parang-truntum",
  openSfx: "gong-jawa",
  palette: {
    outerBg: "#E3D6BE",
    canvasBg: "#3B2318",
    darkCardBg: "#29170F",
    lightCardBg: "#F5EFE4",
    creamSurface: "#FAF6EE",
    skyBg: "#F1E4C8",
    borderGold: "#B58438",
    softBorder: "#DED0B6",
    accent: "#8A4B16",
    accentDark: "#6A3610",
    headingDark: "#3E2723",
    bodyDark: "#36221B",
    mutedDark: "#6B5041",
    lightText: "#F2E2C9",
    lightAccent: "#E2B66D",
    watermarkStroke: "#9E7031",
    selectionBg: "#6A3610",
  },
  labels: {
    coverEyebrow: "Serat Ulem Pawiwahan",
    openButton: "Buka Regol Pendopo",
    heroEyebrow: "Pawiwahan Adat Jawa Keraton",
    defaultGuestName: "Para Tamu Undangan",
    defaultScrollCue: "Geser ke atas",
    continueScrollCue: "Pirsani Jadwal Pahargyan",
    brideSectionTitle: "Calon Penganten",
    brideRole: "Mempelai Putri / Paes Ageng",
    groomRole: "Mempelai Kakung / Beskap Blangkon",
    countdownTitle: "Tumuju Dinten Agung",
    eventsEyebrow: "Adicara Pawiwahan",
    eventsTitle: "Ijab Qabul & Pahargyan",
    akadTitle: "Ijab Qabul",
    resepsiTitle: "Pahargyan",
    storyEyebrow: "Carita Tresna",
    storyTitle: "Lampahing Katresnan",
    galleryEyebrow: "Dokumentasi Pawiwahan",
    galleryTitle: "Momen Endah Keraton",
    rsvpEyebrow: "Atur Rawuh & Pangestu",
    rsvpTitle: "Konfirmasi & Doa Pangestu",
    rsvpWaPrefix: "Sugeng, kula",
    giftTitle: "Tandha Tresna Digital",
    giftNote:
      "Rawuh panjenengan saha donga pangestu dados kabagyan ageng tumrap kulawarga. Menawi ngersakaken ngaturaken tandha tresna, saget lumantar rekening punika:",
    closingNote:
      "Mugi Gusti Kang Murbeng Dumadi tansah maringi berkah lan rahayu. Matur nuwun sanget awit rawuh panjenengan.",
    venueAlt: "Pendopo Agung Joglo Keraton Jawa",
  },
  guardianSizeClass: "w-[31%]",
  guardianFlankClass: "h-[35vh]",
};

export function NikahJawaTemplate({
  site,
  embedded = false,
}: {
  site: NikahSiteConfig;
  embedded?: boolean;
}) {
  return <NikahMotionShell site={site} theme={JAWA_THEME} embedded={embedded} />;
}
