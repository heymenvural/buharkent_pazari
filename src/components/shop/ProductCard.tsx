"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Plus, Star, Store } from "lucide-react";
import { useCart } from "@/store/cart";
import { flyToCart } from "@/lib/flyToCart";
import QuickAddModal from "@/components/shop/QuickAddModal";
import { formatPrice, priceInfo, productRating, type CatalogProduct, type Line } from "@/lib/catalog";

export default function ProductCard({ product }: { product: CatalogProduct }) {
  const imgRef = useRef<HTMLAnchorElement>(null);
  const add = useCart((s) => s.add);
  const [open, setOpen] = useState(false);
  const [fav, setFav] = useState(false);

  const info = priceInfo(product.id);
  const { rating, reviews } = productRating(product.id);
  const Icon = product.icon;
  const href = `/urun/${product.slug}`;

  const handleAdd = (line: Line, qty: number) => {
    add(
      {
        id: `${line.offer.id}:${line.variant.id}`,
        slug: product.slug,
        name: product.name,
        price: line.variant.price,
        unit: line.variant.label,
        seller: line.seller.name,
        productId: product.id,
        offerId: line.offer.id,
        variantId: line.variant.id,
        shippingFee: line.offer.shippingFee,
        maxQty: line.variant.stock,
      },
      qty
    );
    setOpen(false);
    setTimeout(() => imgRef.current && flyToCart(imgRef.current), 350);
  };

  return (
    <article className="group/card flex flex-col">
      <div className="relative">
        <Link
          ref={imgRef}
          href={href}
          className={`relative block aspect-square overflow-hidden rounded-3xl bg-gradient-to-br ${product.bg}`}
        >
          <Icon
            strokeWidth={1}
            className={`absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 group-hover/card:-rotate-6 group-hover/card:scale-110 ${
              product.light ? "text-olive-700/40" : "text-cream-50/40"
            }`}
          />
          <span className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {info.maxDiscount > 0 && (
              <span className="rounded-full bg-terra-500 px-2.5 py-1 text-[11px] font-bold text-cream-50">
                %{info.maxDiscount}
              </span>
            )}
            {product.tags.includes("yeni") && (
              <span className="rounded-full bg-cream-50/90 px-2.5 py-1 text-[11px] font-semibold text-olive-900">Yeni</span>
            )}
          </span>
        </Link>

        <button
          aria-label="Favorilere ekle"
          onClick={() => setFav((f) => !f)}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-cream-50/90 backdrop-blur transition-transform hover:scale-110"
        >
          <motion.span key={String(fav)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
            <Heart className={`h-4 w-4 ${fav ? "fill-terra-500 text-terra-500" : "text-ink"}`} />
          </motion.span>
        </button>

        <motion.button
          onClick={() => setOpen(true)}
          aria-label="Sepete ekle"
          whileTap={{ scale: 0.9 }}
          className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-olive-900 text-cream-50 shadow-soft transition-all duration-300 hover:scale-110 hover:bg-olive-700 lg:h-12 lg:w-12"
        >
          <Plus className="h-5 w-5" />
        </motion.button>
      </div>

      <div className="mt-3 flex flex-1 flex-col px-1">
        <Link href={href} className="line-clamp-2 font-display text-base leading-snug text-ink hover:text-olive-700 md:text-lg">
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-terra-500 text-terra-500" />
            {rating.toFixed(1)} <span className="hidden sm:inline">({reviews})</span>
          </span>
          <span className="flex items-center gap-1">
            <Store className="h-3.5 w-3.5" /> {info.sellerCount} satıcı
          </span>
        </div>
        <div className="mt-auto pt-2">
          {info.oldPrice && <span className="mr-2 text-xs text-muted line-through">{formatPrice(info.oldPrice)}</span>}
          <span className="text-lg font-bold text-olive-900">{formatPrice(info.min)}</span>
          <span className="ml-1 text-xs text-muted">&apos;den başlayan</span>
        </div>
      </div>

      <QuickAddModal product={product} open={open} onClose={() => setOpen(false)} onAdd={handleAdd} />
    </article>
  );
}