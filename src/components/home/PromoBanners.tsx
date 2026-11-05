"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Gift, HandHeart } from "lucide-react";

const banners = [
  {
    href: "/kategori/hediye-kutulari",
    tag: "Ücretsiz kargo",
    title: "Buharkent'ten sevdiklerine",
    text: "İncir, pekmez, bal ve zeytinyağından özenle hazırlanmış hediye kutuları.",
    cta: "Kutuları incele",
    icon: Gift,
    cls: "bg-olive-900 text-cream-50",
  },
  {
    href: "/uretici-ol",
    tag: "Üreticiler için",
    title: "Ürettiğini tüm Türkiye'ye sat",
    text: "Buharkent'te üretiyorsan mağazanı aç, siparişlerini tek panelden yönet.",
    cta: "Başvur",
    icon: HandHeart,
    cls: "bg-terra-500 text-cream-50",
  },
];

export default function PromoBanners() {
  return (
    <section className="grid gap-3 md:grid-cols-2 md:gap-4">
      {banners.map((b, i) => {
        const Icon = b.icon;
        return (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.1, duration: 0.7 }}
          >
            <Link
              href={b.href}
              className={`group relative flex min-h-[230px] flex-col justify-between overflow-hidden rounded-[2rem] p-7 md:p-10 ${b.cls}`}
            >
              <Icon
                strokeWidth={0.9}
                className="pointer-events-none absolute -bottom-8 -right-8 h-48 w-48 opacity-20 transition-transform duration-700 group-hover:-rotate-12 group-hover:scale-110 md:h-60 md:w-60"
              />
              <span className="relative self-start rounded-full bg-cream-50/15 px-3 py-1 text-xs font-semibold">{b.tag}</span>
              <div className="relative mt-6 max-w-sm">
                <h3 className="text-3xl leading-tight md:text-4xl">{b.title}</h3>
                <p className="mt-2 text-sm opacity-80">{b.text}</p>
                <span className="mt-5 inline-flex items-center gap-2 font-semibold">
                  {b.cta}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1.5" />
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </section>
  );
}