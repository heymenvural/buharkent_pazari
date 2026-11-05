import type { CatalogProduct, Line } from "@/lib/catalog";
import type { CartItem } from "@/store/cart";

export const lineKey = (l: Line) => `${l.offer.id}:${l.variant.id}`;

export function toCartItem(product: CatalogProduct, line: Line): Omit<CartItem, "qty"> {
  return {
    id: lineKey(line),
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
  };
}