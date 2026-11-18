"use client";

import type { SiteConfig } from "@/lib/schema";
import { BucinScrapbookTemplate } from "@/templates/bucin/BucinScrapbookTemplate";
import { BucinChatTemplate } from "@/templates/bucin/BucinChatTemplate";
import { BucinPlaylistTemplate } from "@/templates/bucin/BucinPlaylistTemplate";
import { BucinMagazineTemplate } from "@/templates/bucin/BucinMagazineTemplate";
import { UltahInteraktifTemplate } from "@/templates/ultah/UltahInteraktifTemplate";
import { NikahGardenTemplate } from "@/templates/nikah/NikahGardenTemplate";
import { UmkmKatalogTemplate } from "@/templates/umkm/UmkmKatalogTemplate";

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
    case "nikah-garden":
      return <NikahGardenTemplate site={site} embedded={embedded} />;
    case "umkm-katalog":
      return <UmkmKatalogTemplate site={site} embedded={embedded} />;
  }
}
