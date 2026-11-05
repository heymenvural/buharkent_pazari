"use client";

import { motion } from "framer-motion";
import { HandHeart, PackageCheck, Sprout, Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ease = [0.76, 0, 0.24, 1] as const;

const steps: { no: string; title: string; text: string; icon: LucideIcon; cls: string }[] = [
  { no: "01", title: "Toprak", text: "Büyük Menderes vadisinin bereketli topraklarında, her ürün kendi mevsiminde yetişir.", icon: Sprout, cls: "bg-olive-700 text-cream-50" },
  { no: "02", title: "Emek", text: "Buharkent'in kadın girişimcileri ve genç çiftçileri her ürünü kendi elleriyle hasat eder.", icon: HandHeart, cls: "bg-terra-500 text-cream-50" },
  { no: "03", title: "Özen", text: "Katkı maddesi olmadan, geleneksel yöntemlerle kurutulur, sıkılır ve kavanozlanır.", icon: PackageCheck, cls: "bg-fig-600 text-cream-50" },
  { no: "04", title: "Sofra", text: "Aracı olmadan, üreticisinden doğrudan ve taze olarak kapınıza ulaşır.", icon: Utensils, cls: "bg-sand-300 text-olive-900" },
];

export default function Story() {
  return (
    <section id="hikaye">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-terra-500">Hikâyemiz</span>
        <h2 className="mt-3 text-4xl leading-[1.05] text-olive-900 md:text-6xl">
          Tarladan sofraya, <span className="italic text-terra-500">dört adımda.</span>
        </h2>
      </div>

      <div className="relative mt-10">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.no} className="sticky pb-6" style={{ top: `${150 + i * 22}px` }}>
              <motion.article
                className={`relative flex h-[360px] flex-col justify-between overflow-hidden rounded-[2rem] p-7 shadow-2xl md:h-[420px] md:p-12 ${s.cls}`}
                initial={{ opacity: 0, y: 80, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease }}
              >
                <span className="pointer-events-none absolute -right-4 -top-8 select-none font-display text-[10rem] leading-none opacity-15 md:text-[16rem]">
                  {s.no}
                </span>
                <motion.span
                  className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 backdrop-blur md:h-20 md:w-20"
                  initial={{ rotate: -30, scale: 0.6 }}
                  whileInView={{ rotate: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 12 }}
                >
                  <Icon className="h-8 w-8 md:h-10 md:w-10" strokeWidth={1.5} />
                </motion.span>
                <div className="relative max-w-xl">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] opacity-70">Adım {s.no}</span>
                  <h3 className="mt-2 text-5xl md:text-7xl">{s.title}</h3>
                  <p className="mt-4 text-base leading-relaxed opacity-85 md:text-lg">{s.text}</p>
                </div>
              </motion.article>
            </div>
          );
        })}
      </div>
    </section>
  );
}