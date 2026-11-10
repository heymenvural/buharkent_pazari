"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Banknote, CheckCircle2, ChevronDown, Landmark, Loader2, MapPin, Phone, Truck, X } from "lucide-react";
import { updatePartStatus } from "@/app/actions/orderStatus";
import { formatPrice } from "@/lib/catalog";
import { CARGO_COMPANIES, OPEN_STATUSES, PAYMENT_DAYS, STATUS } from "@/lib/orders";
import type { OrderView } from "@/lib/data/orders.server";

const inputCls = "w-full rounded-2xl border-2 border-sand-300 bg-cream-50 px-4 py-3 outline-none focus:border-olive-500";

function OrderCard({ o, admin }: { o: OrderView; admin?: boolean }) {
  const router = useRouter();
  const p = o.parts[0];
  const [open, setOpen] = useState(OPEN_STATUSES.includes(p.status));
  const [mode, setMode] = useState<null | "ship" | "cancel">(null);
  const [cargo, setCargo] = useState<string>(CARGO_COMPANIES[0]);
  const [trackingNo, setTrackingNo] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const days = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 86_400_000);
  const late = p.status === "pending_payment" && days >= PAYMENT_DAYS;

  const go = (to: "preparing" | "shipped" | "delivered" | "cancelled") =>
    start(async () => {
      setError("");
      const res = await updatePartStatus({ orderId: o.id, partId: p.id, to, cargoCompany: cargo, trackingNo, reason });
      if (!res.ok) return setError(res.error ?? "İşlem başarısız.");
      setMode(null);
      router.refresh();
    });

  return (
    <motion.article layout className="rounded-[1.75rem] bg-cream-50 shadow-soft">
      <button onClick={() => setOpen((x) => !x)} className="flex w-full flex-wrap items-center gap-3 p-5 text-left">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm font-semibold text-olive-900">
            {o.orderNo} {admin && <span className="font-sans font-normal text-muted">· {p.sellerName}</span>}
          </p>
          <p className="truncate text-sm text-muted">
            {o.customer.name} · {p.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
          </p>
        </div>
        <span className="text-xs text-muted">{new Date(o.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS[p.status].cls}`}>{STATUS[p.status].short}</span>
        <span className="font-semibold">{formatPrice(p.total)}</span>
        <ChevronDown className={`h-5 w-5 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-4 border-t border-sand-300 p-5">
              {late && (
                <p className="flex gap-2 rounded-2xl bg-[#e0a84a]/15 p-3 text-sm text-[#7a4f10]">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {days} gündür ödeme bekleniyor. Müşteriyi arayabilir ya da siparişi iptal edebilirsin.
                </p>
              )}

              <ul className="divide-y divide-sand-300">
                {p.items.map((i) => (
                  <li key={`${i.slug}-${i.label}`} className="flex items-center gap-3 py-2.5">
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-sand-300">
                      {i.image && <Image src={i.image} alt="" fill sizes="48px" className="object-cover" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <b className="text-ink">{i.qty} ×</b> {i.name} <span className="text-muted">({i.label})</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold">{formatPrice(i.qty * i.price)}</span>
                  </li>
                ))}
              </ul>
              <p className="flex justify-between text-sm text-muted">
                <span>Kargo: {p.shipping === 0 ? "ücretsiz" : formatPrice(p.shipping)}</span>
                <span className="font-semibold text-ink">Toplam {formatPrice(p.total)}</span>
              </p>

              <div className="grid gap-3 rounded-2xl bg-cream-200 p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-ink">{o.customer.name}</p>
                  <a href={`tel:${o.customer.phone}`} className="mt-1 flex items-center gap-1.5 text-olive-700"><Phone className="h-4 w-4" /> {o.customer.phone}</a>
                  <p className="mt-1 flex gap-1.5 text-ink/80"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {o.address.address}, {o.address.district} / {o.address.city}</p>
                  {o.note && <p className="mt-2 text-ink/70">Not: {o.note}</p>}
                </div>
                <div className="sm:text-right">
                  <p className="flex items-center gap-1.5 font-semibold text-ink sm:justify-end">
                    {o.payment === "havale" ? <Landmark className="h-4 w-4" /> : <Banknote className="h-4 w-4" />}
                    {o.payment === "havale" ? "Havale / EFT" : "Kapıda ödeme"}
                  </p>
                  <p className="mt-1 text-ink/70">
                    {o.payment === "havale"
                      ? p.status === "pending_payment"
                        ? `Hesabına ${formatPrice(p.total)} gelmesini bekle (açıklama: ${o.orderNo}).`
                        : "Ödeme alındı."
                      : `Kargo ${formatPrice(p.total)} tahsil edecek.`}
                  </p>
                  {p.trackingNo && <p className="mt-1 text-ink/70">{p.cargoCompany} · <span className="font-mono">{p.trackingNo}</span></p>}
                  {p.cancelReason && <p className="mt-1 text-terra-600">İptal: {p.cancelReason}</p>}
                </div>
              </div>

              {error && <p className="rounded-2xl bg-terra-500/10 px-4 py-3 text-sm font-medium text-terra-600">{error}</p>}

              {mode === "ship" && (
                <div className="grid gap-3 rounded-2xl border-2 border-olive-700 p-4 sm:grid-cols-[1fr_1fr_auto]">
                  <select value={cargo} onChange={(e) => setCargo(e.target.value)} className={inputCls}>
                    {CARGO_COMPANIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <input value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)} maxLength={40} placeholder="Takip numarası" className={`${inputCls} font-mono`} />
                  <button onClick={() => go("shipped")} disabled={pending} className="flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-olive-700 px-5 font-semibold text-cream-50 disabled:opacity-60">
                    {pending && <Loader2 className="h-4 w-4 animate-spin" />} Kaydet
                  </button>
                </div>
              )}
              {mode === "cancel" && (
                <div className="space-y-2 rounded-2xl border-2 border-terra-500 p-4">
                  <textarea rows={2} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Müşteriye iletilecek sebep (örn: ürün tükendi)" className={`${inputCls} resize-none`} />
                  <p className="text-xs text-muted">Ürünler stoğa geri eklenir, müşteriye e-posta gider.</p>
                  <button onClick={() => go("cancelled")} disabled={pending} className="flex min-h-[44px] items-center gap-2 rounded-full bg-terra-600 px-5 font-semibold text-cream-50 disabled:opacity-60">
                    {pending && <Loader2 className="h-4 w-4 animate-spin" />} Siparişi iptal et
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {p.status === "pending_payment" && (
                  <button onClick={() => go("preparing")} disabled={pending} className="flex min-h-[48px] items-center gap-2 rounded-full bg-olive-700 px-5 font-semibold text-cream-50 disabled:opacity-60">
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />} Ödeme geldi
                  </button>
                )}
                {p.status === "preparing" && mode !== "ship" && (
                  <button onClick={() => setMode("ship")} className="flex min-h-[48px] items-center gap-2 rounded-full bg-olive-700 px-5 font-semibold text-cream-50">
                    <Truck className="h-5 w-5" /> Kargoya verdim
                  </button>
                )}
                {p.status === "shipped" && (
                  <button onClick={() => go("delivered")} disabled={pending} className="flex min-h-[48px] items-center gap-2 rounded-full bg-olive-700 px-5 font-semibold text-cream-50 disabled:opacity-60">
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />} Teslim edildi
                  </button>
                )}
                {(p.status === "pending_payment" || p.status === "preparing") && mode !== "cancel" && (
                  <button onClick={() => setMode("cancel")} className="flex min-h-[48px] items-center gap-2 rounded-full px-5 font-semibold text-terra-600 hover:bg-terra-500/10">
                    <X className="h-5 w-5" /> İptal et
                  </button>
                )}
                {mode && (
                  <button onClick={() => setMode(null)} className="min-h-[48px] rounded-full px-5 font-semibold text-muted">Vazgeç</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

const FILTERS = [
  { key: "open", label: "Açık", test: (s: string) => OPEN_STATUSES.includes(s as never) },
  { key: "done", label: "Teslim edilen", test: (s: string) => s === "delivered" },
  { key: "cancelled", label: "İptal", test: (s: string) => s === "cancelled" },
] as const;

/** Siparişler listesi: her kayıtta tek paket (üreticinin kendi paketi) bulunur */
export default function SellerOrders({ orders, admin }: { orders: OrderView[]; admin?: boolean }) {
  const [f, setF] = useState<(typeof FILTERS)[number]["key"]>("open");
  const filter = FILTERS.find((x) => x.key === f)!;
  const list = orders.filter((o) => filter.test(o.parts[0].status));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((x) => {
          const n = orders.filter((o) => x.test(o.parts[0].status)).length;
          return (
            <button
              key={x.key}
              onClick={() => setF(x.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${f === x.key ? "bg-olive-700 text-cream-50" : "border border-sand-400 text-olive-900"}`}
            >
              {x.label} ({n})
            </button>
          );
        })}
      </div>
      <div className="mt-4 space-y-3">
        {list.length === 0 && <p className="rounded-3xl bg-cream-50 p-8 text-center text-muted shadow-soft">Bu listede sipariş yok.</p>}
        {list.map((o) => <OrderCard key={`${o.id}-${o.parts[0].id}`} o={o} admin={admin} />)}
      </div>
    </div>
  );
}
