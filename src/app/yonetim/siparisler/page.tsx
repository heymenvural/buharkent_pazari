import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { formatPrice } from "@/lib/catalog";
import { adminCounts } from "@/lib/data/admin.server";
import { toOrderView } from "@/lib/data/orders.server";
import { Order } from "@/models/Order";
import AdminNav from "@/components/admin/AdminNav";
import SellerOrders from "@/components/orders/SellerOrders";

export const metadata: Metadata = { title: "Siparişler", robots: { index: false } };
export const dynamic = "force-dynamic";

type Doc = { createdAt: Date; total: number; parts: { status: string }[] };
function lastDays(docs: Doc[], days: number) {
  const since = Date.now() - days * 86_400_000;
  return docs.filter((o) => new Date(o.createdAt).getTime() > since);
}

export default async function AdminOrdersPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") notFound();

  await connectDB();
  const [docs, counts] = await Promise.all([Order.find().sort({ createdAt: -1 }).limit(300).lean(), adminCounts()]);

  // Her üretici paketi ayrı satır olarak listelenir
  const rows = docs.flatMap((o) => {
    const v = toOrderView(o);
    return v.parts.map((p) => ({ ...v, parts: [p] }));
  });

  const last30 = lastDays(docs, 30);
  const delivered = last30.flatMap((o) => o.parts).filter((p) => p.status === "delivered");

  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <AdminNav active="/yonetim/siparisler" counts={counts} />
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl text-olive-900 md:text-5xl">Siparişler</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Son 30 gün sipariş", String(last30.length)],
            ["Son 30 gün ciro (üreticilere)", formatPrice(last30.reduce((a, o) => a + o.total, 0))],
            ["Teslim edilen paket", String(delivered.length)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-3xl bg-cream-50 p-5 shadow-soft">
              <p className="text-sm text-muted">{k}</p>
              <p className="mt-1 font-display text-3xl text-olive-900">{v}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">Dernek parayı tahsil etmez; tutarlar doğrudan üreticilere ödenir. Sorunlu paketlerde üretici adına durum güncelleyebilir ya da iptal edebilirsin.</p>
        <div className="mt-6">
          <SellerOrders orders={rows} admin />
        </div>
      </div>
    </main>
  );
}
