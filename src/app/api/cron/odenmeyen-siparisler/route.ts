import { NextResponse } from "next/server";
import { trusted } from "mongoose";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/db";
import { PAYMENT_DAYS } from "@/lib/orders";
import { returnStock } from "@/lib/stock";
import { sendOrderStatusEmail } from "@/lib/mailer";
import { Order } from "@/models/Order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Vercel her gün bir kez çağırır: süresi içinde havalesi yapılmayan paketleri iptal eder,
 * stoğu geri verir ve müşteriye haber verir. Tekrar çağrılması zararsızdır.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  await connectDB();
  const limit = new Date(Date.now() - PAYMENT_DAYS * 86_400_000);
  const orders = await Order.find({ payment: "havale", "parts.status": "pending_payment", createdAt: trusted({ $lt: limit }) }).limit(200);

  let cancelled = 0;
  for (const order of orders) {
    const changed = order.parts.filter((p) => p.status === "pending_payment");
    for (const part of changed) {
      for (const it of part.items) await returnStock(it.listing, it.variantId, it.qty);
      part.status = "cancelled";
      part.cancelReason = `${PAYMENT_DAYS} gün içinde ödeme yapılmadığı için otomatik iptal edildi.`;
      part.history.push({ status: "cancelled", at: new Date(), by: "system", note: part.cancelReason });
      cancelled++;
    }
    await order.save();
    for (const part of changed) await sendOrderStatusEmail(order, part, "cancelled").catch((e) => console.error("cron mail error", e));
  }

  if (cancelled) revalidateTag("catalog", "max");
  return NextResponse.json({ ok: true, orders: orders.length, cancelled });
}
