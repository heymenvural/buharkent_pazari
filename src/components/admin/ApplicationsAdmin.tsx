"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle, BadgeCheck, Building2, CalendarDays, Check, CheckCircle2, ChevronDown, Clock, Eye, FileCheck2,
  Loader2, Mail, MapPin, Phone, Wallet, X, XCircle,
} from "lucide-react";
import { decideDocument, decideSeller } from "@/app/actions/admin";

export type AdminDoc = {
  key: string;
  name: string;
  for: string[];
  row?: { id: string; status: "pending" | "approved" | "rejected"; note?: string; updatedAt: string };
};

export type AppItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "pending" | "approved" | "rejected";
  address: string;
  sellerType: string;
  products: string[];
  tax: string;
  since?: number;
  iban: string;
  ibanName?: string;
  description: string;
  createdAt: string;
  rejectReason?: string;
  slug?: string;
  verified: boolean;
  docs: AdminDoc[];
};

const typeLabel: Record<string, string> = { "kadin-girisimci": "Kadın girişimci", "genc-ciftci": "Genç çiftçi", diger: "Diğer üretici" };
const tabs = [
  { key: "pending" as const, label: "Bekleyen" },
  { key: "approved" as const, label: "Onaylanan" },
  { key: "rejected" as const, label: "Reddedilen" },
];
const chip = {
  none: { label: "Yüklenmedi", cls: "bg-sand-300 text-olive-900", icon: Clock },
  pending: { label: "İncelenmeli", cls: "bg-[#e0a84a]/20 text-[#7a4f10]", icon: Clock },
  approved: { label: "Onaylı", cls: "bg-olive-500/20 text-olive-700", icon: CheckCircle2 },
  rejected: { label: "Düzeltme istendi", cls: "bg-terra-500/15 text-terra-600", icon: XCircle },
};

