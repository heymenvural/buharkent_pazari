"use server";

import { revalidatePath, updateTag } from "next/cache";
import { trusted } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Listing } from "@/models/Listing";
import { Order } from "@/models/Order";
import { Review } from "@/models/Review";
import { SellerProfile } from "@/models/SellerProfile";
import { User } from "@/models/User";

type Result = { ok: boolean; error?: string; removed?: Record<string, number> };

/** Örnek (demo) üreticileri, ilanlarını, yorumlarını, hesaplarını ve sadece onlara ait siparişleri siler. Geri alınamaz. */
export async function clearDemoData(confirm: string): Promise<Result> {
  const session = await auth();
  if (session?.user?.role !== "admin") return { ok: false, error: "Bu işlem için yetkin yok." };
  if (confirm.trim().toLocaleUpperCase("tr-TR") !== "SİL") return { ok: false, error: "Onay için kutuya SİL yaz." };

  await connectDB();
  const demoUsers = await SellerProfile.find({ demo: true }).distinct("user");
  const demoListings = await Listing.find({ $or: [{ demo: true }, { seller: trusted({ $in: demoUsers }) }] }).distinct("_id");

  // Sadece örnek üreticilere ait paketlerden oluşan siparişler (gerçek bir üreticinin paketi varsa sipariş kalır)
  const orders = await Order.find({ "parts.seller": trusted({ $in: demoUsers }) }).select("parts.seller").lean();
  const demoSet = new Set(demoUsers.map(String));
  const demoOrders = orders.filter((o) => o.parts.every((p) => demoSet.has(p.seller.toString()))).map((o) => o._id);

  const [r, l, o, s, u] = await Promise.all([
    Review.deleteMany({ $or: [{ demo: true }, { listing: trusted({ $in: demoListings }) }] }),
    Listing.deleteMany({ _id: trusted({ $in: demoListings }) }),
    Order.deleteMany({ _id: trusted({ $in: demoOrders }) }),
    SellerProfile.deleteMany({ demo: true }),
    User.deleteMany({ _id: trusted({ $in: demoUsers }), role: trusted({ $ne: "admin" }) }),
  ]);

  updateTag("catalog");
  revalidatePath("/", "layout");
  return { ok: true, removed: { yorum: r.deletedCount, ilan: l.deletedCount, sipariş: o.deletedCount, üretici: s.deletedCount, hesap: u.deletedCount } };
}
