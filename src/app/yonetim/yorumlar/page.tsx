import type { Metadata } from "next";
import { trusted } from "mongoose";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import { Listing } from "@/models/Listing";
import { Product } from "@/models/Product";
import { SellerProfile } from "@/models/SellerProfile";
import AdminNav from "@/components/admin/AdminNav";
import { adminCounts } from "@/lib/data/admin.server";
import ReviewsAdmin, { type ReviewItem } from "@/components/admin/ReviewsAdmin";

export const metadata: Metadata = { title: "Yorumlar", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") notFound();

  await connectDB();
  const reviews = await Review.find().sort({ createdAt: -1 }).limit(300).lean();
  const listings = await Listing.find({ _id: trusted({ $in: [...new Set(reviews.map((r) => r.listing.toString()))] }) }).select("product seller").lean();
  const [products, profiles, counts] = await Promise.all([
    Product.find({ _id: trusted({ $in: listings.map((l) => l.product) }) }).select("name slug").lean(),
    SellerProfile.find({ user: trusted({ $in: listings.map((l) => l.seller) }) }).select("user shopName slug").lean(),
    adminCounts(),
  ]);

  const items: ReviewItem[] = reviews.map((r) => {
    const l = listings.find((x) => x._id.toString() === r.listing.toString());
    const p = l && products.find((x) => x._id.toString() === l.product.toString());
    const sp = l && profiles.find((x) => x.user.toString() === l.seller.toString());
    return {
      id: r._id.toString(),
      name: r.name,
      rating: r.rating,
      text: r.text,
      status: r.status,
      verified: !!r.order,
      createdAt: new Date(r.createdAt).toISOString(),
      product: p?.name ?? "Silinmiş ürün",
      productUrl: p ? `/urun/${p.slug}${sp?.slug ? `?uretici=${sp.slug}` : ""}` : undefined,
      seller: sp?.shopName ?? "Bilinmeyen üretici",
    };
  });

  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <AdminNav active="/yonetim/yorumlar" counts={counts} />
      <ReviewsAdmin items={items} />
    </main>
  );
}
