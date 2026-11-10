"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { clearDemoData } from "@/app/actions/launch";

export default function DemoCleaner({ counts }: { counts: { sellers: number; listings: number; reviews: number } }) {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const empty = counts.sellers + counts.listings + counts.reviews === 0;

  if (empty && !msg) return <p className="text-[15px] text-olive-700">✓ Sitede örnek veri kalmadı.</p>;

  return (
    <div>
      {!msg?.ok && (
        <>
          <p className="text-[15px] text-muted">
            Sitede şu an <b className="text-ink">{counts.sellers} örnek üretici</b>, <b className="text-ink">{counts.listings} örnek ilan</b> ve{" "}
            <b className="text-ink">{counts.reviews} örnek yorum</b> var. Gerçek üreticiler gelmeden silersen ürün sayfaları boş görünür. Bu işlem geri alınamaz.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Onay için SİL yaz"
              className="min-w-0 flex-1 rounded-full border border-sand-400 bg-cream-50 px-4 py-2.5 outline-none focus:border-olive-500"
            />
            <button
              type="button"
              disabled={pending || text.trim().toLocaleUpperCase("tr-TR") !== "SİL"}
              onClick={() =>
                start(async () => {
                  const r = await clearDemoData(text);
                  setMsg(
                    r.ok
                      ? { ok: true, text: `Silindi: ${Object.entries(r.removed ?? {}).map(([k, v]) => `${v} ${k}`).join(", ")}.` }
                      : { ok: false, text: r.error ?? "Bir sorun oldu." }
                  );
                })
              }
              className="inline-flex items-center justify-center gap-2 rounded-full bg-terra-600 px-5 py-2.5 font-semibold text-cream-50 disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" /> {pending ? "Siliniyor…" : "Örnek verileri sil"}
            </button>
          </div>
        </>
      )}
      {msg && <p className={`mt-3 text-[15px] font-semibold ${msg.ok ? "text-olive-700" : "text-terra-600"}`}>{msg.text}</p>}
    </div>
  );
}
