"use client";

import ProductImage from "@/components/shop/ProductImage";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, Clock, MapPin, Minus, Plus, ShoppingBag, Star, Truck, X } from "lucide-react";
import { useLenis } from "lenis/react";
import { formatPrice, initials, linesFor, sellerGradient, variantLabels, type CatalogProduct, type Line } from "@/lib/catalog";

const ease = [0.76, 0, 0.24, 1] as const;

export default function QuickAddModal({
  product,
  open,
  onClose,
  onAdd,
}: {
  product: CatalogProduct;
  open: boolean;
  onClose: () => void;
  onAdd: (line: Line, qty: number) => void;
}) {
  const labels = useMemo(() => variantLabels(product.id), [product.id]);
  const [label, setLabel] = useState(labels[0]);
  const lines = useMemo(() => linesFor(product.id, label), [product.id, label]);
  const [selected, setSelected] = useState("");
  const [qty, setQty] = useState(1);
  const lenis = useLenis();
  const Icon = product.icon;

  const current = lines.find((l) => l.offer.id === selected) ?? lines.find((l) => l.variant.stock > 0);
  const maxQty = Math.min(current?.variant.stock ?? 1, 99);

  useEffect(() => {
    if (open) {
      setLabel(labels[0]);
      setQty(1);
      lenis?.stop();
    } else lenis?.start();
  }, [open, labels, lenis]);

  useEffect(() => {
    setSelected("");
    setQty(1);
  }, [lines]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-label={`${product.name} seçenekleri`}
            className="relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-[2rem] bg-cream-100 shadow-2xl sm:max-w-lg sm:rounded-[2rem]"
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease }}
          >
            <div className="flex items-center gap-4 border-b border-sand-300 p-5">
              <ProductImage src={product.images?.[0]} icon={Icon} sizes="64px" className="h-16 w-16 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-xl text-olive-900">{product.name}</p>
                <Link href={`/urun/${product.slug}`} onClick={onClose} className="text-xs font-semibold text-olive-700 hover:underline">
                  Ürün sayfasına git
                </Link>
              </div>
              <button onClick={onClose} aria-label="Kapat" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-sand-300/60">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div data-lenis-prevent className="flex-1 overflow-y-auto p-5">
              <p className="text-sm font-semibold text-ink">Miktar seçin</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {labels.map((l) => {
                  const active = l === label;
                  return (
                    <button
                      key={l}
                      onClick={() => setLabel(l)}
                      className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                        active ? "text-cream-50" : "border border-sand-400 text-olive-900 hover:border-olive-700"
                      }`}
                    >
                      {active && (
                        <motion.span layoutId={`variant-${product.id}`} className="absolute inset-0 rounded-full bg-olive-700" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                      )}
                      <span className="relative">{l}</span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-6 text-sm font-semibold text-ink">Üreticini seç</p>
              <div className="mt-3 space-y-2">
                {lines.map((line, i) => {
                  const active = current?.offer.id === line.offer.id;
                  const out = line.variant.stock === 0;
                  const choose = () => !out && setSelected(line.offer.id);
                  return (
                    <motion.div
                      key={line.offer.id}
                      role="radio"
                      aria-checked={active}
                      aria-disabled={out}
                      tabIndex={out ? -1 : 0}
                      onClick={choose}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), choose())}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`cursor-pointer rounded-2xl border p-3.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-olive-500 ${
                        out ? "cursor-not-allowed opacity-40" : ""
                      } ${active ? "border-olive-700 bg-olive-500/10" : "border-sand-300 hover:border-sand-400"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br font-display text-sm text-cream-50 ${sellerGradient(line.seller.type)}`}>
                          {initials(line.seller.name)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate font-semibold text-ink">{line.seller.name}</span>
                            {line.seller.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-olive-700" />}
                          </span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {line.seller.village}</span>
                            <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-terra-500 text-terra-500" /> {line.offer.rating.toFixed(1)}</span>
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          {line.variant.oldPrice && <span className="block text-xs text-muted line-through">{formatPrice(line.variant.oldPrice)}</span>}
                          <span className="font-bold text-olive-900">{formatPrice(line.variant.price)}</span>
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs italic text-olive-700">&ldquo;{line.seller.tagline}&rdquo;</p>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                        <span className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            {line.offer.shippingFee === 0 ? "Ücretsiz kargo" : formatPrice(line.offer.shippingFee)}
                          </span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {line.offer.shipsIn}</span>
                          {out && <span className="font-semibold text-terra-600">Stokta yok</span>}
                          {!out && line.variant.stock <= 5 && <span className="font-semibold text-terra-600">Son {line.variant.stock}</span>}
                        </span>
                        <Link
                          href={`/urun/${product.slug}?uretici=${line.seller.slug}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                          }}
                          className="flex items-center gap-0.5 font-semibold text-olive-700 hover:underline"
                        >
                          Üreticiyi tanı <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {current && (
              <div className="flex items-center gap-3 border-t border-sand-300 bg-cream-50 p-5">
                <div className="flex items-center rounded-full border border-sand-400">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Azalt" className="grid h-11 w-11 place-items-center">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center font-semibold tabular-nums">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} aria-label="Artır" className="grid h-11 w-11 place-items-center">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => onAdd(current, qty)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-olive-700 py-3.5 font-semibold text-cream-50 transition-colors hover:bg-olive-900"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Sepete ekle · {formatPrice(current.variant.price * qty)}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}