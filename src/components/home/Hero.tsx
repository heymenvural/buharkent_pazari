import Link from "next/link";
import { ArrowRight, Footprints } from "lucide-react";

/** Ana sayfa girişi: tek mesaj, iki net eylem */
export default function Hero() {
  return (
    <section className="rounded-3xl bg-olive-900 px-6 py-10 text-cream-50 md:px-12 md:py-16">
      <p className="text-sm font-semibold text-sand-300">Buharkent Yerel Eylem Grubu Derneği</p>
      <h1 className="mt-3 max-w-2xl text-4xl leading-tight md:text-5xl">Buharkent&apos;in üreticilerinden doğrudan sofrana</h1>
      <p className="mt-4 max-w-xl text-lg text-cream-50/80">
        İncir, zeytinyağı, bal ve el emeği ürünler. Aracı yok, komisyon yok; ödemeni doğrudan üreticiye yaparsın.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/urunler" className="inline-flex items-center justify-center gap-2 rounded-full bg-cream-50 px-7 py-3.5 font-semibold text-olive-900 hover:bg-sand-300">
          Ürünlere göz at <ArrowRight className="h-5 w-5" />
        </Link>
        <Link href="/canli-pazar" className="inline-flex items-center justify-center gap-2 rounded-full border border-cream-50/40 px-7 py-3.5 font-semibold text-cream-50 hover:bg-cream-50/10">
          <Footprints className="h-5 w-5" /> Canlı Pazar&apos;ı gez
        </Link>
      </div>
    </section>
  );
}
