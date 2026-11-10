import type { CatalogProduct, Offer, Seller } from "@/lib/catalog";

export const SPACING = 6; // sıralar arası mesafe (m)
export const STALL_X = 4.3; // tezgâhın sokak ortasına uzaklığı
export const FIRST_ROW_Z = -2;
export const MIN_STALLS = 8;

export type GoodsKind = "fig" | "olive" | "produce" | "egg" | "jar" | "bottle" | "textile" | "gift";

export type StallItem = {
  offer: Offer;
  product: CatalogProduct;
  kind: GoodsKind;
  color: string;
  price: number;
  label: string;
  image?: string;
};

export type StallInfo = {
  key: string;
  seller?: Seller;
  items: StallItem[];
  side: -1 | 1; // -1 sol, 1 sağ
  x: number;
  z: number;
  rotY: number;
  colors: [string, string]; // tente çizgileri
  cloth: string;
};

const AWNINGS: [string, string][] = [
  ["#b5532f", "#f6ead6"],
  ["#4a5627", "#f1e6cc"],
  ["#6e3b4e", "#f3e4d8"],
  ["#c98a2b", "#fcf2dd"],
  ["#2f5a6b", "#eef0e6"],
  ["#8a4b2a", "#f5e6cf"],
  ["#a63d40", "#f8efe0"],
  ["#5d7a3a", "#f4ecd6"],
];
const CLOTHS = ["#e9d3a8", "#d9b9a0", "#c9d2a7", "#e3c7c0", "#d7cfb6", "#cdd9d6"];

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

export function goodsFor(product: CatalogProduct): { kind: GoodsKind; color: string } {
  const n = product.name.toLocaleLowerCase("tr");
  switch (product.category) {
    case "incir-kuru-urunler":
      return n.includes("üzüm") ? { kind: "fig", color: "#5a3a22" } : { kind: "fig", color: "#6b4a2e" };
    case "zeytin-zeytinyagi":
      return n.includes("yağ") ? { kind: "bottle", color: "#8f9a2c" } : { kind: "olive", color: n.includes("siyah") ? "#2b2420" : "#6d7a2e" };
    case "bal-recel-pekmez":
      if (n.includes("bal")) return { kind: "jar", color: "#d99a24" };
      if (n.includes("pekmez")) return { kind: "jar", color: "#3b1a12" };
      if (n.includes("salça")) return { kind: "jar", color: "#b3261e" };
      return { kind: "jar", color: "#8b1e2d" };
    case "meyve-sebze":
      if (n.includes("incir")) return { kind: "produce", color: "#4b2340" };
      if (n.includes("domates")) return { kind: "produce", color: "#c8341f" };
      if (n.includes("biber")) return { kind: "produce", color: "#3f7a2a" };
      return { kind: "produce", color: "#d0612a" };
    case "sut-yumurta":
      return { kind: "egg", color: "#f1e2c6" };
    case "el-emegi":
      return { kind: "textile", color: "#b5532f" };
    default:
      return { kind: "gift", color: "#4a5627" };
  }
}

export function buildStalls(sellers: Seller[], offers: Offer[], products: CatalogProduct[]): StallInfo[] {
  const ordered = [...sellers].sort((a, b) => Number(b.verified) - Number(a.verified) || b.rating - a.rating);

  const withItems = ordered.map((seller) => {
    const items: StallItem[] = offers
      .filter((o) => o.sellerId === seller.id)
      .map((offer) => {
        const product = products.find((p) => p.id === offer.productId);
        if (!product || !offer.variants.length) return null;
        const v = [...offer.variants].sort((a, b) => a.price - b.price)[0];
        return { offer, product, ...goodsFor(product), price: v.price, label: v.label, image: offer.images?.[0] ?? product.images?.[0] } as StallItem;
      })
      .filter((x): x is StallItem => !!x);
    return { seller, items };
  });

  // Boş tezgâhlar "Üretici ol" daveti olarak sona eklenir
  let total = Math.max(MIN_STALLS, withItems.length + 2);
  if (total % 2) total++;
  const all: { seller?: Seller; items: StallItem[] }[] = [...withItems];
  while (all.length < total) all.push({ items: [] });

  return all.map((s, i) => {
    const side: -1 | 1 = i % 2 === 0 ? -1 : 1;
    const row = Math.floor(i / 2);
    const h = hash(s.seller?.id ?? `bos-${i}`);
    return {
      key: s.seller?.id ?? `bos-${i}`,
      seller: s.seller,
      items: s.items,
      side,
      x: side * STALL_X,
      z: FIRST_ROW_Z - row * SPACING,
      rotY: side === -1 ? Math.PI / 2 : -Math.PI / 2,
      colors: s.seller ? AWNINGS[h % AWNINGS.length] : ["#9b9283", "#ece6da"],
      cloth: s.seller ? CLOTHS[h % CLOTHS.length] : "#ddd5c6",
    };
  });
}

export const streetEnd = (stalls: StallInfo[]) => Math.min(...stalls.map((s) => s.z)) - SPACING;
