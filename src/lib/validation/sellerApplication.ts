import { z } from "zod";

export const sellerApplicationSchema = z.object({
  fullName: z.string().trim().min(3, "Ad soyad en az 3 karakter olmalı").max(80),
  phone: z
    .string()
    .trim()
    .transform((s) => s.replace(/[\s()-]/g, ""))
    .pipe(z.string().regex(/^(\+90|0)?5\d{9}$/, "Geçerli bir cep telefonu girin (05XX XXX XX XX)")),
  email: z
    .string()
    .trim()
    .max(120)
    .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Geçerli bir e-posta girin"),
  village: z.string().trim().min(2, "Mahalle veya köy adını girin").max(60),
  sellerType: z.enum(["kadin-girisimci", "genc-ciftci", "diger"]),
  categories: z.array(z.string()).min(1, "En az bir kategori seçin").max(7),
  description: z.string().trim().min(20, "Ürünlerinizi biraz daha anlatın (en az 20 karakter)").max(1000, "En fazla 1000 karakter"),
  kvkk: z.boolean().refine((v) => v === true, { message: "KVKK aydınlatma metnini onaylamalısınız" }),
});

export type SellerApplicationInput = z.input<typeof sellerApplicationSchema>;