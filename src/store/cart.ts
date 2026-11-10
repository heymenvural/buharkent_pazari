import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string; // ilanId:seçenekId
  slug: string;
  name: string;
  price: number;
  unit: string;
  seller: string;
  qty: number;
  productId?: string;
  offerId?: string;
  variantId?: string;
  shippingFee?: number;
  maxQty?: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  patch: (id: string, p: Partial<Pick<CartItem, "price" | "maxQty" | "qty">>) => void;
  clear: () => void;
};

const CART_VERSION = 3;

const clampQty = (qty: number, max?: number) => Math.max(0, Math.min(qty, max ?? 99, 99));

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty = 1) =>
        set((s) => {
          const found = s.items.find((i) => i.id === item.id);
          if (found) {
            return {
              items: s.items.map((i) =>
                i.id === item.id ? { ...i, qty: clampQty(i.qty + qty, item.maxQty) } : i
              ),
            };
          }
          return { items: [...s.items, { ...item, qty: clampQty(qty, item.maxQty) }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.id !== id)
              : s.items.map((i) => (i.id === id ? { ...i, qty: clampQty(qty, i.maxQty) } : i)),
        })),
      patch: (id, p) =>
        set((s) => ({
          items: s.items
            .map((i) => {
              if (i.id !== id) return i;
              const next = { ...i, ...p };
              return { ...next, qty: clampQty(next.qty, next.maxQty) };
            })
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "buharkent-cart",
      version: CART_VERSION,
      // Eski sürümden kalan sepet yeni yapıyla uyumsuz olduğu için güvenle temizlenir
      migrate: () => ({ items: [] }) as unknown as CartState,
      partialize: (s) => ({ items: s.items }) as CartState,
    }
  )
);

export const selectCount = (s: CartState) => s.items.reduce((a, i) => a + i.qty, 0);
export const selectTotal = (s: CartState) => s.items.reduce((a, i) => a + i.qty * i.price, 0);