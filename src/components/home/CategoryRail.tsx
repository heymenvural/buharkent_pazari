import Link from "next/link";
import { categories } from "@/lib/catalog";

export default function CategoryRail() {
  return (
    <section>
      <h2 className="text-2xl text-olive-900 md:text-3xl">Kategoriler</h2>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.slug} href={`/kategori/${c.slug}`} className="flex items-center gap-3 rounded-2xl border border-sand-300 bg-cream-50 p-3 transition-colors hover:border-olive-500 lg:flex-col lg:py-5 lg:text-center">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream-200 text-olive-700">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[15px] font-semibold text-ink">{c.short}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
