"use client";

import { NikahMotionShell } from "@/templates/nikah/NikahMotionShell";
import {
  EXTENDED_NIKAH_MAP,
  type ExtendedNikahSiteConfig,
} from "@/templates/nikah/themes";

export function NikahThemedTemplate({
  site,
  embedded = false,
}: {
  site: ExtendedNikahSiteConfig;
  embedded?: boolean;
}) {
  const spec = EXTENDED_NIKAH_MAP[site.templateId];

  return <NikahMotionShell site={site} theme={spec.theme} embedded={embedded} />;
}
