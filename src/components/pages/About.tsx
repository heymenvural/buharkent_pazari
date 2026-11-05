"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Eye, HandCoins, Leaf, Users } from "lucide-react";
import Counter from "@/components/ui/Counter";
import Story from "@/components/home/Story";
import { catalog, categories, sellers } from "@/lib/catalog";

const ease = [0.76, 0, 0.24, 1] as const;

const values = [
  { icon: HandCoins, title: "Adil kazanç", text: "Aracı yok; emeğin karşılığı doğrudan üreticiye gider." },
  { icon: Leaf, title: "Doğallık", text: "Katkısız, mevsiminde, geleneksel yöntemlerle üretim." },
  { icon: Eye, title: "Şeffaflık", text: "Her ürünün üreticisini, köyünü ve üretim bilgisini görürsün." },
  { icon: Users, title: "Yerel kalkınma", text: "Kadınların ve gençlerin kırsalda kalıp kazanmasını destekler." },
];

export default function About() {
  const stats = [
    { to: sellers.length, label: "Doğrulanmış üretici" },
    { to: sellers.filter((s) => s.type === "Kadın Girişimci").length, label: "Kadın girişimci" },
    { to: catalog.length, label: "Yerel ürün" },
    { to: categories.length, label: "Kategori" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-20 md:space-y-28">
      {/* Giriş */}
      <section>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-terra-500">Hakkımızda</span>
        <h1 className="mt-3 max-w-4xl text-5xl leading-[1.02] text-olive-900 md:text-7xl">
          {["Buharkent'in", "emeği,"].map((w, i) => (
            <span key={i} className="mr-[0.22em] inline-block overflow-hidden pb-1 align-bottom">
              <motion.span className="inline-block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: i * 0.08, duration: 0.8, ease }}>
                {w}
              </motion.span>
            </span>
          ))}
          <br />
          {["tek", "pazarda."].map((w, i) => (
            <span key={i} className="mr-[0.22em] inline-block overflow-hidden pb-1 align-bottom">
              <motion.span className="inline-block italic text-terra-500" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 0.2 + i * 0.08, duration: 0.8, ease }}>
                {w}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          className="mt-6 max-w-2xl text-lg leading-relaxed text-muted"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
        >
          Buharkent Pazarı, Buharkent&apos;te üreten kadın girişimcilerin ve genç çiftçilerin ürünlerini aracısız olarak
          tüm Türkiye&apos;ye ulaştırmak için kurulan yerel bir dijital pazar yeridir.
        </motion.p>

        <div className="mt-12 grid grid-cols-2 gap-y-8 border-y border-sand-300 py-8 md:grid-cols-4 md:py-10">
          {stats.map((s, i) => (
            <div key={s.label} className={`px-2 md:px-6 ${i > 0 ? "md:border-l md:border-sand-300" : ""}`}>
              <div className="font-display text-5xl text-olive-900 md:text-6xl">
                <Counter to={s.to} />
              </div>
              <div className="mt-2 text-sm text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <Story />

      {/* Dernek */}
      <section className="grid gap-8 rounded-[2rem] bg-olive-900 p-7 text-cream-50 md:p-14 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-terra-500">Biz kimiz?</span>
          <h2 className="mt-3 text-4xl leading-tight md:text-5xl">
            Buharkent Yerel <span className="italic text-sand-300">Eylem Grubu</span>
          </h2>
        </div>
        <div className="space-y-4 leading-relaxed text-cream-50/80">
          <p>
            Buharkent Yerel Eylem Grubu Derneği (BUHARYEG), kırsal kalkınmayı yerel ortaklıklarla destekleyen bir
            dernektir. IPARD III programının LEADER yaklaşımıyla, yerel halkın kendi kalkınma önceliklerini belirlemesini
            ve hayata geçirmesini hedefler.
          </p>
          <p>
            Buharkent Pazarı bu vizyonun bir parçası olarak, ilçemizdeki üreticilerin dijital dünyada güçlü bir şekilde
            yer almasını, ürünlerini adil fiyatla satmasını ve kırsalda kalarak kazanç elde etmesini amaçlar.
          </p>
        </div>
      </section>

      {/* Değerler */}
      <section>
        <h2 className="text-3xl text-olive-900 md:text-5xl">Değerlerimiz</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                className="rounded-[1.75rem] bg-cream-50 p-6 shadow-soft"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                whileHover={{ y: -6 }}
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-olive-700/10 text-olive-700">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-2xl text-olive-900">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{v.text}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Çağrı */}
      <section className="flex flex-col items-center text-center">
        <h2 className="max-w-2xl text-4xl leading-tight text-olive-900 md:text-5xl">
          Buharkent&apos;in lezzetleri <span className="italic text-terra-500">bir tık uzağında.</span>
        </h2>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/urunler" className="group inline-flex items-center justify-center gap-2 rounded-full bg-olive-700 px-7 py-4 font-semibold text-cream-50 transition-colors hover:bg-olive-900">
            Alışverişe başla <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/uretici-ol" className="inline-flex items-center justify-center rounded-full border border-olive-700 px-7 py-4 font-semibold text-olive-700 transition-colors hover:bg-olive-700 hover:text-cream-50">
            Üretici ol
          </Link>
        </div>
      </section>
    </div>
  );
}