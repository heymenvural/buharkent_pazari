"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { setSellerDemo, toggleDemo } from "@/app/actions/launch";

export type DemoSeller = { id: string; name: string; demo: boolean; listings: number };

const fmt = (iso: string) => new Date(iso).toLocaleString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export default function DemoPanel({ mode, sellers }: { mode: { on: boolean; until: string | null }; sellers: DemoSeller[] }) {
  const [state, setState] = useState(mode);
  const [list, setList] = useState(sellers);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const demoCount = list.filter((s) => s.demo).length;

  const toggle = (on: boolean, hours: number | null) =>
    start(async () => {
      setError("");
      const r = await toggleDemo(on, hours);
      if (r.ok) setState({ on, until: r.until ?? null });
      else setError(r.error ?? "Bir sorun oldu.");
    });

  const mark = (s: DemoSeller) =>
    start(async () => {
      setError("");
      const r = await setSellerDemo(s.id, !s.demo);
      if (r.ok) setList((l) => l.map((x) => (x.id === s.id ? { ...x, demo: !x.demo } : x)));
      else setError(r.error ?? "Bir sorun oldu.");
    });

  return (
    <div>
      <div className={`flex items-start gap-3 rounded-2xl p-4 ${state.on ? "bg-[#e0a84a]/20" : "bg-olive-500/10"}`}>
        {state.on ? <Eye className="mt-0.5 h-5 w-5 shrink-0 text-terra-600" /> : <EyeOff className="mt-0.5 h-5 w-5 shrink-0 text-olive-700" />}
        <p className="text-[15px] text-ink">
          {state.on ? (
            <>
              <b>Prototipler şu an herkese görünüyor.</b> {state.until ? `${fmt(state.until)} saatinde kendiliğinden gizlenecek.` : "Sen kapatana kadar açık kalacak."} Örnek ürünler satın alınamaz.
            </>
          ) : (
            <>
              <b>Prototipler gizli.</b> Sitede sadece gerçek üreticiler görünür. Tanıtım yapacağın zaman aşağıdan aç.
            </>
          )}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {state.on ? (
          <button type="button" disabled={pending} onClick={() => toggle(false, null)} className="rounded-full bg-olive-700 px-5 py-2.5 font-semibold text-cream-50 disabled:opacity-50">
            Prototipleri gizle
          </button>
        ) : (
          <>
            <button type="button" disabled={pending} onClick={() => toggle(true, 2)} className="rounded-full bg-terra-500 px-5 py-2.5 font-semibold text-cream-50 disabled:opacity-50">
              2 saatliğine göster
            </button>
            <button type="button" disabled={pending} onClick={() => toggle(true, 24)} className="rounded-full border border-terra-500 px-5 py-2.5 font-semibold text-terra-600 disabled:opacity-50">
              24 saat
            </button>
            <button type="button" disabled={pending} onClick={() => toggle(true, null)} className="rounded-full border border-sand-400 px-5 py-2.5 font-semibold text-olive-900 disabled:opacity-50">
              Süresiz
            </button>
          </>
        )}
      </div>
      <p className="mt-2 text-sm text-muted">Değişiklik sitede en geç 1 dakika içinde görünür.</p>
      {error && <p className="mt-2 text-sm font-semibold text-terra-600">{error}</p>}

      <h3 className="mt-6 font-sans text-base font-semibold text-ink">Üreticiler ({demoCount} prototip)</h3>
      <p className="mt-1 text-sm text-muted">Test için açtığın hesapları da prototip yapabilirsin; gerçek üretici olunca &quot;Gerçek&quot;e çevir.</p>
      <ul className="mt-3 divide-y divide-sand-300 rounded-2xl border border-sand-300">
        {list.map((s) => (
          <li key={s.id} className="flex items-center gap-3 px-4 py-3">
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-ink">{s.name}</span>
              <span className="text-sm text-muted">{s.listings} ürün</span>
            </span>
            <button
              type="button"
              disabled={pending}
              onClick={() => mark(s)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold disabled:opacity-50 ${s.demo ? "bg-[#e0a84a]/25 text-olive-900" : "bg-olive-500/15 text-olive-700"}`}
            >
              {s.demo ? "Prototip" : "Gerçek"}
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="px-4 py-3 text-sm text-muted">Henüz üretici yok.</li>}
      </ul>
    </div>
  );
}
