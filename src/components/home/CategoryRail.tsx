"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { categories } from "@/lib/catalog";

export default function CategoryRail() {
  return (
    <section>
      <div className="flex items-end justify-between">
        <h2 className="text-2xl text-olive-900 md:text-3xl">Kategoriler</h2>
        <Link href="/urunler" className="text-sm font-semibold text-olive-700 hover:underline">
          Tümünü gör
        </Link>
      </div>
      <div className="-mx-4 mt-5 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-7 md:overflow-visible md:px-0">
        {categories.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.slug}
              className="shrink-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
            >
              <Link href={`/kategori/${c.slug}`} className="group flex w-20 flex-col items-center gap-2 text-center md:w-auto">
                <span
                  className={`grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br ${c.bg} shadow-soft transition-transform duration-500 group-hover:-translate-y-1.5 md:h-24 md:w-24`}
                >
                  <Icon
                    strokeWidth={1.5}
                    className={`h-8 w-8 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 md:h-10 md:w-10 ${
                      c.slug === "sut-yumurta" ? "text-olive-900" : "text-cream-50"
                    }`}
                  />
                </span>
                <span className="text-xs font-semibold text-ink md:text-sm">{c.short}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}