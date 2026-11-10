import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Sadece admin: Cloudinary ayarlarının doğru olup olmadığını kontrol eder (gizli bilgileri göstermez) */
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const cloud = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const key = process.env.CLOUDINARY_API_KEY?.trim();
  const secret = process.env.CLOUDINARY_API_SECRET?.trim();
  const missing = [!cloud && "CLOUDINARY_CLOUD_NAME", !key && "CLOUDINARY_API_KEY", !secret && "CLOUDINARY_API_SECRET"].filter(Boolean);
  if (missing.length) return NextResponse.json({ durum: "EKSİK", eksik: missing });

  const raw = { cloud: process.env.CLOUDINARY_CLOUD_NAME!, key: process.env.CLOUDINARY_API_KEY!, secret: process.env.CLOUDINARY_API_SECRET! };
  const spaces = Object.entries(raw).filter(([, v]) => v !== v.trim() || /["']/.test(v)).map(([k]) => k);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud!)}/ping`, {
      headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}` },
      cache: "no-store",
    });
    const body = (await res.json().catch(() => ({}))) as { status?: string; error?: { message?: string } };
    if (res.ok && body.status === "ok") {
      return NextResponse.json({ durum: "TAMAM", cloudName: cloud, not: spaces.length ? `Şu değerlerde boşluk/tırnak var, temizlemen iyi olur: ${spaces.join(", ")}` : undefined });
    }
    const msg = body.error?.message ?? `HTTP ${res.status}`;
    const ipucu = /cloud_name/i.test(msg)
      ? "Cloud name yanlış. Cloudinary → Settings → API Keys sayfasındaki 'Cloud name' değerini yaz."
      : /api_key|api key/i.test(msg)
        ? "API Key yanlış ya da başka bir hesaba ait."
        : /secret|signature|credentials/i.test(msg)
          ? "API Secret yanlış ya da başka bir hesaba ait."
          : "Değerleri Cloudinary → Settings → API Keys sayfasından tekrar kopyala.";
    return NextResponse.json({ durum: "HATALI", cloudName: cloud, hata: msg, ipucu });
  } catch {
    return NextResponse.json({ durum: "ULAŞILAMADI", ipucu: "Cloudinary'ye bağlanılamadı, biraz sonra tekrar dene." });
  }
}
