"use client";

import { useState, useTransition } from "react";
import { Check, Star } from "lucide-react";
import { submitReview } from "@/app/actions/review";

export default function ReviewForm({ orderNo, token, listingId, defaultName }: { orderNo: string; token?: string; listingId: string; defaultName: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  if (done) return <p className="flex items-center gap-1.5 text-sm font-semibold text-olive-700"><Check className="h-4 w-4" /> Yorumun için teşekkürler!</p>;
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded-full bg-cream-200 px-4 py-1.5 text-sm font-semibold text-olive-900 hover:bg-sand-300">
        <Star className="h-4 w-4" /> Değerlendir
      </button>
    );

  const send = () =>
    start(async () => {
      setError("");
      const r = await submitReview({ orderNo, token, listingId, rating, text, name });
      if (r.ok) setDone(true);
      else setError(r.error ?? "Bir sorun oldu.");
    });

  return (
    <div className="w-full space-y-3 rounded-2xl bg-cream-200 p-4">
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-label={`${n} yıldız`} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)}>
            <Star className={`h-7 w-7 ${(hover || rating) >= n ? "fill-terra-500 text-terra-500" : "text-sand-400"}`} />
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="Ürün nasıldı? Tadı, tazeliği, paketlemesi…"
        className="w-full rounded-xl border border-sand-300 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-olive-500"
      />
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder="Görünecek adın"
          className="min-w-0 flex-1 rounded-xl border border-sand-300 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-olive-500"
        />
        <button type="button" disabled={pending || !rating} onClick={send} className="rounded-full bg-olive-900 px-5 py-2 text-sm font-semibold text-cream-50 disabled:opacity-50">
          {pending ? "Gönderiliyor…" : "Gönder"}
        </button>
      </div>
      {error && <p className="text-sm text-terra-600">{error}</p>}
    </div>
  );
}
