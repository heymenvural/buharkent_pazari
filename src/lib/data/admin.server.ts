import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Listing } from "@/models/Listing";
import { Report } from "@/models/Report";

/** Yönetim sekmelerindeki bekleyen iş sayıları */
export async function adminCounts() {
  await connectDB();
  const [apps, listings, reports] = await Promise.all([
    User.countDocuments({ role: "seller", sellerStatus: "pending" }),
    Listing.countDocuments({ status: "pending" }),
    Report.countDocuments({ status: "open" }),
  ]);
  return { "/yonetim/basvurular": apps, "/yonetim/urunler": listings, "/yonetim/bildirimler": reports };
}
