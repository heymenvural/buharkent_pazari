import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Report } from "@/models/Report";
import { Listing } from "@/models/Listing";
import { Product } from "@/models/Product";
import { SellerProfile } from "@/models/SellerProfile";
import { User } from "@/models/User";
import { reasonLabel } from "@/lib/reports";
import AdminNav from "@/components/admin/AdminNav";
import ReportsAdmin, { type ReportItem } from "@/components/admin/ReportsAdmin";

export const metadata: Metadata = { title: "Ürün bildirimleri", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") notFound();

  await connectDB();
  const reports = await Report.find().sort({ createdAt: -1 }).limit(300).lean();
  const listingIds = [...new Set(reports.map((r) => r.listing.toString()))];
  const listings = await Listing.find({ _id: { $in: listingIds } }).select("product seller status").lean();
  const [products, profiles, users, pendingApps] = await Promise.all([
    Product.find({ _id: { $in: listings.map((l) => l.product) } }).select("name slug").lean(),
    SellerProfile.find({ user: { $in: listings.map((l) => l.seller) } }).select("user shopName slug").lean(),
    User.find({ _id: { $in: listings.map((l) => l.seller) } }).select("name").lean(),
    User.countDocuments({ role: "seller", sellerStatus: "pending" }),
  ]);

  const items: ReportItem[] = reports.map((r) => {
    const l = listings.find((x) => x._id.toString() === r.listing.toString());
    const p = l && products.find((x) => x._id.toString() === l.product.toString());
    const sp = l && profiles.find((x) => x.user.toString() === l.seller.toString());
    const u = l && users.find((x) => x._id.toString() === l.seller.toString());
    return {
      id: r._id.toString(),
      status: r.status,
      reason: reasonLabel(r.reason),
      note: r.note,
      email: r.email,
      createdAt: new Date(r.createdAt).toISOString(),
      product: p?.name ?? "Silinmiş ürün",
      productUrl: p && sp?.slug ? `/urun/${p.slug}?uretici=${sp.slug}` : p ? `/urun/${p.slug}` : undefined,
      seller: sp?.shopName ?? u?.name ?? "Bilinmeyen üretici",
      listingStatus: l?.status ?? "missing",
    };
  });

  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <AdminNav active="/yonetim/bildirimler" counts={{ "/yonetim/basvurular": pendingApps, "/yonetim/bildirimler": items.filter((i) => i.status === "open").length }} />
      <ReportsAdmin items={items} />
    </main>
  );
}
