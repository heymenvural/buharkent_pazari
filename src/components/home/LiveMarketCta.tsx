import Link from "next/link";
import { ArrowRight, Footprints } from "lucide-react";

/** Ana sayfada Canlı Pazar'a davet */
export default function LiveMarketCta() {
  return (
    <Link href="/canli-pazar" className="flex flex-col gap-5 rounded-3xl border border-sand-300 bg-cream-50 p-6 transition-colors hover:border-olive-500 md:flex-row md:items-center md:p-8">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-terra-500/15 text-terra-600">
        <Footprints className="h-7 w-7" />
      </span>
      <span className="flex-1">
        <span className="block font-display text-2xl text-olive-900 md:text-3xl">Pazarı gezerek alışveriş yap</span>
        <span className="mt-1 block text-muted">Üç boyutlu pazar sokağında yürü, tezgâhlara yaklaş, ürünleri sepetine ekle.</span>
      </span>
      <span className="inline-flex items-center gap-2 font-semibold text-olive-700">
        Canlı Pazar&apos;a gir <ArrowRight className="h-5 w-5" />
      </span>
    </Link>
  );
}
