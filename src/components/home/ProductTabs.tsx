"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { catalog, type Tag } from "@/lib/catalog";

const tabs: { key: Tag | "all"; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "cok-satan", label: "Çok satanlar" },
  { key: "yeni", label: "Yeni gelenler" },
];

export default function ProductTabs() {
  const [tab, setTab] = useState<Tag | "all">("all");
  const list = (tab === "all" ? catalog : catalog.filter((p) => p.tags.includes(tab))).slice(0, 10);

  return (
    <section>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h2 className="text-2xl text-olive-900 md:text-3xl">Ürünler</h2>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[15px] font-semibold transition-colors ${
                tab === t.key ? "bg-olive-700 text-cream-50" : "bg-cream-50 text-olive-900 ring-1 ring-sand-300 hover:ring-olive-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {list.length === 0 && <p className="mt-6 text-muted">Bu bölümde şimdilik ürün yok.</p>}

      <div className="mt-8 flex justify-center">
        <Link href="/urunler" className="inline-flex items-center gap-2 rounded-full border border-olive-700 px-7 py-3 font-semibold text-olive-700 hover:bg-olive-700 hover:text-cream-50">
          Tüm ürünleri gör <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}
