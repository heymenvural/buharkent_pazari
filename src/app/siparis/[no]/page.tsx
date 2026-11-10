import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { toOrderView } from "@/lib/data/orders.server";
import { Order } from "@/models/Order";
import CustomerOrder from "@/components/orders/CustomerOrder";

export const metadata: Metadata = { title: "Sipariş", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ no: string }>; searchParams: Promise<{ t?: string; yeni?: string }> };

const sameToken = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export default async function OrderPage({ params, searchParams }: Props) {
  const { no } = await params;
  const { t, yeni } = await searchParams;
  if (!/^BP-[A-Z0-9]{6}$/.test(no)) notFound();

  await connectDB();
  const order = await Order.findOne({ orderNo: no }).lean();
  if (!order) notFound();

  // Erişim: bağlantıdaki gizli anahtar, siparişin sahibi ya da admin
  const session = await auth();
  const owner = !!session?.user?.id && (order.user?.toString() === session.user.id || session.user.email?.toLowerCase() === order.customer.email);
  const allowed = (typeof t === "string" && sameToken(t, order.token)) || owner || session?.user?.role === "admin";
  if (!allowed) notFound();

  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <CustomerOrder order={toOrderView(order, { showIban: true })} isNew={yeni === "1"} />
    </main>
  );
}
