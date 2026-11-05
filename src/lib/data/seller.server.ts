import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { SellerProfile } from "@/models/SellerProfile";

/** Panel sayfaları için: sadece onaylı üretici girebilir, durum veritabanından okunur */
export async function getApprovedSeller() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris?tab=uretici&next=/panel");
  await connectDB();
  const user = await User.findById(session.user.id).lean();
  if (!user || user.role !== "seller") redirect("/hesabim");
  if (user.sellerStatus !== "approved") redirect("/basvurum");
  const profile = await SellerProfile.findOne({ user: user._id }).lean();
  if (!profile) redirect("/basvurum");
  return { user, profile };
}
