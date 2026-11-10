import { z } from "zod";

const mustAccept = (message: string) => z.boolean().refine((v) => v === true, { message });

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(3, "Ad soyad en az 3 karakter olmalı").max(80, "Çok uzun"),
  email: z.string().trim().email("Geçerli bir e-posta adresi girin").max(120),
  phone: z
    .string()
    .trim()
    .transform((s) => s.replace(/[\s()-]/g, ""))
    .pipe(z.string().regex(/^(\+90|0)?5\d{9}$/, "Geçerli bir cep telefonu girin (05XX XXX XX XX)")),
  city: z.string().trim().min(2, "İl girin").max(40),
  district: z.string().trim().min(2, "İlçe girin").max(40),
  address: z.string().trim().min(10, "Açık adresi eksiksiz yazın").max(300, "Adres çok uzun"),
  note: z.string().trim().max(300, "Not en fazla 300 karakter olabilir"),
  payment: z.enum(["havale", "kapida"]),
  kvkk: mustAccept("KVKK aydınlatma metnini onaylamalısınız"),
  contract: mustAccept("Mesafeli satış sözleşmesini onaylamalısınız"),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;
const objectId = z.string().regex(/^[a-f0-9]{24}$/i, "Geçersiz ürün");

export const orderSchema = z.object({
  form: checkoutSchema,
  items: z
    .array(z.object({ offerId: objectId, variantId: objectId, qty: z.number().int().min(1).max(99), price: z.number().min(0) }))
    .min(1, "Sepetin boş")
    .max(40, "Sepette çok fazla ürün var"),
});

export const lookupSchema = z.object({
  orderNo: z.string().trim().toUpperCase().regex(/^BP-[A-Z0-9]{6}$/, "Sipariş numarası BP-XXXXXX şeklinde olmalı"),
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta girin").max(120),
});
