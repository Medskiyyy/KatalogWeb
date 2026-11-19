import type { NikahSiteConfig, SiteConfig } from "@/lib/schema";
import { ADAT_NIKAH_THEMES } from "./adat-themes";
import { MIDNIGHT_NIKAH_THEMES } from "./midnight-themes";
import { ROMANTIC_NIKAH_THEMES } from "./romantic-themes";
import {
  buildExtendedCatalogItem,
  buildSiteFromExtendedSpec,
  type ExtendedNikahThemeSpec,
} from "./types";

export type { ExtendedNikahGroup, ExtendedNikahThemeSpec } from "./types";

export const EXTENDED_NIKAH_THEMES: ExtendedNikahThemeSpec[] = [
  ...ADAT_NIKAH_THEMES,
  ...ROMANTIC_NIKAH_THEMES,
  ...MIDNIGHT_NIKAH_THEMES,
];

export type ExtendedNikahTemplateId = ExtendedNikahThemeSpec["id"];

export type ExtendedNikahSiteConfig = Extract<
  NikahSiteConfig,
  { templateId: ExtendedNikahTemplateId }
>;

export const EXTENDED_NIKAH_TEMPLATE_IDS = EXTENDED_NIKAH_THEMES.map(
  (item) => item.id
) as ExtendedNikahTemplateId[];

export const EXTENDED_NIKAH_MAP: Record<
  ExtendedNikahTemplateId,
  ExtendedNikahThemeSpec
> = Object.fromEntries(
  EXTENDED_NIKAH_THEMES.map((item) => [item.id, item])
) as Record<ExtendedNikahTemplateId, ExtendedNikahThemeSpec>;

export const EXTENDED_NIKAH_CATALOG_ITEMS = EXTENDED_NIKAH_THEMES.map(
  buildExtendedCatalogItem
);

export function isExtendedNikahTemplateId(
  id: string
): id is ExtendedNikahTemplateId {
  return id in EXTENDED_NIKAH_MAP;
}

export function isExtendedNikahSite(
  site: SiteConfig
): site is ExtendedNikahSiteConfig {
  return isExtendedNikahTemplateId(site.templateId);
}

export function buildExtendedNikahSiteConfig(
  id: ExtendedNikahTemplateId,
  slug: string
) {
  return buildSiteFromExtendedSpec(EXTENDED_NIKAH_MAP[id], slug);
}
