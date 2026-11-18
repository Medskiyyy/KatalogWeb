export type TemplateId =
  | "bucin-scrapbook"
  | "bucin-chat"
  | "bucin-playlist"
  | "bucin-magazine"
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
    "Pesan website kado spesial, undangan acara, dan halaman jualan usaha terima beres lewat Shopee.",
  shopeeUrl: "https://shopee.co.id/katalogweb",
  whatsapp: "6281234567890",
  packages: [
    {
      id: "kado-digital",
      name: "Paket Kado Digital",
      price: 29000,
      priceLabel: "Rp29.000",
      badge: "Hemat",
      description:
        "Website ucapan ulang tahun atau kado pasangan lengkap dengan galeri foto dan lagu pilihanmu.",
      features: [
        "Link website nama pilihanmu aktif 1 tahun penuh",
        "Bebas pilih desain Kado Bucin atau Kejutan Ulang Tahun",
        "Galeri foto, musik latar, dan kupon atau voucher interaktif",
        "Gratis revisi tulisan dan ganti foto maksimal 2 kali",
      ],
    },
    {
      id: "kado-kartu-qr",
      name: "Paket Kado + Kartu Cetak QR",
      price: 45000,
      priceLabel: "Rp45.000",
      badge: "Favorit Kado",
      description:
        "Website kado digital ditambah kartu cetak foto Polaroid berkode QR yang dikirim ke alamatmu.",
      features: [
        "Semua isi Paket Kado Digital aktif 1 tahun penuh",
        "Kartu cetak foto Polaroid atau ucapan ukuran A6 siap kasih",
        "Kode QR tinggal dipindai kamera HP untuk membuka kado",
        "Bisa checkout pakai voucher gratis ongkir Shopee",
      ],
    },
    {
      id: "undangan-pernikahan",
      name: "Paket Undangan Pernikahan",
      price: 69000,
      priceLabel: "Rp69.000",
      badge: "Acara Spesial",
      description:
        "Website undangan elegan dengan nama tamu khusus di tiap link untuk langsung disebar ke WhatsApp.",
      features: [
        "Link undangan pasangan aktif 1 tahun penuh",
        "Nama tamu tampil pribadi di sampul undangan sesuai link sebar",
        "Jadwal akad dan resepsi, hitung mundur, cerita cinta, serta peta lokasi",
        "Amplop digital salin rekening 1 klik dan konfirmasi hadir WhatsApp",
      ],
    },
    {
      id: "website-umkm",
      name: "Paket Website UMKM",
      price: 249000,
      priceLabel: "Rp249.000",
      badge: "Bisnis",
      description:
        "Website profil dan katalog menu jualan lengkap keranjang pesan otomatis ke WhatsApp.",
      features: [
        "Gratis bantu sambung domain nama usahamu sendiri (.my.id / .com)",
        "Katalog produk per kategori lengkap foto dan harga Rupiah",
        "Keranjang belanja menyusun rincian order langsung ke WhatsApp",
        "Penulisan profil usaha rapi dan ringan dibuka dari HP pembeli",
      ],
    },
  ] satisfies PackageTier[],
  templates: [
    {
      id: "bucin-scrapbook",
      name: "Scrapbook Kado Pasangan",
      category: "Bucin",
      demoSlug: "arka-nisa",
      price: 29000,
      priceLabel: "Rp29.000",
      thumbnail: "/demo/bucin-1.webp",
      tagline:
        "Amplop kunci tanggal jadian, jejak cerita, 6 foto Polaroid, catatan kebiasaan kecil, tumpukan kartu alasan sayang, dan kupon klaim.",
      highlights: [
        "Amplop kunci PIN 4 digit & timer lama jadian",
        "Jejak cerita, 6 foto Polaroid, dan tumpukan kartu alasan",
        "Kupon kencan interaktif yang bisa diklaim + surat penutup",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - SCRAPBOOK KADO PASANGAN",
        "Pilihan Nama Link Web: (contoh: arka-nisa)",
        "Nama Kamu & Pasangan:",
        "Tanggal Jadian (YYYY-MM-DD):",
        "PIN Kunci 4 Digit (kosongkan jika tanpa PIN):",
        "Judul Utama:",
        "Pesan Pembuka Singkat:",
        "4 Tahap Jejak Cerita (tanggal, judul, cerita):",
        "6 Alasan Sayang (pisahkan baris baru):",
        "4 Kebiasaan Kecil Pasangan:",
        "3 Kupon Klaim (judul + catatan):",
        "Surat Penutup:",
        "Judul Lagu & Penyanyi:",
        "Foto (kirim 6 foto terbaik lewat chat/Drive):",
      ].join("\n"),
    },
    {
      id: "bucin-chat",
      name: "Arsip Chat & Photobox Kita",
      category: "Bucin",
      demoSlug: "dimas-alya",
      price: 29000,
      priceLabel: "Rp29.000",
      thumbnail: "/demo/bucin-chat-1.webp",
      tagline:
        "Putar ulang chat masa PDKT, gelembung rekaman suara, strip foto ala photobox, mini kuis tentang hubungan kalian, dan voucher traktiran.",
      highlights: [
        "Simulasi chat masa pendekatan & voice note interaktif",
        "Strip 6 foto ala photobox mal + mini kuis tebak kebiasaan",
        "Kupon traktiran yang bisa diklaim + pesan penutup spesial",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - ARSIP CHAT & PHOTOBOX KITA",
        "Pilihan Nama Link Web: (contoh: dimas-alya)",
        "Nama Kamu & Pasangan:",
        "Tanggal Jadian (YYYY-MM-DD):",
        "PIN Kunci 4 Digit (opsional, kosongkan jika langsung buka):",
        "Judul Utama & Pesan Pembuka:",
        "3 Cuplikan Chat Lucu / Masa PDKT:",
        "3 Pertanyaan Mini Kuis Tentang Kalian:",
        "4 Kebiasaan Kecil Pasangan & 6 Alasan Sayang:",
        "3 Kupon Kencan & Surat Penutup:",
        "Judul Lagu & Penyanyi:",
        "Foto (kirim 6 foto ala photobox lewat chat/Drive):",
      ].join("\n"),
    },
    {
      id: "bucin-playlist",
      name: "Mixtape & Vinyl Lagu Kita",
      category: "Bucin",
      demoSlug: "rehan-salsa",
      price: 29000,
      priceLabel: "Rp29.000",
      thumbnail: "/demo/bucin-vinyl-1.webp",
      tagline:
        "Pemutar piringan hitam berputar, daftar lagu kenangan berisi cerita di balik tiap momen, buklet 6 foto, dan tiket kencan siap klaim.",
      highlights: [
        "Piringan vinyl berputar + daftar lagu kenangan interaktif",
        "Cerita di balik tiap momen & potongan kalimat favorit",
        "Buklet 6 foto + tiket kencan ala konser musik yang bisa diklaim",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - MIXTAPE & VINYL LAGU KITA",
        "Pilihan Nama Link Web: (contoh: rehan-salsa)",
        "Nama Kamu & Pasangan:",
        "Tanggal Jadian (YYYY-MM-DD):",
        "PIN Kunci 4 Digit (opsional, kosongkan jika langsung buka):",
        "Judul Album / Mixtape & Catatan Sampul:",
        "Judul Lagu Utama & Penyanyi:",
        "4-6 Momen Tracklist Kenangan (tanggal, judul, cerita):",
        "6 Alasan Sayang & 4 Kebiasaan Kecil:",
        "3 Tiket Kencan / Kupon Hadiah & Catatan Penutup:",
        "Foto (kirim 6 foto terbaik lewat chat/Drive):",
      ].join("\n"),
    },
    {
      id: "bucin-magazine",
      name: "Majalah Edisi Anniversary",
      category: "Bucin",
      demoSlug: "fajar-tiara",
      price: 29000,
      priceLabel: "Rp29.000",
      thumbnail: "/demo/bucin-mag-1.webp",
      tagline:
        "Tampilan majalah edisi khusus pasangan lengkap sampul potret editorial, artikel kronologi jadian, spread 6 foto, tombol kangen, dan kupon gunting.",
      highlights: [
        "Sampul depan majalah anniversary & artikel perjalanan cinta",
        "Spread 6 foto editorial + fakta receh rubrik pasangan",
        "Tombol kangen interaktif + kupon gunting & surat redaksi",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - MAJALAH EDISI ANNIVERSARY",
        "Pilihan Nama Link Web: (contoh: fajar-tiara)",
        "Nama Kamu & Pasangan:",
        "Tanggal Jadian (YYYY-MM-DD):",
        "PIN Kunci 4 Digit (opsional, kosongkan jika langsung buka):",
        "Judul Sampul Majalah & Kata Pengantar:",
        "4 Bab Artikel Kronologi Hubungan:",
        "6 Alasan Sayang & 4 Fakta Kebiasaan Pasangan:",
        "3 Kupon Gunting & Surat Penutup:",
        "Judul Lagu & Penyanyi:",
        "Foto (kirim 6 foto potret/candid lewat chat/Drive):",
      ].join("\n"),
    },
    {
      id: "ultah-interaktif",
      name: "Kejutan Ultah Tiup Lilin",
      category: "Ulang Tahun",
      demoSlug: "hbd-rani-21",
      price: 29000,
      priceLabel: "Rp29.000",
      thumbnail: "/demo/ultah-1.webp",
      tagline:
        "Tiup lilin kue ulang tahun lewat tombol atau mikrofon, angka usia, kotak kado 3 ketuk ke voucher traktiran, checklist harapan, dan papan ucapan.",
      highlights: [
        "Foto kue ulang tahun dengan lilin menyala yang bisa ditiup",
        "Kotak kado interaktif berubah jadi tiket voucher traktiran",
        "Checklist target usia baru & papan kartu ucapan teman",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - KEJUTAN ULTAH TIUP LILIN",
        "Pilihan Nama Link Web: (contoh: hbd-rani-21)",
        "Nama yang Berulang Tahun:",
        "Ulang Tahun ke-:",
        "Tanggal Lahir / Momen:",
        "Nama Pengirim Kado:",
        "Ucapan Utama:",
        "Isi Voucher Hadiah (judul + keterangan + cara klaim):",
        "5 Target / Doa Usia Baru:",
        "Ucapan Sahabat (nama, hubungan, pesan):",
        "Judul Lagu & Penyanyi:",
        "Foto (kirim 5 foto terbaik lewat chat/Drive):",
      ].join("\n"),
    },
    {
      id: "nikah-garden",
      name: "Undangan Pernikahan Garden",
      category: "Pernikahan",
      demoSlug: "reza-nadia",
      price: 69000,
      priceLabel: "Rp69.000",
      thumbnail: "/demo/nikah-couple.webp",
      tagline:
        "Sampul nama tamu pribadi, panduan warna busana, 4 bab kisah cinta, galeri 6 foto, amplop digital, alamat kado fisik, dan doa tamu langsung.",
      highlights: [
        "Sampul nama tamu otomatis & bantu buat link sebar WA",
        "Jadwal akad/resepsi, panduan warna busana, dan peta lokasi",
        "Amplop rekening salin 1 klik, alamat kado, dan papan doa tamu",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - UNDANGAN PERNIKAHAN GARDEN",
        "Pilihan Nama Link Web: (contoh: reza-nadia)",
        "Mempelai Wanita (panggilan, nama lengkap, nama orang tua):",
        "Mempelai Pria (panggilan, nama lengkap, nama orang tua):",
        "Tanggal & Jam Acara:",
        "Detail Akad (tanggal, jam, tempat, link Google Maps):",
        "Detail Resepsi (tanggal, jam, tempat, link Google Maps):",
        "Panduan Warna Busana Tamu:",
        "4 Bab Cerita Cinta (tahun, judul, cerita):",
        "Rekening Amplop Digital (nama bank, no rekening, atas nama):",
        "Alamat Kirim Kado Fisik (penerima & alamat):",
        "Nomor WhatsApp penerima konfirmasi hadir:",
        "Foto Prewedding (kirim 6 foto lewat chat/Drive):",
      ].join("\n"),
    },
    {
      id: "umkm-katalog",
      name: "Website Katalog UMKM & Order WA",
      category: "UMKM",
      demoSlug: "kopi-senja",
      price: 249000,
      priceLabel: "Rp249.000",
      thumbnail: "/demo/umkm-hero.webp",
      tagline:
        "Etalase jualan lengkap banner promo paket, pencarian & filter menu, detail produk, keunggulan bahan, ulasan pembeli, tanya jawab, dan keranjang WhatsApp.",
      highlights: [
        "Menu terfilter + pencarian + pop-up detail produk lengkap",
        "Keranjang belanja otomatis kirim rincian order ke WhatsApp",
        "Banner paket promo, bukti angka toko, ulasan, & panduan order",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - WEBSITE KATALOG UMKM & ORDER WA",
        "Pilihan Nama Link / Domain Usaha: (contoh: kopi-senja / kopisenja.my.id)",
        "Nama Usaha & Kategori:",
        "Tagline & Deskripsi Singkat Usaha:",
        "3 Angka Keunggulan Toko:",
        "Kota, Jam Buka, Alamat Lengkap & Link Maps:",
        "Nomor WhatsApp Penerima Order:",
        "Daftar Produk (nama, kategori, harga, satuan, deskripsi singkat):",
        "Banner Promo Paket Spesial (jika ada):",
        "3 Standar Kualitas Produk:",
        "4 Ulasan Pelanggan & Pertanyaan Umum Pembeli:",
        "Foto Produk & Foto Utama Toko:",
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
