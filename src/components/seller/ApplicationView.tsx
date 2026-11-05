"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  AlertTriangle, BadgeCheck, Camera, CheckCircle2, Clock, Eye, FileCheck2, HelpCircle, Loader2, LogOut, MessageCircle, RefreshCw, XCircle,
} from "lucide-react";
import { PRODUCT_TYPES, TAX_OPTIONS, requirementsFor, whatsappLink, type DocKey, type TaxStatus } from "@/lib/compliance";
import { compressImage } from "@/lib/compressImage";

const ease = [0.76, 0, 0.24, 1] as const;

export type DocRow = { id: string; docKey: DocKey; status: "pending" | "approved" | "rejected"; note?: string; updatedAt: string };

export type ApplicationData = {
  name: string;
  status: "pending" | "approved" | "rejected";
  productTypes: string[];
  taxStatus?: TaxStatus;
  ibanMasked: string;
  ibanName?: string;
  docs: DocRow[];
};

const chip = {
  none: { label: "Yüklenmedi", cls: "bg-sand-300 text-olive-900", icon: Clock },
  pending: { label: "İnceleniyor", cls: "bg-[#e0a84a]/20 text-[#7a4f10]", icon: Clock },
  approved: { label: "Onaylandı", cls: "bg-olive-500/20 text-olive-700", icon: CheckCircle2 },
  rejected: { label: "Düzeltme gerekli", cls: "bg-terra-500/15 text-terra-600", icon: XCircle },
};

