import type { Metadata } from "next";
import { trusted } from "mongoose";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Listing } from "@/models/Listing";
import { Product } from "@/models/Product";
import { SellerProfile } from "@/models/SellerProfile";
import { User } from "@/models/User";
import { PRODUCT_TYPES } from "@/lib/compliance";
import { adminCounts } from "@/lib/data/admin.server";
import AdminNav from "@/components/admin/AdminNav";
import ListingsAdmin, { type AdminListing } from "@/components/admin/ListingsAdmin";

export const metadata: Metadata = { title: "Ürün onayı", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ListingsApprovalPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") notFound();

  await connectDB();
  const listings = await Listing.find({ status: "pending" }).sort({ updatedAt: 1 }).limit(200).lean();
  const [products, profiles, users, counts] = await Promise.all([
    Product.find({ _id: trusted({ $in: listings.map((l) => l.product) }) }).select("name productType active").lean(),
    SellerProfile.find({ user: trusted({ $in: listings.map((l) => l.seller) }) }).select("user shopName slug").lean(),
    User.find({ _id: trusted({ $in: listings.map((l) => l.seller) }) }).select("name").lean(),
    adminCounts(),
  ]);

  const items: AdminListing[] = listings.map((l) => {
    const p = products.find((x) => x._id.toString() === l.product.toString());
    const sp = profiles.find((x) => x.user.toString() === l.seller.toString());
    const u = users.find((x) => x._id.toString() === l.seller.toString());
    return {
      id: l._id.toString(),
      product: p?.name ?? "Ürün",
      productType: PRODUCT_TYPES.find((t) => t.key === p?.productType)?.name ?? "",
      newProduct: !!p && !p.active,
      seller: sp?.shopName ?? u?.name ?? "Üretici",
      sellerSlug: sp?.slug,
      note: l.note,
      images: l.images ?? [],
      variants: [...l.variants].sort((a, b) => a.size - b.size).map((v) => ({ label: v.label, price: v.price, oldPrice: v.oldPrice, stock: v.stock })),
      shippingFee: l.shippingFee,
      shipsIn: l.shipsIn,
      details: l.details.map((d) => ({ k: d.k, v: d.v })),
      updatedAt: new Date(l.updatedAt).toISOString(),
    };
  });

  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <AdminNav active="/yonetim/urunler" counts={counts} />
      <ListingsAdmin items={items} />
    </main>
  );
}
