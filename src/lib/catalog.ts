import type { LucideIcon } from "lucide-react";
import {
  Apple, Carrot, Cherry, Droplets, Egg, Gift, Grape, Hexagon, Leaf, Milk, Nut, Package, Scissors, Sprout, Wheat,
} from "lucide-react";

/* ---------- Tipler ---------- */
export type SellerType = "Kadın Girişimci" | "Genç Çiftçi" | "Üretici";

export type Seller = {
  id: string;
  slug: string;
  name: string;
  owner: string;
  type: SellerType;
  rating: number;
  village: string;
  since: number;
  tagline: string;
  story: string[];
  verified: boolean;
  badges?: string[];
  avatar?: string;
  cover?: string;
  freeShippingOver?: number;
  cod?: boolean;
};

export type Category = { slug: string; name: string; short: string; icon: LucideIcon; bg: string };
export type Variant = { id: string; label: string; size: number; price: number; oldPrice?: number; stock: number };

export type Offer = {
  id: string;
  productId: string;
  sellerId: string;
  variants: Variant[];
  shippingFee: number;
  shipsIn: string;
  rating: number;
  reviews: number;
  note: string;
  details: [string, string][];
  images?: string[];
};

export type Review = { id: string; offerId: string; name: string; rating: number; text: string; date: string };
export type Tag = "firsat" | "cok-satan" | "yeni";

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  iconKey: string;
  icon: LucideIcon;
  bg: string;
  light?: boolean;
  images?: string[];
  tags: Tag[];
};

// Sunucudan istemciye gönderilen, düz (serileştirilebilir) veri
export type CatalogData = {
  products: Omit<CatalogProduct, "icon">[];
  sellers: Seller[];
  offers: Offer[];
  reviews: Review[];
};

/* ---------- Sabit kategoriler ---------- */
export const categories: Category[] = [
  { slug: "incir-kuru-urunler", name: "İncir & Kuru Ürünler", short: "İncir", icon: Nut, bg: "from-fig-600 to-[#3f1f2c]" },
  { slug: "zeytin-zeytinyagi", name: "Zeytin & Zeytinyağı", short: "Zeytinyağı", icon: Droplets, bg: "from-olive-500 to-olive-900" },
  { slug: "bal-recel-pekmez", name: "Bal, Reçel & Pekmez", short: "Bal & Pekmez", icon: Hexagon, bg: "from-[#e0a84a] to-terra-600" },
  { slug: "meyve-sebze", name: "Meyve & Sebze", short: "Meyve & Sebze", icon: Apple, bg: "from-terra-500 to-[#8c3f1c]" },
  { slug: "sut-yumurta", name: "Süt & Yumurta", short: "Süt & Yumurta", icon: Milk, bg: "from-sand-300 to-sand-400" },
  { slug: "el-emegi", name: "El Emeği", short: "El Emeği", icon: Scissors, bg: "from-[#a88d62] to-[#7a6342]" },
  { slug: "hediye-kutulari", name: "Hediye Kutuları", short: "Hediye", icon: Gift, bg: "from-olive-700 to-olive-900" },
];

export const iconMap: Record<string, LucideIcon> = {
  Apple, Carrot, Cherry, Droplets, Egg, Gift, Grape, Hexagon, Leaf, Milk, Nut, Package, Scissors, Sprout, Wheat,
};

/* ---------- Canlı veri deposu ---------- */
// Tüm kullanıcılar için aynı olan katalog verisi; sunucudan gelen veriyle doldurulur.
export let catalog: CatalogProduct[] = [];
export let sellers: Seller[] = [];
export let offers: Offer[] = [];
export let reviewsData: Review[] = [];
let lastData: CatalogData | null = null;

export function hydrateCatalog(data: CatalogData) {
  if (data === lastData) return;
  lastData = data;
  catalog = data.products.map((p) => ({ ...p, icon: iconMap[p.iconKey] ?? Package }));
  sellers = data.sellers;
  offers = data.offers;
  reviewsData = data.reviews;
}

/* ---------- Yardımcılar ---------- */
const tl = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
export const formatPrice = (n: number) => tl.format(n);

export const getSeller = (id: string) => sellers.find((s) => s.id === id)!;
export const getSellerBySlug = (slug: string) => sellers.find((s) => s.slug === slug);
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const getProduct = (slug: string) => catalog.find((p) => p.slug === slug);
export const getProductById = (id: string) => catalog.find((p) => p.id === id);
export const offersFor = (productId: string) => offers.filter((o) => o.productId === productId);
export const sellerOffers = (sellerId: string) => offers.filter((o) => o.sellerId === sellerId);
export const offerReviews = (offerId: string) => reviewsData.filter((r) => r.offerId === offerId);

export const initials = (n: string) =>
  n
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

export const sellerGradient = (type: SellerType) =>
  type === "Kadın Girişimci" ? "from-fig-600 to-[#3f1f2c]" : "from-olive-500 to-olive-900";

export const discountPct = (price: number, oldPrice?: number) =>
  oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;

export function priceInfo(productId: string) {
  let min = Infinity;
  let oldPrice: number | undefined;
  let maxDiscount = 0;
  for (const o of offersFor(productId)) {
    for (const v of o.variants) {
      if (v.price < min) min = v.price;
      const d = discountPct(v.price, v.oldPrice);
      if (d > maxDiscount) {
        maxDiscount = d;
        oldPrice = v.oldPrice;
      }
    }
  }
  return { min: Number.isFinite(min) ? min : 0, oldPrice, maxDiscount, sellerCount: offersFor(productId).length };
}

export function productRating(productId: string) {
  const list = offersFor(productId);
  const reviews = list.reduce((a, o) => a + o.reviews, 0);
  const rating = reviews ? list.reduce((a, o) => a + o.rating * o.reviews, 0) / reviews : 0;
  return { rating, reviews };
}

export function variantLabels(productId: string) {
  const map = new Map<string, number>();
  offersFor(productId).forEach((o) => o.variants.forEach((v) => map.set(v.label, v.size)));
  return [...map.entries()].sort((a, b) => a[1] - b[1]).map(([label]) => label);
}

export type Line = { offer: Offer; variant: Variant; seller: Seller };

export function linesFor(productId: string, label: string): Line[] {
  return offersFor(productId)
    .flatMap((o) => o.variants.filter((v) => v.label === label).map((v) => ({ offer: o, variant: v, seller: getSeller(o.sellerId) })))
    .filter((l) => l.seller)
    .sort((a, b) => a.variant.price - b.variant.price);
}