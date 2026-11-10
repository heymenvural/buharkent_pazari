"use client";

import ProductImage from "@/components/shop/ProductImage";
import Image from "next/image";
import AskSeller from "@/components/shop/AskSeller";
import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeCheck, CalendarDays, ChevronRight, MapPin, Package, Quote, ShieldCheck, Sprout, Star, Truck } from "lucide-react";
import {
  formatPrice, getProductById, getSellerBySlug, initials, offerReviews, sellerGradient, sellerOffers,
} from "@/lib/catalog";

const ease = [0.76, 0, 0.24, 1] as const;

export default function SellerProfile({ slug }: { slug: string }) {
  const seller = getSellerBySlug(slug)!;
  const list = sellerOffers(seller.id);
  const reviews = list.flatMap((o) => offerReviews(o.id).map((r) => ({ ...r, product: getProductById(o.productId)! })));
  const totalReviews = list.reduce((a, o) => a + o.reviews, 0);

  return (
    <div className="mx-auto max-w-7xl">
      <nav className="flex items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="hover:text-olive-700">Ana sayfa</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink">{seller.name}</span>
      </nav>

      {/* Kapak */}
      <motion.div
        className={`relative mt-5 h-44 overflow-hidden rounded-[2rem] bg-gradient-to-br md:h-64 ${sellerGradient(seller.type)}`}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease }}
      >
        {seller.cover && <Image src={seller.cover} alt="" fill priority sizes="(max-width: 1280px) 100vw, 1280px" className="object-cover" />}
        <motion.span
          className="absolute -bottom-10 right-6 text-cream-50/15"
          animate={{ rotate: [-6, 4, -6], y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sprout className="h-56 w-56 md:h-72 md:w-72" strokeWidth={0.8} />
        </motion.span>
      </motion.div>

      {/* Profil */}
      <div className="px-2 md:px-8">
        <motion.span
          className={`-mt-14 grid h-28 w-28 place-items-center overflow-hidden rounded-full border-4 border-cream-100 bg-gradient-to-br font-display text-4xl text-cream-50 shadow-soft ${sellerGradient(seller.type)}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
        >
          {seller.avatar ? (
            <Image src={seller.avatar} alt={seller.name} width={112} height={112} className="h-full w-full rounded-full object-cover" />
          ) : (
            initials(seller.name)
          )}
        </motion.span>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
          <h1 className="mt-4 text-4xl text-olive-900 md:text-5xl">{seller.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {seller.verified && (
              <span className="flex items-center gap-1 rounded-full bg-olive-700 px-3 py-1 text-xs font-semibold text-cream-50">
                <BadgeCheck className="h-3.5 w-3.5" /> Dernek onaylı üretici
              </span>
            )}
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${seller.type === "Kadın Girişimci" ? "bg-fig-600/10 text-fig-600" : "bg-olive-500/15 text-olive-700"}`}>
              {seller.type}
            </span>
            {seller.badges?.map((b) => (
              <span key={b} className="flex items-center gap-1 rounded-full border border-olive-700/30 bg-cream-50 px-3 py-1 text-xs font-semibold text-olive-700">
                <ShieldCheck className="h-3.5 w-3.5" /> {b}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {seller.village}</span>
            <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {seller.since}&apos;den beri</span>
            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-terra-500 text-terra-500" /> {seller.rating.toFixed(1)} ({totalReviews})</span>
            <span className="flex items-center gap-1.5"><Package className="h-4 w-4" /> {list.length} ürün</span>
            {!!seller.freeShippingOver && (
              <span className="flex items-center gap-1.5 font-semibold text-olive-700"><Truck className="h-4 w-4" /> {formatPrice(seller.freeShippingOver)} üzeri kargo ücretsiz</span>
            )}
          </div>
          <AskSeller number={seller.whatsapp} sellerName={seller.name} className="mt-5" />
        </motion.div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-12">
        {/* Hikâye */}
        <motion.section
          className="rounded-[2rem] bg-olive-900 p-7 text-cream-50 md:p-9 lg:sticky lg:top-36 lg:self-start"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-terra-500">Hikâyemiz</p>
          <Quote className="mt-5 h-8 w-8 text-sand-300/50" />
          <p className="mt-2 font-display text-2xl italic leading-snug text-sand-300">{seller.tagline}</p>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-cream-50/75 md:text-base">
            {seller.story.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <p className="mt-6 text-sm font-semibold">— {seller.owner}</p>
        </motion.section>

        {/* Ürünler */}
        <section>
          <h2 className="text-2xl text-olive-900 md:text-3xl">Ürünleri</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:gap-x-5">
            {list.map((o, i) => {
              const p = getProductById(o.productId)!;
              const Icon = p.icon;
              const min = Math.min(...o.variants.map((v) => v.price));
              return (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.07, duration: 0.6 }}
                >
                  <Link href={`/urun/${p.slug}?uretici=${seller.slug}`} className="group block">
                    <ProductImage src={o.images?.[0] ?? p.images?.[0]} icon={Icon} alt={p.name} className="aspect-[4/3] rounded-2xl" />
                    <span className="mt-3 block px-1 font-display text-base leading-snug text-ink group-hover:text-olive-700 md:text-lg">{p.name}</span>
                    <span className="block px-1 text-sm text-muted">{o.variants.map((v) => v.label).join(" · ")}</span>
                    <span className="mt-1 block px-1">
                      <span className="font-bold text-olive-900">{formatPrice(min)}</span>
                      <span className="ml-1 text-xs text-muted">&apos;den başlayan</span>
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Yorumlar */}
          <h2 className="mt-14 text-2xl text-olive-900 md:text-3xl">Müşteri yorumları</h2>
          {reviews.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Henüz yazılı yorum yok.</p>
          ) : (
            <ul className="mt-6 grid gap-3 md:grid-cols-2">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-2xl bg-cream-50 p-5 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">{r.name}</span>
                    <span className="text-xs text-muted">{r.date}</span>
                  </div>
                  <span className="mt-1 flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-terra-500 text-terra-500" : "text-sand-400"}`} />
                    ))}
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-ink/80">{r.text}</p>
                  <Link href={`/urun/${r.product.slug}?uretici=${seller.slug}`} className="mt-3 inline-block text-xs font-semibold text-olive-700 hover:underline">
                    {r.product.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}