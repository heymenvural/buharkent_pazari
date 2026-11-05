"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";

const ease = [0.76, 0, 0.24, 1] as const;
const KEY = "bp-welcome-seen";
// Açılış animasyonu (preloader) bitmeden açılmasın diye bekleme süresi (ms)
const DELAY = 3200;

export default function WelcomeModal() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Sadece ana sayfada, oturum başına bir kez
  useEffect(() => {
    if (pathname !== "/") return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {}
    if (seen) return;
    const t = setTimeout(() => setOpen(true), DELAY);
    return () => clearTimeout(t);
  }, [pathname]);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
  };

  // Esc ile kapat, sayfa kaymasını durdur
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-3 md:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-title"
          data-lenis-prevent
        >
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={close} />

          <motion.div
            className="relative flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] bg-cream-50 shadow-2xl md:grid md:max-h-[92vh] md:max-w-4xl md:grid-cols-2 md:rounded-[2rem]"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.6, ease }}
          >
            <button
              ref={closeRef}
              onClick={close}
              aria-label="Kapat"
              className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-cream-50/90 text-ink shadow-md backdrop-blur transition-transform hover:rotate-90"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Görsel: telefonda üstte bant, bilgisayarda solda tam yükseklik */}
            <div className="relative h-[34dvh] max-h-[300px] min-h-[200px] w-full shrink-0 md:h-auto md:max-h-none md:min-h-[540px]">
              <Image
                src="/karsilama.png"
                alt="BUHARYEG Yönetim Kurulu Başkanı Mehmet Erol"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 448px"
                className="object-cover object-[center_22%] md:object-center"
              />
              {/* Telefonda isim fotoğrafın üstünde */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent px-5 pb-4 pt-16 md:hidden">
                <p className="font-display text-xl leading-tight text-cream-50">Mehmet Erol</p>
                <p className="text-sm text-cream-50/85">BUHARYEG Yönetim Kurulu Başkanı</p>
              </div>
            </div>

            {/* Yazı */}
            <div className="flex min-h-0 flex-col overflow-y-auto p-5 md:justify-center md:p-10">
              <Image
                src="/buharyeg-logo.png"
                alt="BUHARYEG"
                width={140}
                height={56}
                className="h-9 w-auto object-contain object-left md:h-12"
              />

              <h2 id="welcome-title" className="mt-4 text-2xl leading-tight text-olive-900 md:mt-6 md:text-4xl">
                Buharkent Pazarı&apos;na hoş geldiniz
              </h2>

              <div className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-ink/80 md:mt-4 md:space-y-3 md:text-base">
                <p>
                  Bölgemizin kadın girişimcileri ve genç çiftçileri, emekle ürettiklerini artık aracısız olarak sofranıza ulaştırıyor.
                </p>
                <p>
                  Buharkent Pazarı ile yerel üreticimizin emeğini hak ettiği değerle buluşturmayı ve halkımızın kalkınmasına destek olmayı amaçladık. Her siparişiniz, bir üreticimizin yüzünü güldürüyor.
                </p>
              </div>

              {/* Bilgisayarda imza yazının altında */}
              <div className="mt-6 hidden border-l-4 border-terra-500 pl-4 md:block">
                <p className="font-display text-lg text-olive-900">Mehmet Erol</p>
                <p className="text-sm text-muted">BUHARYEG Yönetim Kurulu Başkanı</p>
              </div>

              <div className="mt-5 flex flex-col gap-2.5 md:mt-8 md:flex-row md:gap-3">
                <button
                  onClick={close}
                  className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-olive-700 px-6 font-semibold text-cream-50 hover:bg-olive-900"
                >
                  Alışverişe başla <ArrowRight className="h-5 w-5" />
                </button>
                <Link
                  href="/hakkimizda"
                  onClick={close}
                  className="flex min-h-[48px] items-center justify-center rounded-full px-6 font-semibold text-olive-700 hover:bg-cream-200 md:min-h-[52px] md:border-2 md:border-olive-700 md:hover:bg-transparent"
                >
                  Hikâyemiz
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}