export type TemplateId =
  | "bucin-scrapbook"
  | "bucin-chat"
  | "bucin-playlist"
  | "bucin-magazine"
  | "ultah-interaktif"
  | "ultah-balon"
  | "ultah-retro"
  | "ultah-editorial"
  | "nikah-garden"
  | "nikah-minang"
  | "nikah-jawa"
  | "nikah-sunda"
  | "nikah-motion"
  | "umkm-katalog"
  | "umkm-kuliner"
  | "umkm-fashion"
  | "umkm-jasa";

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
        "Website undangan elegan dengan tema modern maupun adat Nusantara, lengkap nama tamu pribadi per link WhatsApp.",
      features: [
        "Link undangan pasangan aktif 1 tahun penuh",
        "Nama tamu tampil pribadi di sampul undangan sesuai link sebar",
        "Pilihan tema Garden, Adat Minang, Adat Jawa Keraton, atau Adat Sunda",
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
        "Website profil dan katalog jualan usaha (kopi, kuliner katering, fashion butik, atau jasa booking) langsung ke WhatsApp.",
      features: [
        "Gratis bantu sambung domain nama usahamu sendiri (.my.id / .com)",
        "Katalog produk per kategori, varian ukuran, atau kalkulator paket jasa",
        "Keranjang dan form booking menyusun rincian order langsung ke WhatsApp",
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
        "Kupon kencan interaktif yang bisa diklaim + musik piano latar",
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
        "Putar ulang chat masa PDKT dengan balas cepat, rekaman suara asli Bahasa Indonesia, polling kencan seru, strip photobox kilat, dan mini kuis.",
      highlights: [
        "Sampul notifikasi HP + replay chat 3 topik & balas cepat interaktif",
        "2 rekaman voice note suara asli + polling kencan ala WhatsApp",
        "Strip 6 foto photobox kilat kamera + mini kuis tebak kebiasaan",
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
        "4 Tahap Jejak Cerita & Surat Penutup:",
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
        "Pemutar piringan hitam berputar dengan 6 track lagu nyata, jarum gramofon, pemilih mood malam, liner notes cerita momen, dan buklet foto.",
      highlights: [
        "Sampul sleeve vinyl tarik-keluar + 6 track MP3 nyata bisa diganti-ganti",
        "Jarum turun berbunyi, pita kaset Side B, & pemilih mood putaran malam",
        "Buklet 6 foto bergaya gatefold album + surat penutup sampul belakang",
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
        "Catatan Penutup Sampul Belakang Mixtape:",
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
        "Majalah digital edisi anniversary lengkap sampul editorial berlapis, kronologi bab interaktif, spread foto, kuis redaksi, tombol kangen, dan bucket list.",
      highlights: [
        "Sampul edisi khusus + bar progres baca & musik kafe bossa nova",
        "Artikel kronologi interaktif + kuis seberapa hafal hubungan",
        "Spread 6 foto editorial, hujan hati sinyal kangen, & checklist bucket list",
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
        "3 Pertanyaan Kuis Redaksi & Surat Penutup:",
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
        "Tiup lilin kue ulang tahun lewat tombol atau mikrofon lengkap konfeti & sorak pesta, kotak kado 3 ketuk ke voucher traktiran, wishlist, dan ucapan.",
      highlights: [
        "Foto kue dengan 5 nyala lilin bisa ditiup lewat mic HP atau tap",
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
        "Foto (kirim 4-5 foto terbaik lewat chat/Drive):",
      ].join("\n"),
    },
    {
      id: "ultah-balon",
      name: "Pesta Balon & Kapsul Waktu",
      category: "Ulang Tahun",
      demoSlug: "ultah-dinda-20",
      price: 29000,
      priceLabel: "Rp29.000",
      thumbnail: "/demo/ultah-balon-hero.webp",
      tagline:
        "Tema pesta warna cerah dengan mini-game pecahin 5 balon kejutan fakta lucu, kapsul waktu doa usia baru terkunci, dan galeri Polaroid.",
      highlights: [
        "Mini-game pecahin 5 balon berisi fakta lucu sampai efek sorak & konfeti",
        "Kapsul waktu harapan usia baru dengan efek sorak & lagu pesta",
        "Galeri Polaroid seru & papan ucapan geng/sahabat",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - PESTA BALON & KAPSUL WAKTU",
        "Pilihan Nama Link Web: (contoh: ultah-dinda-20)",
        "Nama yang Berulang Tahun & Usia Baru:",
        "Tanggal Ulang Tahun & Nama Pengirim:",
        "Ucapan Utama & Isi Kapsul Harapan:",
        "5 Harapan / Checklist Usia Baru:",
        "Ucapan Sahabat (nama, hubungan, pesan):",
        "Foto (kirim 4-5 foto momen seru lewat chat/Drive):",
      ].join("\n"),
    },
    {
      id: "ultah-retro",
      name: "Arcade & Kaset Retro 90an",
      category: "Ulang Tahun",
      demoSlug: "hbd-bagas-22",
      price: 29000,
      priceLabel: "Rp29.000",
      thumbnail: "/demo/ultah-retro-hero.webp",
      tagline:
        "Gaya layar game genggam & kaset tahun 90an: gerbang 'Press Start Level Up', bar skill karakter + buff doa, quest log, dan album layar TV.",
      highlights: [
        "Layar buka bertema game retro naik level + statistik XP & tombol Buff Doa",
        "Album foto dengan tombol ganti channel TV & quest target tahun baru",
        "Papan skor ucapan teman nongkrong bergaya leaderboard arcade",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - ARCADE & KASET RETRO 90AN",
        "Pilihan Nama Link Web: (contoh: hbd-bagas-22)",
        "Nama Player & Level (Usia Baru):",
        "Tanggal & Nama Pengirim / Squad:",
        "Ucapan Utama & Misi Target Tahun Baru (4-5 poin):",
        "Ucapan Teman Satu Tongkrongan:",
        "Foto (kirim 4-5 foto lewat chat/Drive):",
      ].join("\n"),
    },
    {
      id: "ultah-editorial",
      name: "Jurnal Sweet Birthday Elegan",
      category: "Ulang Tahun",
      demoSlug: "sweet-nadira-19",
      price: 29000,
      priceLabel: "Rp29.000",
      thumbnail: "/demo/ultah-editorial-hero.webp",
      tagline:
        "Nuansa alabaster dan berry yang tenang elegan: amplop segel pita, kartu doa bolak-balik 3D interaktif, refleksi usia, dan kolase potret.",
      highlights: [
        "Amplop segel pita elegan + alunan musik piano lembut",
        "Kartu ucapan sahabat bolak-balik 3D interaktif satu per satu",
        "Kolase galeri estetik & akordeon refleksi harapan pribadi",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - JURNAL SWEET BIRTHDAY ELEGAN",
        "Pilihan Nama Link Web: (contoh: sweet-nadira-19)",
        "Nama Penerima & Ulang Tahun ke-:",
        "Tanggal & Nama Pengirim:",
        "Surat Ucapan Utama:",
        "5 Resolusi / Doa Usia Baru:",
        "Ucapan Hangat Sahabat & Keluarga:",
        "Foto (kirim 4-5 foto estetik lewat chat/Drive):",
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
        "Sampul taman botani dengan nama tamu pribadi per link, panduan warna busana, cerita cinta, galeri, amplop digital, alamat kado fisik, dan doa tamu.",
      highlights: [
        "Sampul nama tamu otomatis & bantu buat link sebar WA massal",
        "Jadwal akad/resepsi, panduan warna busana, dan peta lokasi",
        "Amplop rekening salin 1 klik, alamat kado, dan papan doa tamu",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - UNDANGAN PERNIKAHAN GARDEN",
        "Pilihan Nama Link Web: (contoh: reza-nadia)",
        "Mempelai Wanita (panggilan, nama lengkap, nama orang tua):",
        "Mempelai Pria (panggilan, nama lengkap, nama orang tua):",
        "Tanggal & Jam Acara:",
        "Detail Akad & Resepsi (tempat, alamat, link Maps):",
        "Panduan Warna Busana Tamu:",
        "4 Bab Cerita Cinta & Rekening Amplop Digital:",
        "Alamat Kirim Kado & Nomor WA Konfirmasi Hadir:",
        "Foto Prewedding (kirim 4-6 foto lewat chat/Drive):",
      ].join("\n"),
    },
    {
      id: "nikah-minang",
      name: "Undangan Adat Padang (Minang)",
      category: "Pernikahan",
      demoSlug: "farhan-aisyah",
      price: 69000,
      priceLabel: "Rp69.000",
      thumbnail: "/demo/nikah-minang-couple.webp",
      tagline:
        "Undangan Baralek Gadang bernuansa Songket Marun dan Emas dengan ornamen Gonjong Rumah Gadang, musik sambutan Minang asli, peta, dan RSVP WhatsApp.",
      highlights: [
        "Ornamen atap Gonjong & Pucuk Rebung + musik sambutan Minang asli",
        "Profil Anak Daro & Marapulai, jadwal Akad, serta Baralek Gadang",
        "Link nama tamu pribadi, salin rekening 1 klik, alamat kado, & RSVP WA",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - UNDANGAN ADAT PADANG (MINANGKABAU)",
        "Pilihan Nama Link Web: (contoh: farhan-aisyah)",
        "Anak Daro (panggilan, nama lengkap + gelar jika ada, orang tua):",
        "Marapulai (panggilan, nama lengkap + Sutan/gelar adat, orang tua):",
        "Tanggal & Jam Akad Nikah + Alamat & Link Maps:",
        "Tanggal & Jam Baralek Gadang + Alamat & Link Maps:",
        "Rangkaian Prosesi Adat (Malam Bainai, Manjapuik Marapulai, dll):",
        "Kisah Singkat, Rekening Amplop Digital & Alamat Kado:",
        "Nomor WhatsApp Konfirmasi Hadir & Foto Prewedding Adat:",
      ].join("\n"),
    },
    {
      id: "nikah-jawa",
      name: "Undangan Adat Jawa Keraton",
      category: "Pernikahan",
      demoSlug: "bagus-sekarsari",
      price: 69000,
      priceLabel: "Rp69.000",
      thumbnail: "/demo/nikah-jawa-couple.webp",
      tagline:
        "Undangan Pawiwahan Jawa warna Sogan & Emas Keraton lengkap gerbang Gunungan Kayon, suara gong gamelan asli saat dibuka, Ijab Qabul, dan Pahargyan.",
      highlights: [
        "Gerbang Pendopo & Gunungan + gong & gamelan keraton Jawa asli",
        "Tata bahasa Krama halus + jadwal Ijab Qabul, Panggih, & Pahargyan",
        "Panduan busana batik, salin rekening 1 klik, alamat kado, & RSVP WA",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - UNDANGAN PAWIWAHAN ADAT JAWA KERATON",
        "Pilihan Nama Link Web: (contoh: bagus-sekarsari)",
        "Mempelai Putri (panggilan, nama lengkap, putra/putri dari siapa):",
        "Mempelai Kakung (panggilan, nama lengkap, putra dari siapa):",
        "Jadwal Ijab Qabul & Pahargyan (hari, jam, pendopo/gedung, Maps):",
        "Prosesi Adat (Siraman, Midodareni, Panggih, dll):",
        "Kisah Singkat, Warna Busana Batik, Rekening & Alamat Kado:",
        "Nomor WhatsApp Konfirmasi Hadir & Foto Prewedding Adat:",
      ].join("\n"),
    },
    {
      id: "nikah-sunda",
      name: "Undangan Adat Sunda Sawer",
      category: "Pernikahan",
      demoSlug: "galih-ratna",
      price: 69000,
      priceLabel: "Rp69.000",
      thumbnail: "/demo/nikah-sunda-couple.webp",
      tagline:
        "Undangan Walimatul Ursy khas Sunda bernuansa Hijau Daun & Melati Siger lengkap animasi kelopak melati, alunan Kecapi Degung Sunda, dan generator link tamu.",
      highlights: [
        "Kelopak bunga ronce melati berjatuhan + musik Kacapi Degung asli",
        "Profil Mojang & Jajaka, jadwal Akad, prosesi Ngeuyeuk Seureuh & Sawer",
        "Salin rekening amplop digital 1 klik, peta lokasi, & RSVP WA",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - UNDANGAN WALIMATUL URSY ADAT SUNDA",
        "Pilihan Nama Link Web: (contoh: galih-ratna)",
        "Mempelai Istri (panggilan, nama lengkap, putri dari Bapak/Ibu):",
        "Mempelai Pameget (panggilan, nama lengkap, putra dari Bapak/Ibu):",
        "Jadwal Akad Nikah & Resepsi Saweran (tanggal, jam, tempat, Maps):",
        "Prosesi Adat Sunda (Ngeuyeuk Seureuh, Mapag Panganten, Sawer):",
        "Cerita Cinta, Rekening Amplop, Alamat Kado, & Nomor WA:",
        "Foto Prewedding Adat Sunda (4-6 foto lewat chat/Drive):",
      ].join("\n"),
    },
    {
      id: "nikah-motion",
      name: "Undangan Motion Gerbang Bunga",
      category: "Pernikahan",
      demoSlug: "adit-kirana",
      price: 79000,
      priceLabel: "Rp79.000",
      thumbnail: "/demo/nikah-jawa-couple.webp",
      tagline:
        "Undangan pernikahan sinematik dengan animasi gerbang bunga mekar saat dibuka, pendopo & wayang berayun, kupu-kupu terbang, serta personalisasi nama tamu.",
      highlights: [
        "Animasi gerbang bunga mekar & zoom-in pendopo saat tombol Buka Undangan diklik",
        "Bunga & daun goyang tertiup angin, kupu-kupu terbang, + motif batik kawung",
        "Hitung mundur Save The Date, galeri lightbox, amplop digital, & RSVP WA",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - UNDANGAN MOTION GERBANG BUNGA",
        "Pilihan Nama Link Web: (contoh: adit-kirana)",
        "Mempelai Putri (panggilan, nama lengkap, putri dari Bapak/Ibu):",
        "Mempelai Putra (panggilan, nama lengkap, putra dari Bapak/Ibu):",
        "Jadwal Akad Nikah & Resepsi (tanggal, jam, tempat, link Maps):",
        "Love Story Singkat & Rekening Amplop Digital:",
        "Nomor WhatsApp Konfirmasi Hadir & Foto Prewedding (4-6 foto):",
      ].join("\n"),
    },
    {
      id: "umkm-katalog",
      name: "Katalog Kedai Kopi & Minuman",
      category: "UMKM",
      demoSlug: "kopi-senja",
      price: 249000,
      priceLabel: "Rp249.000",
      thumbnail: "/demo/umkm-hero.webp",
      tagline:
        "Etalase kopi dan roti harian lengkap banner promo paket, pencarian & filter menu, detail produk modal, ulasan pelanggan, dan keranjang WhatsApp.",
      highlights: [
        "Menu terfilter + pencarian cepat + pop-up rincian komposisi",
        "Keranjang belanja otomatis menyusun order langsung ke WhatsApp",
        "Banner paket hantaran, angka bukti toko, ulasan, & tanya jawab",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - WEBSITE KATALOG KEDAI KOPI & MINUMAN",
        "Pilihan Nama Link / Domain Usaha: (contoh: kopi-senja / kopisenja.my.id)",
        "Nama Usaha, Kategori, Kota, Jam Buka, Alamat & Maps:",
        "Nomor WhatsApp Penerima Order:",
        "Daftar Menu (nama, kategori, harga, satuan, deskripsi singkat):",
        "Promo Paket Bundling & 3 Keunggulan Toko:",
        "Foto Menu & Foto Utama Kedai:",
      ].join("\n"),
    },
    {
      id: "umkm-kuliner",
      name: "Resto, Katering & Kue Rumahan",
      category: "UMKM",
      demoSlug: "dapur-bunda-sari",
      price: 249000,
      priceLabel: "Rp249.000",
      thumbnail: "/demo/umkm-kuliner-hero.webp",
      tagline:
        "Buku menu kuliner rumahan & katering acara lengkap kalkulator estimasi porsi (20-200 box), varian lauk, paket tumpeng/hantaran, dan order WhatsApp.",
      highlights: [
        "Kalkulator estimasi porsi katering & nasi kotak otomatis",
        "Buku menu kuliner 2 kolom lengkap foto porsi & tombol pesan cepat",
        "Tanpa potongan komisi aplikasi, rincian langsung ke WA dapur",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - WEBSITE RESTO, KATERING & KUE RUMAHAN",
        "Pilihan Nama Link / Domain Usaha: (contoh: dapur-bunda-sari)",
        "Nama Dapur / Usaha, Kota, Jam Buka, Alamat & Link Maps:",
        "Nomor WhatsApp Order Katering:",
        "Daftar Menu & Paket Kotak/Tumpeng (nama, kategori, harga, porsi):",
        "Ulasan Pelanggan & Foto Hidangan Asli:",
      ].join("\n"),
    },
    {
      id: "umkm-fashion",
      name: "Butik Fashion, Hijab & Apparel",
      category: "UMKM",
      demoSlug: "atelier-noura",
      price: 249000,
      priceLabel: "Rp249.000",
      thumbnail: "/demo/umkm-fashion-hero.webp",
      tagline:
        "Etalase lookbook butik bersih ala studio mode: galeri koleksi 3:4, pilihan ukuran S/M/L/XL di detail produk, panduan ukuran baju, dan tas belanja WA.",
      highlights: [
        "Desain lookbook butik bersih menonjolkan foto koleksi 3:4",
        "Pemilih ukuran S/M/L/XL + pop-up Panduan Ukuran (Size Chart)",
        "Tas belanja otomatis mengirim ukuran & item pilihan ke WhatsApp",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - WEBSITE BUTIK FASHION, HIJAB & APPAREL",
        "Pilihan Nama Link / Domain Butik: (contoh: atelier-noura)",
        "Nama Brand Fashion, Kota, Jam Operasional, Alamat Studio:",
        "Nomor WhatsApp Admin Order:",
        "Daftar Koleksi (nama item, kategori, harga, bahan, pilihan ukuran):",
        "Foto Model Lookbook & Foto Produk (kirim via Drive):",
      ].join("\n"),
    },
    {
      id: "umkm-jasa",
      name: "Jasa, Barbershop & Studio",
      category: "UMKM",
      demoSlug: "potong-rapi-barber",
      price: 249000,
      priceLabel: "Rp249.000",
      thumbnail: "/demo/umkm-jasa-hero.webp",
      tagline:
        "Halaman jasa profesional & barbershop lengkap kalkulator pilih layanan + perawatan, booking jadwal tanggal & jam ke WhatsApp, galeri, serta peta lokasi.",
      highlights: [
        "Daftar harga paket jasa interaktif otomatis hitung estimasi total",
        "Form reservasi jadwal tanggal & jam langsung kirim ke WhatsApp",
        "Tampilan percaya diri dengan ulasan pelanggan, FAQ, & Google Maps",
      ],
      buyerFormTemplate: [
        "FORMAT ORDER - WEBSITE JASA, BARBERSHOP & STUDIO",
        "Pilihan Nama Link / Domain Usaha: (contoh: potong-rapi-barber)",
        "Nama Usaha Jasa, Kota, Jam Buka, Alamat & Link Maps:",
        "Nomor WhatsApp Admin Booking:",
        "Daftar Layanan / Paket Jasa (nama layanan, kategori, harga, durasi):",
        "Foto Tempat / Portfolio Hasil Jasa & Ulasan Pelanggan:",
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
