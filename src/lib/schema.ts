import { z } from "zod";
import type { TemplateId } from "@/config/brand";

export const RESERVED_SLUGS = new Set([
  "www",
  "mail",
  "ftp",
  "api",
  "admin",
  "studio",
  "preview",
  "s",
  "uploads",
  "demo",
  "katalogweb",
  "localhost",
]);

export const SlugSchema = z
  .string()
  .min(3, "Subdomain minimal 3 karakter")
  .max(40, "Subdomain maksimal 40 karakter")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Gunakan huruf kecil, angka, dan tanda hubung (-) saja"
  )
  .refine(
    (val) => !RESERVED_SLUGS.has(val),
    "Nama subdomain ini dicadangkan sistem"
  );

export const MusicTrackSchema = z.string().min(1);

const BaseSiteFields = {
  slug: SlugSchema,
  title: z.string().min(1, "Judul website wajib diisi"),
  seoDescription: z.string().min(1, "Deskripsi singkat wajib diisi"),
  createdAt: z.string().min(1),
  orderNote: z.string().optional(),
  musicTrack: MusicTrackSchema,
};

export const BucinMemorySchema = z.object({
  imageUrl: z.string().min(1),
  caption: z.string().min(1),
  dateLabel: z.string().min(1),
});

export const BucinDataSchema = z.object({
  partnerOne: z.string().min(1),
  partnerTwo: z.string().min(1),
  anniversaryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD"),
  passcodePin: z.string().max(4),
  heroHeadline: z.string().min(1),
  openingNote: z.string().min(1),
  memories: z.array(BucinMemorySchema).min(1),
  loveReasons: z.array(z.string().min(1)).min(1),
  closingLetter: z.string().min(1),
  songDedication: z.object({
    title: z.string().min(1),
    artist: z.string().min(1),
  }),
});

export const UltahMemorySchema = z.object({
  imageUrl: z.string().min(1),
  caption: z.string().min(1),
});

export const UltahWishSchema = z.object({
  from: z.string().min(1),
  role: z.string().min(1),
  message: z.string().min(1),
});

export const UltahDataSchema = z.object({
  celebrantName: z.string().min(1),
  turningAge: z.number().int().min(1).max(120),
  birthDateLabel: z.string().min(1),
  senderName: z.string().min(1),
  heroWish: z.string().min(1),
  giftVoucher: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    redeemNote: z.string().min(1),
  }),
  memories: z.array(UltahMemorySchema).min(1),
  friendWishes: z.array(UltahWishSchema).min(1),
});

export const NikahPersonSchema = z.object({
  nickname: z.string().min(1),
  fullName: z.string().min(1),
  parents: z.string().min(1),
  photoUrl: z.string().min(1),
});

export const NikahEventSchema = z.object({
  dateLabel: z.string().min(1),
  timeLabel: z.string().min(1),
  venueName: z.string().min(1),
  address: z.string().min(1),
  mapsUrl: z.string().min(1),
});

export const NikahDataSchema = z.object({
  bride: NikahPersonSchema,
  groom: NikahPersonSchema,
  weddingDateIso: z.string().min(1),
  blessingQuote: z.object({
    text: z.string().min(1),
    source: z.string().min(1),
  }),
  akad: NikahEventSchema,
  resepsi: NikahEventSchema,
  storyTimeline: z
    .array(
      z.object({
        year: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
      })
    )
    .min(1),
  gallery: z.array(z.string().min(1)).min(1),
  digitalEnvelopes: z
    .array(
      z.object({
        bankName: z.string().min(1),
        accountNumber: z.string().min(1),
        accountHolder: z.string().min(1),
      })
    )
    .min(1),
  rsvpWhatsapp: z.string().min(6),
});

export const UmkmProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().nonnegative(),
  unitLabel: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().min(1),
  featured: z.boolean().optional(),
});

