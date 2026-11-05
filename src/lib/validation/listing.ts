import { z } from "zod";
import { PRODUCT_TYPES } from "@/lib/compliance";

export const SHIPS_IN = ["Aynı gün", "1-2 gün", "2-3 gün", "3-5 gün", "1 hafta"] as const;
const typeKeys = PRODUCT_TYPES.map((t) => t.key) as [string, ...string[]];
const money = (max: number) => z.number({ message: "Bir tutar yaz" }).finite().min(0).max(max);

export const variantSchema = z
  .object({
    id: z.string().max(40).optional(),
    amount: z.number({ message: "Miktarı yaz" }).finite().positive("Miktar 0'dan büyük olmalı").max(100_000),
    unit: z.enum(["g", "kg", "ml", "L", "adet"]),
    price: money(1_000_000).refine((n) => n >= 1, "Fiyat en az 1 ₺ olmalı"),
    oldPrice: money(1_000_000).optional(),
    stock: z.number({ message: "Stok yaz" }).int("Stok tam sayı olmalı").min(0).max(100_000),
  })
  .superRefine((v, ctx) => {
    if (v.oldPrice !== undefined && v.oldPrice > 0 && v.oldPrice <= v.price) {
      ctx.addIssue({ code: "custom", path: ["oldPrice"], message: "İndirimden önceki fiyat, satış fiyatından yüksek olmalı" });
    }
  });

export const listingSchema = z
  .object({
    id: z.string().max(40).optional(),
    productId: z.string().max(40).optional(),
    newProduct: z
      .object({
        name: z.string().trim().min(3, "Ürün adını yaz").max(80, "En fazla 80 karakter"),
        productType: z.enum(typeKeys, { message: "Ürün grubunu seç" }),
      })
      .optional(),
    note: z.string().trim().min(20, "Ürününü biraz daha anlat (en az 20 karakter)").max(2000, "En fazla 2000 karakter"),
    images: z.array(z.string().max(300)).min(1, "En az bir fotoğraf ekle").max(6, "En fazla 6 fotoğraf"),
    variants: z.array(variantSchema).min(1, "En az bir seçenek ekle").max(10, "En fazla 10 seçenek"),
    shippingFee: money(5_000),
    shipsIn: z.enum(SHIPS_IN),
    details: z
      .array(z.object({ k: z.string().trim().max(40), v: z.string().trim().max(200) }))
      .max(6)
      .transform((a) => a.filter((d) => d.k && d.v)),
  })
  .superRefine((d, ctx) => {
    if (!d.id && !d.productId && !d.newProduct) ctx.addIssue({ code: "custom", path: ["productId"], message: "Bir ürün seç" });
  });

export const shopSchema = z.object({
  shopName: z.string().trim().min(2, "Mağaza adını yaz").max(80),
  tagline: z.string().trim().max(160, "En fazla 160 karakter"),
  story: z.string().trim().min(20, "Hikâyeni biraz daha anlat (en az 20 karakter)").max(3000, "En fazla 3000 karakter"),
  avatar: z.string().max(300),
  cover: z.string().max(300),
  freeShippingOver: z.number().finite().min(0).max(100_000).nullable(),
});

export type ListingInput = z.input<typeof listingSchema>;
export type ShopInput = z.input<typeof shopSchema>;
