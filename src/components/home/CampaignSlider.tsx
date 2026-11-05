"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Droplets, Gift, Nut, Percent, Sprout } from "lucide-react";
import { introDelay } from "@/lib/intro";

const ease = [0.76, 0, 0.24, 1] as const;

const slides = [
  {
    tag: "Sezonun ilk hasadı",
    title: "Yeni hasat zeytinyağı",
    sub: "Erken hasat sızma zeytinyağında %10'a varan indirim.",
    cta: "Fırsatı yakala",
    href: "/urun/erken-hasat-zeytinyagi",
    bg: "from-olive-500 to-olive-900",
    icon: Droplets,
  },
  {
    tag: "Sezonun yıldızı",
    title: "Buharkent inciri",
    sub: "Güneşte kurutulmuş, katkısız; doğrudan üreticisinden.",
    cta: "Hemen keşfet",
    href: "/kategori/incir-kuru-urunler",
    bg: "from-fig-600 to-[#2a141d]",
    icon: Nut,
  },
  {
    tag: "Hediye",
    title: "Sevdiklerine Buharkent'ten",
    sub: "Lezzet kutularında ücretsiz kargo fırsatı.",
    cta: "Kutuları gör",
    href: "/kategori/hediye-kutulari",
    bg: "from-terra-500 to-[#7a3417]",
    icon: Gift,
  },
];

export default function CampaignSlider() {
  const [[index, dir], setState] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const [delay] = useState(() => introDelay(1.5));

  const go = (d: number) => setState(([i]) => [(i + d + slides.length) % slides.length, d]);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setState(([i]) => [(i + 1) % slides.length, 1]), 5500);
    return () => clearTimeout(t);
  }, [index, paused]);

  const s = slides[index];
  const Icon = s.icon;

  return (
    <motion.section
      className="grid gap-3 md:gap-4 lg:grid-cols-3"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease }}
    >
      <div
        className="relative h-[320px] overflow-hidden rounded-[2rem] sm:h-[380px] lg:col-span-2 lg:h-[440px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={index}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%" }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d > 0 ? "-30%" : "30%", opacity: 0.4 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.8, ease }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) go(1);
              else if (info.offset.x > 80) go(-1);
            }}
            className={`absolute inset-0 flex bg-gradient-to-br ${s.bg} p-6 text-cream-50 sm:p-10 lg:p-14`}
          >
            <span className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full border border-cream-50/10" />
            <span className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full border border-cream-50/10" />
            <motion.span
              className="pointer-events-none absolute -bottom-10 -right-6 opacity-20"
              animate={{ y: [0, -14, 0], rotate: [-8, -2, -8] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Icon className="h-56 w-56 sm:h-72 sm:w-72 lg:h-96 lg:w-96" strokeWidth={0.8} />
            </motion.span>

            <div className="relative z-10 flex max-w-md flex-col justify-center">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="self-start rounded-full bg-cream-50/15 px-3 py-1 text-xs font-semibold backdrop-blur"
              >
                {s.tag}
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7, ease }}
                className="mt-4 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl"
              >
                {s.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-3 text-sm text-cream-50/80 sm:text-base"
              >
                {s.sub}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Link
                  href={s.href}
                  className="group mt-6 inline-flex items-center gap-2 rounded-full bg-cream-50 px-6 py-3 text-sm font-semibold text-olive-900 transition-colors hover:bg-sand-300"
                >
                  {s.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-5 left-6 z-20 flex gap-2 sm:left-10 lg:left-14">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Kampanya ${i + 1}`}
              onClick={() => setState([i, i > index ? 1 : -1])}
              className="relative h-1.5 w-8 overflow-hidden rounded-full bg-cream-50/30"
            >
              {i === index && (
                <motion.span
                  key={`${index}-${paused}`}
                  className="absolute inset-y-0 left-0 bg-cream-50"
                  initial={{ width: paused ? "100%" : "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: paused ? 0 : 5.5, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="absolute bottom-4 right-4 z-20 hidden gap-2 sm:flex">
          {[
            { d: -1, icon: ChevronLeft, label: "Önceki" },
            { d: 1, icon: ChevronRight, label: "Sonraki" },
          ].map(({ d, icon: I, label }) => (
            <button
              key={label}
              aria-label={label}
              onClick={() => go(d)}
              className="grid h-10 w-10 place-items-center rounded-full bg-cream-50/15 text-cream-50 backdrop-blur transition-colors hover:bg-cream-50/30"
            >
              <I className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-1">
        {[
          { href: "/#firsatlar", title: "Günün Fırsatları", sub: "Her gün yeni indirimler", icon: Percent, cls: "bg-terra-500 text-cream-50" },
          { href: "/uretici-ol", title: "Üretici misin?", sub: "Ürünlerini tüm Türkiye'ye sat", icon: Sprout, cls: "bg-sand-300 text-olive-900" },
        ].map((b) => {
          const I = b.icon;
          return (
            <Link
              key={b.title}
              href={b.href}
              className={`group relative flex min-h-[150px] flex-col justify-end overflow-hidden rounded-[2rem] p-5 sm:p-7 ${b.cls}`}
            >
              <I
                className="absolute -right-4 -top-4 h-28 w-28 opacity-20 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110 sm:h-36 sm:w-36"
                strokeWidth={1}
              />
              <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/20 transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
              <h3 className="relative text-xl leading-tight sm:text-3xl">{b.title}</h3>
              <p className="relative mt-1 text-xs opacity-80 sm:text-sm">{b.sub}</p>
            </Link>
          );
        })}
      </div>
    </motion.section>
  );
}