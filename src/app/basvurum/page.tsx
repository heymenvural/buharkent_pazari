import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { SellerProfile } from "@/models/SellerProfile";
import { SellerDocument } from "@/models/SellerDocument";
import { maskIban } from "@/lib/iban";
import ApplicationView, { type ApplicationData } from "@/components/seller/ApplicationView";

export const metadata: Metadata = { title: "Başvurum", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ApplicationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris?tab=uretici");
  if (session.user.role !== "seller") redirect("/hesabim");

  await connectDB();
  const [user, profile, docs] = await Promise.all([
    User.findById(session.user.id).lean(),
    SellerProfile.findOne({ user: session.user.id }).lean(),
    SellerDocument.find({ user: session.user.id }).sort({ updatedAt: -1 }).lean(),
  ]);
  if (!user || !profile) redirect("/hesabim");

  const data: ApplicationData = {
    name: user.name,
    status: user.sellerStatus ?? "pending",
    productTypes: profile.productTypes ?? [],
    taxStatus: profile.taxStatus,
    ibanMasked: profile.iban ? maskIban(profile.iban) : "",
    ibanName: profile.ibanName,
    docs: docs.map((d) => ({
      id: d._id.toString(),
      docKey: d.docKey,
      status: d.status,
      note: d.note,
      updatedAt: new Date(d.updatedAt).toISOString(),
    })),
  };

  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <ApplicationView data={data} />
    </main>
  );
}