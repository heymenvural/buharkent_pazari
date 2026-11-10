"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, CalendarDays, MapPin, Package, Search, Star } from "lucide-react";
import { initials, sellerGradient, sellerOffers, sellers, type SellerType } from "@/lib/catalog";

const ease = [0.76, 0, 0.24, 1] as const;
const filters: { key: SellerType | "all"; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "Kadın Girişimci", label: "Kadın Girişimciler" },
  { key: "Genç Çiftçi", label: "Genç Çiftçiler" },
];

const norm = (s: string) => s.toLocaleLowerCase("tr").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function SellerDirectory() {
  const [type, setType] = useState<SellerType | "all">("all");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const n = norm(q.trim());
    return sellers.filter(
      (s) => (type === "all" || s.type === type) && (!n || norm(`${s.name} ${s.village} ${s.tagline}`).includes(n))
    );
  }, [type, q]);

  return (
    <div className="mx-auto max-w-7xl">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-terra-500">Üreticilerimiz</span>
      <h1 className="mt-3 max-w-3xl text-4xl leading-[1.1] text-olive-900 md:text-6xl">
        Her ürünün arkasında <span className="italic text-terra-500">bir yüz var.</span>
      </h1>
      <p className="mt-4 max-w-xl text-muted">
        Buharkent&apos;te üreten, dernek tarafından tek tek doğrulanan kadın girişimciler ve genç çiftçiler.
      </p>

      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
          {filters.map((f) => {
            const active = type === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setType(f.key)}
                className={`relative shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold ${active ? "" : "border border-sand-400 hover:border-olive-700"}`}
              >
                {active && <motion.span layoutId="seller-filter" className="absolute inset-0 rounded-full bg-olive-700" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                <span className={`relative ${active ? "text-cream-50" : "text-olive-900"}`}>{f.label}</span>
              </button>
            );
          })}
        </div>
        <label className="relative md:w-72">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value.slice(0, 40))}
            placeholder="Üretici veya mahalle ara"
            aria-label="Üretici ara"
            className="w-full rounded-full border border-sand-300 bg-cream-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-olive-500"
          />
        </label>
      </div>

      <motion.div layout className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((s, i) => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ delay: (i % 3) * 0.06, duration: 0.5, ease }}
            >
              <Link href={`/uretici/${s.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[2rem] bg-cream-50 shadow-soft transition-transform duration-500 hover:-translate-y-1.5">
                <div className={`relative h-28 bg-gradient-to-br ${sellerGradient(s.type)}`}>
                  <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-cream-50/20 text-cream-50 transition-transform duration-500 group-hover:rotate-45">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col px-6 pb-6">
                  <span className={`-mt-9 grid h-[72px] w-[72px] place-items-center rounded-full border-4 border-cream-50 bg-gradient-to-br font-display text-2xl text-cream-50 transition-transform duration-500 group-hover:scale-105 ${sellerGradient(s.type)}`}>
                    {initials(s.name)}
                  </span>
                  <h2 className="mt-3 flex items-center gap-1.5 text-2xl text-ink">
                    {s.name}
                    {s.verified && <BadgeCheck className="h-5 w-5 shrink-0 text-olive-700" />}
                  </h2>
                  <span className={`mt-1 self-start rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.type === "Kadın Girişimci" ? "bg-fig-600/10 text-fig-600" : "bg-olive-500/15 text-olive-700"}`}>
                    {s.type}
                  </span>
                  <p className="mt-4 flex-1 font-display italic leading-relaxed text-olive-700">&ldquo;{s.tagline}&rdquo;</p>
                  <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-sand-300 pt-4 text-xs text-muted">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {s.village}</span>
                    <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {s.since}&apos;den beri</span>
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-terra-500 text-terra-500" /> {s.rating.toFixed(1)}</span>
                    <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> {sellerOffers(s.id).length} ürün</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {list.length === 0 && <p className="mt-10 text-center text-muted">Aramana uygun üretici bulunamadı.</p>}
    </div>
  );
}