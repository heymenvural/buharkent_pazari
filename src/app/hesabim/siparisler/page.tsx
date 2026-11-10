import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { trusted } from "mongoose";
import { ArrowLeft, Package } from "lucide-react";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { formatPrice } from "@/lib/catalog";
import { STATUS } from "@/lib/orders";
import { Order } from "@/models/Order";

export const metadata: Metadata = { title: "Siparişlerim", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris?next=/hesabim/siparisler");

  await connectDB();
  const or: object[] = [{ user: session.user.id }];
  if (session.user.email) or.push({ "customer.email": session.user.email.toLowerCase() });
  const orders = await Order.find(trusted({ $or: or })).sort({ createdAt: -1 }).limit(100).lean();

  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <div className="mx-auto max-w-4xl">
        <Link href="/hesabim" className="inline-flex items-center gap-1.5 text-sm font-semibold text-olive-700"><ArrowLeft className="h-4 w-4" /> Hesabım</Link>
        <h1 className="mt-3 text-4xl text-olive-900 md:text-5xl">Siparişlerim</h1>

        <div className="mt-8 space-y-3">
          {orders.length === 0 && (
            <div className="rounded-[2rem] bg-cream-50 p-10 text-center shadow-soft">
              <Package className="mx-auto h-10 w-10 text-olive-700/50" />
              <p className="mt-3 text-muted">Henüz siparişin yok.</p>
              <Link href="/urunler" className="mt-5 inline-block rounded-full bg-olive-700 px-6 py-3 font-semibold text-cream-50">Ürünlere göz at</Link>
            </div>
          )}
          {orders.map((o) => (
            <Link key={o.orderNo} href={`/siparis/${o.orderNo}`} className="block rounded-[1.75rem] bg-cream-50 p-5 shadow-soft transition-transform hover:-translate-y-0.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono font-semibold text-olive-900">{o.orderNo}</p>
                <p className="text-sm text-muted">{new Date(o.createdAt).toLocaleDateString("tr-TR", { dateStyle: "long" })}</p>
              </div>
              <div className="mt-3 space-y-2">
                {o.parts.map((p) => (
                  <div key={p._id.toString()} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="min-w-0 truncate text-ink/80">
                      <b>{p.sellerName}</b> · {p.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                    </span>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[p.status].cls}`}>{STATUS[p.status].short}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-right font-display text-xl text-olive-900">{formatPrice(o.total)}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
