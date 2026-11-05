"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EyeOff, ExternalLink, Loader2, Mail, RotateCcw, Store, X } from "lucide-react";
import { resolveReport } from "@/app/actions/admin";

export type ReportItem = {
  id: string;
  status: "open" | "removed" | "dismissed";
  reason: string;
  note: string;
  email?: string;
  createdAt: string;
  product: string;
  productUrl?: string;
  seller: string;
  listingStatus: string;
};

const tabs = [
  { key: "open" as const, label: "Açık" },
  { key: "removed" as const, label: "Kaldırılan" },
  { key: "dismissed" as const, label: "Geçersiz" },
];

function Card({ r, onError }: { r: ReportItem; onError: (e: string) => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  const act = (action: "remove" | "dismiss" | "restore") => {
    setBusy(action);
    startTransition(async () => {
      const res = await resolveReport(r.id, action);
      setBusy(null);
      if (!res.ok) return onError(res.error ?? "İşlem başarısız.");
      router.refresh();
    });
  };

  return (
    <motion.article layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 60 }} className="rounded-[1.75rem] bg-cream-50 p-6 shadow-soft">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl text-olive-900">{r.product}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><Store className="h-4 w-4" /> {r.seller}</p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-1 md:items-end">
          <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleString("tr-TR")}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${r.listingStatus === "active" ? "bg-olive-500/20 text-olive-700" : "bg-terra-500/15 text-terra-600"}`}>
            İlan: {r.listingStatus === "active" ? "yayında" : r.listingStatus === "missing" ? "silinmiş" : "yayında değil"}
          </span>
        </div>
      </div>

      <p className="mt-4 inline-block rounded-full bg-terra-500/15 px-3 py-1 text-sm font-semibold text-terra-600">{r.reason}</p>
      {r.note && <p className="mt-3 whitespace-pre-line rounded-2xl bg-cream-100 p-4 text-sm leading-relaxed text-ink/80">{r.note}</p>}
      {r.email && (
        <a href={`mailto:${r.email}`} className="mt-3 flex items-center gap-1.5 text-sm text-muted hover:text-olive-700">
          <Mail className="h-4 w-4" /> {r.email}
        </a>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {r.productUrl && (
          <a href={r.productUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-olive-700 px-4 py-2 text-sm font-semibold text-olive-700 hover:bg-olive-700/10">
            <ExternalLink className="h-4 w-4" /> Ürünü aç
          </a>
        )}
        {r.status === "open" && (
          <>
            <button onClick={() => act("remove")} disabled={pending} className="flex items-center gap-1.5 rounded-full bg-terra-600 px-4 py-2 text-sm font-semibold text-cream-50 hover:bg-terra-500 disabled:opacity-60">
              {busy === "remove" ? <Loader2 className="h-4 w-4 animate-spin" /> : <EyeOff className="h-4 w-4" />} Yayından kaldır
            </button>
            <button onClick={() => act("dismiss")} disabled={pending} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-olive-900 hover:bg-cream-200 disabled:opacity-60">
              {busy === "dismiss" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />} Geçersiz say
            </button>
          </>
        )}
        {r.status === "removed" && r.listingStatus === "paused" && (
          <button onClick={() => act("restore")} disabled={pending} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-olive-700 hover:bg-cream-200 disabled:opacity-60">
            {busy === "restore" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} Yayına geri al
          </button>
        )}
      </div>
    </motion.article>
  );
}

export default function ReportsAdmin({ items }: { items: ReportItem[] }) {
  const [tab, setTab] = useState<ReportItem["status"]>("open");
  const [error, setError] = useState("");
  const list = items.filter((i) => i.status === tab);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-4xl text-olive-900 md:text-5xl">Ürün bildirimleri</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Aracı hizmet sağlayıcı olarak, hukuka aykırı olduğu bildirilen ürünü gecikmeden incelemen ve gerekirse yayından kaldırman gerekir.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const count = items.filter((i) => i.status === t.key).length;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={`relative rounded-full px-5 py-2.5 text-sm font-semibold ${active ? "" : "border border-sand-400"}`}>
              {active && <motion.span layoutId="report-tab" className="absolute inset-0 rounded-full bg-olive-700" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className={`relative ${active ? "text-cream-50" : "text-olive-900"}`}>{t.label} ({count})</span>
            </button>
          );
        })}
      </div>

      {error && (
        <button onClick={() => setError("")} className="mt-5 block w-full rounded-2xl bg-terra-500/10 px-4 py-3 text-left text-sm font-medium text-terra-600">
          {error}
        </button>
      )}

      <div className="mt-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {list.length === 0 && (
            <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl bg-cream-50 p-10 text-center text-muted shadow-soft">
              Bu listede bildirim yok.
            </motion.p>
          )}
          {list.map((r) => <Card key={r.id} r={r} onError={setError} />)}
        </AnimatePresence>
      </div>
    </div>
  );
}
