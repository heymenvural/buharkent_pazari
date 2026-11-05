"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Plus } from "lucide-react";

const ease = [0.76, 0, 0.24, 1] as const;

const faqs = [
  {
    q: "Ürünler gerçekten Buharkent'te mi üretiliyor?",
    a: "Evet. Sitedeki tüm üreticiler Buharkent'te yaşayan ve üretim yapan, BUHARYEG tarafından tek tek doğrulanan kadın girişimciler ve genç çiftçilerdir.",
  },
  {
    q: "Üye olmadan alışveriş yapabilir miyim?",
    a: "Elbette. Ürünleri sepete ekleyip misafir olarak sipariş verebilirsiniz. Üye olursanız siparişlerinizi ve kargo takibini tek yerden izleyebilirsiniz.",
  },
  {
    q: "Kargo nasıl çalışıyor?",
    a: "Her üretici kendi ürününü özenle paketleyip kargoya verir. Kargo ücreti ürün sayfasında belirtilir, takip numarası hesabınıza ve e-postanıza iletilir.",
  },
  {
    q: "Hangi ödeme yöntemlerini kullanabilirim?",
    a: "Şu an havale/EFT ile ödeme alıyoruz. Güvenli kredi kartı ile ödeme seçeneği çok yakında aktif olacak.",
  },
  {
    q: "Ürün beklediğim gibi çıkmazsa ne olur?",
    a: "Mesafeli satış mevzuatı kapsamındaki tüm haklarınız saklıdır. Bize yazmanız yeterli; üreticiyle birlikte en kısa sürede çözüm buluruz.",
  },
  {
    q: "Ben de üretici olabilir miyim?",
    a: "Buharkent'te üretim yapıyorsanız başvuru formunu doldurun. Ekibimiz sizinle iletişime geçip mağazanızı açmanıza yardımcı olur.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="sss" className="px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-terra-500">SSS</span>
          <h2 className="mt-3 text-4xl leading-[1.1] text-olive-900 md:text-6xl">
            Merak <span className="italic text-terra-500">ettikleriniz.</span>
          </h2>
          <div className="mt-8 rounded-3xl bg-cream-200 p-6 md:p-8">
            <p className="font-display text-xl text-olive-900">Cevabını bulamadınız mı?</p>
            <p className="mt-2 text-sm text-muted">Ekibimiz size yardımcı olmaktan mutluluk duyar.</p>
            <a
              href="#iletisim"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-olive-700 px-6 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-olive-900"
            >
              <Mail className="h-4 w-4" /> Bize ulaşın
            </a>
          </div>
        </div>

        <div className="border-t border-sand-300">
          {faqs.map((f, i) => {
            const active = open === i;
            return (
              <motion.div
                key={f.q}
                className="border-b border-sand-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.6 }}
              >
                <button
                  onClick={() => setOpen(active ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left md:py-6"
                >
                  <span className={`font-display text-lg transition-colors md:text-2xl ${active ? "text-terra-500" : "text-olive-900"}`}>
                    {f.q}
                  </span>
                  <motion.span
                    animate={{ rotate: active ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors ${
                      active ? "border-terra-500 bg-terra-500 text-cream-50" : "border-sand-400"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {active && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-10 leading-relaxed text-muted md:pr-14">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}