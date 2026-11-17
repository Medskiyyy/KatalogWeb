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
  title: `${BRAND.name} - Jasa Website Subdomain Murah untuk Kado, Undangan & UMKM`,
  description: BRAND.tagline,
};

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
      <body className="min-h-[100dvh] antialiased">{children}</body>
    </html>
  );
}
