"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  BRAND,
  getDevSubdomainUrl,
  getPreviewPath,
  getSubdomainUrl,
} from "@/config/brand";

interface SubdomainLinkProps {
  slug: string;
  query?: string;
  className?: string;
  children: ReactNode;
  openInNewTab?: boolean;
}

export function SubdomainLink({
  slug,
  query = "",
  className,
  children,
  openInNewTab = false,
}: SubdomainLinkProps) {
  const cleanQuery = query ? (query.startsWith("?") ? query : `?${query}`) : "";
  const fallbackHref = `${getPreviewPath(slug)}${cleanQuery}`;
  const [href, setHref] = useState(fallbackHref);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const host = window.location.hostname.toLowerCase();
      if (host === "localhost") {
        const port = Number(window.location.port || "3000");
        setHref(`${getDevSubdomainUrl(slug, port)}${cleanQuery}`);
      } else if (host === BRAND.domain || host === `www.${BRAND.domain}`) {
        setHref(`${getSubdomainUrl(slug)}${cleanQuery}`);
      } else {
        setHref(fallbackHref);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [cleanQuery, fallbackHref, slug]);

  return (
    <a
      href={href}
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      className={className}
    >
      {children}
    </a>
  );
}
