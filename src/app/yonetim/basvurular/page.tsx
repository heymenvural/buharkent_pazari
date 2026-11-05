import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { SellerProfile } from "@/models/SellerProfile";
import type { IUser } from "@/models/User";
import ApplicationsAdmin, { type AppItem } from "@/components/admin/ApplicationsAdmin";

export const metadata: Metadata = { title: "Üretici başvuruları", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const session = await auth();
  // Admin olmayanlara sayfanın varlığı bile gösterilmez
  if (session?.user?.role !== "admin") notFound();

  await connectDB();
  const rows = await SellerProfile.find()
    .populate<{ user: Pick<IUser, "_id" | "name" | "email" | "phone" | "sellerStatus"> | null }>("user", "name email phone sellerStatus")
    .sort({ createdAt: -1 })
    .limit(300)
    .lean();

  const items: AppItem[] = rows
    .filter((r) => r.user)
    .map((r) => ({
      id: r._id.toString(),
      name: r.user!.name,
      email: r.user!.email,
      phone: r.user!.phone ?? r.phone,
      status: r.user!.sellerStatus ?? "pending",
      village: r.village,
      sellerType: r.sellerType,
      categories: r.categories,
      description: r.description,
      createdAt: new Date(r.createdAt).toISOString(),
      rejectReason: r.rejectReason,
    }));

  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <ApplicationsAdmin items={items} />
    </main>
  );
}