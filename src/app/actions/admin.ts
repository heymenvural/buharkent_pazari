"use server";

import { isValidObjectId, Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { SellerProfile } from "@/models/SellerProfile";
import { sendSellerDecisionEmail } from "@/lib/mailer";

export async function decideSeller(
  profileId: string,
  decision: "approve" | "reject",
  reason?: string
): Promise<{ ok: boolean; error?: string }> {
  // Yetki her istekte sunucuda yeniden kontrol edilir
  const session = await auth();
  if (session?.user?.role !== "admin") return { ok: false, error: "Bu işlem için yetkiniz yok." };
  if (!isValidObjectId(profileId) || (decision !== "approve" && decision !== "reject")) {
    return { ok: false, error: "Geçersiz istek." };
  }
  const note = typeof reason === "string" ? reason.trim().slice(0, 300) : "";

  await connectDB();
  const profile = await SellerProfile.findById(profileId);
  if (!profile) return { ok: false, error: "Başvuru bulunamadı." };
  const user = await User.findById(profile.user);
  if (!user) return { ok: false, error: "Kullanıcı bulunamadı." };

  user.sellerStatus = decision === "approve" ? "approved" : "rejected";
  if (decision === "approve" && !user.emailVerified) user.emailVerified = new Date();
  await user.save();

  profile.reviewedAt = new Date();
  if (isValidObjectId(session.user.id)) profile.reviewedBy = new Types.ObjectId(session.user.id);
  profile.rejectReason = decision === "reject" && note ? note : undefined;
  await profile.save();

  await sendSellerDecisionEmail(user.email, user.name, decision === "approve", note).catch((e) => console.error("mail error", e));

  revalidatePath("/yonetim/basvurular");
  return { ok: true };
}