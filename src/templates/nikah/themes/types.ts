import type { TemplateCatalogItem } from "@/config/brand";
import type { NikahSiteConfig } from "@/lib/schema";
import type { NikahMotionTheme } from "@/templates/nikah/NikahMotionShell";

export type ExtendedNikahGroup = "adat" | "romantic" | "midnight";

export interface ExtendedNikahThemeSpec {
  id:
    | "nikah-bali"
    | "nikah-batak"
    | "nikah-betawi"
    | "nikah-bugis"
    | "nikah-palembang"
    | "nikah-banjar"
    | "nikah-dayak"
    | "nikah-melayu"
    | "nikah-aceh"
    | "nikah-chinese"
    | "nikah-pink-castle"
    | "nikah-azure-castle"
    | "nikah-rosewood-romance"
    | "nikah-sailing-blossoms"
    | "nikah-victorian-bloomhouse"
    | "nikah-royal-garden"
    | "nikah-secret-garden"
    | "nikah-pine-pavilion"
    | "nikah-iris-cottage"
    | "nikah-cyan-fountain"
    | "nikah-midnight-black"
    | "nikah-midnight-navy"
    | "nikah-midnight-burgundy"
    | "nikah-midnight-emerald"
    | "nikah-ethereal-moonfall";
  assetKey: string;
  group: ExtendedNikahGroup;
  name: string;
  shortLabel: string;
  stageTint: string;
  badgeClass: string;
  demoSlug: string;
  price: number;
  priceLabel: string;
  tagline: string;
  highlights: [string, string, string];
  musicTrack: string;
  theme: NikahMotionTheme;
  demoSeed: {
    brideName: string;
    brideNickname: string;
    brideParents: string;
    bridePhoto: string;
    groomName: string;
    groomNickname: string;
    groomParents: string;
    groomPhoto: string;
    weddingDateIso: string;
    akadDateLabel: string;
    akadTimeLabel: string;
    akadVenue: string;
    akadAddress: string;
    resepsiDateLabel: string;
    resepsiTimeLabel: string;
    resepsiVenue: string;
    resepsiAddress: string;
    quoteText: string;
    quoteSource: string;
    culturalNote: string;
    extras: { label: string; detail: string }[];
    dresscodeNote: string;
    dresscodeColors: { label: string; hex: string }[];
    gallery: string[];
  };
}

export function buildExtendedCatalogItem(
  spec: ExtendedNikahThemeSpec
): TemplateCatalogItem {
  return {
    id: spec.id,
    name: spec.name,
    category: "Pernikahan",
    demoSlug: spec.demoSlug,
    price: spec.price,
    priceLabel: spec.priceLabel,
    thumbnail: spec.theme.assets.sky,
    tagline: spec.tagline,
    highlights: spec.highlights,
    buyerFormTemplate: [
      `FORMAT ORDER - ${spec.name.toUpperCase()}`,
      `Pilihan Nama Link Web: (contoh: ${spec.demoSlug})`,
      "Mempelai Wanita (nama lengkap, panggilan, nama orang tua):",
      "Mempelai Pria (nama lengkap, panggilan, nama orang tua):",
      "Jadwal Akad / Pemberkatan (tanggal, jam, tempat, link Maps):",
      "Jadwal Resepsi (tanggal, jam, tempat, link Maps):",
      "Nomor Rekening Amplop Digital & Alamat Kado Fisik:",
      "Nomor WhatsApp Konfirmasi Hadir & Foto Prewedding (4-6 foto):",
    ].join("\n"),
  };
}

export function buildSiteFromExtendedSpec(
  spec: ExtendedNikahThemeSpec,
  slug: string
): Extract<NikahSiteConfig, { templateId: ExtendedNikahThemeSpec["id"] }> {
  const s = spec.demoSeed;
  return {
    slug,
    templateId: spec.id,
    title: `The Wedding of ${s.brideNickname} & ${s.groomNickname}`,
    seoDescription: `${spec.name} - Undangan pernikahan digital ${s.brideNickname} dan ${s.groomNickname}.`,
    createdAt: "2026-11-19",
    orderNote: "Order baru Shopee",
    musicTrack: spec.musicTrack,
    data: {
      bride: {
        fullName: s.brideName,
        nickname: s.brideNickname,
        parents: s.brideParents,
        photoUrl: s.bridePhoto,
      },
      groom: {
        fullName: s.groomName,
        nickname: s.groomNickname,
        parents: s.groomParents,
        photoUrl: s.groomPhoto,
      },
      weddingDateIso: s.weddingDateIso,
      blessingQuote: {
        text: s.quoteText,
        source: s.quoteSource,
      },
      akad: {
        dateLabel: s.akadDateLabel,
        timeLabel: s.akadTimeLabel,
        venueName: s.akadVenue,
        address: s.akadAddress,
        mapsUrl: "https://maps.google.com/?q=-6.2088,106.8456",
      },
      resepsi: {
        dateLabel: s.resepsiDateLabel,
        timeLabel: s.resepsiTimeLabel,
        venueName: s.resepsiVenue,
        address: s.resepsiAddress,
        mapsUrl: "https://maps.google.com/?q=-6.2088,106.8456",
      },
      culturalNote: s.culturalNote,
      ceremonyExtras: s.extras,
      storyTimeline: [
        {
          year: "2023",
          title: "Pertemuan Pertama",
          description:
            "Perkenalan singkat yang mempertemukan dua keluarga dan menumbuhkan rasa saling percaya.",
        },
        {
          year: "2025",
          title: "Melangkah ke Jenjang Serius",
          description:
            "Dengan restu orang tua, kedua belah pihak bersepakat menentukan langkah menuju pelaminan.",
        },
        {
          year: "2027",
          title: "Ikatan Suci Pernikahan",
          description:
            "Merayakan hari bahagia bersama keluarga besar dan sahabat tercinta dalam suasana penuh syukur.",
        },
      ],
      gallery: s.gallery,
      digitalEnvelopes: [
        {
          bankName: "BCA",
          accountNumber: "5480192837",
          accountHolder: s.brideName,
        },
        {
          bankName: "Mandiri",
          accountNumber: "1230094857123",
          accountHolder: s.groomName,
        },
      ],
      rsvpWhatsapp: "6281234567890",
      dresscode: {
        note: s.dresscodeNote,
        colors: s.dresscodeColors,
      },
      giftAddress: {
        recipient: `${s.brideNickname} & ${s.groomNickname} (0812-3456-7890)`,
        address: s.resepsiAddress,
      },
      initialPrayers: [
        {
          name: "Keluarga Besar",
          relation: "Keluarga",
          message:
            "Selamat menempuh hidup baru, semoga selalu dilimpahi kebahagiaan, rukun, dan berkah selamanya.",
        },
        {
          name: "Rekan & Sahabat",
          relation: "Sahabat",
          message:
            "Turut berbahagia melihat kalian bersatu. Lancar terus sampai hari H!",
        },
      ],
    },
  } as Extract<NikahSiteConfig, { templateId: ExtendedNikahThemeSpec["id"] }>;
}
