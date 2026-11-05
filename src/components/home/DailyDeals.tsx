"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { catalog, priceInfo } from "@/lib/catalog";

const pad = (n: number) => String(n).padStart(2, "0");

function useCountdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      setLeft(Math.max(0, end.getTime() - now.getTime()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return left;
}

function TimeBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="relative grid h-10 w-11 place-items-center overflow-hidden rounded-xl bg-olive-900 font-display text-xl text-cream-50 md:h-12 md:w-14 md:text-2xl">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-wider text-muted">{label}</span>
    </div>
  );
}

export default function DailyDeals() {
  const trackRef = useRef<HTMLDivElement>(null);
  const left = useCountdown();
  const deals = catalog.filter((p) => p.tags.includes("firsat") || priceInfo(p.id).maxDiscount > 0);

  const h = left === null ? "--" : pad(Math.floor(left / 3_600_000));
  const m = left === null ? "--" : pad(Math.floor((left % 3_600_000) / 60_000));
  const s = left === null ? "--" : pad(Math.floor((left % 60_000) / 1000));

  const scroll = (d: number) =>
    trackRef.current?.scrollBy({ left: d * trackRef.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section id="firsatlar" className="scroll-mt-40 rounded-[2rem] bg-cream-200 p-5 md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <motion.span
            className="grid h-12 w-12 place-items-center rounded-2xl bg-terra-500 text-cream-50"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            <Flame className="h-6 w-6" />
          </motion.span>
          <div>
            <h2 className="text-2xl text-olive-900 md:text-3xl">Günün Fırsatları</h2>
            <p className="text-sm text-muted">Gece yarısına kadar geçerli</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 md:justify-end">
          <div className="flex items-start gap-1.5">
            <TimeBox value={h} label="Saat" />
            <span className="mt-2 font-display text-xl text-olive-900">:</span>
            <TimeBox value={m} label="Dk" />
            <span className="mt-2 font-display text-xl text-olive-900">:</span>
            <TimeBox value={s} label="Sn" />
          </div>
          <div className="hidden gap-2 md:flex">
            <button
              onClick={() => scroll(-1)}
              aria-label="Önceki"
              className="grid h-11 w-11 place-items-center rounded-full border border-sand-400 transition-colors hover:bg-cream-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll(1)}
              aria-label="Sonraki"
              className="grid h-11 w-11 place-items-center rounded-full border border-sand-400 transition-colors hover:bg-cream-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        className="mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] md:gap-5"
      >
        {deals.map((p, i) => (
          <motion.div
            key={p.id}
            className="w-[47%] shrink-0 snap-start sm:w-[31%] lg:w-[23%]"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.6 }}
          >
            <ProductCard product={p} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}