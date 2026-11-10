"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Eye, EyeOff, ShoppingBag, Star } from "lucide-react";
import { setReviewStatus } from "@/app/actions/review";

export type ReviewItem = {
  id: string;
  name: string;
  rating: number;
  text: string;
  status: "published" | "hidden";
  verified: boolean;
  createdAt: string;
  product: string;
  productUrl?: string;
  seller: string;
};

export default function ReviewsAdmin({ items }: { items: ReviewItem[] }) {
  const [list, setList] = useState(items);
  const [filter, setFilter] = useState<"all" | "published" | "hidden" | "low">("all");
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const shown = list.filter((r) => (filter === "all" ? true : filter === "low" ? r.rating <= 2 : r.status === filter));

  const toggle = (r: ReviewItem) =>
    start(async () => {
      setError("");
      const to = r.status === "published" ? "hidden" : "published";
      const res = await setReviewStatus(r.id, to);
      if (res.ok) setList((l) => l.map((x) => (x.id === r.id ? { ...x, status: to } : x)));
      else setError(res.error ?? "Bir sorun oldu.");
    });

  const tabs = [
    ["all", "Tümü"],
    ["published", "Yayında"],
    ["hidden", "Gizli"],
    ["low", "1–2 yıldız"],
  ] as const;

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-4xl text-olive-900">Yorumlar</h1>
      <p className="mt-1 text-muted">Hakaret, kişisel bilgi ya da ürünle ilgisiz yorumları gizleyebilirsin. Gizlenen yorum puana sayılmaz.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map(([k, label]) => (
          <button key={k} type="button" onClick={() => setFilter(k)} className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === k ? "bg-olive-900 text-cream-50" : "bg-cream-50 text-olive-900 shadow-soft"}`}>
            {label}
          </button>
        ))}
      </div>
      {error && <p className="mt-4 text-sm text-terra-600">{error}</p>}
      {shown.length === 0 && <p className="mt-10 text-center text-muted">Burada yorum yok.</p>}
      <ul className="mt-6 space-y-3">
        {shown.map((r) => (
          <li key={r.id} className={`rounded-3xl bg-cream-50 p-5 shadow-soft ${r.status === "hidden" ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`h-4 w-4 ${r.rating >= n ? "fill-terra-500 text-terra-500" : "text-sand-400"}`} />
                ))}
              </span>
              <b className="text-ink">{r.name}</b>
              {r.verified && <span className="flex items-center gap-1 text-olive-700"><ShoppingBag className="h-3.5 w-3.5" /> Satın aldı</span>}
              <span className="text-muted">{new Date(r.createdAt).toLocaleDateString("tr-TR")}</span>
              {r.status === "hidden" && <span className="rounded-full bg-terra-500/15 px-2 py-0.5 text-xs font-semibold text-terra-600">Gizli</span>}
            </div>
            <p className="mt-2 whitespace-pre-line text-ink">{r.text}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              {r.productUrl ? <Link href={r.productUrl} className="font-semibold text-olive-700 underline">{r.product}</Link> : <span>{r.product}</span>}
              <span className="text-muted">· {r.seller}</span>
              <button type="button" disabled={pending} onClick={() => toggle(r)} className="ml-auto flex items-center gap-1.5 rounded-full bg-cream-200 px-4 py-1.5 font-semibold text-olive-900 hover:bg-sand-300 disabled:opacity-50">
                {r.status === "published" ? <><EyeOff className="h-4 w-4" /> Gizle</> : <><Eye className="h-4 w-4" /> Yayınla</>}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
