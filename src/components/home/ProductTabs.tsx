"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { catalog, type Tag } from "@/lib/catalog";

const tabs: { key: Tag | "all"; label: string }[] = [
  { key: "cok-satan", label: "Çok Satanlar" },
  { key: "yeni", label: "Yeni Gelenler" },
  { key: "all", label: "Tümü" },
];

export default function ProductTabs() {
  const [tab, setTab] = useState<Tag | "all">("cok-satan");
  const list = tab === "all" ? catalog : catalog.filter((p) => p.tags.includes(tab));

  return (
    <section>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2 className="text-2xl text-olive-900 md:text-3xl">Buharkent&apos;ten taze gelenler</h2>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold ${
                  active ? "" : "border border-sand-400 hover:border-olive-700"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="home-tab"
                    className="absolute inset-0 rounded-full bg-olive-700"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className={`relative ${active ? "text-cream-50" : "text-olive-900"}`}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <motion.div layout className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.45, delay: (i % 5) * 0.05 }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/urunler"
          className="group inline-flex items-center gap-2 rounded-full border border-olive-700 px-7 py-3.5 font-semibold text-olive-700 transition-colors hover:bg-olive-700 hover:text-cream-50"
        >
          Tüm ürünleri gör
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}