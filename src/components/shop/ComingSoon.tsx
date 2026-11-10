import Link from "next/link";
import { Sprout } from "lucide-react";

/** Henüz hiç ürün yokken gösterilir: alıcıya "yakında", üreticiye "başvur" der */
export default function ComingSoon() {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-sand-300 bg-cream-50 px-6 py-14 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-cream-200">
        <Sprout className="h-8 w-8 text-olive-700" />
      </span>
      <p className="mt-5 font-display text-2xl text-olive-900">Tezgâhlar kuruluyor</p>
      <p className="mt-2 max-w-md text-[15px] text-muted">
        Buharkent&apos;in üreticileri ürünlerini hazırlıyor; çok yakında burada olacaklar. Buharkent&apos;te üretiyorsan tezgâhını ilk açanlardan biri ol.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href="/uretici-ol" className="rounded-full bg-olive-700 px-6 py-3 font-semibold text-cream-50 hover:bg-olive-900">
          Üretici olarak başvur
        </Link>
        <Link href="/hakkimizda" className="rounded-full border border-olive-700 px-6 py-3 font-semibold text-olive-700">
          Biz kimiz?
        </Link>
      </div>
    </div>
  );
}
