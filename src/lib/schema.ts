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
  milestones: z
    .array(
      z.object({
        dateLabel: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
      })
    )
    .optional(),
  littleThings: z
    .array(
      z.object({
        label: z.string().min(1),
        detail: z.string().min(1),
      })
    )
    .optional(),
  coupons: z
    .array(
      z.object({
        title: z.string().min(1),
        note: z.string().min(1),
      })
    )
    .optional(),
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
  cakeImageUrl: z.string().optional(),
  wishChecklist: z.array(z.string().min(1)).optional(),
  playlistSong: z
    .object({
      title: z.string().min(1),
      artist: z.string().min(1),
    })
    .optional(),
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
  dresscode: z
    .object({
      note: z.string().min(1),
      colors: z.array(
        z.object({
          label: z.string().min(1),
          hex: z.string().min(1),
        })
      ),
    })
    .optional(),
  giftAddress: z
    .object({
      recipient: z.string().min(1),
      address: z.string().min(1),
    })
    .optional(),
  initialPrayers: z
    .array(
      z.object({
        name: z.string().min(1),
        relation: z.string().min(1),
        message: z.string().min(1),
      })
    )
    .optional(),
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
  stats: z
    .array(
      z.object({
        value: z.string().min(1),
        label: z.string().min(1),
      })
    )
    .optional(),
  promoBanner: z
    .object({
      title: z.string().min(1),
      description: z.string().min(1),
      priceLabel: z.string().min(1),
      productId: z.string().min(1),
    })
    .optional(),
  faqs: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      })
    )
    .optional(),
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
          heroHeadline: "Hal-Hal Kecil yang Bikin Aku Betah Sama Kamu",
          openingNote:
            "Dari chat singkat yang awalnya malu-malu sampai sekarang punya segudang inside joke berdua. Biar semua kenangan kita nggak tenggelam di galeri HP.",
          memories: [
            {
              imageUrl: "/demo/bucin-1.webp",
              caption: "Ngopi sore pertama, masih sama-sama jaim",
              dateLabel: "Mei 2024",
            },
            {
              imageUrl: "/demo/bucin-2.webp",
              caption: "Jalan santai nungguin sunset kesukaanmu",
              dateLabel: "Agustus 2024",
            },
            {
              imageUrl: "/demo/bucin-3.webp",
              caption: "Ketawa lepas di kedai deket kampus",
              dateLabel: "November 2024",
            },
            {
              imageUrl: "/demo/bucin-4.webp",
              caption: "Nunggu hujan reda berdua sambil ngobrol ngalor-ngidul",
              dateLabel: "Februari 2025",
            },
          ],
          loveReasons: [
            "Selalu mau dengerin keluh kesahku sepulang kerja walau harimu sendiri udah capek.",
            "Udah hafal pesanan kopiku tanpa perlu kutanya lagi.",
            "Suka tiba-tiba ngirim foto random pas lagi kangen.",
            "Selalu kasih kabar sepele yang entah kenapa bikin hariku jauh lebih tenang.",
          ],
          closingLetter:
            "Makasih ya udah betah jalan bareng aku sejauh ini. Kalau lagi capek sama kerjaan atau kuliah, buka lagi halaman ini biar inget kalau kamu selalu punya aku di pihakmu.",
          songDedication: {
            title: "Bertaut",
            artist: "Nadin Amizah",
          },
          milestones: [
            {
              dateLabel: "12 Mei 2024",
              title: "Ketemuan Pertama",
              description: "Bilangnya cuma ngopi sejam, eh pulangnya pas kedai udah mau tutup.",
            },
            {
              dateLabel: "18 Oktober 2024",
              title: "Ngerayain Ultah Bareng",
              description: "Pertama kali niup lilin bareng dan tukeran kado kecil.",
            },
            {
              dateLabel: "12 Mei 2025",
              title: "Anniversary Pertama Kita",
              description: "Udah hafal kebiasaan masing-masing, termasuk kalau kamu lagi laper.",
            },
          ],
          littleThings: [
            {
              label: "Menu Kopi Andalan",
              detail: "Es kopi susu less sugar, wajib tanpa kayu manis.",
            },
            {
              label: "Kebiasaan Pas Makan",
              detail: "Bilangnya terserah, tapi ujung-ujungnya milih mie ayam.",
            },
            {
              label: "Obat Bad Mood",
              detail: "Seblak atau mie kuah hangat pas lagi mendung sore.",
            },
            {
              label: "Jam Paling Ditunggu",
              detail: "Telepon malem sebelum tidur cerita soal hari masing-masing.",
            },
          ],
          coupons: [
            {
              title: "Kupon Bebas Pilih Makan",
              note: "Kamu yang tentuin mau makan di mana minggu ini, aku yang bayarin.",
            },
            {
              title: "Kupon Jalan Malam & Jajan",
              note: "Keliling kota malam minggu plus beli es krim kesukaanmu.",
            },
            {
              title: "Kupon Nonton Tanpa Protes",
              note: "Bebas pilih film maraton di rumah sambil ngemil sepuasnya.",
            },
          ],
        },
      };

    case "ultah-interaktif":
      return {
        slug: cleanedSlug,
        templateId: "ultah-interaktif",
        title: "Happy Birthday ke-21!",
        seoDescription: "Kejutan ulang tahun interaktif tiup lilin dan voucher traktiran.",
        createdAt: today,
        orderNote: "Order baru Shopee",
        musicTrack: "builtin:birthday",
        data: {
          celebrantName: "Rani",
          turningAge: 21,
          birthDateLabel: "18 November 2026",
          senderName: "Dimas & Geng Kampus",
          heroWish:
            "Cie resmi kepala dua plus satu! Semoga makin lancar kuliah atau kerjaannya, badan selalu fit, dan semua wishlist kamu tahun ini beneran kejadian satu-satu.",
          cakeImageUrl: "/demo/ultah-cake-stage.webp",
          giftVoucher: {
            title: "Voucher Traktiran Makan Malam Bebas Pilih",
            description: "Berlaku buat 1x makan malam plus dessert kesukaanmu weekend ini, tanpa batas minimal.",
            redeemNote: "Tunjukin tiket ini pas ketemu nanti ya, anti wacana!",
          },
          memories: [
            {
              imageUrl: "/demo/ultah-1.webp",
              caption: "Kue cantik buat orang yang paling ditunggu traktirannya",
            },
            {
              imageUrl: "/demo/ultah-2.webp",
              caption: "Momen ketawa rame-rame sebelum tiup lilin",
            },
            {
              imageUrl: "/demo/ultah-3.webp",
              caption: "Kado kecil yang udah diumpetin dari minggu lalu",
            },
          ],
          friendWishes: [
            {
              from: "Dimas",
              role: "Pasangan",
              message: "Happy birthday sayang! Makasih udah jadi partner cerita paling asik tahun ini.",
            },
            {
              from: "Salsa",
              role: "Bestie Kuliah",
              message: "Panjang umur bestie, skripsi cepet ACC biar bisa foto wisuda bareng.",
            },
          ],
          wishChecklist: [
            "Skripsi atau target kerjaan beres tanpa drama",
            "Tetap sehat dan sempat istirahat di sela kesibukan",
            "Liburan singkat bareng orang-orang terdekat",
            "Duit jajan dan tabungan aman sampai akhir tahun",
          ],
          playlistSong: {
            title: "Selamat Ulang Tahun",
            artist: "Versi Akustik Kotak Musik",
          },
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
            parents: "Putri kedua dari Bapak Hendra Wijaya & Ibu Ratna Sari",
            photoUrl: "/demo/nikah-bride.webp",
          },
          groom: {
            nickname: "Reza",
            fullName: "Reza Pratama Kusuma",
            parents: "Putra pertama dari Bapak Bambang Kusuma & Ibu Siti Aminah",
            photoUrl: "/demo/nikah-groom.webp",
          },
          weddingDateIso: "2026-12-20T09:00:00+07:00",
          blessingQuote: {
            text: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan pasangan hidup bagimu agar kamu merasa tenteram bersamanya.",
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
              description: "Berawal dari proyek panitia acara kampus yang membawa kami pada obrolan hangat di penghujung sore.",
            },
            {
              year: "2024",
              title: "Melangkah Lebih Serius",
              description: "Saling menguatkan di awal dunia kerja dan memperkenalkan niat baik kepada kedua orang tua.",
            },
            {
              year: "2026",
              title: "Menuju Pelaminan",
              description: "Dengan penuh syukur, kami memohon doa restu Bapak/Ibu/Saudara/i untuk memulai hidup baru.",
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
          dresscode: {
            note: "Tamu undangan disarankan mengenakan busana bernuansa hijau sage, putih gading, atau cokelat tanah.",
            colors: [
              { label: "Hijau Sage", hex: "#6B8E78" },
              { label: "Putih Gading", hex: "#F5F2EB" },
              { label: "Cokelat Pasir", hex: "#B69B74" },
            ],
          },
          giftAddress: {
            recipient: "Nadia Putri Larasati (0812-3456-7890)",
            address: "Jl. Kemang Pratama Raya No. 14, Rawalumbu, Bekasi 17116",
          },
          initialPrayers: [
            {
              name: "Bapak Budi Santoso",
              relation: "Keluarga Besar",
              message: "Semoga senantiasa menjadi keluarga yang sakinah, mawaddah, warahmah hingga akhir hayat.",
            },
            {
              name: "Rina Kartika",
              relation: "Sahabat Kuliah",
              message: "Selamat Reza dan Nadia! Akhirnya berlabuh di pelaminan juga, lancar terus sampai hari H.",
            },
          ],
        },
      };

    case "umkm-katalog":
      return {
        slug: cleanedSlug,
        templateId: "umkm-katalog",
        title: "Kopi Senja Bekasi",
        seoDescription: "Katalog menu kopi susu gula aren dingin dan croissant panggang pagi Kopi Senja Bekasi.",
        createdAt: today,
        orderNote: "Order baru Shopee",
        musicTrack: "none",
        data: {
          businessName: "Kopi Senja",
          categoryLabel: "Kopi & Roti Harian",
          tagline: "Kopi Susu Aren Dingin & Croissant Panggang Pagi, Harga Asli Kedai",
          description:
            "Pesan langsung dari katalog tanpa biaya aplikasi tambahan. Tersedia botol 250ml buat stok kulkas hingga paket hantaran rapat area Bekasi.",
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
                "Biji arabika-robusta disangrai rutin tiap minggu, bikin rasa kopi tetap creamy dan nendang tanpa pahit gosong.",
            },
            {
              title: "Harga Asli Kedai via WhatsApp",
              description:
                "Order langsung di katalog tanpa mark-up komisi aplikasi, tinggal klik kirim dan bayar sesuai kesepakatan.",
            },
            {
              title: "Segel Rapat Aman Dikirim",
              description:
                "Botol 250ml tersegel higienis dan boks roti khusus menjaga suhu dingin dan kerenyahan sampai tujuan.",
            },
          ],
          products: [
            {
              id: "kopi-aren",
              name: "Es Kopi Susu Aren",
              category: "Kopi",
              price: 22000,
              unitLabel: "botol 250ml",
              description: "Double espresso house blend ketemu susu segar dingin dan gula aren organik yang wangi legit.",
              imageUrl: "/demo/umkm-kopi-aren.webp",
              featured: true,
            },
            {
              id: "butter-croissant",
              name: "Butter Croissant",
              category: "Roti",
              price: 24000,
              unitLabel: "pcs",
              description: "Kulit renyah berlapis-lapis dengan wangi mentega panggang hangat, pas banget dicocol kopi.",
              imageUrl: "/demo/umkm-croissant.webp",
            },
            {
              id: "matcha-latte",
              name: "Iced Matcha Oat",
              category: "Non-Kopi",
              price: 26000,
              unitLabel: "botol 250ml",
              description: "Matcha Jepang pekat dikocok bareng oat milk gurih yang creamy dan ringan di tenggorokan.",
              imageUrl: "/demo/umkm-matcha.webp",
            },
            {
              id: "paket-hampers",
              name: "Paket Hantaran 4 Botol",
              category: "Paket",
              price: 85000,
              unitLabel: "box",
              description: "Isi 2 Kopi Susu Aren dan 2 Matcha Oat dingin, lengkap boks rapi dan kartu ucapan.",
              imageUrl: "/demo/umkm-hampers.webp",
            },
          ],
          testimonials: [
            {
              quote: "Kopi arennya juara, manisnya nggak bikin serik di tenggorokan dan kopinya masih berasa.",
              author: "Fajar Nugroho",
              role: "Anak Kantoran Bekasi",
            },
            {
              quote: "Sering pesan paket hantaran buat rapat tim di kantor, datangnya cepet dan kemasannya niat.",
              author: "Rika Wulandari",
              role: "Admin HRD",
            },
            {
              quote: "Croissant-nya masih garing waktu sampai rumah, harganya juga jauh lebih hemat beli langsung di sini.",
              author: "Bagas Pradipta",
              role: "Langganan Mingguan",
            },
          ],
          stats: [
            { value: "1.200+", label: "Botol Terjual / Bulan" },
            { value: "100%", label: "Gula Aren Organik" },
            { value: "<45 Mnt", label: "Kirim Instan Bekasi" },
          ],
          promoBanner: {
            title: "Paket Hantaran Rapat & Keluarga (4 Botol)",
            description: "Bebas pilih isi Kopi Susu Aren dan Matcha Oat 250ml, udah termasuk boks rapi plus kartu ucapan.",
            priceLabel: "Rp85.000",
            productId: "paket-hampers",
          },
          faqs: [
            {
              question: "Botol 250ml tahan berapa lama di kulkas?",
              answer: "Selama segel belum dibuka dan masuk kulkas dingin, rasanya tetap segar sampai 3 hari.",
            },
            {
              question: "Bisa pesan banyak untuk acara kantor?",
              answer: "Bisa banget, untuk pesanan di atas 20 botol disarankan konfirmasi H-1 lewat WhatsApp.",
            },
          ],
        },
      };
  }
}
