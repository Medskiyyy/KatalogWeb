import type { Metadata } from "next";
import { getAllSites } from "@/lib/sites";
import { StudioWorkspace } from "@/components/studio/StudioWorkspace";

export const metadata: Metadata = {
  title: "KatalogWeb Studio - Editor Subdomain & Cetak Kartu QR",
  description:
    "Studio lokal untuk membuat, mengedit, pratinjau langsung, dan mencetak kartu QR A4 untuk subdomain KatalogWeb.",
};

export default async function StudioPage() {
  const sites = await getAllSites();
  return <StudioWorkspace initialSites={sites} />;
}
