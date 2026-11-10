import type { Metadata } from "next";
import { trusted } from "mongoose";
import { Suspense } from "react";
import { getApprovedSeller } from "@/lib/data/seller.server";
import { Listing } from "@/models/Listing";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { toOrderView } from "@/lib/data/orders.server";
import SellerPanel, { type PanelListing, type PanelShop } from "@/components/seller/SellerPanel";

export const metadata: Metadata = { title: "Üretici paneli", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const { user, profile } = await getApprovedSeller();
  const listings = await Listing.find({ seller: user._id }).sort({ updatedAt: -1 }).lean();
  const products = await Product.find({ _id: trusted({ $in: listings.map((l) => l.product) }) }).select("name").lean();

  const items: PanelListing[] = listings.map((l) => ({
    id: l._id.toString(),
    productName: products.find((p) => p._id.toString() === l.product.toString())?.name ?? "Ürün",
    image: l.images[0],
    status: l.status,
    locked: !!l.locked,
    adminNote: l.adminNote,
    minPrice: Math.min(...l.variants.map((v) => v.price)),
    stock: l.variants.reduce((a, v) => a + v.stock, 0),
    variants: [...l.variants].sort((a, b) => a.size - b.size).map((v) => v.label),
  }));

  const shop: PanelShop = {
    name: user.name,
    slug: profile.slug,
    shopName: profile.shopName ?? user.name,
    tagline: profile.tagline ?? "",
    story: (profile.story?.length ? profile.story : [profile.description]).join("\n\n"),
    avatar: profile.avatar ?? "",
    cover: profile.cover ?? "",
    freeShippingOver: profile.freeShippingOver ? String(profile.freeShippingOver) : "",
    cod: !!profile.codEnabled,
  };

  // Siparişlerde üretici sadece kendi paketini görür
  const orderDocs = await Order.find({ "parts.seller": user._id }).sort({ createdAt: -1 }).limit(200).lean();
  const orders = orderDocs.map((o) => toOrderView(o, { onlySeller: user._id.toString() }));

  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <Suspense>
        <SellerPanel listings={items} shop={shop} orders={orders} />
      </Suspense>
    </main>
  );
}
