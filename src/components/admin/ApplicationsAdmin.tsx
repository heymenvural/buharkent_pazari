"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Mail, MapPin, Phone, X } from "lucide-react";
import { decideSeller } from "@/app/actions/admin";
import { getCategory } from "@/lib/catalog";

export type AppItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "pending" | "approved" | "rejected";
  village: string;
  sellerType: string;
  categories: string[];
  description: string;
  createdAt: string;
  rejectReason?: string;
};

const typeLabel: Record<string, string> = { "kadin-girisimci": "Kadın girişimci", "genc-ciftci": "Genç çiftçi", diger: "Diğer üretici" };
const tabs = [
  { key: "pending" as const, label: "Bekleyen" },
  { key: "approved" as const, label: "Onaylanan" },
  { key: "rejected" as const, label: "Reddedilen" },
];

export default function ApplicationsAdmin({ items }: { items: AppItem[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<AppItem["status"]>("pending");
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  const list = items.filter((i) => i.status === tab);

  const act = (id: string, decision: "approve" | "reject") => {
    setBusy(id);
    setError("");
    startTransition(async () => {
      const res = await decideSeller(id, decision, decision === "reject" ? reason : undefined);
      setBusy(null);
      if (!res.ok) return setError(res.error ?? "İşlem başarısız.");
      setRejecting(null);
      setReason("");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-terra-500">Yönetim</span>
      <h1 className="mt-3 text-4xl text-olive-900 md:text-5xl">Üretici başvuruları</h1>

      <div className="mt-8 flex gap-2">
        {tabs.map((t) => {
          const count = items.filter((i) => i.status === t.key).length;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={`relative rounded-full px-5 py-2.5 text-sm font-semibold ${active ? "" : "border border-sand-400"}`}>
              {active && <motion.span layoutId="admin-tab" className="absolute inset-0 rounded-full bg-olive-700" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className={`relative ${active ? "text-cream-50" : "text-olive-900"}`}>
                {t.label} ({count})
              </span>
            </button>
          );
        })}
      </div>

      {error && <p className="mt-5 rounded-2xl bg-terra-500/10 px-4 py-3 text-sm font-medium text-terra-600">{error}</p>}

      <div className="mt-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {list.length === 0 && (
            <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl bg-cream-50 p-10 text-center text-muted shadow-soft">
              Bu listede başvuru yok.
            </motion.p>
          )}
          {list.map((a) => (
            <motion.article
              key={a.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 60 }}
              className="rounded-[1.75rem] bg-cream-50 p-6 shadow-soft"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-2xl text-olive-900">{a.name}</h2>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted">
                    <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {a.email}</span>
                    <a href={`tel:${a.phone}`} className="flex items-center gap-1.5 hover:text-olive-700"><Phone className="h-4 w-4" /> {a.phone}</a>
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {a.village}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-fig-600/10 px-3 py-1 text-xs font-semibold text-fig-600">{typeLabel[a.sellerType] ?? a.sellerType}</span>
                    {a.categories.map((c) => (
                      <span key={c} className="rounded-full bg-olive-500/15 px-3 py-1 text-xs font-semibold text-olive-700">
                        {getCategory(c)?.name ?? c}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted">{new Date(a.createdAt).toLocaleString("tr-TR")}</span>
              </div>

              <p className="mt-4 whitespace-pre-line rounded-2xl bg-cream-100 p-4 text-sm leading-relaxed text-ink/80">{a.description}</p>
              {a.rejectReason && <p className="mt-3 text-sm text-terra-600">Red notu: {a.rejectReason}</p>}

              {a.status === "pending" && (
                <div className="mt-5">
                  {rejecting === a.id ? (
                    <div className="space-y-3">
                      <textarea
                        rows={2}
                        maxLength={300}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Red sebebi (isteğe bağlı, üreticiye e-postayla iletilir)"
                        className="w-full resize-none rounded-2xl border border-sand-300 bg-cream-100 px-4 py-3 text-sm outline-none focus:border-olive-500"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => act(a.id, "reject")} disabled={busy === a.id} className="flex items-center gap-2 rounded-full bg-terra-600 px-5 py-2.5 text-sm font-semibold text-cream-50 disabled:opacity-60">
                          {busy === a.id && <Loader2 className="h-4 w-4 animate-spin" />} Reddi onayla
                        </button>
                        <button onClick={() => setRejecting(null)} className="rounded-full border border-sand-400 px-5 py-2.5 text-sm font-semibold text-olive-900">
                          Vazgeç
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => act(a.id, "approve")} disabled={busy === a.id} className="flex items-center gap-2 rounded-full bg-olive-700 px-5 py-2.5 text-sm font-semibold text-cream-50 hover:bg-olive-900 disabled:opacity-60">
                        {busy === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Onayla
                      </button>
                      <button onClick={() => setRejecting(a.id)} className="flex items-center gap-2 rounded-full border border-terra-500 px-5 py-2.5 text-sm font-semibold text-terra-600 hover:bg-terra-500/10">
                        <X className="h-4 w-4" /> Reddet
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}