import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Listing } from "@/models/Listing";
import { SellerProfile } from "@/models/SellerProfile";
import { Review } from "@/models/Review";
import { User, type IUser } from "@/models/User";
import { hydrateCatalog, type CatalogData, type SellerType } from "@/lib/catalog";

const empty: CatalogData = { products: [], sellers: [], offers: [], reviews: [] };

const monthYear = (d: Date) => {
  const s = d.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
  return s.charAt(0).toLocaleUpperCase("tr") + s.slice(1);
};

const typeLabel = (t: string): SellerType =>
  t === "kadin-girisimci" ? "Kadın Girişimci" : t === "genc-ciftci" ? "Genç Çiftçi" : "Üretici";

async function load(): Promise<CatalogData> {
  await connectDB();
  const [products, listings, profiles, reviews] = await Promise.all([
    Product.find({ active: true }).lean(),
    Listing.find({ status: "active" }).lean(),
    SellerProfile.find()
      .populate<{ user: Pick<IUser, "_id" | "name" | "sellerStatus"> | null }>({
        path: "user",
        model: User,
        select: "name sellerStatus",
      })
      .lean(),
    Review.find({ status: "published" }).sort({ createdAt: -1 }).limit(1000).lean(),
  ]);

  // Sadece onaylı ve mağaza adresi olan üreticiler ile onların aktif ilanları gösterilir
  const approved = profiles.filter((p) => p.user && p.user.sellerStatus === "approved" && p.slug);
  const sellerIds = new Set(approved.map((p) => p.user!._id.toString()));
  const productIds = new Set(products.map((p) => p._id.toString()));
  const active = listings.filter((l) => sellerIds.has(l.seller.toString()) && productIds.has(l.product.toString()));
  const listed = new Set(active.map((l) => l.product.toString()));
  const listingIds = new Set(active.map((l) => l._id.toString()));

  const sellerRating = (uid: string) => {
    const ls = active.filter((l) => l.seller.toString() === uid);
    const n = ls.reduce((a, l) => a + l.reviewCount, 0);
    return n ? ls.reduce((a, l) => a + l.rating * l.reviewCount, 0) / n : 0;
  };

  return {
    products: products
      .filter((p) => listed.has(p._id.toString()))
      .map((p) => ({
        id: p._id.toString(),
        slug: p.slug,
        name: p.name,
        category: p.category,
        description: p.description,
        iconKey: p.iconKey,
        bg: p.bg,
        light: p.light,
        images: p.images,
        tags: p.tags,
      })),
    sellers: approved.map((p) => {
      const uid = p.user!._id.toString();
      return {
        id: uid,
        slug: p.slug!,
        name: p.shopName ?? p.user!.name,
        owner: p.user!.name,
        type: typeLabel(p.sellerType),
        rating: Math.round(sellerRating(uid) * 10) / 10,
        village: p.village,
        since: p.since ?? new Date(p.createdAt).getFullYear(),
        tagline: p.tagline ?? p.description.slice(0, 160),
        story: p.story?.length ? p.story : [p.description],
        verified: p.verified,
      };
    }),
    offers: active.map((l) => ({
      id: l._id.toString(),
      productId: l.product.toString(),
      sellerId: l.seller.toString(),
      variants: l.variants.map((v) => ({
        id: v._id.toString(),
        label: v.label,
        size: v.size,
        price: v.price,
        ...(v.oldPrice ? { oldPrice: v.oldPrice } : {}),
        stock: v.stock,
      })),
      shippingFee: l.shippingFee,
      shipsIn: l.shipsIn,
      rating: l.rating,
      reviews: l.reviewCount,
      note: l.note,
      details: l.details.map((d) => [d.k, d.v] as [string, string]),
      images: l.images,
    })),
    reviews: reviews
      .filter((r) => listingIds.has(r.listing.toString()))
      .map((r) => ({
        id: r._id.toString(),
        offerId: r.listing.toString(),
        name: r.name,
        rating: r.rating,
        text: r.text,
        date: monthYear(new Date(r.createdAt)),
      })),
  };
}

const cached = unstable_cache(load, ["catalog-snapshot-v3"], { revalidate: 60, tags: ["catalog"] });

export async function getCatalogSnapshot(): Promise<CatalogData> {
  try {
    return await cached();
  } catch (e) {
    // Hata önbelleğe alınmaz; site boş katalogla ayakta kalır, bir sonraki istekte tekrar denenir
    console.error("catalog load error", e);
    return empty;
  }
}

// Sunucu bileşenlerinde (sayfa, metadata) katalog fonksiyonlarını kullanmadan önce çağrılır
export async function ensureCatalog() {
  const data = await getCatalogSnapshot();
  hydrateCatalog(data);
  return data;
}