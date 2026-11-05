"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Flag, Loader2, X } from "lucide-react";
import { reportListing } from "@/app/actions/report";
import { REPORT_REASONS } from "@/lib/reports";

const ease = [0.76, 0, 0.24, 1] as const;

export default function ReportButton({ offerId, productName, sellerName }: { offerId: string; productName: string; sellerName: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setDone(false);
      setReason("");
      setNote("");
      setErrors({});
    }, 300);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const submit = async () => {
    if (!reason) return setErrors({ reason: "Bir sebep seç" });
    setLoading(true);
    const res = await reportListing({ offerId, reason, note, email });
    setLoading(false);
    if (!res.ok) return setErrors(res.errors ?? { form: "Bir sorun oluştu." });
    setDone(true);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="mt-4 flex items-center gap-1.5 text-sm text-muted underline-offset-4 hover:text-terra-600 hover:underline">
        <Flag className="h-4 w-4" /> Bu ürünü bildir
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            data-lenis-prevent
          >
            <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={close} />
            <motion.div
              className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-[1.75rem] bg-cream-50 p-6 shadow-2xl sm:rounded-[1.75rem] md:p-8"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.45, ease }}
            >
              <button onClick={close} aria-label="Kapat" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full hover:bg-cream-200">
                <X className="h-5 w-5" />
              </button>

              {done ? (
                <div className="py-6 text-center">
                  <CheckCircle2 className="mx-auto h-14 w-14 text-olive-700" />
                  <h2 className="mt-4 text-2xl text-olive-900">Bildirimin alındı</h2>
                  <p className="mt-2 text-muted">Ekibimiz en kısa sürede inceleyecek. Kurallara aykırıysa ürün yayından kaldırılacak.</p>
                  <button onClick={close} className="mt-6 rounded-full bg-olive-700 px-6 py-3 font-semibold text-cream-50">Tamam</button>
                </div>
              ) : (
                <>
                  <h2 id="report-title" className="pr-10 text-2xl text-olive-900">Bu ürünü bildir</h2>
                  <p className="mt-1 text-sm text-muted">{productName} · {sellerName}</p>

                  <div className="mt-5 space-y-2">
                    {REPORT_REASONS.map((r) => (
                      <label key={r.key} className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-colors ${reason === r.key ? "border-olive-700 bg-cream-100" : "border-sand-300"}`}>
                        <input type="radio" name="reason" value={r.key} checked={reason === r.key} onChange={() => { setReason(r.key); setErrors({}); }} className="h-5 w-5 accent-[#4a5627]" />
                        <span className="text-sm font-medium text-ink">{r.label}</span>
                      </label>
                    ))}
                    {errors.reason && <p className="text-sm font-medium text-terra-600">{errors.reason}</p>}
                  </div>

                  <label className="mt-4 block">
                    <span className="mb-1.5 block text-sm font-semibold text-ink">Açıklama {reason !== "diger" && <span className="font-normal text-muted">(isteğe bağlı)</span>}</span>
                    <textarea rows={3} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} className="w-full resize-none rounded-2xl border-2 border-sand-300 bg-cream-50 px-4 py-3 text-sm outline-none focus:border-olive-500" />
                    {errors.note && <span className="text-sm font-medium text-terra-600">{errors.note}</span>}
                  </label>

                  <label className="mt-3 block">
                    <span className="mb-1.5 block text-sm font-semibold text-ink">E-postan <span className="font-normal text-muted">(sonucu bildirmemiz için, isteğe bağlı)</span></span>
                    <input type="email" maxLength={120} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border-2 border-sand-300 bg-cream-50 px-4 py-3 text-sm outline-none focus:border-olive-500" />
                    {errors.email && <span className="text-sm font-medium text-terra-600">{errors.email}</span>}
                  </label>

                  {errors.form && <p className="mt-3 rounded-2xl bg-terra-500/10 px-4 py-3 text-sm font-medium text-terra-600">{errors.form}</p>}

                  <button onClick={submit} disabled={loading} className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-terra-500 font-semibold text-cream-50 hover:bg-terra-600 disabled:opacity-60">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Flag className="h-5 w-5" />} Bildirimi gönder
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
