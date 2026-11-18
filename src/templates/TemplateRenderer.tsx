"use client";

import type { SiteConfig } from "@/lib/schema";
import { BucinScrapbookTemplate } from "@/templates/bucin/BucinScrapbookTemplate";
import { BucinChatTemplate } from "@/templates/bucin/BucinChatTemplate";
import { BucinPlaylistTemplate } from "@/templates/bucin/BucinPlaylistTemplate";
import { BucinMagazineTemplate } from "@/templates/bucin/BucinMagazineTemplate";
import { UltahInteraktifTemplate } from "@/templates/ultah/UltahInteraktifTemplate";
import { UltahBalonTemplate } from "@/templates/ultah/UltahBalonTemplate";
import { UltahRetroTemplate } from "@/templates/ultah/UltahRetroTemplate";
import { UltahEditorialTemplate } from "@/templates/ultah/UltahEditorialTemplate";
import { NikahGardenTemplate } from "@/templates/nikah/NikahGardenTemplate";
import { NikahMinangTemplate } from "@/templates/nikah/NikahMinangTemplate";
import { NikahJawaTemplate } from "@/templates/nikah/NikahJawaTemplate";
import { NikahSundaTemplate } from "@/templates/nikah/NikahSundaTemplate";
import { UmkmKatalogTemplate } from "@/templates/umkm/UmkmKatalogTemplate";
import { UmkmKulinerTemplate } from "@/templates/umkm/UmkmKulinerTemplate";
import { UmkmFashionTemplate } from "@/templates/umkm/UmkmFashionTemplate";
import { UmkmJasaTemplate } from "@/templates/umkm/UmkmJasaTemplate";

interface TemplateRendererProps {
  site: SiteConfig;
  embedded?: boolean;
}

export function TemplateRenderer({ site, embedded = false }: TemplateRendererProps) {
  switch (site.templateId) {
    case "bucin-scrapbook":
      return <BucinScrapbookTemplate site={site} embedded={embedded} />;
    case "bucin-chat":
      return <BucinChatTemplate site={site} embedded={embedded} />;
    case "bucin-playlist":
      return <BucinPlaylistTemplate site={site} embedded={embedded} />;
    case "bucin-magazine":
      return <BucinMagazineTemplate site={site} embedded={embedded} />;
    case "ultah-interaktif":
      return <UltahInteraktifTemplate site={site} embedded={embedded} />;
    case "ultah-balon":
      return <UltahBalonTemplate site={site} embedded={embedded} />;
    case "ultah-retro":
      return <UltahRetroTemplate site={site} embedded={embedded} />;
    case "ultah-editorial":
      return <UltahEditorialTemplate site={site} embedded={embedded} />;
    case "nikah-garden":
      return <NikahGardenTemplate site={site} embedded={embedded} />;
    case "nikah-minang":
      return <NikahMinangTemplate site={site} embedded={embedded} />;
    case "nikah-jawa":
      return <NikahJawaTemplate site={site} embedded={embedded} />;
    case "nikah-sunda":
      return <NikahSundaTemplate site={site} embedded={embedded} />;
    case "umkm-katalog":
      return <UmkmKatalogTemplate site={site} embedded={embedded} />;
    case "umkm-kuliner":
      return <UmkmKulinerTemplate site={site} embedded={embedded} />;
    case "umkm-fashion":
      return <UmkmFashionTemplate site={site} embedded={embedded} />;
    case "umkm-jasa":
      return <UmkmJasaTemplate site={site} embedded={embedded} />;
  }
}
