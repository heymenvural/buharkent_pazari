import type { MetadataRoute } from "next";
import { ORG } from "@/lib/legal";
import { categories } from "@/lib/catalog";
import { getCatalogSnapshot } from "@/lib/data/catalog.server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const u = (p: string) => `${ORG.site}${p}`;
  const now = new Date();
  const data = await getCatalogSnapshot();
  const pages = ["", "/urunler", "/ureticiler", "/canli-pazar", "/hakkimizda", "/uretici-ol", "/satici-rehberi", "/sss", "/siparis-takip", "/kvkk", "/gizlilik", "/mesafeli-satis", "/cerez-politikasi"];
  return [
    ...pages.map((p) => ({ url: u(p), lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...categories.map((c) => ({ url: u(`/kategori/${c.slug}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...data.products.map((p) => ({ url: u(`/urun/${p.slug}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.9 })),
    ...data.sellers.map((s) => ({ url: u(`/uretici/${s.slug}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
