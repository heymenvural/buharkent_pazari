"use server";

import { isValidObjectId, Types } from "mongoose";
import { revalidatePath, updateTag } from "next/cache";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { SellerProfile } from "@/models/SellerProfile";
import { SellerDocument } from "@/models/SellerDocument";
import { Listing } from "@/models/Listing";
import { Product } from "@/models/Product";
import { Report } from "@/models/Report";
import { DOCS, requirementsFor } from "@/lib/compliance";
import { slugify } from "@/lib/slug";
import { sendDocumentRejectedEmail, sendListingDecisionEmail, sendListingRemovedEmail, sendSellerDecisionEmail } from "@/lib/mailer";

type Result = { ok: boolean; error?: string };

// Yetki her istekte sunucuda yeniden kontrol edilir
async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") return null;
  return isValidObjectId(session.user.id) ? new Types.ObjectId(session.user.id) : undefined;
}

const cleanNote = (s: unknown) => (typeof s === "string" ? s.trim().slice(0, 300) : "");

async function uniqueSlug(base: string) {
  const root = slugify(base);
  let slug = root;
  for (let i = 2; await SellerProfile.exists({ slug }); i++) slug = `${root}-${i}`;
  return slug;
}

/* ---------- Üretici başvurusu ---------- */
export async function decideSeller(profileId: string, decision: "approve" | "reject", reason?: string, force = false): Promise<Result> {
  const adminId = await requireAdmin();
  if (adminId === null) return { ok: false, error: "Bu işlem için yetkiniz yok." };
  if (!isValidObjectId(profileId) || (decision !== "approve" && decision !== "reject")) return { ok: false, error: "Geçersiz istek." };
  const note = cleanNote(reason);

  await connectDB();
  const profile = await SellerProfile.findById(profileId);
  if (!profile) return { ok: false, error: "Başvuru bulunamadı." };
  const user = await User.findById(profile.user);
  if (!user) return { ok: false, error: "Kullanıcı bulunamadı." };

  if (decision === "approve") {
    // Gerekli belgelerin hepsi onaylanmadan satış izni verilmez (bilinçli istisna hariç)
    const req = requirementsFor(profile.productTypes ?? [], profile.taxStatus);
    const approvedDocs = await SellerDocument.find({ user: user._id, status: "approved" }).distinct("docKey");
    const missing = req.docs.filter((d) => !approvedDocs.includes(d.doc.key));
    if (missing.length && !force) {
      return { ok: false, error: `Onaylanmamış belgeler var: ${missing.map((m) => m.doc.name).join(", ")}` };
    }
    if (!profile.slug) profile.slug = await uniqueSlug(profile.shopName ?? user.name);
    if (!profile.shopName) profile.shopName = user.name;
    if (!profile.story?.length) profile.story = [profile.description];
    profile.verified = missing.length === 0;
    if (!user.emailVerified) user.emailVerified = new Date();
  }

  user.sellerStatus = decision === "approve" ? "approved" : "rejected";
  await user.save();

  profile.reviewedAt = new Date();
  if (adminId) profile.reviewedBy = adminId;
  profile.rejectReason = decision === "reject" && note ? note : undefined;
  await profile.save();

  // Reddedilen üreticinin yayındaki ilanları da durdurulur
  if (decision === "reject") await Listing.updateMany({ seller: user._id, status: "active" }, { status: "paused" });

  await sendSellerDecisionEmail(user.email, user.name, decision === "approve", note).catch((e) => console.error("mail error", e));

  updateTag("catalog");
  revalidatePath("/yonetim/basvurular");
  return { ok: true };
}

