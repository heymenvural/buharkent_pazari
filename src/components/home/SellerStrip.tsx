"use client";

import Link from "next/link";
import { offers, sellers, initials } from "@/lib/catalog";

export default function SellerStrip() {
  if (!sellers.length) return null;
  return (
    <section>
      <div className="flex items-end justify-between">
        <h2 className="text-2xl text-olive-900 md:text-3xl">Üreticilerimiz</h2>
        <Link href="/ureticiler" className="font-semibold text-olive-700 hover:underline">
          Tümü
        </Link>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sellers.slice(0, 6).map((s) => {
          const count = offers.filter((o) => o.sellerId === s.id).length;
          return (
            <Link key={s.id} href={`/uretici/${s.slug}`} className="flex items-center gap-4 rounded-2xl border border-sand-300 bg-cream-50 p-4 transition-colors hover:border-olive-500">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-olive-700 font-semibold text-cream-50">{initials(s.name)}</span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-ink">{s.name}</span>
                <span className="block text-sm text-muted">
                  {s.type} · {count} ürün
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
