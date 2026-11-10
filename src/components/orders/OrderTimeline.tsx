import { Check, X } from "lucide-react";
import { STATUS, type PartStatus, type PaymentMethod } from "@/lib/orders";

/** Paketin hangi aşamada olduğunu gösteren adım çizgisi */
export default function OrderTimeline({ status, payment, history }: { status: PartStatus; payment: PaymentMethod; history: { status: PartStatus; at: string }[] }) {
  if (status === "cancelled") {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-terra-500/10 px-4 py-3 text-sm font-semibold text-terra-600">
        <X className="h-4 w-4" /> Bu paket iptal edildi
      </p>
    );
  }
  const steps: PartStatus[] = payment === "havale" ? ["pending_payment", "preparing", "shipped", "delivered"] : ["preparing", "shipped", "delivered"];
  const current = steps.indexOf(status);
  const when = (s: PartStatus) => history.find((h) => h.status === s)?.at;
  const label = (s: PartStatus) => (s === "pending_payment" ? "Sipariş alındı" : STATUS[s].label);

  return (
    <ol className="grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((s, i) => {
        const doneStep = i < current || (i === current && s === "delivered");
        const active = i === current && s !== "delivered";
        const at = when(s);
        return (
          <li key={s} className="min-w-0">
            <div className={`h-1.5 rounded-full ${i <= current ? "bg-olive-700" : "bg-sand-300"}`} />
            <p className={`mt-2 flex items-center gap-1 text-xs font-semibold ${i <= current ? "text-olive-900" : "text-muted"}`}>
              {doneStep && <Check className="h-3.5 w-3.5 shrink-0" />}
              {active && <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-terra-500" />}
              <span className="truncate">{active && s === "pending_payment" ? "Ödeme bekleniyor" : label(s)}</span>
            </p>
            {at && i <= current && <p className="text-[11px] text-muted">{new Date(at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</p>}
          </li>
        );
      })}
    </ol>
  );
}
