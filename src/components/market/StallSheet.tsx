"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Check, MapPin, ShieldCheck, ShoppingBag, Store, Truck, X } from "lucide-react";
import { categories, formatPrice, initials, type Seller, type Variant } from "@/lib/catalog";
import { toCartItem } from "@/lib/cartLine";
import { useCart } from "@/store/cart";
import type { StallInfo, StallItem } from "./layout";

const ease = [0.76, 0, 0.24, 1] as const;

function ItemRow({ it, seller }: { it: StallItem; seller: Seller }) {
  const add = useCart((s) => s.add);
  const variants = [...it.offer.variants].sort((a, b) => a.size - b.size);
  const [vid, setVid] = useState(variants.find((v) => v.stock > 0)?.id ?? variants[0].id);
  const [done, setDone] = useState(false);
  const v = variants.find((x) => x.id === vid) as Variant;
  const cat = categories.find((c) => c.slug === it.product.category);
  const Icon = it.product.icon;
  const out = v.stock <= 0;

  const onAdd = () => {
    if (out) return;
    add(toCartItem(it.product, { offer: it.offer, variant: v, seller }));
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  };

  return (
    <div className="flex gap-3 rounded-3xl bg-cream-50 p-3 shadow-soft">
      <div className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br ${cat?.bg ?? "from-sand-300 to-sand-400"}`}>
        {it.image ? (
          <Image src={it.image} alt={it.product.name} fill sizes="96px" className="object-cover" />
        ) : (
          <Icon className={`absolute inset-0 m-auto h-10 w-10 ${it.product.light ? "text-olive-700/60" : "text-cream-50/70"}`} strokeWidth={1.2} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/urun/${it.product.slug}`} className="line-clamp-2 font-semibold leading-snug text-ink hover:text-olive-700">
          {it.product.name}
        </Link>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {variants.map((x) => (
            <button
              key={x.id}
              onClick={() => setVid(x.id)}
              disabled={x.stock <= 0}
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-40 ${x.id === vid ? "border-olive-700 bg-olive-700 text-cream-50" : "border-sand-400 text-olive-900"}`}
            >
              {x.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p>
            <span className="font-display text-xl text-olive-900">{formatPrice(v.price)}</span>
            {v.oldPrice && <span className="ml-1.5 text-sm text-muted line-through">{formatPrice(v.oldPrice)}</span>}
          </p>
          <button
            onClick={onAdd}
            disabled={out}
            className={`flex min-h-[40px] items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors disabled:opacity-50 ${done ? "bg-olive-500 text-cream-50" : "bg-terra-500 text-cream-50 hover:bg-terra-600"}`}
          >
            {done ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            {out ? "Tükendi" : done ? "Eklendi" : "Sepete ekle"}
          </button>
        </div>
        {v.stock > 0 && v.stock <= 3 && <p className="mt-1 text-xs font-semibold text-terra-600">Son {v.stock} adet</p>}
      </div>
    </div>
  );
}

export default function StallSheet({ stall, onClose }: { stall: StallInfo | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {stall && (
        <motion.aside
          key={stall.key}
          data-lenis-prevent
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.45, ease }}
          className="absolute inset-x-0 bottom-0 z-30 flex max-h-[78dvh] flex-col overflow-hidden rounded-t-[2rem] bg-cream-100 shadow-2xl md:inset-x-auto md:bottom-4 md:right-4 md:top-4 md:max-h-none md:w-[440px] md:rounded-[2rem]"
          role="dialog"
          aria-label={stall.seller?.name ?? "Boş tezgâh"}
        >
          {/* Başlık: tente renginde şerit */}
          <div className="relative shrink-0 p-5 pb-4" style={{ background: `repeating-linear-gradient(90deg, ${stall.colors[0]} 0 28px, ${stall.colors[1]} 28px 56px)` }}>
            <button onClick={onClose} aria-label="Kapat" className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-cream-50/95 text-ink shadow-md">
              <X className="h-5 w-5" />
            </button>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-cream-50/95 p-3 shadow-md">
              {stall.seller ? (
                <>
                  <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full font-display text-xl text-cream-50" style={{ background: stall.colors[0] }}>
                    {stall.seller.avatar ? <Image src={stall.seller.avatar} alt="" fill sizes="56px" className="object-cover" /> : initials(stall.seller.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate font-display text-xl text-olive-900">
                      {stall.seller.name} {stall.seller.verified && <BadgeCheck className="h-5 w-5 shrink-0 text-olive-700" />}
                    </p>
                    <p className="flex items-center gap-1 truncate text-sm text-muted">
                      <MapPin className="h-3.5 w-3.5 shrink-0" /> {stall.seller.village} · {stall.seller.type}
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <p className="font-display text-xl text-olive-900">Bu tezgâh senin olabilir</p>
                  <p className="text-sm text-muted">Aydın, Denizli veya Muğla&apos;da üretiyorsan</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain p-4 md:p-5">
            {stall.seller ? (
              <>
                {stall.seller.tagline && <p className="mb-3 text-sm italic leading-relaxed text-ink/75">&ldquo;{stall.seller.tagline}&rdquo;</p>}
                {(stall.seller.badges?.length || stall.seller.freeShippingOver) && (
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {stall.seller.badges?.map((b) => (
                      <span key={b} className="flex items-center gap-1 rounded-full border border-olive-700/30 bg-cream-50 px-2.5 py-1 text-xs font-semibold text-olive-700">
                        <ShieldCheck className="h-3.5 w-3.5" /> {b}
                      </span>
                    ))}
                    {!!stall.seller.freeShippingOver && (
                      <span className="flex items-center gap-1 rounded-full bg-olive-500/15 px-2.5 py-1 text-xs font-semibold text-olive-700">
                        <Truck className="h-3.5 w-3.5" /> {formatPrice(stall.seller.freeShippingOver)} üzeri kargo ücretsiz
                      </span>
                    )}
                  </div>
                )}
                <div className="space-y-3">
                  {stall.items.map((it) => (
                    <ItemRow key={it.offer.id} it={it} seller={stall.seller!} />
                  ))}
                  {stall.items.length === 0 && <p className="rounded-2xl bg-cream-50 p-5 text-center text-muted">Bu üretici tezgâhını henüz kuruyor.</p>}
                </div>
                <Link href={`/uretici/${stall.seller.slug}`} className="mt-4 flex min-h-[48px] items-center justify-center gap-2 rounded-full border-2 border-olive-700 font-semibold text-olive-700 hover:bg-olive-700/5">
                  <Store className="h-4 w-4" /> Üreticinin hikâyesi ve mağazası
                </Link>
              </>
            ) : (
              <div className="space-y-4 text-ink/80">
                <p className="leading-relaxed">Kendi ürettiğin ürünleri aracısız satmak ister misin? Başvuru ücretsiz; para doğrudan senin hesabına gelir.</p>
                <Link href="/uretici-ol" className="flex min-h-[52px] items-center justify-center rounded-full bg-olive-700 font-semibold text-cream-50 hover:bg-olive-900">
                  Üretici olarak başvur
                </Link>
                <Link href="/satici-rehberi" className="block text-center text-sm font-semibold text-olive-700 underline">
                  Hangi belgeler gerekiyor?
                </Link>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
