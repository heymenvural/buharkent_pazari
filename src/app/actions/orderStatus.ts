"use server";

import { isValidObjectId } from "mongoose";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { CARGO_COMPANIES, NEXT, type PartStatus } from "@/lib/orders";
import { sendOrderStatusEmail } from "@/lib/mailer";
import { returnStock } from "@/lib/stock";
import { Order } from "@/models/Order";
import { User } from "@/models/User";

type Result = { ok: boolean; error?: string };

const schema = z.object({
  orderId: z.string().refine(isValidObjectId),
  partId: z.string().refine(isValidObjectId),
  to: z.enum(["preparing", "shipped", "delivered", "cancelled"]),
  cargoCompany: z.string().trim().max(40).optional(),
  trackingNo: z.string().trim().max(40).optional(),
  reason: z.string().trim().max(300).optional(),
});

/** Üretici (kendi paketi için) veya admin sipariş durumunu ilerletir */
export async function updatePartStatus(input: unknown): Promise<Result> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid || !isValidObjectId(uid)) return { ok: false, error: "Giriş yapmalısın." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Geçersiz istek." };
  const d = parsed.data;

  await connectDB();
  const me = await User.findById(uid).select("role sellerStatus").lean();
  const isAdmin = me?.role === "admin";
  if (!me || (!isAdmin && !(me.role === "seller" && me.sellerStatus === "approved"))) return { ok: false, error: "Bu işlem için yetkin yok." };

  const order = await Order.findById(d.orderId);
  const part = order?.parts.find((p) => p._id.toString() === d.partId);
  if (!order || !part) return { ok: false, error: "Sipariş bulunamadı." };
  if (!isAdmin && part.seller.toString() !== uid) return { ok: false, error: "Bu sipariş sana ait değil." };

  const from = part.status as PartStatus;
  if (!NEXT[from].includes(d.to)) return { ok: false, error: "Bu sipariş bu duruma geçirilemez." };

  if (d.to === "shipped") {
    if (!d.cargoCompany || !(CARGO_COMPANIES as readonly string[]).includes(d.cargoCompany)) return { ok: false, error: "Kargo firmasını seç." };
    if (!d.trackingNo || d.trackingNo.length < 4) return { ok: false, error: "Kargo takip numarasını yaz." };
    part.cargoCompany = d.cargoCompany;
    part.trackingNo = d.trackingNo;
  }
  if (d.to === "cancelled") {
    if (!d.reason || d.reason.length < 5) return { ok: false, error: "Müşteriye iletilecek iptal sebebini yaz." };
    part.cancelReason = d.reason;
    // Stok iadesi
    for (const it of part.items) {
      await returnStock(it.listing, it.variantId, it.qty);
    }
    updateTag("catalog");
  }

  part.status = d.to;
  part.history.push({ status: d.to, at: new Date(), by: isAdmin && part.seller.toString() !== uid ? "admin" : "seller", note: d.to === "cancelled" ? d.reason : undefined });
  await order.save();

  await sendOrderStatusEmail(order, part, d.to).catch((e) => console.error("status mail error", e));

  revalidatePath("/panel");
  revalidatePath("/yonetim/siparisler");
  revalidatePath(`/siparis/${order.orderNo}`);
  return { ok: true };
}
