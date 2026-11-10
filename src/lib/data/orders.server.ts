import type { IOrder } from "@/models/Order";
import type { PartStatus, PaymentMethod } from "@/lib/orders";

// Tarayıcıya gönderilecek düz sipariş verisi
export type OrderPartView = {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  iban?: string;
  ibanName?: string;
  items: { name: string; slug: string; label: string; price: number; qty: number; image?: string }[];
  subtotal: number;
  shipping: number;
  total: number;
  status: PartStatus;
  cargoCompany?: string;
  trackingNo?: string;
  cancelReason?: string;
  history: { status: PartStatus; at: string; note?: string }[];
};

export type OrderView = {
  id: string;
  orderNo: string;
  createdAt: string;
  customer: { name: string; email: string; phone: string };
  address: { city: string; district: string; address: string };
  note?: string;
  payment: PaymentMethod;
  subtotal: number;
  shipping: number;
  total: number;
  parts: OrderPartView[];
};

export function toOrderView(o: IOrder, opts: { onlySeller?: string; showIban?: boolean } = {}): OrderView {
  const parts = o.parts.filter((p) => !opts.onlySeller || p.seller.toString() === opts.onlySeller);
  return {
    id: o._id.toString(),
    orderNo: o.orderNo,
    createdAt: new Date(o.createdAt).toISOString(),
    customer: { ...o.customer },
    address: { ...o.address },
    note: o.note,
    payment: o.payment,
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    parts: parts.map((p) => ({
      id: p._id.toString(),
      sellerId: p.seller.toString(),
      sellerName: p.sellerName,
      sellerPhone: p.sellerPhone,
      // IBAN sadece havale bekleyen siparişte müşteriye gösterilir
      ...(opts.showIban && o.payment === "havale" && p.status === "pending_payment" ? { iban: p.iban, ibanName: p.ibanName } : {}),
      items: p.items.map((i) => ({ name: i.name, slug: i.slug, label: i.label, price: i.price, qty: i.qty, image: i.image })),
      subtotal: p.subtotal,
      shipping: p.shipping,
      total: p.total,
      status: p.status,
      cargoCompany: p.cargoCompany,
      trackingNo: p.trackingNo,
      cancelReason: p.cancelReason,
      history: p.history.map((h) => ({ status: h.status, at: new Date(h.at).toISOString(), note: h.note })),
    })),
  };
}
