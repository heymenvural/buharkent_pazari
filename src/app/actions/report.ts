"use server";

import { headers } from "next/headers";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { Listing } from "@/models/Listing";
import { Product } from "@/models/Product";
import { Report } from "@/models/Report";
import { User } from "@/models/User";
import { SellerProfile } from "@/models/SellerProfile";
import { reasonLabel } from "@/lib/reports";
import { sendReportAlertEmail } from "@/lib/mailer";

const schema = z.object({
  offerId: z.string().refine(isValidObjectId),
  reason: z.enum(["sahte", "baskasinin-urunu", "saglik", "yaniltici", "yasak", "diger"], { message: "Bir sebep seç" }),
  note: z.string().trim().max(1000, "En fazla 1000 karakter"),
  email: z.union([z.literal(""), z.string().trim().toLowerCase().email("Geçerli bir e-posta yaz").max(120)]),
}).superRefine((d, ctx) => {
  if (d.reason === "diger" && d.note.length < 10) ctx.addIssue({ code: "custom", path: ["note"], message: "Sorunu kısaca açıkla" });
});

export async function reportListing(input: unknown): Promise<{ ok: boolean; errors?: Record<string, string> }> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`report:${ip}`, 5, 60 * 60_000)) {
    return { ok: false, errors: { form: "Çok fazla bildirim gönderdin. Biraz sonra tekrar dene." } };
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    parsed.error.issues.forEach((i) => (errors[String(i.path[0] ?? "form")] ??= i.message));
    return { ok: false, errors };
  }
  const d = parsed.data;

  try {
    await connectDB();
    const listing = await Listing.findById(d.offerId);
    if (!listing) return { ok: false, errors: { form: "İlan bulunamadı." } };
    const session = await auth();

    await Report.create({
      listing: listing._id,
      seller: listing.seller,
      reason: d.reason,
      note: d.note,
      email: d.email || session?.user?.email || undefined,
      reporter: session?.user?.id && isValidObjectId(session.user.id) ? session.user.id : undefined,
    });

    const [product, seller, profile] = await Promise.all([
      Product.findById(listing.product).lean(),
      User.findById(listing.seller).lean(),
      SellerProfile.findOne({ user: listing.seller }).lean(),
    ]);
    const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
    await sendReportAlertEmail(admins, product?.name ?? "Ürün", profile?.shopName ?? seller?.name ?? "Üretici", reasonLabel(d.reason), d.note).catch((e) =>
      console.error("mail error", e)
    );
    return { ok: true };
  } catch (e) {
    console.error("report error", e);
    return { ok: false, errors: { form: "Bir sorun oluştu, lütfen tekrar dene." } };
  }
}
