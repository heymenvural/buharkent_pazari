"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Plus, Star } from "lucide-react";
import { useCart } from "@/store/cart";
import { flyToCart } from "@/lib/flyToCart";
import QuickAddModal from "@/components/shop/QuickAddModal";
import ProductImage from "@/components/shop/ProductImage";
import { formatPrice, priceInfo, productRating, type CatalogProduct, type Line } from "@/lib/catalog";

export default function ProductCard({ product }: { product: CatalogProduct }) {
  const imgRef = useRef<HTMLAnchorElement>(null);
  const add = useCart((s) => s.add);
  const [open, setOpen] = useState(false);

  const info = priceInfo(product.id);
  const { rating, reviews } = productRating(product.id);
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
    <article className="flex flex-col overflow-hidden rounded-2xl border border-sand-300 bg-cream-50 transition-shadow hover:shadow-soft">
      <Link ref={imgRef} href={href} className="relative block">
        <ProductImage src={product.images?.[0]} icon={product.icon} alt={product.name} className="aspect-[4/3]" />
        {info.maxDiscount > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-terra-500 px-2 py-0.5 text-xs font-bold text-cream-50">%{info.maxDiscount}</span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3 md:p-4">
        <Link href={href} className="line-clamp-2 font-semibold leading-snug text-ink hover:text-olive-700">
          {product.name}
        </Link>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted">
          {reviews > 0 && (
            <>
              <Star className="h-4 w-4 fill-terra-500 text-terra-500" /> {rating.toFixed(1)} ·{" "}
            </>
          )}
          {info.sellerCount} üretici
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span>
            {info.oldPrice && <span className="block text-sm text-muted line-through">{formatPrice(info.oldPrice)}</span>}
            <span className="text-lg font-bold text-olive-900">{formatPrice(info.min)}</span>
            {info.sellerCount > 1 && <span className="ml-1 text-sm text-muted">&apos;den</span>}
          </span>
          <button
            onClick={() => setOpen(true)}
            aria-label={`${product.name} sepete ekle`}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-olive-700 text-cream-50 transition-colors hover:bg-olive-900"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      <QuickAddModal product={product} open={open} onClose={() => setOpen(false)} onAdd={handleAdd} />
    </article>
  );
}
