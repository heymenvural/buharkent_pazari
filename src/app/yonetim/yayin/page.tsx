import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { trusted } from "mongoose";
import { CheckCircle2, CircleAlert, CircleDashed } from "lucide-react";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { ORG, isPlaceholder } from "@/lib/legal";
import { Listing } from "@/models/Listing";
import { Review } from "@/models/Review";
import { SellerProfile } from "@/models/SellerProfile";
import { User } from "@/models/User";
import AdminNav from "@/components/admin/AdminNav";
import DemoCleaner from "@/components/admin/DemoCleaner";
import { adminCounts } from "@/lib/data/admin.server";

export const metadata: Metadata = { title: "Yayın kontrolü", robots: { index: false } };
export const dynamic = "force-dynamic";

type Check = { label: string; ok: boolean | "optional"; hint: string };
const has = (...keys: string[]) => keys.every((k) => !!process.env[k]);

export default async function LaunchPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") notFound();

  await connectDB();
  const [sellers, listings, reviews, realSellers, realListings, counts] = await Promise.all([
    SellerProfile.countDocuments({ demo: true }),
    Listing.countDocuments({ demo: true }),
    Review.countDocuments({ demo: true }),
    SellerProfile.find({ demo: trusted({ $ne: true }) })
      .distinct("user")
      .then((ids) => User.countDocuments({ _id: trusted({ $in: ids }), sellerStatus: "approved" })),
    Listing.countDocuments({ demo: trusted({ $ne: true }), status: "active" }),
    adminCounts(),
  ]);

  const legalMissing = (["address", "email", "phone", "registryNo"] as const).filter((k) => isPlaceholder(ORG[k]));

  const groups: { title: string; items: Check[] }[] = [
    {
      title: "Servisler",
      items: [
        { label: "Veritabanı", ok: true, hint: "Bağlantı çalışıyor." },
        { label: "Giriş sistemi adresi (AUTH_URL)", ok: has("AUTH_URL", "AUTH_SECRET"), hint: "Vercel'de AUTH_URL sitenin tam adresi olmalı (alan adı alınca güncelle)." },
        { label: "E-posta gönderimi", ok: has("GMAIL_USER", "GMAIL_APP_PASSWORD"), hint: "Doğrulama ve sipariş e-postaları için GMAIL_USER ve GMAIL_APP_PASSWORD." },
        { label: "Fotoğraf yükleme (Cloudinary)", ok: has("CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"), hint: "Değerler girilmiş görünüyor; çalıştığını /api/gorsel/durum adresinden test et." },
        { label: "Bot koruması (Turnstile)", ok: has("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY"), hint: "Kayıt, sipariş ve bildirim formlarını botlara karşı korur." },
        { label: "Google ile giriş", ok: has("AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET") ? true : "optional", hint: "Google Cloud'da uygulamayı 'Yayında' durumuna almayı unutma; yoksa sadece test kullanıcıları girebilir." },
        { label: "Zamanlanmış görev şifresi (CRON_SECRET)", ok: has("CRON_SECRET") ? true : "optional", hint: "İsteğe bağlı; ödenmeyen sipariş hatırlatmasını dışarıdan tetiklenmeye karşı korur." },
        { label: "Site adresi (NEXT_PUBLIC_SITE_URL)", ok: has("NEXT_PUBLIC_SITE_URL") ? true : "optional", hint: `Şu an: ${ORG.site}. Alan adı alınca bunu ekle.` },
      ],
    },
    {
      title: "İçerik",
      items: [
        { label: "Yasal metinlerdeki dernek bilgileri", ok: legalMissing.length === 0, hint: legalMissing.length ? `Eksik: ${legalMissing.map((k) => ({ address: "adres", email: "e-posta", phone: "telefon", registryNo: "kütük no" })[k]).join(", ")}.` : "Tamam." },
        { label: "Onaylı gerçek üretici", ok: realSellers > 0, hint: `${realSellers} üretici onaylı.` },
        { label: "Yayında gerçek ilan", ok: realListings > 0, hint: `${realListings} ilan yayında.` },
      ],
    },
  ];

  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <AdminNav active="/yonetim/yayin" counts={counts} />
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl text-olive-900">Yayın kontrolü</h1>
        <p className="mt-1 text-muted">Siteyi herkese duyurmadan önce bu listedeki her şey yeşil olmalı.</p>

        {groups.map((g) => (
          <section key={g.title} className="mt-8">
            <h2 className="text-2xl text-olive-900">{g.title}</h2>
            <ul className="mt-3 divide-y divide-sand-300 rounded-2xl border border-sand-300 bg-cream-50">
              {g.items.map((c) => (
                <li key={c.label} className="flex items-start gap-3 p-4">
                  {c.ok === true ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-olive-700" />
                  ) : c.ok === "optional" ? (
                    <CircleDashed className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
                  ) : (
                    <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-terra-600" />
                  )}
                  <span>
                    <span className="block font-semibold text-ink">{c.label}</span>
                    <span className="block text-sm text-muted">{c.hint}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="mt-8">
          <h2 className="text-2xl text-olive-900">Örnek veriler</h2>
          <div className="mt-3 rounded-2xl border border-sand-300 bg-cream-50 p-5">
            <DemoCleaner counts={{ sellers, listings, reviews }} />
          </div>
        </section>
      </div>
    </main>
  );
}