export const UmkmDataSchema = z.object({
  businessName: z.string().min(1),
  categoryLabel: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  heroImageUrl: z.string().min(1),
  cityLabel: z.string().min(1),
  openHoursLabel: z.string().min(1),
  whatsappNumber: z.string().min(6),
  address: z.string().min(1),
  mapsUrl: z.string().min(1),
  highlights: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
      })
    )
    .length(3),
  products: z.array(UmkmProductSchema).min(1),
  testimonials: z
    .array(
      z.object({
        quote: z.string().min(1),
        author: z.string().min(1),
        role: z.string().min(1),
      })
    )
    .min(1),
});

export const SiteConfigSchema = z.discriminatedUnion("templateId", [
  z.object({
    ...BaseSiteFields,
    templateId: z.literal("bucin-scrapbook"),
    data: BucinDataSchema,
  }),
  z.object({
    ...BaseSiteFields,
    templateId: z.literal("ultah-interaktif"),
    data: UltahDataSchema,
  }),
  z.object({
    ...BaseSiteFields,
    templateId: z.literal("nikah-garden"),
    data: NikahDataSchema,
  }),
  z.object({
    ...BaseSiteFields,
    templateId: z.literal("umkm-katalog"),
    data: UmkmDataSchema,
  }),
]);

export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type BucinSiteConfig = Extract<SiteConfig, { templateId: "bucin-scrapbook" }>;
export type UltahSiteConfig = Extract<SiteConfig, { templateId: "ultah-interaktif" }>;
export type NikahSiteConfig = Extract<SiteConfig, { templateId: "nikah-garden" }>;
export type UmkmSiteConfig = Extract<SiteConfig, { templateId: "umkm-katalog" }>;

export function slugifyInput(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 40);
}