function UploadButton({ docKey, hasFile, onDone }: { docKey: DocKey; hasFile: boolean; onDone: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onFile = async (f?: File) => {
    if (!f) return;
    setError("");
    setBusy(true);
    try {
      const file = await compressImage(f);
      if (file.size > 4 * 1024 * 1024) throw new Error("Dosya çok büyük (en fazla 4 MB).");
      const fd = new FormData();
      fd.append("docKey", docKey);
      fd.append("file", file);
      const res = await fetch("/api/belgeler", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Yükleme başarısız.");
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme başarısız.");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div>
      <input ref={ref} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      <button
        type="button"
        disabled={busy}
        onClick={() => ref.current?.click()}
        className={`flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full px-5 font-semibold transition-colors disabled:opacity-60 sm:w-auto ${
          hasFile ? "border-2 border-olive-700 text-olive-700" : "bg-olive-700 text-cream-50 hover:bg-olive-900"
        }`}
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : hasFile ? <RefreshCw className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
        {busy ? "Yükleniyor..." : hasFile ? "Değiştir" : "Fotoğraf çek / Dosya seç"}
      </button>
      {error && <p className="mt-2 text-sm font-medium text-terra-600">{error}</p>}
    </div>
  );
}

export default function ApplicationView({ data }: { data: ApplicationData }) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const req = requirementsFor(data.productTypes, data.taxStatus);
  const docMap = new Map(data.docs.map((d) => [d.docKey, d]));
  const uploaded = req.docs.filter((d) => docMap.has(d.doc.key)).length;
  const tax = TAX_OPTIONS.find((o) => o.key === data.taxStatus);

  // Admin onayladıysa oturumdaki durumu tazele
  useEffect(() => {
    if (session?.user && session.user.sellerStatus !== data.status) update();
  }, [session?.user, data.status, update]);

  const banner =
    data.status === "approved"
      ? { cls: "bg-olive-700 text-cream-50", icon: BadgeCheck, title: "Başvurun onaylandı!", text: "Artık Buharkent Pazarı üreticisisin. Üretici panelinden ürünlerini ekleyebilirsin." }
      : data.status === "rejected"
      ? { cls: "bg-terra-600 text-cream-50", icon: XCircle, title: "Başvurun onaylanmadı", text: "Detaylar için e-postanı kontrol et veya bizimle iletişime geç." }
      : { cls: "bg-[#e0a84a] text-ink", icon: Clock, title: "Üyeliğin henüz onaylanmadı", text: "Aşağıdaki belgelerini yükle. Ekibimiz başvurunu inceleyip seni arayacak." };
  const BannerIcon = banner.icon;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <motion.div className={`flex flex-col gap-4 rounded-[2rem] p-6 md:flex-row md:items-center md:p-8 ${banner.cls}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
        <BannerIcon className="h-10 w-10 shrink-0" />
        <div className="flex-1">
          <p className="text-sm opacity-80">Merhaba {data.name}</p>
          <h1 className="text-3xl">{banner.title}</h1>
          <p className="mt-1 opacity-90">{banner.text}</p>
        </div>
        {data.status === "approved" && (
          <Link href="/panel" className="shrink-0 rounded-full bg-cream-50 px-6 py-3 text-center font-semibold text-olive-900 hover:bg-sand-300">
            Üretici paneline git
          </Link>
        )}
      </motion.div>

      {/* Belgeler */}
      <section className="rounded-[2rem] bg-cream-50 p-5 shadow-soft md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl text-olive-900 md:text-3xl">Belgelerin</h2>
          {req.docs.length > 0 && (
            <span className="text-sm font-semibold text-muted">
              {uploaded} / {req.docs.length} yüklendi
            </span>
          )}
        </div>
        {req.docs.length > 0 && (
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-sand-300">
            <motion.div className="h-full rounded-full bg-olive-700" initial={{ width: 0 }} animate={{ width: `${(uploaded / req.docs.length) * 100}%` }} transition={{ duration: 0.8, ease }} />
          </div>
        )}

        <div className="mt-6 space-y-4">
          {req.docs.length === 0 && <p className="rounded-2xl bg-olive-500/15 p-5 text-olive-900">Seçtiğin ürünler için ek belge gerekmiyor. Ekibimiz seninle iletişime geçecek.</p>}

          {req.docs.map(({ doc, for: forList }) => {
            const row = docMap.get(doc.key);
            const c = chip[row?.status ?? "none"];
            const ChipIcon = c.icon;
            return (
              <div key={doc.key} className="rounded-3xl border-2 border-sand-300 p-5">
                <div className="flex flex-wrap items-start gap-3">
                  <FileCheck2 className="mt-1 h-6 w-6 shrink-0 text-olive-700" />
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold text-ink">{doc.name}</p>
                    <p className="text-sm text-muted">Gerekli olduğu yer: {forList.join(", ")}</p>
                  </div>
                  <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${c.cls}`}>
                    <ChipIcon className="h-4 w-4" /> {c.label}
                  </span>
                </div>

                {row?.status === "rejected" && row.note && (
                  <p className="mt-3 flex gap-2 rounded-2xl bg-terra-500/10 p-3 text-sm text-terra-600">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {row.note}
                  </p>
                )}

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  {row?.status !== "approved" && <UploadButton docKey={doc.key} hasFile={!!row} onDone={() => router.refresh()} />}
                  {row && (
                    <a href={`/api/belgeler/${row.id}`} target="_blank" rel="noopener noreferrer" className="flex min-h-[52px] items-center justify-center gap-2 rounded-full px-5 font-semibold text-olive-700 hover:bg-cream-200">
                      <Eye className="h-5 w-5" /> Yüklediğimi gör
                    </a>
                  )}
                  {!row && (
                    <Link href="/satici-rehberi#ne-satacaksin" className="flex min-h-[52px] items-center justify-center gap-2 rounded-full px-5 font-semibold text-olive-700 hover:bg-cream-200">
                      <HelpCircle className="h-5 w-5" /> Nasıl alırım?
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-muted">PDF, JPG veya PNG yükleyebilirsin. Telefonla çektiğin fotoğrafta yazıların okunabildiğinden emin ol.</p>
      </section>

      {/* Başvuru özeti */}
      <section className="rounded-[2rem] bg-cream-50 p-5 shadow-soft md:p-8">
        <h2 className="text-2xl text-olive-900">Başvuru bilgilerin</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-sm text-muted">Satmak istediğin ürünler</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {PRODUCT_TYPES.filter((t) => data.productTypes.includes(t.key)).map((t) => (
                <span key={t.key} className="rounded-full bg-olive-700/10 px-3 py-1 text-sm font-semibold text-olive-700">{t.name}</span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Vergi durumu</dt>
            <dd className="mt-1 font-semibold text-ink">{tax?.title ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Ödeme hesabı</dt>
            <dd className="mt-1 font-mono text-sm font-semibold text-ink">{data.ibanMasked || "-"}</dd>
            {data.ibanName && <dd className="text-sm text-muted">{data.ibanName}</dd>}
          </div>
        </dl>
        <a
          href={whatsappLink(`Merhaba, ben ${data.name}. Üretici başvurumdaki bilgileri değiştirmek istiyorum.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 font-semibold text-olive-700 underline"
        >
          <MessageCircle className="h-5 w-5" /> Bilgilerimi değiştirmek istiyorum
        </a>
      </section>

      <div className="flex justify-center">
        <button onClick={() => signOut({ redirectTo: "/" })} className="flex items-center gap-2 rounded-full px-5 py-3 font-semibold text-muted hover:text-ink">
          <LogOut className="h-5 w-5" /> Çıkış yap
        </button>
      </div>
    </div>
  );
}