"use client";

import ComingSoon from "@/components/shop/ComingSoon";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, SearchX, SlidersHorizontal, X } from "lucide-react";
import { useLenis } from "lenis/react";
import ProductCard from "@/components/shop/ProductCard";
import {
  catalog,
  categories,
  getCategory,
  getSeller,
  offersFor,
  priceInfo,
  productRating,
  type SellerType,
} from "@/lib/catalog";

const ease = [0.76, 0, 0.24, 1] as const;

type Sort = "onerilen" | "fiyat-artan" | "fiyat-azalan" | "puan" | "yeni";
const sorts: { key: Sort; label: string }[] = [
  { key: "onerilen", label: "Önerilen" },
  { key: "fiyat-artan", label: "Fiyat: Artan" },
  { key: "fiyat-azalan", label: "Fiyat: Azalan" },
  { key: "puan", label: "En yüksek puan" },
  { key: "yeni", label: "En yeni" },
];

const sellerTypes: SellerType[] = ["Kadın Girişimci", "Genç Çiftçi"];
const priceRanges = [
  { label: "150 ₺ altı", min: "", max: "150" },
  { label: "150 - 300 ₺", min: "150", max: "300" },
  { label: "300 ₺ üstü", min: "300", max: "" },
];

const norm = (s: string) =>
  s
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
const digits = (v: string) => v.replace(/\D/g, "").slice(0, 6);