export function createDefaultSiteConfig(
  templateId: TemplateId,
  slugInput: string
): SiteConfig {
  const cleanedSlug = slugifyInput(slugInput) || "order-baru";
  const today = new Date().toISOString().slice(0, 10);

  switch (templateId) {
    case "bucin-scrapbook":
      return {
        slug: cleanedSlug,
        templateId: "bucin-scrapbook",
        title: "Cerita Kita Berdua",
        seoDescription: "Kado scrapbook digital spesial untuk pasangan.",
        createdAt: today,
        orderNote: "Order baru Shopee",
        musicTrack: "builtin:romance",
        data: {
          partnerOne: "Arka",
          partnerTwo: "Nisa",
          anniversaryDate: "2024-05-12",
          passcodePin: "1205",
          heroHeadline: "Catatan Kecil Tentang Kita",
          openingNote:
            "Terima kasih sudah menemaniku melewati hari biasa hingga momen yang paling berkesan.",
          memories: [
            {
              imageUrl: "/demo/bucin-1.webp",
              caption: "Ngopi sore pertama setelah hujan reda",
              dateLabel: "Mei 2024",
            },
            {
              imageUrl: "/demo/bucin-2.webp",
              caption: "Jalan kaki sore mengejar matahari terbenam",
              dateLabel: "Agustus 2024",
            },
            {
              imageUrl: "/demo/bucin-3.webp",
              caption: "Foto dadakan di dalam studio kecil",
              dateLabel: "November 2024",
            },
          ],
          loveReasons: [
            "Selalu sabar mendengarkan ceritaku sepulang kerja.",
            "Tahu persis menu kopi favoritku tanpa perlu ditanya.",
            "Bisa bikin suasana canggung langsung cair lewat tawa kecil.",
          ],
          closingLetter:
            "Semoga halaman sederhana ini selalu mengingatkanmu bahwa di hari apa pun, kamu selalu punya tempat pulang yang hangat.",
          songDedication: {
            title: "Bertaut",
            artist: "Nadin Amizah",
          },
        },
      };

    case "ultah-interaktif":
      return {
        slug: cleanedSlug,
        templateId: "ultah-interaktif",
        title: "Selamat Ulang Tahun ke-21",
        seoDescription: "Kejutan ulang tahun interaktif tiup lilin dan voucher hadiah.",
        createdAt: today,
        orderNote: "Order baru Shopee",
        musicTrack: "builtin:birthday",
        data: {
          celebrantName: "Rani",
          turningAge: 21,
          birthDateLabel: "18 November 2026",
          senderName: "Dimas & Geng Kampus",
          heroWish:
            "Semoga di usia baru ini semua rencana baikmu berjalan mulus, sehat terus, dan makin bahagia setiap harinya.",
          giftVoucher: {
            title: "Voucher Traktiran Dinner Bebas Pilih",
            description: "Berlaku untuk 1 kali makan malam berdua di tempat favoritmu akhir pekan ini.",
            redeemNote: "Tunjukkan halaman ini ke pengirim sebelum akhir bulan.",
          },
          memories: [
            {
              imageUrl: "/demo/ultah-1.webp",
              caption: "Kue spesial untuk perayaan hari ini",
            },
            {
              imageUrl: "/demo/ultah-2.webp",
              caption: "Tawa lepas sebelum potong kue",
            },
            {
              imageUrl: "/demo/ultah-3.webp",
              caption: "Hadiah kecil yang sudah disiapkan dari jauh hari",
            },
          ],
          friendWishes: [
            {
              from: "Dimas",
              role: "Pasangan",
              message: "Selamat bertambah usia. Terima kasih sudah jadi orang paling suportif tahun ini.",
            },
            {
              from: "Salsa",
              role: "Teman Kuliah",
              message: "Panjang umur dan lancar terus skripsinya. Jangan lupa traktiran mie ayam.",
            },
          ],
        },
      };

    case "nikah-garden":
      return {
        slug: cleanedSlug,
        templateId: "nikah-garden",
        title: "Pernikahan Reza & Nadia",
        seoDescription: "Undangan pernikahan digital Reza dan Nadia.",
        createdAt: today,
        orderNote: "Order baru Shopee",
        musicTrack: "builtin:wedding",
        data: {
          bride: {
            nickname: "Nadia",
            fullName: "Nadia Putri Larasati",
            parents: "Putri dari Bapak Hendra Wijaya & Ibu Ratna Sari",
            photoUrl: "/demo/nikah-bride.webp",
          },
          groom: {
            nickname: "Reza",
            fullName: "Reza Pratama Kusuma",
            parents: "Putra dari Bapak Bambang Kusuma & Ibu Siti Aminah",
            photoUrl: "/demo/nikah-groom.webp",
          },
          weddingDateIso: "2026-12-20T09:00:00+07:00",
          blessingQuote: {
            text: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan pasangan hidup agar kamu merasa tenteram bersamanya.",
            source: "QS. Ar-Rum: 21",
          },
          akad: {
            dateLabel: "Minggu, 20 Desember 2026",
            timeLabel: "08.00 - 10.00 WIB",
            venueName: "Taman Pendopo Kalimalang",
            address: "Jl. Raya Kalimalang No. 48, Bekasi Selatan",
            mapsUrl: "https://maps.google.com/?q=Bekasi+Selatan",
          },
          resepsi: {
            dateLabel: "Minggu, 20 Desember 2026",
            timeLabel: "11.00 - 14.00 WIB",
            venueName: "Taman Pendopo Kalimalang",
            address: "Jl. Raya Kalimalang No. 48, Bekasi Selatan",
            mapsUrl: "https://maps.google.com/?q=Bekasi+Selatan",
          },
          storyTimeline: [
            {
              year: "2022",
              title: "Pertemuan Pertama",
              description: "Berawal dari proyek panitia acara kampus yang memaksa kami sering diskusi sore.",
            },
            {
              year: "2024",
              title: "Komitmen Bersama",
              description: "Memutuskan melangkah lebih serius setelah sama-sama lulus dan mulai bekerja.",
            },
            {
              year: "2026",
              title: "Menuju Pelaminan",
              description: "Memohon doa restu keluarga dan sahabat untuk memulai rumah tangga baru.",
            },
          ],
          gallery: [
            "/demo/nikah-couple.webp",
            "/demo/nikah-gallery-1.webp",
            "/demo/nikah-gallery-2.webp",
            "/demo/nikah-gallery-3.webp",
          ],
          digitalEnvelopes: [
            {
              bankName: "BCA",
              accountNumber: "5420198821",
              accountHolder: "Nadia Putri Larasati",
            },
            {
              bankName: "Mandiri",
              accountNumber: "1560004819201",
              accountHolder: "Reza Pratama Kusuma",
            },
          ],
          rsvpWhatsapp: "6281234567890",
        },
      };

    case "umkm-katalog":
      return {
        slug: cleanedSlug,
        templateId: "umkm-katalog",
        title: "Kopi Senja Bekasi",
        seoDescription: "Katalog menu kopi susu dan pastry harian Kopi Senja Bekasi.",
        createdAt: today,
        orderNote: "Order baru Shopee",
        musicTrack: "none",
        data: {
          businessName: "Kopi Senja",
          categoryLabel: "Kopi & Roti Harian",
          tagline: "Racikan kopi susu aren dan croissant mentega panggang setiap pagi.",
          description:
            "Pesan langsung lewat katalog tanpa aplikasi tambahan. Pilihan minuman botolan 250ml hingga paket hantaran acara kantor area Bekasi.",
          heroImageUrl: "/demo/umkm-hero.webp",
          cityLabel: "Bekasi Barat",
          openHoursLabel: "Setiap hari, 08.00 - 21.00 WIB",
          whatsappNumber: "6281234567890",
          address: "Jl. Patriot Raya No. 19, Jakasampurna, Bekasi Barat",
          mapsUrl: "https://maps.google.com/?q=Bekasi+Barat",
          highlights: [
            {
              title: "Seduh Baru Setiap Pagi",
              description:
                "Biji arabika-robusta disangrai mingguan dan diracik segar saat pesanan masuk.",
            },
            {
              title: "Pesan Mudah via WhatsApp",
              description:
                "Pilih menu di keranjang lalu kirim rincian otomatis tanpa biaya admin aplikasi.",
            },
            {
              title: "Kemasan Botol Aman Antar",
              description:
                "Tersedia ukuran gelas harian dan botol rapat anti tumpah untuk kurir instan.",
            },
          ],
          products: [
            {
              id: "kopi-aren",
              name: "Es Kopi Susu Aren",
              category: "Kopi",
              price: 22000,
              unitLabel: "botol 250ml",
              description: "Espresso ganda dengan susu segar dan gula aren organik cair.",
              imageUrl: "/demo/umkm-kopi-aren.webp",
              featured: true,
            },
            {
              id: "butter-croissant",
              name: "Butter Croissant",
              category: "Roti",
              price: 24000,
              unitLabel: "pcs",
              description: "Lapisan renyah di luar, lembut bermentega di dalam, hangat dari oven.",
              imageUrl: "/demo/umkm-croissant.webp",
            },
            {
              id: "matcha-latte",
              name: "Iced Matcha Oat",
              category: "Non-Kopi",
              price: 26000,
              unitLabel: "botol 250ml",
              description: "Bubuk matcha Uji murni dikocok dengan susu gandum creamy.",
              imageUrl: "/demo/umkm-matcha.webp",
            },
            {
              id: "paket-hampers",
              name: "Paket Hantaran 4 Botol",
              category: "Paket",
              price: 85000,
              unitLabel: "box",
              description: "Isi 2 Kopi Susu Aren dan 2 Matcha Oat lengkap dengan kartu ucapan.",
              imageUrl: "/demo/umkm-hampers.webp",
            },
          ],
          testimonials: [
            {
              quote: "Kopi arennya seimbang, manisnya pas dan tidak bikin enek diminum siang hari.",
              author: "Fajar Nugroho",
              role: "Karyawan Swasta",
            },
            {
              quote: "Order paket hantaran buat rapat kantor di Bekasi cepat banget sampainya.",
              author: "Rika Wulandari",
              role: "Admin HRD",
            },
            {
              quote: "Croissant-nya masih renyah waktu sampai rumah, harganya ramah di kantong.",
              author: "Bagas Pradipta",
              role: "Pelanggan Tetap",
            },
          ],
        },
      };
  }
}