function DocRow({ d, onDone }: { d: AdminDoc; onDone: (err?: string) => void }) {
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const c = chip[d.row?.status ?? "none"];
  const Icon = c.icon;

  const act = async (decision: "approve" | "reject") => {
    if (!d.row) return;
    setBusy(true);
    const res = await decideDocument(d.row.id, decision, note);
    setBusy(false);
    if (res.ok) {
      setRejecting(false);
      setNote("");
    }
    onDone(res.ok ? undefined : res.error);
  };

  return (
    <div className="rounded-2xl border border-sand-300 bg-cream-100 p-4">
      <div className="flex flex-wrap items-start gap-3">
        <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-olive-700" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{d.name}</p>
          <p className="text-xs text-muted">{d.for.join(", ")}</p>
        </div>
        <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${c.cls}`}>
          <Icon className="h-3.5 w-3.5" /> {c.label}
        </span>
      </div>
      {d.row?.note && d.row.status === "rejected" && <p className="mt-2 text-sm text-terra-600">Not: {d.row.note}</p>}

      {d.row && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <a href={`/api/belgeler/${d.row.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-olive-700 px-4 py-2 text-sm font-semibold text-olive-700 hover:bg-olive-700/10">
            <Eye className="h-4 w-4" /> Belgeyi aç
          </a>
          {d.row.status !== "approved" && !rejecting && (
            <button onClick={() => act("approve")} disabled={busy} className="flex items-center gap-1.5 rounded-full bg-olive-700 px-4 py-2 text-sm font-semibold text-cream-50 hover:bg-olive-900 disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Onayla
            </button>
          )}
          {d.row.status !== "rejected" && !rejecting && (
            <button onClick={() => setRejecting(true)} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-terra-600 hover:bg-terra-500/10">
              <X className="h-4 w-4" /> Düzeltme iste
            </button>
          )}
        </div>
      )}

      {rejecting && (
        <div className="mt-3 space-y-2">
          <textarea
            rows={2}
            maxLength={300}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Örn: Fotoğraf bulanık, yazılar okunmuyor. Lütfen tekrar çek."
            className="w-full resize-none rounded-2xl border border-sand-300 bg-cream-50 px-4 py-3 text-sm outline-none focus:border-olive-500"
          />
          <div className="flex gap-2">
            <button onClick={() => act("reject")} disabled={busy} className="flex items-center gap-1.5 rounded-full bg-terra-600 px-4 py-2 text-sm font-semibold text-cream-50 disabled:opacity-60">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Gönder
            </button>
            <button onClick={() => setRejecting(false)} className="rounded-full px-4 py-2 text-sm font-semibold text-olive-900">
              Vazgeç
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AppCard({ a, onError }: { a: AppItem; onError: (e: string) => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(a.status === "pending");
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmForce, setConfirmForce] = useState(false);
  const [pending, startTransition] = useTransition();

  const missing = a.docs.filter((d) => d.row?.status !== "approved");
  const waiting = a.docs.filter((d) => d.row?.status === "pending").length;

  const decide = (decision: "approve" | "reject", force = false) =>
    startTransition(async () => {
      const res = await decideSeller(a.id, decision, decision === "reject" ? reason : undefined, force);
      if (!res.ok) return onError(res.error ?? "İşlem başarısız.");
      setRejecting(false);
      setConfirmForce(false);
      router.refresh();
    });

  const docDone = (err?: string) => (err ? onError(err) : router.refresh());

  return (
    <motion.article layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 60 }} className="rounded-[1.75rem] bg-cream-50 shadow-soft">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full flex-col gap-3 p-6 text-left md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-2xl text-olive-900">
            {a.name} {a.verified && <BadgeCheck className="h-5 w-5 text-olive-700" />}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <MapPin className="h-4 w-4 shrink-0" /> {a.address}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {a.docs.length > 0 && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${missing.length ? "bg-[#e0a84a]/20 text-[#7a4f10]" : "bg-olive-500/20 text-olive-700"}`}>
              Belgeler {a.docs.length - missing.length}/{a.docs.length}
              {waiting > 0 && ` · ${waiting} incelenmeli`}
            </span>
          )}
          <span className="text-xs text-muted">{new Date(a.createdAt).toLocaleDateString("tr-TR")}</span>
          <ChevronDown className={`h-5 w-5 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-6 border-t border-sand-300 p-6">
              {/* Kişi */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink/80">
                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-muted" /> {a.email}</span>
                <a href={`tel:${a.phone}`} className="flex items-center gap-1.5 hover:text-olive-700"><Phone className="h-4 w-4 text-muted" /> {a.phone}</a>
                {a.since && <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-muted" /> {a.since}&apos;den beri</span>}
                <span className="rounded-full bg-fig-600/10 px-3 py-0.5 text-xs font-semibold text-fig-600">{typeLabel[a.sellerType] ?? a.sellerType}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {a.products.map((p) => (
                  <span key={p} className="rounded-full bg-olive-500/15 px-3 py-1 text-xs font-semibold text-olive-700">{p}</span>
                ))}
              </div>

              <p className="whitespace-pre-line rounded-2xl bg-cream-100 p-4 text-sm leading-relaxed text-ink/80">{a.description}</p>

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex gap-2 rounded-2xl bg-cream-100 p-4">
                  <Building2 className="h-5 w-5 shrink-0 text-olive-700" />
                  <div><p className="text-xs text-muted">Vergi durumu</p><p className="font-semibold text-ink">{a.tax}</p></div>
                </div>
                <div className="flex gap-2 rounded-2xl bg-cream-100 p-4">
                  <Wallet className="h-5 w-5 shrink-0 text-olive-700" />
                  <div>
                    <p className="text-xs text-muted">IBAN</p>
                    <p className="font-mono font-semibold text-ink">{a.iban || "-"}</p>
                    {a.ibanName && <p className="text-xs text-muted">{a.ibanName}{a.ibanName.toLocaleLowerCase("tr") !== a.name.toLocaleLowerCase("tr") && " · ad soyadla eşleşmiyor, kontrol et"}</p>}
                  </div>
                </div>
              </div>

              {/* Belgeler */}
              <div>
                <p className="mb-3 font-semibold text-olive-900">Belgeler</p>
                {a.docs.length === 0 ? (
                  <p className="text-sm text-muted">Bu ürünler için belge gerekmiyor.</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {a.docs.map((d) => <DocRow key={d.key} d={d} onDone={docDone} />)}
                  </div>
                )}
              </div>

              {a.rejectReason && <p className="text-sm text-terra-600">Red notu: {a.rejectReason}</p>}
              {a.slug && (
                <a href={`/uretici/${a.slug}`} target="_blank" className="inline-block text-sm font-semibold text-olive-700 underline">
                  Mağaza sayfasını aç
                </a>
              )}

              {/* Karar */}
              <div className="border-t border-sand-300 pt-5">
                {rejecting ? (
                  <div className="space-y-3">
                    <textarea
                      rows={2}
                      maxLength={300}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Red sebebi (üreticiye e-postayla iletilir)"
                      className="w-full resize-none rounded-2xl border border-sand-300 bg-cream-100 px-4 py-3 text-sm outline-none focus:border-olive-500"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => decide("reject")} disabled={pending} className="flex items-center gap-2 rounded-full bg-terra-600 px-5 py-2.5 text-sm font-semibold text-cream-50 disabled:opacity-60">
                        {pending && <Loader2 className="h-4 w-4 animate-spin" />} {a.status === "approved" ? "Satış iznini kaldır" : "Reddi onayla"}
                      </button>
                      <button onClick={() => setRejecting(false)} className="rounded-full border border-sand-400 px-5 py-2.5 text-sm font-semibold text-olive-900">Vazgeç</button>
                    </div>
                  </div>
                ) : confirmForce ? (
                  <div className="space-y-3 rounded-2xl bg-[#e0a84a]/15 p-4">
                    <p className="flex gap-2 text-sm text-[#7a4f10]">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      {missing.length} belge onaylı değil. Üretici satışa açılır ama &quot;doğrulanmış&quot; rozeti almaz. Emin misin?
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => decide("approve", true)} disabled={pending} className="flex items-center gap-2 rounded-full bg-[#7a4f10] px-5 py-2.5 text-sm font-semibold text-cream-50 disabled:opacity-60">
                        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Eksik belgeyle onayla
                      </button>
                      <button onClick={() => setConfirmForce(false)} className="rounded-full px-5 py-2.5 text-sm font-semibold text-olive-900">Vazgeç</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    {a.status !== "approved" && (
                      <button
                        onClick={() => (missing.length ? setConfirmForce(true) : decide("approve"))}
                        disabled={pending}
                        className="flex items-center gap-2 rounded-full bg-olive-700 px-5 py-2.5 text-sm font-semibold text-cream-50 hover:bg-olive-900 disabled:opacity-60"
                      >
                        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Satış izni ver
                      </button>
                    )}
                    {a.status !== "rejected" && (
                      <button onClick={() => setRejecting(true)} className="flex items-center gap-2 rounded-full border border-terra-500 px-5 py-2.5 text-sm font-semibold text-terra-600 hover:bg-terra-500/10">
                        <X className="h-4 w-4" /> {a.status === "approved" ? "Satış iznini kaldır" : "Reddet"}
                      </button>
                    )}
                    {a.status !== "approved" && missing.length > 0 && <span className="text-xs text-muted">Önce belgeleri incelemen önerilir.</span>}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default function ApplicationsAdmin({ items }: { items: AppItem[] }) {
  const [tab, setTab] = useState<AppItem["status"]>("pending");
  const [error, setError] = useState("");
  const list = items.filter((i) => i.status === tab);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-4xl text-olive-900 md:text-5xl">Üretici başvuruları</h1>

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const count = items.filter((i) => i.status === t.key).length;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={`relative rounded-full px-5 py-2.5 text-sm font-semibold ${active ? "" : "border border-sand-400"}`}>
              {active && <motion.span layoutId="admin-tab" className="absolute inset-0 rounded-full bg-olive-700" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
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
              Bu listede başvuru yok.
            </motion.p>
          )}
          {list.map((a) => <AppCard key={a.id} a={a} onError={setError} />)}
        </AnimatePresence>
      </div>
    </div>
  );
}