function CheckRow({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" onClick={onChange} className="flex w-full items-center gap-3 py-1.5 text-left text-sm text-ink/85">
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors ${
          checked ? "border-olive-700 bg-olive-700" : "border-sand-400"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="h-3 w-3 text-cream-50">
            <path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

export default function ProductListing({ category, query }: { category?: string; query?: string }) {
  const [cats, setCats] = useState<string[]>(category ? [category] : []);
  const [types, setTypes] = useState<SellerType[]>([]);
  const [minP, setMinP] = useState("");
  const [maxP, setMaxP] = useState("");
  const [discount, setDiscount] = useState(false);
  const [sort, setSort] = useState<Sort>("onerilen");
  const [sheet, setSheet] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    if (sheet) lenis?.stop();
    else lenis?.start();
  }, [sheet, lenis]);

  const results = useMemo(() => {
    const q = query ? norm(query).split(/\s+/).filter(Boolean) : [];
    const list = catalog.filter((p) => {
      if (q.length) {
        const hay = norm(`${p.name} ${p.description} ${getCategory(p.category)?.name ?? ""}`);
        if (!q.every((w) => hay.includes(w))) return false;
      }
      if (cats.length && !cats.includes(p.category)) return false;
      const info = priceInfo(p.id);
      if (minP && info.min < Number(minP)) return false;
      if (maxP && info.min > Number(maxP)) return false;
      if (discount && info.maxDiscount === 0) return false;
      if (types.length && !offersFor(p.id).some((o) => types.includes(getSeller(o.sellerId).type))) return false;
      return true;
    });

    const score = (tags: string[]) => (tags.includes("cok-satan") ? 2 : 0) + (tags.includes("firsat") ? 1 : 0);
    const idx = (id: string) => catalog.findIndex((p) => p.id === id);

    return [...list].sort((a, b) => {
      switch (sort) {
        case "fiyat-artan":
          return priceInfo(a.id).min - priceInfo(b.id).min;
        case "fiyat-azalan":
          return priceInfo(b.id).min - priceInfo(a.id).min;
        case "puan":
          return productRating(b.id).rating - productRating(a.id).rating;
        case "yeni":
          return Number(b.tags.includes("yeni")) - Number(a.tags.includes("yeni")) || idx(b.id) - idx(a.id);
        default:
          return score(b.tags) - score(a.tags);
      }
    });
  }, [query, cats, minP, maxP, discount, types, sort]);

  const activeCount = cats.filter((c) => c !== category).length + types.length + (minP || maxP ? 1 : 0) + (discount ? 1 : 0);

  const clear = () => {
    setCats(category ? [category] : []);
    setTypes([]);
    setMinP("");
    setMaxP("");
    setDiscount(false);
  };

  const cat = category ? getCategory(category) : undefined;
  const title = query ? `“${query}” için sonuçlar` : cat ? cat.name : "Tüm ürünler";

  const filters = (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Kategori</p>
        <div className="mt-3">
          {categories.map((c) => (
            <CheckRow key={c.slug} checked={cats.includes(c.slug)} onChange={() => setCats((a) => toggle(a, c.slug))} label={c.name} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Üretici</p>
        <div className="mt-3">
          {sellerTypes.map((t) => (
            <CheckRow key={t} checked={types.includes(t)} onChange={() => setTypes((a) => toggle(a, t))} label={t} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Fiyat</p>
        <div className="mt-3 flex items-center gap-2">
          <input
            inputMode="numeric"
            placeholder="En az"
            value={minP}
            onChange={(e) => setMinP(digits(e.target.value))}
            className="w-full rounded-xl border border-sand-300 bg-cream-100 px-3 py-2.5 text-sm outline-none focus:border-olive-500"
          />
          <span className="text-muted">–</span>
          <input
            inputMode="numeric"
            placeholder="En çok"
            value={maxP}
            onChange={(e) => setMaxP(digits(e.target.value))}
            className="w-full rounded-xl border border-sand-300 bg-cream-100 px-3 py-2.5 text-sm outline-none focus:border-olive-500"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {priceRanges.map((r) => {
            const active = minP === r.min && maxP === r.max;
            return (
              <button
                key={r.label}
                type="button"
                onClick={() => {
                  setMinP(active ? "" : r.min);
                  setMaxP(active ? "" : r.max);
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active ? "bg-olive-700 text-cream-50" : "border border-sand-400 text-olive-900 hover:border-olive-700"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <button type="button" onClick={() => setDiscount((d) => !d)} className="flex w-full items-center justify-between text-sm font-semibold text-ink">
        Sadece indirimli ürünler
        <span className={`relative h-6 w-11 rounded-full transition-colors ${discount ? "bg-olive-700" : "bg-sand-400"}`}>
          <motion.span
            className="absolute top-1 h-4 w-4 rounded-full bg-cream-50"
            animate={{ left: discount ? 24 : 4 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </span>
      </button>

      {activeCount > 0 && (
        <button type="button" onClick={clear} className="text-sm font-semibold text-terra-600 hover:underline">
          Filtreleri temizle
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl">
      <nav className="flex items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="hover:text-olive-700">Ana sayfa</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink">{cat ? cat.name : query ? "Arama" : "Ürünler"}</span>
      </nav>

      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl text-olive-900 md:text-5xl">{title}</h1>
          <p className="mt-1 text-sm text-muted">{results.length} ürün bulundu</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSheet(true)}
            className="relative flex items-center gap-2 rounded-full border border-sand-400 bg-cream-50 px-4 py-2.5 text-sm font-semibold text-olive-900 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filtrele
            {activeCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-terra-500 px-1 text-xs font-bold text-cream-50">
                {activeCount}
              </span>
            )}
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="Sırala"
            className="min-w-0 flex-1 rounded-full border border-sand-400 bg-cream-50 px-4 py-2.5 text-sm font-semibold text-olive-900 outline-none md:flex-none"
          >
            {sorts.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-36 rounded-3xl bg-cream-50 p-6 shadow-soft">{filters}</div>
        </aside>

        <div>
          {catalog.length === 0 ? (
            <ComingSoon />
          ) : results.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center rounded-3xl bg-cream-50 px-6 py-16 text-center shadow-soft"
            >
              <span className="grid h-20 w-20 place-items-center rounded-full bg-cream-200">
                <SearchX className="h-9 w-9 text-olive-700" />
              </span>
              <p className="mt-5 font-display text-2xl text-olive-900">Aradığın ürünü bulamadık</p>
              <p className="mt-2 max-w-sm text-sm text-muted">Filtreleri değiştirmeyi ya da farklı bir kelimeyle aramayı deneyebilirsin.</p>
              <div className="mt-6 flex gap-3">
                {activeCount > 0 && (
                  <button onClick={clear} className="rounded-full bg-olive-700 px-6 py-3 text-sm font-semibold text-cream-50">
                    Filtreleri temizle
                  </button>
                )}
                <Link href="/urunler" className="rounded-full border border-olive-700 px-6 py-3 text-sm font-semibold text-olive-700">
                  Tüm ürünler
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {results.map((p, i) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.45, delay: (i % 4) * 0.05, ease }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobil filtre paneli */}
      <AnimatePresence>
        {sheet && (
          <div className="fixed inset-0 z-[70] flex items-end lg:hidden">
            <motion.div
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheet(false)}
            />
            <motion.div
              className="relative flex max-h-[85vh] w-full flex-col rounded-t-[2rem] bg-cream-100"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.5, ease }}
            >
              <div className="flex items-center justify-between border-b border-sand-300 p-5">
                <p className="font-display text-2xl text-olive-900">Filtrele</p>
                <button onClick={() => setSheet(false)} aria-label="Kapat" className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand-300/60">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div data-lenis-prevent className="flex-1 overflow-y-auto p-5">
                {filters}
              </div>
              <div className="border-t border-sand-300 bg-cream-50 p-4">
                <button
                  onClick={() => setSheet(false)}
                  className="w-full rounded-full bg-olive-700 py-4 font-semibold text-cream-50"
                >
                  {results.length} ürünü göster
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}