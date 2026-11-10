import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { cloudinaryReady, signUpload } from "@/lib/cloudinary";
import { User } from "@/models/User";

export const runtime = "nodejs";

export async function POST() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return NextResponse.json({ ok: false, error: "Giriş yapmalısın." }, { status: 401 });
  if (!cloudinaryReady()) return NextResponse.json({ ok: false, error: "Fotoğraf yükleme henüz ayarlanmadı." }, { status: 503 });
  if (!await rateLimit(`img-sign:${id}`, 60, 60 * 60_000)) {
    return NextResponse.json({ ok: false, error: "Çok fazla fotoğraf yükledin, biraz sonra tekrar dene." }, { status: 429 });
  }

  // Sadece onaylı üretici ve admin yükleyebilir (durum veritabanından kontrol edilir)
  await connectDB();
  const user = await User.findById(id).select("role sellerStatus").lean();
  const allowed = user && (user.role === "admin" || (user.role === "seller" && user.sellerStatus === "approved"));
  if (!allowed) return NextResponse.json({ ok: false, error: "Bu işlem için yetkin yok." }, { status: 403 });

  return NextResponse.json({ ok: true, ...signUpload(id) });
}
