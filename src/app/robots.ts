import type { MetadataRoute } from "next";
import { ORG } from "@/lib/legal";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/yonetim", "/panel", "/hesabim", "/siparis/", "/odeme", "/basvurum", "/dogrula"] }],
    sitemap: `${ORG.site}/sitemap.xml`,
  };
}
