"use client";

import { motion } from "framer-motion";
import { Check, Droplets, Hexagon, Nut } from "lucide-react";

const ease = [0.76, 0, 0.24, 1] as const;

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <motion.div
      className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-cream-50 shadow-soft lg:grid-cols-2"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease }}
    >
      <div className="relative hidden overflow-hidden bg-olive-900 p-12 text-cream-50 lg:flex lg:flex-col lg:justify-between">
        {[
          { Icon: Nut, cls: "right-10 top-10 h-28 w-28", d: 0 },
          { Icon: Droplets, cls: "right-36 top-40 h-16 w-16", d: 1 },
          { Icon: Hexagon, cls: "bottom-16 right-14 h-24 w-24", d: 2 },
        ].map(({ Icon, cls, d }, i) => (
          <motion.span
            key={i}
            className={`absolute text-cream-50/15 ${cls}`}
            animate={{ y: [0, -14, 0], rotate: [-6, 6, -6] }}
            transition={{ duration: 6 + d, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon className="h-full w-full" strokeWidth={1} />
          </motion.span>
        ))}
        <span className="font-display text-2xl">
          Buharkent<span className="text-terra-500">.</span>
        </span>
        <div className="relative">
          <h2 className="text-5xl leading-[1.05]">
            Buharkent&apos;in emeği <span className="italic text-sand-300">bir tık uzağında.</span>
          </h2>
          <ul className="mt-8 space-y-3 text-cream-50/80">
            {["Siparişlerini tek yerden takip et", "Favori üreticilerini kaydet", "Adresini kaydet, hızlıca öde"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-terra-500">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-cream-50/50">Üye olmadan da alışveriş yapabilirsin.</p>
      </div>

      <div className="p-6 sm:p-10 md:p-14">
        <h1 className="text-4xl text-olive-900 md:text-5xl">{title}</h1>
        <p className="mt-2 text-muted">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </motion.div>
  );
}