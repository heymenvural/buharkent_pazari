"use client";

import { motion } from "framer-motion";
import { ArrowDown, Check } from "lucide-react";

const ease = [0.76, 0, 0.24, 1] as const;

const benefits = [
  "Kolay ve hızlı mağaza açılışı",
  "Ürünlerin tüm Türkiye'ye ulaşsın",
  "Fiyatını ve kargonu sen belirle",
  "Dernekten eğitim ve tanıtım desteği",
];

const steps = [
  { no: "1", title: "Başvur", text: "Formu doldur, ürettiğin ürünleri anlat." },
  { no: "2", title: "Onaylan", text: "Ekibimiz seninle iletişime geçip mağazanı açar." },
  { no: "3", title: "Satışa başla", text: "Ürünlerini yükle, siparişlerini panelden yönet." },
];

export default function SellerCta() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-olive-900 px-6 py-14 text-cream-50 md:rounded-[3rem] md:px-14 md:py-20">
      <motion.div
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-terra-500/30 blur-3xl"
        animate={{ scale: [1, 1.25, 1], x: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-olive-500/40 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-terra-500">Üretici Ol</span>
          <h1 className="mt-4 text-4xl leading-[1.1] md:text-6xl">
            {["Buharkent'te", "üretiyorsan,", "sıra", "sende."].map((w, i) => (
              <span key={i} className="mr-[0.25em] inline-block overflow-hidden pb-1 align-bottom">
                <motion.span
                  className={`inline-block ${i >= 2 ? "italic text-sand-300" : ""}`}
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ delay: i * 0.08, duration: 0.8, ease }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>

          <ul className="mt-8 space-y-3">
            {benefits.map((b, i) => (
              <motion.li
                key={b}
                className="flex items-center gap-3 text-base text-cream-50/85 md:text-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-terra-500">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {b}
              </motion.li>
            ))}
          </ul>

          <a
            href="#basvuru"
            className="group mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-cream-50 px-7 py-4 font-semibold text-olive-900 transition-colors hover:bg-sand-300"
          >
            Hemen Başvur
            <ArrowDown className="h-5 w-5 transition-transform group-hover:translate-y-1" />
          </a>
        </div>

        <div className="flex flex-col justify-center gap-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.no}
              className="flex items-start gap-5 rounded-3xl border border-cream-50/10 bg-cream-50/5 p-5 backdrop-blur md:p-7"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.8, ease }}
              whileHover={{ x: 8, backgroundColor: "rgba(253,251,246,0.1)" }}
            >
              <span className="font-display text-5xl leading-none text-terra-500 md:text-6xl">{s.no}</span>
              <div>
                <h3 className="text-2xl md:text-3xl">{s.title}</h3>
                <p className="mt-1 text-cream-50/70">{s.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}