/* ---------- Belge onayı ---------- */
export async function decideDocument(docId: string, decision: "approve" | "reject", reason?: string): Promise<Result> {
  const adminId = await requireAdmin();
  if (adminId === null) return { ok: false, error: "Bu işlem için yetkiniz yok." };
  if (!isValidObjectId(docId) || (decision !== "approve" && decision !== "reject")) return { ok: false, error: "Geçersiz istek." };
  const note = cleanNote(reason);
  if (decision === "reject" && !note) return { ok: false, error: "Üreticinin neyi düzelteceğini bilmesi için bir not yaz." };

  await connectDB();
  const doc = await SellerDocument.findById(docId);
  if (!doc) return { ok: false, error: "Belge bulunamadı." };

  doc.status = decision === "approve" ? "approved" : "rejected";
  doc.note = decision === "reject" ? note : undefined;
  doc.reviewedAt = new Date();
  if (adminId) doc.reviewedBy = adminId;
  await doc.save();

  // Onaylı üreticinin belgesi reddedilirse "doğrulanmış" rozeti kalkar
  if (decision === "reject") {
    await SellerProfile.updateOne({ user: doc.user }, { verified: false });
    const user = await User.findById(doc.user);
    if (user) await sendDocumentRejectedEmail(user.email, user.name, DOCS[doc.docKey].name, note).catch((e) => console.error("mail error", e));
  }

  updateTag("catalog");
  revalidatePath("/yonetim/basvurular");
  return { ok: true };
}

/* ---------- Ürün bildirimleri ---------- */
export async function resolveReport(reportId: string, action: "remove" | "dismiss" | "restore"): Promise<Result> {
  const adminId = await requireAdmin();
  if (adminId === null) return { ok: false, error: "Bu işlem için yetkiniz yok." };
  if (!isValidObjectId(reportId) || !["remove", "dismiss", "restore"].includes(action)) return { ok: false, error: "Geçersiz istek." };

  await connectDB();
  const report = await Report.findById(reportId);
  if (!report) return { ok: false, error: "Bildirim bulunamadı." };
  const listing = await Listing.findById(report.listing);

  const stamp = { resolvedAt: new Date(), ...(adminId ? { resolvedBy: adminId } : {}) };

  if (action === "remove") {
    if (listing && !listing.locked) {
      listing.status = "paused";
      listing.locked = true; // üretici kendisi tekrar açamaz
      await listing.save();
      const [seller, product] = await Promise.all([User.findById(listing.seller), Product.findById(listing.product)]);
      if (seller && product) await sendListingRemovedEmail(seller.email, seller.name, product.name).catch((e) => console.error("mail error", e));
    }
    // Aynı ilan için açık olan diğer bildirimler de kapanır
    await Report.updateMany({ listing: report.listing, status: "open" }, { status: "removed", ...stamp });
  } else if (action === "dismiss") {
    report.set({ status: "dismissed", ...stamp });
    await report.save();
  } else {
    if (listing) {
      listing.status = "active";
      listing.locked = false;
      await listing.save();
    }
    report.set({ status: "dismissed", ...stamp });
    await report.save();
  }

  updateTag("catalog");
  revalidatePath("/yonetim/bildirimler");
  return { ok: true };
}

/* ---------- Ürün (ilan) onayı ---------- */
export async function decideListing(listingId: string, decision: "approve" | "reject", reason?: string): Promise<Result> {
  const adminId = await requireAdmin();
  if (adminId === null) return { ok: false, error: "Bu işlem için yetkiniz yok." };
  if (!isValidObjectId(listingId) || (decision !== "approve" && decision !== "reject")) return { ok: false, error: "Geçersiz istek." };
  const note = cleanNote(reason);
  if (decision === "reject" && !note) return { ok: false, error: "Üreticinin neyi düzelteceğini bilmesi için bir not yaz." };

  await connectDB();
  const listing = await Listing.findById(listingId);
  if (!listing) return { ok: false, error: "Ürün bulunamadı." };
  const [product, user] = await Promise.all([Product.findById(listing.product), User.findById(listing.seller)]);

  if (decision === "approve") {
    if (user?.sellerStatus !== "approved") return { ok: false, error: "Üreticinin satış izni yok." };
    listing.status = "active";
    listing.adminNote = undefined;
    if (product && !product.active) {
      product.active = true;
      await product.save();
    }
    // İlk ürünü onaylanan üreticinin sonraki ürünleri doğrudan yayına girer
    await SellerProfile.updateOne({ user: listing.seller }, { trusted: true });
  } else {
    listing.status = "rejected";
    listing.adminNote = note;
  }
  await listing.save();

  if (user && product) {
    await sendListingDecisionEmail(user.email, user.name, product.name, decision === "approve", note).catch((e) => console.error("mail error", e));
  }

  updateTag("catalog");
  revalidatePath("/yonetim/urunler");
  return { ok: true };
}
