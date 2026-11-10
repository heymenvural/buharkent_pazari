"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, BadgeCheck, CalendarDays, Camera, Check, ChevronRight, Clock, MapPin,
  MessageSquare, Minus, Plus, Quote, ShoppingBag, Star, Store, Truck,
} from "lucide-react";
import { useCart } from "@/store/cart";
import { flyToCart } from "@/lib/flyToCart";
import { toCartItem } from "@/lib/cartLine";
import ProductCard from "@/components/shop/ProductCard";
import ReportButton from "@/components/shop/ReportButton";
import AskSeller from "@/components/shop/AskSeller";
import { unitPrice } from "@/lib/units";
import {
  catalog, discountPct, formatPrice, getCategory, getProduct, getSeller, initials, linesFor,
  offerReviews, offersFor, productRating, sellerGradient, variantLabels,
} from "@/lib/catalog";

const ease = [0.76, 0, 0.24, 1] as const;

function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${size} ${n <= Math.round(value) ? "fill-terra-500 text-terra-500" : "text-sand-400"}`} />
      ))}
    </span>
  );
}

export default function ProductDetail({ slug, initialSeller }: { slug: string; initialSeller?: string }) {
  const product = getProduct(slug)!;
  const router = useRouter();
  const labels = useMemo(() => variantLabels(product.id), [product.id]);

  const [label, setLabel] = useState(() => {
    if (initialSeller) {
      const o = offersFor(product.id).find((x) => getSeller(x.sellerId).slug === initialSeller);
      if (o) return [...o.variants].sort((a, b) => a.size - b.size)[0].label;
    }
    return labels[0];
  });
  const [sellerSlug, setSellerSlug] = useState<string | undefined>(initialSeller);
  const [qty, setQty] = useState(1);
  const [thumb, setThumb] = useState(0);
  const [added, setAdded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const add = useCart((s) => s.add);

  const category = getCategory(product.category);
  const { rating, reviews } = productRating(product.id);
  const Icon = product.icon;

  const lines = useMemo(() => linesFor(product.id, label), [product.id, label]);
  const current = lines.find((l) => l.seller.slug === sellerSlug) ?? lines.find((l) => l.variant.stock > 0) ?? lines[0];
  const reviewsList = current ? offerReviews(current.offer.id) : [];
  // Üreticinin kendi fotoğrafları varsa onlar, yoksa katalog görselleri, o da yoksa ikon gösterilir
  const ownPhotos = !!current?.offer.images?.length;
  const photos = (ownPhotos ? current!.offer.images! : product.images ?? []).slice(0, 6);
  const photo = photos.length ? photos[thumb % photos.length] : undefined;

  const related = useMemo(() => {
    const same = catalog.filter((p) => p.category === product.category && p.id !== product.id);
    const others = catalog.filter((p) => p.category !== product.category && p.id !== product.id);
    return [...same, ...others].slice(0, 5);
  }, [product]);

  const select = (s: string) => {
    setSellerSlug(s);
    setQty(1);
    setThumb(0);
    router.replace(`/urun/${product.slug}?uretici=${s}`, { scroll: false });
  };

  const addCurrent = () => {
    if (!current || current.variant.stock === 0) return;
    add(toCartItem(product, current), Math.min(qty, current.variant.stock));
    if (imgRef.current) flyToCart(imgRef.current);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <nav className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs text-muted [scrollbar-width:none]">
        <Link href="/" className="hover:text-olive-700">Ana sayfa</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        {category && (
          <>
            <Link href={`/kategori/${category.slug}`} className="hover:text-olive-700">{category.name}</Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
          </>
        )}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
        {/* Galeri */}
        <div className="lg:sticky lg:top-36 lg:self-start">
          <div ref={imgRef} className="relative aspect-square overflow-hidden rounded-3xl bg-cream-200">
            <AnimatePresence mode="wait">
              <motion.span
                key={`${current?.seller.slug}-${thumb}`}
                className="absolute inset-0 grid place-items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {photo ? (
                  <Image src={photo} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 600px" className="object-cover" />
                ) : (
                  <Icon strokeWidth={1} className="h-1/3 w-1/3 text-olive-700/30" />
                )}
              </motion.span>
            </AnimatePresence>
            {current && photo && (
              <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-cream-50/90 px-3 py-1.5 text-[13px] font-semibold text-olive-900">
                <Camera className="h-4 w-4" /> {ownPhotos ? current.seller.name : "Temsili fotoğraf"}
              </span>
            )}
          </div>
          {photos.length > 1 ? (
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
              {photos.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setThumb(i)}
                  aria-label={`Görsel ${i + 1}`}
                  className={`relative aspect-square overflow-hidden rounded-2xl bg-sand-300 transition-all ${
                    thumb === i ? "ring-2 ring-olive-700 ring-offset-2 ring-offset-cream-100" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="120px" className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Bilgi + seçim */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
          {category && (
            <Link href={`/kategori/${category.slug}`} className="inline-block rounded-full bg-olive-500/15 px-3 py-1 text-xs font-semibold text-olive-700">
              {category.name}
            </Link>
          )}
          <h1 className="mt-3 text-3xl leading-tight text-olive-900 md:text-5xl">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <Stars value={rating} />
              <span className="font-semibold text-ink">{rating.toFixed(1)}</span>
              <span>({reviews} değerlendirme)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Store className="h-4 w-4" /> {offersFor(product.id).length} üretici
            </span>
          </div>
          <p className="mt-4 leading-relaxed text-ink/80">{product.description}</p>

          {/* 1. Miktar */}
          <p className="mt-7 flex items-center gap-2 text-sm font-semibold text-ink">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-olive-700 text-xs text-cream-50">1</span> Miktar seç
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {labels.map((l) => {
              const active = l === label;
              return (
                <button
                  key={l}
                  onClick={() => {
                    setLabel(l);
                    setQty(1);
                  }}
                  className={`relative rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                    active ? "text-cream-50" : "border border-sand-400 text-olive-900 hover:border-olive-700"
                  }`}
                >
                  {active && (
                    <motion.span layoutId="detail-variant" className="absolute inset-0 rounded-full bg-olive-700" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                  )}
                  <span className="relative">{l}</span>
                </button>
              );
            })}
          </div>

          {/* 2. Üretici */}
          <p className="mt-7 flex items-center gap-2 text-sm font-semibold text-ink">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-olive-700 text-xs text-cream-50">2</span>
            Üreticini seç <span className="font-normal text-muted">({lines.length})</span>
          </p>
          <div className="mt-3 space-y-2">
            {lines.map((l) => {
              const active = current?.seller.slug === l.seller.slug;
              const out = l.variant.stock === 0;
              const total = l.variant.price * qty + l.offer.shippingFee;
              return (
                <button
                  key={l.offer.id}
                  disabled={out}
                  onClick={() => select(l.seller.slug)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors disabled:opacity-40 ${
                    active ? "border-olive-700 bg-olive-500/10" : "border-sand-300 bg-cream-50 hover:border-sand-400"
                  }`}
                >
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${active ? "border-olive-700" : "border-sand-400"}`}>
                    {active && <span className="h-2.5 w-2.5 rounded-full bg-olive-700" />}
                  </span>
                  <span className={`hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br font-display text-cream-50 sm:grid ${sellerGradient(l.seller.type)}`}>
                    {initials(l.seller.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate font-semibold text-ink">{l.seller.name}</span>
                      {l.seller.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-olive-700" />}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0" /> {l.seller.village.split(",")[0]}</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-terra-500 text-terra-500" /> {l.offer.rating.toFixed(1)}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    {l.variant.oldPrice && <span className="block text-xs text-muted line-through">{formatPrice(l.variant.oldPrice)}</span>}
                    <span className="block font-bold text-olive-900">{formatPrice(l.variant.price)}</span>
                    {unitPrice(l.variant.label, l.variant.price) && <span className="block text-xs text-muted">{unitPrice(l.variant.label, l.variant.price)}</span>}
                    <span className="block text-xs text-muted">{out ? "Stokta yok" : `Kargo dahil ${formatPrice(total)}`}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Adet + ekle */}
          {current && (
            <div className="mt-6 hidden items-center gap-3 lg:flex">
              <div className="flex items-center rounded-full border border-sand-400 bg-cream-50">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Azalt" className="grid h-12 w-12 place-items-center">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-semibold tabular-nums">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(current.variant.stock, 99, q + 1))} aria-label="Artır" className="grid h-12 w-12 place-items-center">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={addCurrent}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-olive-700 px-6 py-4 font-semibold text-cream-50 transition-colors hover:bg-olive-900"
              >
                {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                <span className="truncate">
                  {added ? "Sepete eklendi" : `${current.seller.name}'ndan ekle · ${formatPrice(current.variant.price * qty)}`}
                </span>
              </button>
            </div>
          )}
          {current && current.variant.oldPrice && (
            <p className="mt-3 text-sm font-semibold text-terra-600">
              Bu üreticide %{discountPct(current.variant.price, current.variant.oldPrice)} indirim
            </p>
          )}
          {current && <ReportButton offerId={current.offer.id} productName={product.name} sellerName={current.seller.name} />}
        </motion.div>
      </div>

      {/* Seçili üreticinin paneli */}
      {current && (
        <AnimatePresence mode="wait">
          <motion.div
            key={current.seller.slug}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease }}
            className="mt-14 md:mt-20"
          >
            <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <section className="rounded-[2rem] bg-cream-50 p-6 shadow-soft md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-terra-500">Üreticinin anlatımıyla</p>
                <div className="mt-4 flex gap-3">
                  <Quote className="h-8 w-8 shrink-0 text-sand-400" />
                  <p className="font-display text-xl italic leading-relaxed text-olive-900 md:text-2xl">{current.offer.note}</p>
                </div>
                <dl className="mt-8 grid gap-3 sm:grid-cols-2">
                  {current.offer.details.map(([k, v]) => (
                    <div key={k} className="rounded-2xl bg-cream-100 p-4">
                      <dt className="text-xs text-muted">{k}</dt>
                      <dd className="mt-1 font-semibold text-ink">{v}</dd>
                    </div>
                  ))}
                  <div className="rounded-2xl bg-cream-100 p-4">
                    <dt className="flex items-center gap-1.5 text-xs text-muted"><Truck className="h-3.5 w-3.5" /> Kargo</dt>
                    <dd className="mt-1 font-semibold text-ink">
                      {current.offer.shippingFee === 0 ? "Ücretsiz" : formatPrice(current.offer.shippingFee)}
                      <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-muted">
                        <Clock className="h-3 w-3" /> {current.offer.shipsIn} içinde
                      </span>
                      {!!current.seller.freeShippingOver && (
                        <span className="mt-1 block text-xs font-normal text-olive-700">
                          Bu üreticiden {formatPrice(current.seller.freeShippingOver)} ve üzeri alışverişte kargo ücretsiz
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="overflow-hidden rounded-[2rem] bg-olive-900 text-cream-50">
                <div className={`h-28 bg-gradient-to-br ${sellerGradient(current.seller.type)} opacity-80`} />
                <div className="px-6 pb-7">
                  <span className={`-mt-10 grid h-20 w-20 place-items-center rounded-full border-4 border-olive-900 bg-gradient-to-br font-display text-2xl ${sellerGradient(current.seller.type)}`}>
                    {initials(current.seller.name)}
                  </span>
                  <h3 className="mt-3 text-2xl">{current.seller.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {current.seller.verified && (
                      <span className="flex items-center gap-1 rounded-full bg-cream-50/10 px-2.5 py-1 text-xs font-semibold">
                        <BadgeCheck className="h-3.5 w-3.5" /> Dernek onaylı
                      </span>
                    )}
                    <span className="rounded-full bg-cream-50/10 px-2.5 py-1 text-xs font-semibold">{current.seller.type}</span>
                  </div>
                  <div className="mt-4 space-y-1.5 text-sm text-cream-50/75">
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {current.seller.village}</p>
                    <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {current.seller.since}&apos;den beri üretiyor</p>
                  </div>
                  <p className="mt-5 font-display text-lg italic leading-snug text-sand-300">&ldquo;{current.seller.tagline}&rdquo;</p>
                  <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-cream-50/70">{current.seller.story[0]}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Link
                      href={`/uretici/${current.seller.slug}`}
                      className="group inline-flex items-center gap-2 rounded-full bg-cream-50 px-5 py-3 text-sm font-semibold text-olive-900 transition-colors hover:bg-sand-300"
                    >
                      Hikâyesini ve mağazasını gör
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <AskSeller number={current.seller.whatsapp} sellerName={current.seller.name} productName={product.name} />
                  </div>
                </div>
              </section>
            </div>

            {/* Yorumlar */}
            <section className="mt-5 rounded-[2rem] bg-cream-50 p-6 shadow-soft md:p-8">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h3 className="text-2xl text-olive-900">Bu üreticinin ürününe yapılan yorumlar</h3>
                <span className="flex items-center gap-2 text-sm text-muted">
                  <Stars value={current.offer.rating} /> {current.offer.rating.toFixed(1)} · {current.offer.reviews} değerlendirme
                </span>
              </div>
              {reviewsList.length === 0 ? (
                <p className="mt-6 flex items-center gap-2 text-sm text-muted">
                  <MessageSquare className="h-4 w-4" /> Henüz yazılı yorum yok.
                </p>
              ) : (
                <ul className="mt-6 grid gap-3 md:grid-cols-2">
                  {reviewsList.map((r) => (
                    <li key={r.id} className="rounded-2xl bg-cream-100 p-5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-ink">{r.name}</span>
                        <span className="text-xs text-muted">{r.date}</span>
                      </div>
                      <Stars value={r.rating} size="h-3.5 w-3.5" />
                      <p className="mt-2 text-sm leading-relaxed text-ink/80">{r.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </motion.div>
        </AnimatePresence>
      )}

      <section className="mt-16 md:mt-24">
        <h2 className="text-2xl text-olive-900 md:text-3xl">Bunlar da ilgini çekebilir</h2>
        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:gap-x-5 lg:grid-cols-5">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Mobil sabit bar */}
      {current && (
        <div className="mobile-buybar fixed inset-x-0 bottom-0 z-30 border-t border-sand-300 bg-cream-50/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
          <p className="truncate px-1 text-xs text-muted">
            {current.seller.name} · {label}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex items-center rounded-full border border-sand-400">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Azalt" className="grid h-11 w-10 place-items-center">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-5 text-center text-sm font-semibold tabular-nums">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(current.variant.stock, 99, q + 1))} aria-label="Artır" className="grid h-11 w-10 place-items-center">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={addCurrent}
              disabled={current.variant.stock === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-olive-700 py-3 font-semibold text-cream-50 disabled:bg-sand-400"
            >
              {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
              {added ? "Eklendi" : `Ekle · ${formatPrice(current.variant.price * qty)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}