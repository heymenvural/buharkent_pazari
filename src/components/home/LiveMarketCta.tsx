"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Footprints } from "lucide-react";

const STALLS = [
  ["#b5532f", "#f6ead6"],
  ["#4a5627", "#f1e6cc"],
  ["#6e3b4e", "#f3e4d8"],
  ["#c98a2b", "#fcf2dd"],
];

/** Ana sayfada Canlı Pazar'a davet */
export default function LiveMarketCta() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7 }}
    >
      <Link href="/canli-pazar" className="group relative block overflow-hidden rounded-[2rem] bg-[#efdcbc] p-6 md:p-10">
        {/* Perspektifli tezgâh sırası */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 [perspective:700px] md:block">
          <div className="absolute inset-0 flex items-end justify-center gap-3 pb-8 transition-transform duration-700 [transform:rotateY(-28deg)] group-hover:[transform:rotateY(-18deg)_translateX(-12px)]">
            {STALLS.map(([a, b], i) => (
              <div key={i} className="flex flex-col items-center" style={{ transform: `translateZ(${-i * 70}px)` }}>
                <div className="h-10 w-28 rounded-t-lg shadow-md" style={{ background: `repeating-linear-gradient(90deg, ${a} 0 14px, ${b} 14px 28px)` }} />
                <div className="flex h-16 w-24 items-start justify-center gap-1.5 bg-[#8a5f3a] pt-1.5">
                  {[0, 1, 2].map((k) => (
                    <span key={k} className="h-4 w-5 rounded-sm" style={{ background: [a, "#6b4a2e", "#d99a24"][k] }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative max-w-md">
          <span className="flex w-fit items-center gap-2 rounded-full bg-terra-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-terra-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terra-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-terra-500" />
            </span>
            Yeni · Canlı Pazar
          </span>
          <h2 className="mt-4 text-3xl leading-tight text-olive-900 md:text-5xl">
            Pazarı <span className="italic text-terra-600">gezerek</span> alışveriş yap
          </h2>
          <p className="mt-3 text-ink/75 md:text-lg">Buharkent&apos;in pazar sokağında yürü, üreticilerin tezgâhlarına yaklaş, ürünlere bak ve sepetine ekle.</p>
          <span className="mt-6 inline-flex min-h-[52px] items-center gap-2 rounded-full bg-olive-700 px-6 font-semibold text-cream-50 transition-colors group-hover:bg-olive-900">
            <Footprints className="h-5 w-5" /> Pazarı gez <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.section>
  );
}
