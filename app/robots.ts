import type { MetadataRoute } from "next";
import { SITE_SITEMAP_URL } from "@/lib/site-brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: SITE_SITEMAP_URL,
  };
}
