import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSites, getSiteBySlug } from "@/lib/sites";
import { TemplateRenderer } from "@/templates/TemplateRenderer";
import { BRAND, getSubdomainHost } from "@/config/brand";

interface SubdomainPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const sites = await getAllSites();
  return sites.map((site) => ({ slug: site.slug }));
}

export async function generateMetadata({
  params,
}: SubdomainPageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = await getSiteBySlug(slug);
  if (!site) {
    return {
      title: `Halaman Tidak Ditemukan - ${BRAND.name}`,
    };
  }
  return {
    title: `${site.title} - ${getSubdomainHost(site.slug)}`,
    description: site.seoDescription,
  };
}

export default async function ClientSitePage({ params }: SubdomainPageProps) {
  const { slug } = await params;
  const site = await getSiteBySlug(slug);
  if (!site) {
    notFound();
  }
  return <TemplateRenderer site={site} />;
}
