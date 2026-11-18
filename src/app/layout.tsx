import type { Metadata } from "next";
import {
  Archivo,
  Caveat,
  Cormorant_Garamond,
  JetBrains_Mono,
  Onest,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { BRAND } from "@/config/brand";
import "./globals.css";

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-caveat",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND.name} - Jasa Website Kado, Undangan & UMKM Siap Pakai`,
  description: BRAND.tagline,
};

const DEV_RECOVERY_SCRIPT = `(function () {
  try {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (regs) {
        if (regs && regs.length > 0) {
          Promise.all(regs.map(function (reg) { return reg.unregister(); })).then(function () {
            if (window.caches && caches.keys) {
              caches.keys().then(function (keys) {
                return Promise.all(keys.map(function (k) { return caches.delete(k); }));
              }).finally(function () {
                if (!sessionStorage.getItem("kw_sw_cleared")) {
                  sessionStorage.setItem("kw_sw_cleared", "1");
                  window.location.reload();
                }
              });
            } else if (!sessionStorage.getItem("kw_sw_cleared")) {
              sessionStorage.setItem("kw_sw_cleared", "1");
              window.location.reload();
            }
          });
        }
      });
    }
    window.addEventListener("error", function (event) {
      var msg = (event && event.message) || "";
      if (/module factory is not available|ChunkLoadError/i.test(msg)) {
        if (!sessionStorage.getItem("kw_chunk_reloaded")) {
          sessionStorage.setItem("kw_chunk_reloaded", "1");
          fetch(window.location.href, { cache: "reload" }).finally(function () {
            window.location.reload();
          });
        }
      }
    });
  } catch (e) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${onest.variable} ${archivo.variable} ${jakarta.variable} ${cormorant.variable} ${caveat.variable} ${jetbrainsMono.variable}`}
    >
      {process.env.NODE_ENV !== "production" ? (
        <head>
          <script dangerouslySetInnerHTML={{ __html: DEV_RECOVERY_SCRIPT }} />
        </head>
      ) : null}
      <body className="min-h-[100dvh] antialiased">{children}</body>
    </html>
  );
}
