import { trusted } from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Listing } from "@/models/Listing";
import { Report } from "@/models/Report";
import { Order } from "@/models/Order";

/** Yönetim sekmelerindeki bekleyen iş sayıları */
export async function adminCounts() {
  await connectDB();
  const [apps, listings, reports, late] = await Promise.all([
    User.countDocuments({ role: "seller", sellerStatus: "pending" }),
    Listing.countDocuments({ status: "pending" }),
    Report.countDocuments({ status: "open" }),
    // 3 günden uzun süredir ödeme bekleyen paketler
    Order.countDocuments({ "parts.status": "pending_payment", createdAt: trusted({ $lt: new Date(Date.now() - 3 * 86_400_000) }) }),
  ]);
  return { "/yonetim/basvurular": apps, "/yonetim/urunler": listings, "/yonetim/siparisler": late, "/yonetim/bildirimler": reports };
}
