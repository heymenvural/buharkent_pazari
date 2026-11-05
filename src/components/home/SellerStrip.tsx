"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Star } from "lucide-react";
import { offers, sellers } from "@/lib/catalog";

const initials = (n: string) =>
  n
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

export default function SellerStrip() {
  return (
    <section>
      <div className="flex items-end justify-between">
        <h2 className="text-2xl text-olive-900 md:text-3xl">Öne çıkan üreticiler</h2>
        <Link href="/ureticiler" className="text-sm font-semibold text-olive-700 hover:underline">
          Tüm üreticiler
        </Link>
      </div>
      <div className="-mx-4 mt-5 flex gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] md:mx-0 md:gap-4 md:px-0">
        {sellers.map((s, i) => {
          const count = offers.filter((o) => o.sellerId === s.id).length;
          return (
            <motion.div
              key={s.id}
              className="shrink-0"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.6 }}
            >
              <Link
                href={`/uretici/${s.slug}`}
                className="group flex w-64 items-center gap-4 rounded-3xl bg-cream-50 p-4 shadow-soft transition-transform duration-300 hover:-translate-y-1"
              >
                <span
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br font-display text-lg text-cream-50 transition-transform duration-500 group-hover:scale-110 ${
                    s.type === "Kadın Girişimci" ? "from-fig-600 to-[#3f1f2c]" : "from-olive-500 to-olive-900"
                  }`}
                >
                  {initials(s.name)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink">{s.name}</span>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      s.type === "Kadın Girişimci" ? "bg-fig-600/10 text-fig-600" : "bg-olive-500/15 text-olive-700"
                    }`}
                  >
                    {s.type}
                  </span>
                  <span className="mt-1 flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-terra-500 text-terra-500" /> {s.rating.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="h-3 w-3" /> {count} ürün
                    </span>
                  </span>
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}