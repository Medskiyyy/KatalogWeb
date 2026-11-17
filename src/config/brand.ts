export type TemplateId =
  | "bucin-scrapbook"
  | "ultah-interaktif"
  | "nikah-garden"
  | "umkm-katalog";

export interface PackageTier {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  badge: string;
  description: string;
  features: string[];
}

export interface TemplateCatalogItem {
  id: TemplateId;
  name: string;
  category: "Bucin" | "Ulang Tahun" | "Pernikahan" | "UMKM";
  demoSlug: string;
  price: number;
  priceLabel: string;
  thumbnail: string;
  tagline: string;
  highlights: string[];
  buyerFormTemplate: string;
}

export const BRAND = {
  name: "KatalogWeb",
  domain: "katalogweb.my.id",
  tagline:
    "Pesan website kado personal, undangan acara, dan katalog UMKM dengan subdomain pilihanmu sendiri.",
  shopeeUrl: "https://shopee.co.id/katalogweb",
  whatsapp: "6281234567890",
  packages: [
    {
      id: "subdomain-kilat",
      name: "Subdomain Kilat",
      price: 29000,
      priceLabel: "Rp29.000",
      badge: "Paling Laris",
      description:
        "Cocok untuk kado bucin dan ulang tahun. Link langsung jadi tanpa menunggu kurir.",
      features: [
        "Subdomain pilihan nama.katalogweb.my.id aktif 1 tahun",
        "Bebas pilih tema Bucin Scrapbook atau Ultah Interaktif",
        "Maksimal 8 foto terkompresi WebP + musik latar",
        "Revisi teks dan penyesuaian foto maksimal 2 kali",
      ],
    },
    {
      id: "bundling-qr",
      name: "Bundling Kartu Fisik QR",
      price: 45000,
      priceLabel: "Rp45.000",
      badge: "Kado Fisik",
      description:
        "Website kado plus kartu Polaroid cetak berkode QR untuk dikirim lewat ekspedisi Shopee.",
      features: [
        "Semua fitur paket Subdomain Kilat aktif 1 tahun",
        "Cetak kartu ucapan Polaroid atau minimalis ukuran A6",
        "Kode QR langsung membuka subdomain kado pilihanmu",
        "Bisa checkout pakai voucher gratis ongkir Shopee",
      ],
    },
    {
      id: "undangan-acara",
      name: "Undangan Pernikahan",
      price: 69000,
      priceLabel: "Rp69.000",
      badge: "Acara Spesial",
      description:
        "Undangan digital elegan dengan nama tamu tanpa batas untuk dibagikan ke WhatsApp.",
      features: [
        "Subdomain pasangan nama.katalogweb.my.id aktif 1 tahun",
        "Nama tamu otomatis lewat link parameter (?to=Nama)",
        "Jadwal akad dan resepsi, hitung mundur, serta peta lokasi",
        "Amplop digital salin rekening 1 klik dan form RSVP WhatsApp",
      ],
    },
    {
      id: "katalog-umkm",
      name: "Katalog Usaha UMKM",
      price: 249000,
      priceLabel: "Rp249.000",
      badge: "Bisnis",
      description:
        "Landing page jualan terima beres lengkap dengan keranjang pesanan langsung ke WhatsApp.",
      features: [
        "Subdomain usaha toko.katalogweb.my.id atau sambung domain .my.id",
        "Katalog produk per kategori dengan format harga Rupiah rapi",
        "Keranjang belanja otomatis menyusun rincian order ke WhatsApp",
        "Copywriting produk rapi serta optimasi tampilan mobile cepat",
      ],
    },
  ] satisfies PackageTier[],
  templates: [
    {
      id: "bucin-scrapbook",
      name: "Scrapbook Kado Bucin",
      category: "Bucin",
      demoSlug: "arka-nisa",
      price: 29000,
      priceLabel: "Rp29.000",
      thumbnail: "/demo/bucin-1.webp",
      tagline:
        "Kunci PIN tanggal jadian, galeri Polaroid miring, kartu alasan sayang, dan surat penutup.",
      highlights: [
        "Kunci PIN 4 digit + pembuka amplop",
        "Penghitung hari bersama real-time",
        "Tumpukan kartu alasan interaktif",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - SCRAPBOOK KADO BUCIN",
        "Nama Subdomain Pilihan: (contoh: arka-nisa)",
        "Nama Pasangan 1 & 2:",
        "Tanggal Jadian (YYYY-MM-DD):",
        "PIN Kunci 4 Digit (kosongkan jika tanpa PIN):",
        "Judul Utama:",
        "Pesan Pembuka Singkat:",
        "5 Alasan Sayang (pisahkan baris baru):",
        "Surat Penutup:",
        "Judul Lagu & Penyanyi:",
        "Foto (kirim 4-8 foto terbaik lewat chat/Drive):",
      ].join("\n"),
    },
    {
      id: "ultah-interaktif",
      name: "Ultah Tiup Lilin Interaktif",
      category: "Ulang Tahun",
      demoSlug: "hbd-rani-21",
      price: 29000,
      priceLabel: "Rp29.000",
      thumbnail: "/demo/ultah-1.webp",
      tagline:
        "Tiup lilin kue ulang tahun lewat tombol atau mikrofon, konfeti, voucher hadiah, dan ucapan teman.",
      highlights: [
        "Lilin kue interaktif (tap atau tiup mic)",
        "Kartu gosok/buka voucher traktiran",
        "Galeri kenangan & papan ucapan teman",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - ULTAH TIUP LILIN INTERAKTIF",
        "Nama Subdomain Pilihan: (contoh: hbd-rani-21)",
        "Nama yang Berulang Tahun:",
        "Ulang Tahun ke-:",
        "Tanggal Lahir / Momen:",
        "Nama Pengirim Kado:",
        "Ucapan Utama:",
        "Isi Voucher Hadiah (judul + keterangan):",
        "Ucapan Sahabat (nama, hubungan, pesan):",
        "Foto (kirim 3-6 foto lewat chat/Drive):",
      ].join("\n"),
    },
    {
      id: "nikah-garden",
      name: "Undangan Garden Botanical",
      category: "Pernikahan",
      demoSlug: "reza-nadia",
      price: 69000,
      priceLabel: "Rp69.000",
      thumbnail: "/demo/nikah-couple.webp",
      tagline:
        "Sampul nama tamu custom, hitung mundur hari H, cerita cinta, amplop digital, dan RSVP WhatsApp.",
      highlights: [
        "Nama tamu otomatis (?to=Nama+Tamu)",
        "Amplop digital salin rekening 1 klik",
        "Generator link tamu bawaan",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - UNDANGAN PERNIKAHAN GARDEN",
        "Nama Subdomain Pilihan: (contoh: reza-nadia)",
        "Mempelai Wanita (panggilan, nama lengkap, nama orang tua):",
        "Mempelai Pria (panggilan, nama lengkap, nama orang tua):",
        "Tanggal & Jam Acara (untuk countdown):",
        "Detail Akad (tanggal, jam, tempat, link Google Maps):",
        "Detail Resepsi (tanggal, jam, tempat, link Google Maps):",
        "3 Tahap Cerita Singkat (tahun, judul, cerita):",
        "Rekening Amplop Digital (nama bank, no rekening, atas nama):",
        "Nomor WhatsApp penerima RSVP:",
        "Foto Prewedding (kirim 4-6 foto lewat chat/Drive):",
      ].join("\n"),
    },
    {
      id: "umkm-katalog",
      name: "Etalase UMKM Order WA",
      category: "UMKM",
      demoSlug: "kopi-senja",
      price: 249000,
      priceLabel: "Rp249.000",
      thumbnail: "/demo/umkm-hero.webp",
      tagline:
        "Katalog menu atau produk dengan keranjang belanja yang otomatis menyusun order ke WhatsApp.",
      highlights: [
        "Filter kategori & harga Rupiah rapi",
        "Keranjang belanja langsung kirim ke WA",
        "Lokasi outlet & testimoni pelanggan",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - ETALASE UMKM ORDER WA",
        "Nama Subdomain Pilihan: (contoh: kopi-senja)",
        "Nama Usaha & Kategori:",
        "Tagline & Deskripsi Singkat Usaha:",
        "Kota, Jam Buka, Alamat Lengkap & Link Maps:",
        "Nomor WhatsApp Penerima Order:",
        "Daftar Produk (nama, kategori, harga, satuan, deskripsi singkat):",
        "3 Keunggulan Utama Usaha:",
        "3 Testimoni Pelanggan:",
        "Foto Produk & Banner Utama:",
      ].join("\n"),
    },
  ] satisfies TemplateCatalogItem[],
};

export function getSubdomainHost(slug: string): string {
  return `${slug}.${BRAND.domain}`;
}

export function getSubdomainUrl(slug: string): string {
  return `https://${slug}.${BRAND.domain}`;
}

export function getDevSubdomainUrl(slug: string, port = 3000): string {
  return `http://${slug}.localhost:${port}`;
}

export function getPreviewPath(slug: string): string {
  return `/s/${slug}`;
}
