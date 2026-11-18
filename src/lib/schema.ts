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
  audioUrl: z.string().optional(),
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
  voiceNoteUrl: z.string().optional(),
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
  chatThreads: z
    .array(
      z.object({
        topic: z.string().min(1),
        messages: z
          .array(
            z.object({
              sender: z.enum(["one", "two"]),
              text: z.string().min(1),
              time: z.string().min(1),
            })
          )
          .min(1),
      })
    )
    .optional(),
  quizQuestions: z
    .array(
      z.object({
        question: z.string().min(1),
        options: z.array(z.string().min(1)).min(2),
        correctIndex: z.number().int().nonnegative(),
        reaction: z.string().min(1),
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
  giftVoucher: z
    .object({
      title: z.string().min(1),
      description: z.string().min(1),
      redeemNote: z.string().min(1),
    })
    .optional(),
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
  culturalNote: z.string().optional(),
  ceremonyExtras: z
    .array(
      z.object({
        label: z.string().min(1),
        detail: z.string().min(1),
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
  options: z.array(z.string().min(1)).optional(),
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
    templateId: z.literal("bucin-chat"),
    data: BucinDataSchema,
  }),
  z.object({
    ...BaseSiteFields,
    templateId: z.literal("bucin-playlist"),
    data: BucinDataSchema,
  }),
  z.object({
    ...BaseSiteFields,
    templateId: z.literal("bucin-magazine"),
    data: BucinDataSchema,
  }),
  z.object({
    ...BaseSiteFields,
    templateId: z.literal("ultah-interaktif"),
    data: UltahDataSchema,
  }),
  z.object({
    ...BaseSiteFields,
    templateId: z.literal("ultah-balon"),
    data: UltahDataSchema,
  }),
  z.object({
    ...BaseSiteFields,
    templateId: z.literal("ultah-retro"),
    data: UltahDataSchema,
  }),
  z.object({
    ...BaseSiteFields,
    templateId: z.literal("ultah-editorial"),
    data: UltahDataSchema,
  }),
  z.object({
    ...BaseSiteFields,
    templateId: z.literal("nikah-garden"),
    data: NikahDataSchema,
  }),
  z.object({
    ...BaseSiteFields,
    templateId: z.literal("nikah-minang"),
    data: NikahDataSchema,
  }),
  z.object({
    ...BaseSiteFields,
    templateId: z.literal("nikah-jawa"),
    data: NikahDataSchema,
  }),
  z.object({
    ...BaseSiteFields,
    templateId: z.literal("nikah-sunda"),
    data: NikahDataSchema,
  }),
  z.object({
    ...BaseSiteFields,
    templateId: z.literal("umkm-katalog"),
    data: UmkmDataSchema,
  }),
  z.object({
    ...BaseSiteFields,
    templateId: z.literal("umkm-kuliner"),
    data: UmkmDataSchema,
  }),
  z.object({
    ...BaseSiteFields,
    templateId: z.literal("umkm-fashion"),
    data: UmkmDataSchema,
  }),
  z.object({
    ...BaseSiteFields,
    templateId: z.literal("umkm-jasa"),
    data: UmkmDataSchema,
  }),
]);

export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type BucinTemplateSiteConfig = Extract<
  SiteConfig,
  {
    templateId:
      | "bucin-scrapbook"
      | "bucin-chat"
      | "bucin-playlist"
      | "bucin-magazine";
  }
>;
export type BucinSiteConfig = BucinTemplateSiteConfig;
export type UltahSiteConfig = Extract<
  SiteConfig,
  {
    templateId:
      | "ultah-interaktif"
      | "ultah-balon"
      | "ultah-retro"
      | "ultah-editorial";
  }
>;
export type NikahSiteConfig = Extract<
  SiteConfig,
  {
    templateId:
      | "nikah-garden"
      | "nikah-minang"
      | "nikah-jawa"
      | "nikah-sunda";
  }
>;
export type UmkmSiteConfig = Extract<
  SiteConfig,
  {
    templateId:
      | "umkm-katalog"
      | "umkm-kuliner"
      | "umkm-fashion"
      | "umkm-jasa";
  }
>;

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

    case "bucin-chat":
      return {
        slug: cleanedSlug,
        templateId: "bucin-chat",
        title: "Arsip Chat & Photobox Dimas & Alya",
        seoDescription: "Putar ulang chat awal PDKT, strip photobox, mini kuis pasangan, dan voucher traktiran.",
        createdAt: today,
        orderNote: "Order baru Shopee",
        musicTrack: "builtin:lofi",
        data: {
          partnerOne: "Dimas",
          partnerTwo: "Alya",
          anniversaryDate: "2024-08-17",
          passcodePin: "",
          heroHeadline: "Dari Chat Salah Kirim Sampai Jadi Orang Paling Dicari",
          openingNote:
            "Buat pengingat kalau awalnya kita sama-sama jaim di chat, sebelum akhirnya tiap malam ngabisin kuota buat teleponan bahas hal nggak penting.",
          voiceNoteUrl: "/audio/voicenotes/dimas-vn.mp3",
          memories: [
            {
              imageUrl: "/demo/bucin-chat-1.webp",
              caption: "Sesi photobox perdana yang hasilnya masih kaku banget",
              dateLabel: "Sep 2024",
            },
            {
              imageUrl: "/demo/bucin-chat-2.webp",
              caption: "Jajan es krim pinggir jalan habis ujan-ujanan",
              dateLabel: "Nov 2024",
            },
            {
              imageUrl: "/demo/bucin-chat-3.webp",
              caption: "Dua gelas favorit kita tiap nongkrong weekend",
              dateLabel: "Jan 2025",
            },
            {
              imageUrl: "/demo/bucin-1.webp",
              caption: "Ngopi sore sepulang kerja buat cerita seharian",
              dateLabel: "Mar 2025",
            },
          ],
          loveReasons: [
            "Selalu bales chat cepat walau cuma kirim stiker random.",
            "Sabar nemenin muter-muter nyari tempat makan tiap kali aku bilang terserah.",
            "Ketawa kamu gampang banget bikin capek seharian langsung ilang.",
            "Inget pesanan minum aku bahkan sebelum aku sebut.",
          ],
          littleThings: [
            {
              label: "Stiker Paling Sering",
              detail: "Kucing melet tiap kali baru bangun atau lagi males ngetik.",
            },
            {
              label: "Jam Rawan Laper",
              detail: "Jam sepuluh malam mendadak nanya menu makan berkuah.",
            },
            {
              label: "Posisi Duduk Wajib",
              detail: "Selalu milih pojokan kafe deket colokan biar HP aman.",
            },
            {
              label: "Topik Favorit",
              detail: "Ngegosipin kucing komplek sama rencana liburan tahun depan.",
            },
          ],
          coupons: [
            {
              title: "Kupon Bebas Debat Makan Malam",
              note: "Tinggal tunjuk mau makan apa hari ini, langsung berangkat tanpa protes.",
            },
            {
              title: "Kupon Traktiran Kopi + Dessert",
              note: "Kapan aja lagi bad mood kerja, tinggal screenshot kupon ini.",
            },
            {
              title: "Kupon Photobox Ulang Bareng",
              note: "Berlaku buat 2 sesi foto strip minggu ini, gayanya kamu yang atur.",
            },
          ],
          chatThreads: [
            {
              topic: "Awal Modus",
              messages: [
                { sender: "one", text: "Al, file catatan kuliah kemarin masih ada di kamu nggak?", time: "19.14" },
                { sender: "two", text: "Ada kok, bentar aku cari dulu di laptop ya. Kamu butuh yang bab mana?", time: "19.17" },
                { sender: "one", text: "Bebas sih semuanya boleh, tapi sekalian mau nanya udah makan belum?", time: "19.18" },
                { sender: "two", text: "Haha ketahuan banget modusnya ya dari nanya catatan ke nanya makan.", time: "19.20" },
              ],
            },
            {
              topic: "Debat Makan",
              messages: [
                { sender: "one", text: "Nanti sore pengen makan apa? Aku udah mau jalan jemput.", time: "16.40" },
                { sender: "two", text: "Terserah kamu aja, aku ngikut apa aja yang penting enak.", time: "16.42" },
                { sender: "one", text: "Pecel lele tenda depan?", time: "16.43" },
                { sender: "two", text: "Hmm nggak lagi pengen gorengan sih, mie kuah aja gimana?", time: "16.44" },
              ],
            },
          ],
          quizQuestions: [
            {
              question: "Kapan pertama kali kita ngaku sama-sama grogi pas ketemu?",
              options: ["Di parkiran kampus", "Waktu ngopi pertama", "Di depan toko buku"],
              correctIndex: 1,
              reaction: "Bener banget, sampai es kopi kita hampir nggak kesentuh saking gugupnya.",
            },
            {
              question: "Kalau bilang terserah mau makan apa, ujungnya hampir pasti milih apa?",
              options: ["Salad buah", "Mie kuah hangat atau bakso", "Roti tawar"],
              correctIndex: 1,
              reaction: "Akurat 100%, mie hangat selalu jadi penyelamat suasana.",
            },
          ],
          closingLetter:
            "Makasih ya udah betah diajak chat ngalor-ngidul tiap hari sampai sekarang. Semoga arsip kecil ini selalu bikin kamu senyum pas lagi capek.",
          songDedication: {
            title: "Monokrom",
            artist: "Tulus",
          },
        },
      };

    case "bucin-playlist":
      return {
        slug: cleanedSlug,
        templateId: "bucin-playlist",
        title: "Mixtape & Vinyl Rehan & Salsa",
        seoDescription: "Kumpulan track kenangan, vinyl berputar, cerita lagu, dan tiket kencan kita.",
        createdAt: today,
        orderNote: "Order baru Shopee",
        musicTrack: "builtin:indie",
        data: {
          partnerOne: "Rehan",
          partnerTwo: "Salsa",
          anniversaryDate: "2024-03-22",
          passcodePin: "",
          heroHeadline: "Side A & Side B: Lagu-Lagu yang Ngingetin ke Kamu",
          openingNote:
            "Dari rebutan kabel earphone di kereta sampai nyanyi fals bareng di jalanan malam, ini album kecil berisi momen yang paling sering aku putar ulang.",
          memories: [
            {
              imageUrl: "/demo/bucin-vinyl-1.webp",
              caption: "Track 01 - Nyari piringan hitam lama sambil debat selera lagu",
              dateLabel: "Mar 2024",
              audioUrl: "/audio/tracks/track-01.mp3",
            },
            {
              imageUrl: "/demo/bucin-vinyl-2.webp",
              caption: "Track 02 - Bagi earphone sebelah di kereta pulang sore",
              dateLabel: "Jun 2024",
              audioUrl: "/audio/tracks/track-02.mp3",
            },
            {
              imageUrl: "/demo/bucin-vinyl-3.webp",
              caption: "Track 03 - Nonton panggung akustik berdua sampai malam",
              dateLabel: "Okt 2024",
              audioUrl: "/audio/tracks/track-03.mp3",
            },
            {
              imageUrl: "/demo/bucin-2.webp",
              caption: "Track 04 - Jalan kaki ngejar langit sore favorit kamu",
              dateLabel: "Feb 2025",
              audioUrl: "/audio/tracks/track-04.mp3",
            },
          ],
          milestones: [
            {
              dateLabel: "Track 01",
              title: "Earphone Sebelah di KRL",
              description: "Awal mula tahu kalau selera lagu kita ternyata banyak cocoknya.",
            },
            {
              dateLabel: "Track 02",
              title: "Pulang Malam Kehujanan",
              description: "Nunggu hujan reda di depan minimarket sambil dengerin playlist random.",
            },
            {
              dateLabel: "Track 03",
              title: "Karaoke di Motor",
              description: "Salah lirik nggak masalah yang penting kompak nyanyi di lampu merah.",
            },
          ],
          loveReasons: [
            "Kamu nggak pernah protes pas aku putar lagu yang sama tiga kali berturut-turut.",
            "Suara kamu ikut nyanyi pelan di mobil selalu lebih bagus dari lagu aslinya.",
            "Selalu tahu lagu apa yang pas buat nenangin aku pas lagi penat.",
            "Nemenin keliling toko kaset walau kaki udah sama-sama pegal.",
          ],
          littleThings: [
            {
              label: "Lagu Pembuka Pagi",
              detail: "Pop akustik pelan sebelum ngopi biar nggak kaget sama deadline.",
            },
            {
              label: "Aturan Audio Mobil",
              detail: "Yang duduk di sebelah wajib jadi DJ anti-ngantuk.",
            },
            {
              label: "Koleksi Favorit",
              detail: "Selalu simpen tiket konser sama struk kopi berdua di belakang casing HP.",
            },
            {
              label: "Kebiasaan Pas Denger Musik",
              detail: "Jari tangan ikut ketuk-ketuk meja mengikuti tempo drum.",
            },
          ],
          coupons: [
            {
              title: "VIP Pass Nonton Live Music",
              note: "Berlaku buat nonton konser atau panggung akustik akhir pekan berdua.",
            },
            {
              title: "Kendali Penuh Playlist Seharian",
              note: "Bebas muter lagu kesukaan kamu di speaker tanpa hak veto dariku.",
            },
            {
              title: "Traktiran Ngopi di Toko Vinyl",
              note: "Pulang jalan nanti aku traktir es kopi plus camilan bebas pilih.",
            },
          ],
          closingLetter:
            "Kalau suatu hari nanti kita denger lagu lama ini lagi di mana pun, semoga rasanya tetap hangat kayak sore pertama kita bagi earphone berdua.",
          songDedication: {
            title: "Perahu Kertas",
            artist: "Maudy Ayunda",
          },
        },
      };

    case "bucin-magazine":
      return {
        slug: cleanedSlug,
        templateId: "bucin-magazine",
        title: "Edisi Khusus Fajar & Tiara",
        seoDescription: "Majalah digital edisi anniversary berisi artikel perjalanan cinta, spread foto, dan kupon gunting.",
        createdAt: today,
        orderNote: "Order baru Shopee",
        musicTrack: "builtin:bossa",
        data: {
          partnerOne: "Fajar",
          partnerTwo: "Tiara",
          anniversaryDate: "2024-02-14",
          passcodePin: "",
          heroHeadline: "Edisi Khusus: Dua Tahun Lebih Jalan Bareng Tiara",
          openingNote:
            "Arsip gaya majalah untuk merangkum cerita paling seru, fakta receh yang cuma kita berdua yang paham, serta rencana-rencana kecil ke depan.",
          memories: [
            {
              imageUrl: "/demo/bucin-mag-1.webp",
              caption: "Sampul edisi pagi setelah jalan kaki keliling galeri",
              dateLabel: "Feb 2024",
            },
            {
              imageUrl: "/demo/bucin-mag-2.webp",
              caption: "Sarapan weekend plus bunga kecil di atas meja",
              dateLabel: "Jun 2024",
            },
            {
              imageUrl: "/demo/bucin-mag-3.webp",
              caption: "Jalan pagi di taman kota mumpung masih sepi",
              dateLabel: "Nov 2024",
            },
            {
              imageUrl: "/demo/bucin-1.webp",
              caption: "Obrolan panjang tiap akhir pekan tanpa lihat jam",
              dateLabel: "Mar 2025",
            },
          ],
          milestones: [
            {
              dateLabel: "Bab 01",
              title: "Pertemuan Tanpa Rencana",
              description: "Semua dimulai dari sapaan singkat yang nggak disangka berlanjut terus sampai sekarang.",
            },
            {
              dateLabel: "Bab 02",
              title: "Jalan Pagi & Kopi Pertama",
              description: "Mulai rutin luangin akhir pekan cuma buat jalan santai dan tukar cerita.",
            },
            {
              dateLabel: "Bab 03",
              title: "Melangkah Lebih Tenang",
              description: "Sudah makin nyaman jadi diri sendiri tanpa perlu jaim di depan satu sama lain.",
            },
          ],
          loveReasons: [
            "Kamu bikin hari paling melelahkan tetap kerasa layak ditutup dengan senyum.",
            "Selalu punya ide kecil yang bikin akhir pekan sederhana berasa istimewa.",
            "Jujur dan hangat bahkan saat menyampaikan hal yang lagi bikin bete.",
            "Sabar menunggu aku milih menu sambil tetap bercanda.",
          ],
          littleThings: [
            {
              label: "Minuman Wajib",
              detail: "Matcha hangat atau es kopi susu less ice sebelum mulai jalan.",
            },
            {
              label: "Spot Favorit",
              detail: "Taman rindang jam 7 pagi sebelum matahari terik.",
            },
            {
              label: "Kebiasaan Unik",
              detail: "Motret bayangan kita berdua di trotoar tiap kali lagi jalan sore.",
            },
            {
              label: "Resolusi Berdua",
              detail: "Bisa lebih sering jalan ke kota baru minimal sekali setahun.",
            },
          ],
          coupons: [
            {
              title: "Kupon Weekend Staycation Mini",
              note: "Bebas pilih tanggal dan tempat buat rehat sejenak dari rutinitas.",
            },
            {
              title: "Kupon Traktiran Brunch Minggu",
              note: "Menu utama dan dessert bebas kamu tentukan, aku yang pesan.",
            },
            {
              title: "Kupon Jasa Foto Seharian",
              note: "Siap jadi fotografer pribadi kamu sampai dapat angle terbaik.",
            },
          ],
          closingLetter:
            "Terima kasih sudah jadi partner terbaik sekaligus pembaca nomor satu di cerita hidupku. Edisi-edisi berikutnya masih bakal terus kita tulis berdua.",
          songDedication: {
            title: "Kasih Putih",
            artist: "Glenn Fredly",
          },
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

    case "ultah-balon":
      return {
        slug: cleanedSlug,
        templateId: "ultah-balon",
        title: "Selamat Ulang Tahun ke-20 Dinda!",
        seoDescription: "Kejutan pesta balon warna cerah dan kapsul waktu harapan ulang tahun ke-20.",
        createdAt: today,
        orderNote: "Order baru Shopee",
        musicTrack: "builtin:birthday",
        data: {
          celebrantName: "Dinda",
          turningAge: 20,
          birthDateLabel: "22 November 2026",
          senderName: "Nadia, Ara & Geng Kopi",
          heroWish:
            "Selamat datang di kepala dua! Semoga kuliah makin lancar, rezeki jajan nggak pernah seret, dan selalu dikelilingi orang-orang baik yang bikin kamu ketawa tiap hari.",
          cakeImageUrl: "/demo/ultah-balon-hero.webp",
          giftVoucher: {
            title: "Voucher Bebas Pilih Cafe & Photobox",
            description: "Berlaku untuk 1x traktiran makan siang plus cetak photobox bareng sahabat.",
            redeemNote: "Pecahin semua balon dulu baru screenshot kupon ini buat klaim!",
          },
          memories: [
            { imageUrl: "/demo/ultah-balon-hero.webp", caption: "Dekor balon warna cerah spesial buat ulang tahun Dinda" },
            { imageUrl: "/demo/ultah-1.webp", caption: "Momen ketawa nggak berhenti pas lagi kumpul bareng" },
            { imageUrl: "/demo/ultah-2.webp", caption: "Sesi foto dadakan habis kelas sore" },
            { imageUrl: "/demo/ultah-3.webp", caption: "Kado kecil yang disimpan buat hari spesial" },
          ],
          friendWishes: [
            { from: "Nadia", role: "Teman Sekelas", message: "Happy 20th Dinda! Panjang umur, makin bersinar, dan traktiran ditunggu!" },
            { from: "Ara", role: "Partner Nongkrong", message: "Sehat selalu Din, makin sukses magangnya dan jangan lupa sering me-time." },
          ],
          wishChecklist: [
            "IPK aman dan tugas akhir kelar tepat waktu",
            "Bisa liburan singkat keluar kota bareng geng",
            "Lebih berani ambil peluang baru di usia 20",
            "Badan tetap bugar meski jadwal padat",
          ],
          playlistSong: { title: "Carefree Celebration", artist: "Musik Pesta Akustik" },
        },
      };

    case "ultah-retro":
      return {
        slug: cleanedSlug,
        templateId: "ultah-retro",
        title: "Level 22 Unlocked - HBD Bagas!",
        seoDescription: "Halaman kejutan ulang tahun bertema arcade retro 90an untuk sahabat atau pasangan.",
        createdAt: today,
        orderNote: "Order baru Shopee",
        musicTrack: "builtin:indie",
        data: {
          celebrantName: "Bagas",
          turningAge: 22,
          birthDateLabel: "25 November 2026",
          senderName: "Squad Mabar & Kopi",
          heroWish:
            "Naik ke Level 22 tanpa skip side-quest! Semoga karier makin ngebut, rank selalu naik, dompet tebel terus, dan jangan lupa istirahat pas begadang.",
          cakeImageUrl: "/demo/ultah-retro-hero.webp",
          giftVoucher: {
            title: "Loot Box: Traktiran Ramen + Kopi Susu",
            description: "Berlaku untuk 1x makan malam sepuasnya bareng pengirim kapan pun kamu sempat.",
            redeemNote: "Klaim kode hadiah ini di grup chat biar langsung dieksekusi minggu ini.",
          },
          memories: [
            { imageUrl: "/demo/ultah-retro-hero.webp", caption: "CH-01 // Perlengkapan wajib nongkrong malam minggu" },
            { imageUrl: "/demo/ultah-2.webp", caption: "CH-02 // Sesi kumpul rame-rame tanpa lihat jam" },
            { imageUrl: "/demo/ultah-3.webp", caption: "CH-03 // Surprise kado tengah malam pas hampir ketiduran" },
            { imageUrl: "/demo/ultah-4.webp", caption: "CH-04 // Momen foto ramean sebelum pulang" },
          ],
          friendWishes: [
            { from: "Rizky", role: "Partner Mabar", message: "HBD Gas! Semoga di level 22 makin gacor kerjaan sama skripsinya." },
            { from: "Tama", role: "Tetangga Kos", message: "Sehat terus bro, ditunggu traktiran gorengan plus es kopinya malam ini." },
          ],
          wishChecklist: [
            "Sidang atau proyek tahun ini beres mulus",
            "Nabung lancar buat upgrade setup impian",
            "Tidur cukup minimal 7 jam tiap malam",
            "Makin rajin olahraga akhir pekan",
          ],
          playlistSong: { title: "Warm Retro Tape", artist: "Mixtape Pilihan" },
        },
      };

    case "ultah-editorial":
      return {
        slug: cleanedSlug,
        templateId: "ultah-editorial",
        title: "Edisi Ulang Tahun ke-19 Nadira",
        seoDescription: "Jurnal ulang tahun estetik dengan amplop segel pita, kartu ucapan bolak-balik, dan kado digital.",
        createdAt: today,
        orderNote: "Order baru Shopee",
        musicTrack: "builtin:romance",
        data: {
          celebrantName: "Nadira",
          turningAge: 19,
          birthDateLabel: "28 November 2026",
          senderName: "Keluarga & Sahabat Dekat",
          heroWish:
            "Selamat ulang tahun yang ke-19, Nadira. Semoga langkah kecilmu tahun ini selalu bertemu hari yang hangat, hati yang tenang, dan tawa yang tulus.",
          cakeImageUrl: "/demo/ultah-editorial-hero.webp",
          giftVoucher: {
            title: "Kartu Hadiah: Brunch & Toko Buku Pilihan",
            description: "Berlaku untuk memilih 1 buku favorit dan menikmati brunch pagi santai bersama.",
            redeemNote: "Simpan kartu ini untuk menentukan jadwal minggu pagi pilihanmu.",
          },
          memories: [
            { imageUrl: "/demo/ultah-editorial-hero.webp", caption: "Pagi tenang merayakan bertambahnya usia" },
            { imageUrl: "/demo/ultah-1.webp", caption: "Senyum hangat di setiap perayaan kecil" },
            { imageUrl: "/demo/ultah-3.webp", caption: "Bingkisan pita yang disimpan penuh doa" },
            { imageUrl: "/demo/ultah-4.webp", caption: "Kebersamaan sederhana yang selalu dirindukan" },
          ],
          friendWishes: [
            { from: "Kak Hana", role: "Keluarga", message: "Barakallah fii umrik Nadira sayang, selalu jadi pribadi yang lembut dan kuat." },
            { from: "Kei", role: "Sahabat SMA", message: "Happy 19th! Terima kasih selalu jadi pendengar terbaik sejak dulu." },
          ],
          wishChecklist: [
            "Menjaga ketenangan hati di tengah jadwal padat",
            "Tamat membaca 12 buku favorit sepanjang tahun",
            "Lebih sering menikmati akhir pekan tanpa terburu-buru",
            "Selalu dikelilingi doa baik keluarga",
          ],
          playlistSong: { title: "Morning Piano", artist: "Musik Akustik Hangat" },
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

    case "nikah-minang":
      return {
        slug: cleanedSlug,
        templateId: "nikah-minang",
        title: "Baralek Gadang Farhan & Aisyah",
        seoDescription: "Undangan pernikahan Adat Minangkabau (Padang) Farhan dan Aisyah.",
        createdAt: today,
        orderNote: "Order baru Shopee",
        musicTrack: "builtin:nikah-minang",
        data: {
          bride: {
            nickname: "Aisyah",
            fullName: "Aisyah Putri Tanjung, S.Ked",
            parents: "Putri dari Bapak H. Darmawan Chaniago & Ibu Hj. Rosmita",
            photoUrl: "/demo/nikah-minang-couple.webp",
          },
          groom: {
            nickname: "Farhan",
            fullName: "Farhan Akbar Sutan Marajo, S.T.",
            parents: "Putra dari Bapak H. Syamsul Bahri & Ibu Hj. Yusnita",
            photoUrl: "/demo/nikah-groom.webp",
          },
          weddingDateIso: "2026-12-27T09:00:00+07:00",
          blessingQuote: {
            text: "Adaik basandi syarak, syarak basandi Kitabullah. Semoga Allah menghimpun yang terserak dari keduanya dan memberkahi rumah tangga sepanjang masa.",
            source: "Pepatah Adat Minangkabau & QS. Ar-Rum: 21",
          },
          akad: {
            dateLabel: "Minggu, 27 Desember 2026",
            timeLabel: "08.30 - 10.00 WIB",
            venueName: "Masjid Raya Baiturrahman Padang Baru",
            address: "Jl. Khatib Sulaiman No. 24, Padang",
            mapsUrl: "https://maps.google.com/?q=Padang",
          },
          resepsi: {
            dateLabel: "Minggu, 27 Desember 2026",
            timeLabel: "11.00 - 16.00 WIB",
            venueName: "Gedung Balairung Songket Minang",
            address: "Jl. Sudirman No. 88, Padang Barat",
            mapsUrl: "https://maps.google.com/?q=Padang",
          },
          culturalNote:
            "Dengan penuh hormat kami mengundang Bapak/Ibu/Dunsanak sadonyo untuk menghadiri prosesi Baralek Gadang anak kemenakan kami.",
          ceremonyExtras: [
            {
              label: "Malam Bainai",
              detail: "Sabtu malam pukul 19.30 WIB di kediaman Anak Daro bersama ninik mamak & bundo kanduang.",
            },
            {
              label: "Manjapuik Marapulai",
              detail: "Rombongan pihak Anak Daro menjemput Marapulai disertai sirih carano dan talempong.",
            },
          ],
          storyTimeline: [
            { year: "2023", title: "Basuo di Tanah Rantau", description: "Dipertemukan di acara silaturahmi perantau Minang yang hangat dengan sapaan sederhana." },
            { year: "2025", title: "Batuka Tando & Lamaran", description: "Kedua keluarga bertemu menyepakati niat suci dalam musyawarah ninik mamak." },
            { year: "2026", title: "Baralek Gadang", description: "InsyaAllah resmi menyatukan dua keluarga dalam ikatan pernikahan yang diridhai." },
          ],
          gallery: [
            "/demo/nikah-minang-couple.webp",
            "/demo/nikah-minang-venue.webp",
            "/demo/nikah-gallery-1.webp",
            "/demo/nikah-gallery-2.webp",
          ],
          digitalEnvelopes: [
            { bankName: "Bank Nagari", accountNumber: "210002918472", accountHolder: "Aisyah Putri Tanjung" },
            { bankName: "BSI", accountNumber: "7182940112", accountHolder: "Farhan Akbar" },
          ],
          rsvpWhatsapp: "6281234567890",
          dresscode: {
            note: "Tamu disarankan mengenakan busana marun songket, emas lembut, atau krem gading.",
            colors: [
              { label: "Marun Songket", hex: "#7F1D1D" },
              { label: "Emas Pucuk", hex: "#B45309" },
              { label: "Putih Gading", hex: "#FAF3E8" },
            ],
          },
          giftAddress: {
            recipient: "Aisyah Putri Tanjung (0812-3456-7890)",
            address: "Komp. Griya Minang Indah Blok B-12, Padang",
          },
          initialPrayers: [
            { name: "Datuak Rajo Alam", relation: "Ninik Mamak", message: "Selamat menempuh hidup baru, semoga rukun damai sampai anak cucu kelak." },
            { name: "Mira Andini", relation: "Sahabat", message: "MasyaAllah Aisyah gagah bana pakai Suntiang! Lancar sampai hari baralek." },
          ],
        },
      };

    case "nikah-jawa":
      return {
        slug: cleanedSlug,
        templateId: "nikah-jawa",
        title: "Pawiwahan Bagus & Sekarsari",
        seoDescription: "Undangan pernikahan Pawiwahan Adat Jawa Keraton Bagus dan Sekarsari.",
        createdAt: today,
        orderNote: "Order baru Shopee",
        musicTrack: "builtin:nikah-jawa",
        data: {
          bride: {
            nickname: "Sekar",
            fullName: "Raden Roro Sekarsari Kusumaningrum",
            parents: "Putri saking Bapak KRT. Hadiwijoyo & Ibu Endang Pratiwi",
            photoUrl: "/demo/nikah-jawa-couple.webp",
          },
          groom: {
            nickname: "Bagus",
            fullName: "Bagus Wicaksono Adi, S.Kom",
            parents: "Putra saking Bapak Ir. Santoso Prawiro & Ibu Sri Wahyuni",
            photoUrl: "/demo/nikah-groom.webp",
          },
          weddingDateIso: "2027-01-10T09:00:00+07:00",
          blessingQuote: {
            text: "Mugi tansah pinaringan rahayu, guyub rukun, dados kulawarga ingkang sakinah, mawaddah, warahmah salawasipun.",
            source: "Doa Pangestu Adat Jawa",
          },
          akad: {
            dateLabel: "Minggu Pahing, 10 Januari 2027",
            timeLabel: "08.00 - 10.00 WIB",
            venueName: "Pendopo Agung Joglo Kraton",
            address: "Jl. Taman Siswa No. 32, Yogyakarta",
            mapsUrl: "https://maps.google.com/?q=Yogyakarta",
          },
          resepsi: {
            dateLabel: "Minggu Pahing, 10 Januari 2027",
            timeLabel: "11.00 - 14.30 WIB",
            venueName: "Pendopo Agung Joglo Kraton",
            address: "Jl. Taman Siswa No. 32, Yogyakarta",
            mapsUrl: "https://maps.google.com/?q=Yogyakarta",
          },
          culturalNote:
            "Kanthi nyuwun sih rahmating Gusti Allah SWT, kula ngaturi rawuh panjenengan ing adicara Pawiwahan putra-putri kula.",
          ceremonyExtras: [
            {
              label: "Midodareni & Siraman",
              detail: "Sabtu Kliwon pukul 16.00 WIB di kediaman calon mempelai putri bersama keluarga sepuh.",
            },
            {
              label: "Upacara Panggih",
              detail: "Dilaksanakan tepat usai Ijab Qabul pukul 10.00 WIB lengkap balangan gantal lan sungkeman.",
            },
          ],
          storyTimeline: [
            { year: "2023", title: "Wiwit Tepang", description: "Awal kenal di kota pelajar saat mengerjakan pameran arsitektur budaya bersama." },
            { year: "2025", title: "Paningset & Peningsetan", description: "Silaturahmi keluarga besar untuk meneguhkan restu menuju hari bahagia." },
            { year: "2027", title: "Dhaup Agung", description: "Mengawali babak baru rumah tangga berlandaskan nilai kasih dan tata krama." },
          ],
          gallery: [
            "/demo/nikah-jawa-couple.webp",
            "/demo/nikah-jawa-venue.webp",
            "/demo/nikah-gallery-1.webp",
            "/demo/nikah-gallery-3.webp",
          ],
          digitalEnvelopes: [
            { bankName: "BCA", accountNumber: "0371849201", accountHolder: "Sekarsari Kusumaningrum" },
            { bankName: "Mandiri", accountNumber: "137008492018", accountHolder: "Bagus Wicaksono Adi" },
          ],
          rsvpWhatsapp: "6281234567890",
          dresscode: {
            note: "Para tamu disarankan mengenakan busana batik atau kebaya nuansa sogan cokelat, gading, atau emas.",
            colors: [
              { label: "Sogan Cokelat", hex: "#3E2723" },
              { label: "Emas Keraton", hex: "#92400E" },
              { label: "Gading Halus", hex: "#F5EFE4" },
            ],
          },
          giftAddress: {
            recipient: "Sekarsari Kusumaningrum (0812-3456-7890)",
            address: "Ndalam Prawirotaman No. 18, Mergangsan, Yogyakarta",
          },
          initialPrayers: [
            { name: "Eyang Haryono", relation: "Sesepuh Keluarga", message: "Sugeng mangayubagya Bagus lan Sekar, mugi tansah atut runtut dumugi kaken-ninen." },
            { name: "Dian Purnama", relation: "Rekan Kerja", message: "Anggun banget adat Jowone! Mugi dilancarke sadayanipun nggeh." },
          ],
        },
      };

    case "nikah-sunda":
      return {
        slug: cleanedSlug,
        templateId: "nikah-sunda",
        title: "Walimatul Ursy Galih & Ratna",
        seoDescription: "Undangan pernikahan Adat Sunda Sawer Galih dan Ratna.",
        createdAt: today,
        orderNote: "Order baru Shopee",
        musicTrack: "builtin:nikah-sunda",
        data: {
          bride: {
            nickname: "Ratna",
            fullName: "Ratna Komalasari, S.Psi",
            parents: "Putri ti Bapa H. Asep Suryana & Ibu Hj. Neneng Kartini",
            photoUrl: "/demo/nikah-sunda-couple.webp",
          },
          groom: {
            nickname: "Galih",
            fullName: "Galih Pratama Hidayat, S.E.",
            parents: "Putra ti Bapa Dedi Kusnadi & Ibu Tati Rohaeti",
            photoUrl: "/demo/nikah-groom.webp",
          },
          weddingDateIso: "2027-01-24T09:00:00+07:00",
          blessingQuote: {
            text: "Silih asah, silih asih, silih asuh. Mugia rumah tangga salawasna aya dina panangtayungan Gusti Allah SWT.",
            source: "Papatah Sunda & QS. Ar-Rum: 21",
          },
          akad: {
            dateLabel: "Minggu, 24 Januari 2027",
            timeLabel: "08.00 - 10.00 WIB",
            venueName: "Bale Taman Siliwangi",
            address: "Jl. Ir. H. Djuanda Dago No. 112, Bandung",
            mapsUrl: "https://maps.google.com/?q=Bandung",
          },
          resepsi: {
            dateLabel: "Minggu, 24 Januari 2027",
            timeLabel: "11.00 - 14.00 WIB",
            venueName: "Bale Taman Siliwangi",
            address: "Jl. Ir. H. Djuanda Dago No. 112, Bandung",
            mapsUrl: "https://maps.google.com/?q=Bandung",
          },
          culturalNote:
            "Sampurasun. Kalayan nyuhunkeun pidua ti sadaya kulawargi miwah réréncangan, simkuring ngahaturanan sumping dina dinten bagja.",
          ceremonyExtras: [
            {
              label: "Ngeuyeuk Seureuh",
              detail: "Sabtu sore pukul 15.30 WIB berupa prosesi nasihat pernikahan adat Sunda di pendopo taman.",
            },
            {
              label: "Sawer Panganten & Huap Lingkung",
              detail: "Berlangsung seusai akad nikah pukul 10.00 WIB diiringi kacapi suling lan tembang sawer.",
            },
          ],
          storyTimeline: [
            { year: "2022", title: "Patepang di Bandung", description: "Berawal dari hujan sore di jalan Dago yang membuka percakapan pertama kami." },
            { year: "2025", title: "Neundeun Omong & Seserahan", description: "Orang tua dari kedua pihak saling bersilaturahmi memantapkan niat suci." },
            { year: "2027", title: "Ngawangun Kulawarga", description: "Siap melangkah bersama membangun rumah yang dipenuhi syukur dan kehangatan." },
          ],
          gallery: [
            "/demo/nikah-sunda-couple.webp",
            "/demo/nikah-sunda-venue.webp",
            "/demo/nikah-gallery-2.webp",
            "/demo/nikah-gallery-3.webp",
          ],
          digitalEnvelopes: [
            { bankName: "BJB", accountNumber: "009182746100", accountHolder: "Ratna Komalasari" },
            { bankName: "BCA", accountNumber: "7771092841", accountHolder: "Galih Pratama Hidayat" },
          ],
          rsvpWhatsapp: "6281234567890",
          dresscode: {
            note: "Tamu disarankan mengenakan busana warna hijau daun, putih bersih, atau krem lembut.",
            colors: [
              { label: "Hijau Daun", hex: "#14532D" },
              { label: "Melati Putih", hex: "#FAFAF7" },
              { label: "Emas Lembut", hex: "#A16207" },
            ],
          },
          giftAddress: {
            recipient: "Ratna Komalasari (0812-3456-7890)",
            address: "Jl. Tubagus Ismail VIII No. 9, Coblong, Bandung",
          },
          initialPrayers: [
            { name: "Kang Ridwan", relation: "Sahabat Bandung", message: "Wilujeng Galih & Ratna! Mugia sakinah mawaddah warahmah salamina." },
            { name: "Teh Maya", relation: "Sepupu", message: "Siger melatinya manis banget, lancar sampai acara saweran!" },
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

    case "umkm-kuliner":
      return {
        slug: cleanedSlug,
        templateId: "umkm-kuliner",
        title: "Dapur Bunda Sari - Nasi Liwet & Katering",
        seoDescription: "Menu masakan rumahan, nasi kotak rapat, dan tumpeng hantaran Dapur Bunda Sari langsung order WhatsApp.",
        createdAt: today,
        orderNote: "Order baru Shopee",
        musicTrack: "none",
        data: {
          businessName: "Dapur Bunda Sari",
          categoryLabel: "Masakan Rumahan & Katering",
          tagline: "Nasi Liwet, Tumpeng Mini & Nasi Kotak Masak Hangat Setiap Pagi",
          description: "Masakan rumahan resep turun-temurun tanpa pengawet. Siap kirim untuk makan siang kantor, syukuran keluarga, hingga pengajian.",
          heroImageUrl: "/demo/umkm-kuliner-hero.webp",
          cityLabel: "Bekasi & Jakarta Timur",
          openHoursLabel: "Setiap hari, 06.30 - 18.00 WIB",
          whatsappNumber: "6281234567890",
          address: "Jl. Raya Pekayon No. 27, Bekasi Selatan",
          mapsUrl: "https://maps.google.com/?q=Bekasi+Selatan",
          highlights: [
            { title: "Dimasak Dadakan Subuh", description: "Sayur dan lauk selalu dimasak pagi sebelum diantar supaya tetap hangat." },
            { title: "Hitung Porsi Acara Fleksibel", description: "Bisa pesan 10 hingga 200 kotak dengan pilihan lauk sesuai anggaran." },
            { title: "Halal & Kemasan Higienis", description: "Bahan pasar segar dan kemasan kotak kertas aman tanpa plastik berlebih." },
          ],
          products: [
            {
              id: "liwet-box",
              name: "Nasi Liwet Ayam Lengkuas",
              category: "Nasi Kotak",
              price: 35000,
              unitLabel: "box",
              description: "Nasi liwet wangi serai, ayam kampung lengkuas, tempe orek, lalapan, & sambal terasi.",
              imageUrl: "/demo/umkm-kuliner-hero.webp",
              featured: true,
              options: ["Level Sambal Sedang", "Level Sambal Pedas", "Tanpa Sambal"],
            },
            {
              id: "katering-hemat",
              name: "Nasi Kotak Rapat Kantoran",
              category: "Katering",
              price: 29000,
              unitLabel: "box",
              description: "Nasi putih pulen, rendang daging empuk atau empal, tumis buncis, & kerupuk udang.",
              imageUrl: "/demo/umkm-kuliner-box.webp",
              options: ["Rendang Sapi", "Empal Serundeng"],
            },
            {
              id: "tumpeng-mini",
              name: "Tumpeng Syukuran Porsi 6 Org",
              category: "Tumpeng",
              price: 185000,
              unitLabel: "nampan",
              description: "Nasi kuning gurih komplit perkedel, urap, telur balado, & ayam panggang bumbu rujak.",
              imageUrl: "/demo/umkm-kuliner-hero.webp",
            },
            {
              id: "kue-lapis-box",
              name: "Kotak Kue Basah 12 Potong",
              category: "Kue Basah",
              price: 68000,
              unitLabel: "box",
              description: "Campuran kue lapis pandan, risoles mayo, dan lemper ayam suwir hangat.",
              imageUrl: "/demo/umkm-kuliner-box.webp",
            },
          ],
          testimonials: [
            { quote: "Pesan 65 nasi kotak buat rapat kantor datangnya masih ngebul hangat, sambelnya juara.", author: "Ibu Ratna", role: "Kantor Wilayah Bekasi" },
            { quote: "Kue lapis pandannya legit banget, nggak kemanisan buat acara arisan keluarga.", author: "Mbak Siska", role: "Pelanggan Tetap" },
          ],
          stats: [
            { value: "4.500+", label: "Kotak Terkirim" },
            { value: "Min. H-1", label: "Order Katering Besar" },
            { value: "100%", label: "Masak Pagi Segar" },
          ],
          promoBanner: {
            title: "Paket Tumpeng Mini + 6 Kotak Kue Hantaran",
            description: "Cocok buat acara syukuran keluarga atau ulang tahun kantor di rumah, bebas pilih tanggal antar.",
            priceLabel: "Rp240.000",
            productId: "tumpeng-mini",
          },
          faqs: [
            { question: "Minimal pemesanan katering acara berapa box?", answer: "Untuk menu harian bisa order satuan, sedangkan paket katering rapat minimal 10 box." },
          ],
        },
      };

    case "umkm-fashion":
      return {
        slug: cleanedSlug,
        templateId: "umkm-fashion",
        title: "Atelier Noura - Linen & Hijab Modest",
        seoDescription: "Lookbook resmi dan katalog koleksi pakaian linen wanita dan hijab Atelier Noura.",
        createdAt: today,
        orderNote: "Order baru Shopee",
        musicTrack: "none",
        data: {
          businessName: "Atelier Noura",
          categoryLabel: "Butik Linen & Hijab",
          tagline: "Potongan Linen Nyaman & Hijab Sutra Ringan untuk Dipakai Seharian",
          description: "Koleksi busana harian berbahan linen rami bernapas dan silk matte jatuh, dijahit dalam jumlah terbatas dari studio lokal.",
          heroImageUrl: "/demo/umkm-fashion-hero.webp",
          cityLabel: "Bandung Selatan",
          openHoursLabel: "Selasa - Minggu, 10.00 - 19.00 WIB",
          whatsappNumber: "6281234567890",
          address: "Jl. Buah Batu No. 94, Bandung",
          mapsUrl: "https://maps.google.com/?q=Bandung",
          highlights: [
            { title: "Bahan Linen Rami Asli", description: "Adem dipakai cuaca tropis dan semakin lembut setelah dicuci." },
            { title: "Ukuran Inklusif S sampai XL", description: "Pola potong longgar elegan mengikuti bentuk tubuh tanpa terasa sempit." },
            { title: "Gratis Tukar Ukuran 7 Hari", description: "Salah pilih size? Tinggal chat admin untuk penukaran cepat." },
          ],
          products: [
            {
              id: "noura-tunic",
              name: "Alya Linen Oversized Shirt",
              category: "Atasan",
              price: 229000,
              unitLabel: "pcs",
              description: "Kemeja outer longgar bahan 100% linen natural warna oatmeal yang ringan.",
              imageUrl: "/demo/umkm-fashion-hero.webp",
              featured: true,
              options: ["S", "M", "L", "XL"],
            },
            {
              id: "sage-tunic",
              name: "Senja Sage Tunic Dress",
              category: "Atasan",
              price: 269000,
              unitLabel: "pcs",
              description: "Tunik panjang kantong samping berpotongan lurus warna hijau sage tenang.",
              imageUrl: "/demo/umkm-fashion-flatlay.webp",
              options: ["S", "M", "L", "XL"],
            },
            {
              id: "espresso-pashmina",
              name: "Silk Matte Pashmina",
              category: "Hijab",
              price: 89000,
              unitLabel: "pcs",
              description: "Pashmina jatuh tidak menerawang dan tidak licin di kepala tanpa perlu banyak jarum.",
              imageUrl: "/demo/umkm-fashion-hero.webp",
              options: ["Espresso", "Oatmilk", "Rosewood"],
            },
            {
              id: "woven-bag",
              name: "Kala Woven Sling Bag",
              category: "Aksesori",
              price: 195000,
              unitLabel: "pcs",
              description: "Tas selempang anyaman kulit sintetis lentur muat dompet panjang dan HP.",
              imageUrl: "/demo/umkm-fashion-flatlay.webp",
              options: ["Warm Tan"],
            },
          ],
          testimonials: [
            { quote: "Linen-nya tebel tapi tetep adem dipakai seharian keluar kota, nggak gampang kusut parah.", author: "Nadia Putri", role: "Pembeli Kemeja Oatmeal" },
            { quote: "Pashmina silk-nya gampang banget diatur, udah beli tiga warna beda.", author: "Sinta Dewi", role: "Pelanggan Bandung" },
          ],
          stats: [
            { value: "S - XL", label: "Ukuran Lengkap" },
            { value: "100%", label: "Linen Rami Lokal" },
            { value: "7 Hari", label: "Garansi Tukar Size" },
          ],
          promoBanner: {
            title: "Setelan Kemeja Linen + Pashmina Silk",
            description: "Hemat Rp28.000 setiap pembelian satu set atasan linen lengkap hijab warna serasi.",
            priceLabel: "Rp290.000",
            productId: "noura-tunic",
          },
          faqs: [
            { question: "Apakah bisa tukar ukuran kalau kurang pas?", answer: "Bisa banget dalam 7 hari selama tag label masih terpasang rapi." },
          ],
        },
      };

    case "umkm-jasa":
      return {
        slug: cleanedSlug,
        templateId: "umkm-jasa",
        title: "Potong Rapi Barbershop & Studio",
        seoDescription: "Daftar harga layanan cukur, perawatan rambut, dan reservasi jadwal langsung WhatsApp Potong Rapi.",
        createdAt: today,
        orderNote: "Order baru Shopee",
        musicTrack: "none",
        data: {
          businessName: "Potong Rapi Studio",
          categoryLabel: "Barbershop & Grooming",
          tagline: "Cukur Presisi, Keramas Dingin & Konsultasi Gaya Tanpa Antre Lama",
          description: "Studio perawatan rambut pria dan remaja dengan alat selalu disterilkan setiap pelanggan selesai. Booking jam kedatangan langsung dari HP.",
          heroImageUrl: "/demo/umkm-jasa-hero.webp",
          cityLabel: "Jakarta Selatan",
          openHoursLabel: "Setiap hari, 10.00 - 22.00 WIB",
          whatsappNumber: "6281234567890",
          address: "Jl. Tebet Utara Dalam No. 15, Jakarta Selatan",
          mapsUrl: "https://maps.google.com/?q=Tebet+Jakarta+Selatan",
          highlights: [
            { title: "Booking Jam Anti-Antre", description: "Pilih layanan dan slot jam langsung terkirim ke kasir sebelum berangkat." },
            { title: "Peralatan Selalu Steril UV", description: "Sisir, pisau silet baru sekali pakai, dan gunting dibersihkan tiap sesi." },
            { title: "Konsultasi Bentuk Wajah", description: "Bebas tanya potongan yang cocok tanpa buru-buru sebelum gunting menyentuh rambut." },
          ],
          products: [
            {
              id: "signature-cut",
              name: "Signature Haircut + Wash + Tonic",
              category: "Cukur Rambut",
              price: 65000,
              unitLabel: "45 mnt",
              description: "Potong rambut presisi sesuai bentuk kepala, keramas dingin, pijat pundak ringan, & hair styling.",
              imageUrl: "/demo/umkm-jasa-hero.webp",
              featured: true,
              options: ["Fade", "Comma Hair", "Classic Trim"],
            },
            {
              id: "beard-groom",
              name: "Hot Towel Shave & Trim Jenggot",
              category: "Perawatan",
              price: 45000,
              unitLabel: "25 mnt",
              description: "Kompres handuk hangat aromaterapi, perapian kumis/jenggot, dan aftershave dingin.",
              imageUrl: "/demo/umkm-jasa-tools.webp",
            },
            {
              id: "combo-rapi",
              name: "Paket Lengkap Rambut + Jenggot",
              category: "Paket Hemat",
              price: 95000,
              unitLabel: "65 mnt",
              description: "Kombinasi penuh haircut, cuci rambut, hot towel shave, serta hair tonic perawatan kulit kepala.",
              imageUrl: "/demo/umkm-jasa-hero.webp",
            },
            {
              id: "clay-pomade",
              name: "Matte Clay Pomade 100gr",
              category: "Produk",
              price: 85000,
              unitLabel: "jar",
              description: "Pomade tahan lama hasil akhir natural matte tanpa kilap berminyak.",
              imageUrl: "/demo/umkm-jasa-tools.webp",
            },
          ],
          testimonials: [
            { quote: "Enak banget bisa booking jam duluan lewat web, nyampe lokasi tinggal duduk langsung potong.", author: "Rama Putra", role: "Pelanggan Bulanan" },
            { quote: "Tempatnya bersih banget, kapsternya detail pas bikin fade nggak belang.", author: "Kevin Wijaya", role: "Warga Tebet" },
          ],
          stats: [
            { value: "4.9/5", label: "Rating Google Maps" },
            { value: "100%", label: "Steril Tiap Sesi" },
            { value: "6 Kapster", label: "Siap Melayani" },
          ],
          promoBanner: {
            title: "Paket Cukur Rapi + Hair Wash Mahasiswa",
            description: "Potongan harga khusus Senin sampai Kamis pukul 10.00 - 15.00 WIB cukup pilih slot pagi.",
            priceLabel: "Rp55.000",
            productId: "signature-cut",
          },
          faqs: [
            { question: "Kalau telat datang lebih dari 15 menit bagaimana?", answer: "Slot digeser ke antrean kosong berikutnya atau cukup kabari admin WhatsApp." },
          ],
        },
      };
  }
}
