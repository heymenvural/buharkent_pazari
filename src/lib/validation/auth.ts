import { z } from "zod";
import { categories } from "@/lib/catalog";

const email = z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi girin").max(120);
const password = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalı")
  .max(128, "Şifre çok uzun")
  .regex(/[A-Za-zÇĞİÖŞÜçğıöşü]/, "Şifre en az bir harf içermeli")
  .regex(/\d/, "Şifre en az bir rakam içermeli");
const kvkk = z.boolean().refine((v) => v === true, { message: "KVKK aydınlatma metnini onaylamalısınız" });

export const phoneSchema = z
  .string()
  .trim()
  .transform((s) => s.replace(/[\s()-]/g, ""))
  .pipe(z.string().regex(/^(\+90|0)?5\d{9}$/, "Geçerli bir cep telefonu girin (05XX XXX XX XX)"));

const categorySlugs = categories.map((c) => c.slug) as [string, ...string[]];

export const loginSchema = z.object({ email, password: z.string().min(1).max(128) });

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Adınızı girin").max(80, "Çok uzun"),
  email,
  password,
  kvkk,
});

export const sellerRegisterSchema = registerSchema.extend({
  phone: phoneSchema,
  village: z.string().trim().min(2, "Mahalle veya köy adını girin").max(60),
  sellerType: z.enum(["kadin-girisimci", "genc-ciftci", "diger"]),
  categories: z.array(z.enum(categorySlugs)).min(1, "En az bir kategori seçin").max(7),
  description: z.string().trim().min(20, "Ürünlerinizi biraz daha anlatın (en az 20 karakter)").max(1000, "En fazla 1000 karakter"),
});

export const verifySchema = z.object({ email, code: z.string().regex(/^\d{6}$/, "6 haneli kodu girin") });

export type RegisterInput = z.input<typeof registerSchema>;
export type SellerRegisterInput = z.input<typeof sellerRegisterSchema>;