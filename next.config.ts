import path from "node:path";
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = isProd
  ? {
      output: "export",
      trailingSlash: true,
      images: {
        unoptimized: true,
      },
    }
  : {
      allowedDevOrigins: ["localhost", "*.localhost"],
      turbopack: {
        root: path.resolve(process.cwd()),
      },
      images: {
        unoptimized: true,
      },
      async headers() {
        return [
          {
            source: "/_next/static/:path*",
            headers: [
              {
                key: "Cache-Control",
                value: "no-store, no-cache, must-revalidate",
              },
            ],
          },
        ];
      },
      async rewrites() {
        return {
          beforeFiles: [
            {
              source: "/__studio/:path*",
              destination: "http://127.0.0.1:3099/__studio/:path*",
            },
            {
              source: "/",
              has: [
                {
                  type: "host",
                  value: "(?<slug>^(?!www$|localhost$)[a-z0-9-]+)\\.localhost(?::\\d+)?$",
                },
              ],
              destination: "/s/:slug",
            },
          ],
          afterFiles: [],
          fallback: [],
        };
      },
    };

export default nextConfig;
