import { z } from "zod";
import { PRODUCT_TYPES, taxOptionsFor } from "@/lib/compliance";
import { isValidTrIban, normalizeIban } from "@/lib/iban";
import { PROVINCES, isValidLocation } from "@/lib/locations";

const email = z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi girin").max(120);
const password = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalı")
  .max(128, "Şifre çok uzun")
  .regex(/[A-Za-zÇĞİÖŞÜçğıöşü]/, "Şifre en az bir harf içermeli")
  .regex(/\d/, "Şifre en az bir rakam içermeli");
const mustAccept = (message: string) => z.boolean().refine((v) => v === true, { message });

export const phoneSchema = z
  .string()
  .trim()
  .transform((s) => s.replace(/[\s()-]/g, ""))
  .pipe(z.string().regex(/^(\+90|0)?5\d{9}$/, "Geçerli bir cep telefonu girin (05XX XXX XX XX)"));

const productKeys = PRODUCT_TYPES.map((p) => p.key) as [string, ...string[]];
const thisYear = new Date().getFullYear();

export const loginSchema = z.object({ email, password: z.string().min(1).max(128) });

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Adınızı girin").max(80, "Çok uzun"),
  email,
  password,
  kvkk: mustAccept("KVKK aydınlatma metnini onaylamalısınız"),
});

export const sellerRegisterSchema = z
  .object({
    name: z.string().trim().min(2, "Adını ve soyadını yaz").max(80, "Çok uzun"),
    phone: phoneSchema,
    sellerType: z.enum(["kadin-girisimci", "genc-ciftci", "diger"]),
    province: z.enum(PROVINCES, { message: "İlini seç" }),
    district: z.string().trim().min(2, "İlçeni seç").max(60),
    village: z.string().trim().min(2, "Mahalleni veya köyünü seç").max(80),
    productTypes: z.array(z.enum(productKeys)).min(1, "En az bir ürün grubu seç").max(12),
    since: z.number({ message: "Ne zamandan beri ürettiğini seç" }).int().min(1950).max(thisYear),
    description: z.string().trim().min(20, "Kendini biraz daha anlat (en az 20 karakter)").max(1000, "En fazla 1000 karakter"),
    taxStatus: z.enum(["ciftci", "muaf910", "muaf96", "mukellef"], { message: "Vergi durumunu seç" }),
    iban: z
      .string()
      .transform(normalizeIban)
      .refine(isValidTrIban, "Geçerli bir IBAN yaz (TR ile başlayan 26 karakter)"),
    ibanName: z.string().trim().min(3, "Hesap sahibinin adını yaz").max(80),
    email,
    password,
    kvkk: mustAccept("KVKK aydınlatma metnini onaylamalısın"),
    agreement: mustAccept("Üretici taahhütnamesini onaylamalısın"),
  })
  .superRefine((d, ctx) => {
    if (!isValidLocation(d.province, d.district, d.village)) {
      ctx.addIssue({ code: "custom", path: ["village"], message: "Adres listeden seçilmeli" });
    }
    const { options } = taxOptionsFor(d.productTypes);
    if (!options.some((o) => o.key === d.taxStatus)) {
      ctx.addIssue({ code: "custom", path: ["taxStatus"], message: "Bu vergi durumu seçtiğin ürünlere uygun değil" });
    }
  });

export const verifySchema = z.object({ email, code: z.string().regex(/^\d{6}$/, "6 haneli kodu girin") });

export type RegisterInput = z.input<typeof registerSchema>;
export type SellerRegisterInput = z.input<typeof sellerRegisterSchema>;