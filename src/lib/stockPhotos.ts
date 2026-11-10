import manifest from "./stockPhotos.generated.json";

const m = manifest as Record<"urun" | "tur" | "kategori", Record<string, string>>;

/**
 * Satıcı fotoğraf koymadığında gösterilecek genel fotoğraf.
 * Sıra: ürüne özel → ürün türü → kategori. Hiçbiri yoksa undefined.
 */
export function stockPhoto(p: { slug?: string; productType?: string; category?: string }): string | undefined {
  return (p.slug && m.urun[p.slug]) || (p.productType && m.tur[p.productType]) || (p.category && m.kategori[p.category]) || undefined;
}

/** Ürünün kendi fotoğrafları, yoksa genel fotoğraf */
export function productPhotos(p: { slug?: string; productType?: string; category?: string; images?: string[] }): string[] {
  if (p.images?.length) return p.images;
  const s = stockPhoto(p);
  return s ? [s] : [];
}
