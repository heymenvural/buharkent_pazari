"use server";

import { timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { recomputeRating } from "@/lib/reviews.server";
import { Order } from "@/models/Order";
import { Review } from "@/models/Review";
import { User } from "@/models/User";

type Result = { ok: boolean; error?: string };

const schema = z.object({
  orderNo: z.string().regex(/^BP-[A-Z0-9]{6}$/),
  token: z.string().max(64).optional(),
  listingId: z.string().refine(isValidObjectId),
  rating: z.number().int().min(1, "Puan ver").max(5),
  text: z.string().trim().min(10, "Biraz daha yaz (en az 10 karakter)").max(1000, "En fazla 1000 karakter"),
  name: z.string().trim().min(2, "Görünecek adını yaz").max(60),
});

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** Sadece teslim edilmiş siparişteki ürün için, sipariş başına bir kez yorum yapılabilir */
export async function submitReview(input: unknown): Promise<Result> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await rateLimit(`review:${ip}`, 20, 60 * 60_000))) return { ok: false, error: "Çok fazla deneme yaptın, biraz sonra tekrar dene." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;

  await connectDB();
  const order = await Order.findOne({ orderNo: d.orderNo });
  if (!order) return { ok: false, error: "Sipariş bulunamadı." };

  const session = await auth();
  const owner = !!session?.user?.id && (order.user?.toString() === session.user.id || session.user.email?.toLowerCase() === order.customer.email);
  if (!owner && !(d.token && same(d.token, order.token))) return { ok: false, error: "Bu sipariş için yorum yapma yetkin yok." };

  const part = order.parts.find((p) => p.items.some((i) => i.listing.toString() === d.listingId));
  if (!part) return { ok: false, error: "Bu ürün siparişinde yok." };
  if (part.status !== "delivered") return { ok: false, error: "Ürün teslim edildikten sonra yorum yapabilirsin." };
  if (await Review.exists({ order: order._id, listing: d.listingId })) return { ok: false, error: "Bu ürünü zaten değerlendirdin." };

  try {
    await Review.create({
      listing: d.listingId,
      order: order._id,
      user: order.user ?? (session?.user?.id && isValidObjectId(session.user.id) ? (await User.exists({ _id: session.user.id }))?._id : undefined),
      name: d.name,
      rating: d.rating,
      text: d.text,
    });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return { ok: false, error: "Bu ürünü zaten değerlendirdin." };
    throw e;
  }
  await recomputeRating(d.listingId);
  updateTag("catalog");
  revalidatePath(`/siparis/${order.orderNo}`);
  return { ok: true };
}

/** Admin: yorumu gizle / tekrar yayınla */
export async function setReviewStatus(id: string, status: "published" | "hidden"): Promise<Result> {
  const session = await auth();
  if (session?.user?.role !== "admin") return { ok: false, error: "Bu işlem için yetkin yok." };
  if (!isValidObjectId(id) || !["published", "hidden"].includes(status)) return { ok: false, error: "Geçersiz istek." };
  await connectDB();
  const review = await Review.findByIdAndUpdate(id, { status }, { returnDocument: "after" });
  if (!review) return { ok: false, error: "Yorum bulunamadı." };
  await recomputeRating(review.listing);
  updateTag("catalog");
  revalidatePath("/yonetim/yorumlar");
  return { ok: true };
}
