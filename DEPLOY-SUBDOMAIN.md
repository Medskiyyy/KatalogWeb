# Deploy KatalogWeb + Wildcard Subdomain (`*.katalogweb.my.id`) Gratis

Project ini dibangun sebagai static export (`out/`) yang dipasangkan dengan Cloudflare Worker (`cloudflare/worker.mjs`) untuk menangani routing subdomain klien tanpa backend/database berbayar.

## Cara Kerja Routing

1. Pengunjung membuka `https://katalogweb.my.id` -> melihat halaman utama toko KatalogWeb (`/index.html`).
2. Pengunjung membuka `https://arka-nisa.katalogweb.my.id` -> Cloudflare Worker memetakan request ke `/s/arka-nisa/index.html` sambil menjaga URL address bar tetap bersih di subdomain klien.
3. Parameter query seperti `?to=Ahmad+Hidayatullah` pada undangan pernikahan tetap diteruskan utuh.

## Langkah Deploy di Cloudflare (Free Plan)

1. Build proyek statis:
   ```powershell
   npm.cmd run build
   ```
2. Di Dashboard Cloudflare domain `katalogweb.my.id` -> menu **DNS > Records**:
   - Tambahkan record `A` atau `AAAA` untuk root (`@`) dan wildcard (`*`) dengan target `100::` (`AAAA`) berstatus **Proxied** (awan oranye).
3. Login & deploy lewat Wrangler:
   ```powershell
   npx.cmd wrangler login
   npx.cmd wrangler deploy
   ```
4. Di Dashboard Cloudflare -> **Workers & Pages > katalogweb > Settings > Domains & Routes**:
   - Tambahkan custom domain `katalogweb.my.id`
   - Tambahkan Worker Route `*.katalogweb.my.id/*` mengarah ke worker `katalogweb`.

Setiap kali menambah pesanan klien baru lewat `/studio`, jalankan `npm.cmd run build` lalu `npx.cmd wrangler deploy` (atau sambungkan repo GitHub ke Cloudflare Workers Builds agar otomatis deploy setiap `git push`).
