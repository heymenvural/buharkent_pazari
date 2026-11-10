import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { DOCS, type DocKey } from "@/lib/compliance";
import { SellerDocument } from "@/models/SellerDocument";
import { MAX_FILE_BYTES, deleteFile, extOf, saveFile, sniffMime } from "@/lib/files";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || (user.role !== "seller" && user.role !== "admin")) {
    return NextResponse.json({ ok: false, error: "Bu işlem için giriş yapmalısın." }, { status: 401 });
  }
  if (!await rateLimit(`upload:${user.id}`, 20, 60 * 60_000)) {
    return NextResponse.json({ ok: false, error: "Çok fazla yükleme yaptın, biraz sonra tekrar dene." }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Dosya okunamadı." }, { status: 400 });
  }

  const docKey = String(form.get("docKey") ?? "") as DocKey;
  const file = form.get("file");
  if (!(docKey in DOCS)) return NextResponse.json({ ok: false, error: "Geçersiz belge türü." }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "Dosya seçilmedi." }, { status: 400 });
  if (file.size === 0 || file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ ok: false, error: "Dosya en fazla 4 MB olabilir." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const mime = sniffMime(buf);
  if (!mime) return NextResponse.json({ ok: false, error: "Sadece PDF, JPG veya PNG yükleyebilirsin." }, { status: 400 });

  await connectDB();
  const existing = await SellerDocument.findOne({ user: user.id, docKey });
  const fileId = await saveFile(buf, `${docKey}-${Date.now()}.${extOf(mime)}`, { user: user.id, docKey });
  const originalName = file.name.replace(/[^\p{L}\p{N}._ -]/gu, "").slice(0, 120) || `${docKey}.${extOf(mime)}`;

  if (existing) {
    const oldFile = existing.fileId;
    existing.set({ fileId, mime, size: buf.length, originalName, status: "pending", note: undefined, reviewedAt: undefined, reviewedBy: undefined });
    await existing.save();
    await deleteFile(oldFile);
    return NextResponse.json({ ok: true, id: existing._id.toString(), status: "pending" });
  }

  const doc = await SellerDocument.create({ user: user.id, docKey, fileId, mime, size: buf.length, originalName });
  return NextResponse.json({ ok: true, id: doc._id.toString(), status: "pending" });
}