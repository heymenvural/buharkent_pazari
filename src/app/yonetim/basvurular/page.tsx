import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { SellerProfile } from "@/models/SellerProfile";
import { SellerDocument } from "@/models/SellerDocument";
import { User, type IUser } from "@/models/User";
import { PRODUCT_TYPES, TAX_OPTIONS, requirementsFor } from "@/lib/compliance";
import { maskIban } from "@/lib/iban";
import AdminNav from "@/components/admin/AdminNav";
import { adminCounts } from "@/lib/data/admin.server";
import ApplicationsAdmin, { type AppItem } from "@/components/admin/ApplicationsAdmin";

export const metadata: Metadata = { title: "Üretici başvuruları", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const session = await auth();
  // Admin olmayanlara sayfanın varlığı bile gösterilmez
  if (session?.user?.role !== "admin") notFound();

  await connectDB();
  const [rows, docs, counts] = await Promise.all([
    SellerProfile.find({ demo: { $ne: true } })
      .populate<{ user: Pick<IUser, "_id" | "name" | "email" | "phone" | "sellerStatus"> | null }>({
        path: "user",
        model: User,
        select: "name email phone sellerStatus",
      })
      .sort({ createdAt: -1 })
      .limit(300)
      .lean(),
    SellerDocument.find().select("user docKey status note updatedAt").lean(),
    adminCounts(),
  ]);

  const items: AppItem[] = rows
    .filter((r) => r.user)
    .map((r) => {
      const uid = r.user!._id.toString();
      const mine = docs.filter((d) => d.user.toString() === uid);
      const req = requirementsFor(r.productTypes ?? [], r.taxStatus);
      return {
        id: r._id.toString(),
        name: r.user!.name,
        email: r.user!.email,
        phone: r.user!.phone ?? r.phone,
        status: r.user!.sellerStatus ?? "pending",
        address: [r.village, r.district, r.province].filter(Boolean).join(", "),
        sellerType: r.sellerType,
        products: PRODUCT_TYPES.filter((t) => r.productTypes?.includes(t.key)).map((t) => t.name),
        tax: TAX_OPTIONS.find((o) => o.key === r.taxStatus)?.title ?? "Belirtilmemiş",
        since: r.since,
        iban: r.iban ? maskIban(r.iban) : "",
        ibanName: r.ibanName,
        description: r.description,
        createdAt: new Date(r.createdAt).toISOString(),
        rejectReason: r.rejectReason,
        slug: r.slug,
        verified: r.verified,
        docs: req.docs.map(({ doc, for: forList }) => {
          const row = mine.find((d) => d.docKey === doc.key);
          return {
            key: doc.key,
            name: doc.name,
            for: forList,
            row: row && { id: row._id.toString(), status: row.status, note: row.note, updatedAt: new Date(row.updatedAt).toISOString() },
          };
        }),
      };
    });

  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <AdminNav active="/yonetim/basvurular" counts={counts} />
      <ApplicationsAdmin items={items} />
    </main>
  );
}
