"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, ArrowRight, AtSign, Mail, MapPin, Phone } from "lucide-react";
import { useLenis } from "lenis/react";
import { legalLinks } from "@/lib/legal";

const ease = [0.76, 0, 0.24, 1] as const;

const cols = [
  {
    title: "Alışveriş",
    links: [
      { label: "Tüm Ürünler", href: "/urunler" },
      { label: "Canlı Pazar (3D)", href: "/canli-pazar" },
      { label: "İncir & Kuru Ürünler", href: "/kategori/incir-kuru-urunler" },
      { label: "Zeytinyağı", href: "/kategori/zeytin-zeytinyagi" },
      { label: "Bal & Pekmez", href: "/kategori/bal-recel-pekmez" },
      { label: "Hediye Kutuları", href: "/kategori/hediye-kutulari" },
    ],
  },
  {
    title: "Kurumsal",
    links: [
      { label: "Hakkımızda", href: "/hakkimizda" },
      { label: "Üreticilerimiz", href: "/ureticiler" },
      { label: "Üretici Ol", href: "/uretici-ol" },
      { label: "Sıkça Sorulanlar", href: "/sss" },
    ],
  },
      { title: "Yasal", links: legalLinks },
];

export default function Footer() {
  const lenis = useLenis();
  const [sent, setSent] = useState(false);
  const pathname = usePathname();
  if (pathname === "/canli-pazar") return null;

  return (
    <footer id="iletisim" className="relative overflow-hidden bg-olive-900 text-cream-50">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-16 md:px-8 md:pt-24">
        <div className="grid gap-10 border-b border-cream-50/10 pb-14 lg:grid-cols-2 lg:items-end">
          <h2 className="text-4xl leading-[1.1] md:text-6xl">
            Hasat haberleri <span className="italic text-sand-300">ilk size gelsin.</span>
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              maxLength={120}
              placeholder="E-posta adresiniz"
              className="flex-1 rounded-full border border-cream-50/20 bg-cream-50/5 px-6 py-4 text-cream-50 outline-none transition-colors placeholder:text-cream-50/40 focus:border-terra-500"
            />
            <button className="group inline-flex items-center justify-center gap-2 rounded-full bg-terra-500 px-7 py-4 font-semibold transition-colors hover:bg-terra-600">
              {sent ? "Teşekkürler!" : "Abone Ol"}
              {!sent && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-10 py-14 md:grid-cols-4">
          {cols.map((c) => (
            <div key={c.title}>
              <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-cream-50/50">{c.title}</h3>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="group relative text-sm text-cream-50/80 transition-colors hover:text-cream-50">
                      {l.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-terra-500 transition-transform duration-300 group-hover:scale-x-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 md:col-span-1">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-cream-50/50">İletişim</h3>
            <ul className="mt-5 space-y-3 text-sm text-cream-50/80">
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-terra-500" /> Buharkent, Aydın</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-terra-500" /> info@alanadiniz.com</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0 text-terra-500" /> +90 (256) 000 00 00</li>
              <li className="flex items-center gap-2"><AtSign className="h-4 w-4 shrink-0 text-terra-500" /> buharkentpazari</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-cream-50/10 pt-6 text-xs text-cream-50/50 md:flex-row md:items-center">
          <div>
            <p>© {new Date().getFullYear()} Buharkent Pazarı. Tüm hakları Harun Eymen Vural&apos;da saklıdır.</p>
            <p className="mt-1">Buharkent Yerel Eylem Grubu Derneği girişimidir.</p>
          </div>
          <button
            onClick={() => lenis?.scrollTo(0, { duration: 2 })}
            className="group inline-flex items-center gap-2 rounded-full border border-cream-50/20 px-4 py-2 text-cream-50/80 transition-colors hover:border-cream-50 hover:text-cream-50"
          >
            Başa dön <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>

      <div className="pointer-events-none select-none overflow-hidden">
        <motion.p
          className="-mb-[0.2em] text-center font-display text-[19vw] leading-none text-cream-50/[0.06]"
          initial={{ y: "60%" }}
          whileInView={{ y: "0%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease }}
        >
          Buharkent
        </motion.p>
      </div>
    </footer>
  );
}