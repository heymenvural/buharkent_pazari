"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useLenis } from "lenis/react";
import { useCart, selectCount, selectTotal } from "@/store/cart";
import { useUI } from "@/store/ui";
import { catalog, formatPrice } from "@/lib/catalog";

const ease = [0.76, 0, 0.24, 1] as const;

export default function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const close = useUI((s) => s.closeCart);
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const count = useCart(selectCount);
  const total = useCart(selectTotal);
  const lenis = useLenis();

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open, lenis]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-label="Sepet"
            className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col bg-cream-100 shadow-2xl sm:rounded-l-[2rem]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="flex items-center justify-between border-b border-sand-300 px-5 py-5 md:px-6">
              <h2 className="text-2xl text-olive-900">
                Sepetim <span className="font-sans text-base text-muted">({count})</span>
              </h2>
              <button onClick={close} aria-label="Kapat" className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-sand-300/60">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div data-lenis-prevent className="flex-1 overflow-y-auto px-5 md:px-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <motion.span
                    className="grid h-24 w-24 place-items-center rounded-full bg-cream-200"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ShoppingBag className="h-10 w-10 text-olive-700" strokeWidth={1.5} />
                  </motion.span>
                  <p className="mt-6 font-display text-2xl text-olive-900">Sepetin henüz boş</p>
                  <p className="mt-2 text-sm text-muted">Buharkent&apos;in lezzetleri seni bekliyor.</p>
                  <button
                    onClick={close}
                    className="mt-6 rounded-full bg-olive-700 px-6 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-olive-900"
                  >
                    Alışverişe başla
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-sand-300">
                  <AnimatePresence initial={false}>
                    {items.map((i) => {
                      const p = catalog.find((x) => x.id === i.productId) ?? catalog.find((x) => x.slug === i.slug);
                      const Icon = p?.icon;
                      return (
                        <motion.li
                          key={i.id}
                          layout
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 80, height: 0, paddingTop: 0, paddingBottom: 0 }}
                          transition={{ duration: 0.4, ease }}
                          className="flex gap-4 overflow-hidden py-5"
                        >
                          <Link
                            href={`/urun/${i.slug}`}
                            onClick={close}
                            className={`grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${p?.bg ?? "from-sand-300 to-sand-400"}`}
                          >
                            {Icon && <Icon strokeWidth={1.2} className={`h-9 w-9 ${p?.light ? "text-olive-700/60" : "text-cream-50/70"}`} />}
                          </Link>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <Link href={`/urun/${i.slug}`} onClick={close} className="block truncate font-display text-base text-ink hover:text-olive-700">
                                  {i.name}
                                </Link>
                                <p className="truncate text-xs text-muted">
                                  {i.unit} · {i.seller}
                                </p>
                              </div>
                              <button
                                onClick={() => remove(i.id)}
                                aria-label="Kaldır"
                                className="shrink-0 rounded-full p-1.5 text-muted transition-colors hover:bg-terra-500/10 hover:text-terra-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="mt-auto flex items-center justify-between pt-3">
                              <div className="flex items-center rounded-full border border-sand-400">
                                <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="Azalt" className="grid h-8 w-8 place-items-center">
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <motion.span
                                  key={i.qty}
                                  initial={{ y: -8, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  className="w-6 text-center text-sm font-semibold tabular-nums"
                                >
                                  {i.qty}
                                </motion.span>
                                <button
                                  onClick={() => setQty(i.id, i.qty + 1)}
                                  disabled={i.maxQty !== undefined && i.qty >= i.maxQty}
                                  aria-label="Artır"
                                  className="grid h-8 w-8 place-items-center disabled:opacity-30"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <span className="font-bold text-olive-900">{formatPrice(i.price * i.qty)}</span>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-sand-300 bg-cream-50 px-5 pb-6 pt-5 md:px-6">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Ara toplam</span>
                  <span className="font-display text-2xl text-olive-900">{formatPrice(total)}</span>
                </div>
                <p className="mt-1 text-xs text-muted">Kargo ücretleri ödeme adımında üreticiye göre eklenir.</p>
                <Link
                  href="/odeme"
                  onClick={close}
                  className="group mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-olive-700 py-4 font-semibold text-cream-50 transition-colors hover:bg-olive-900"
                >
                  Siparişi Tamamla
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <button onClick={close} className="mt-3 w-full text-center text-sm font-semibold text-olive-700">
                  Alışverişe devam et
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}