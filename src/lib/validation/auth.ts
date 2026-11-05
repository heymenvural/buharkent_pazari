import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi girin").max(120);

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Şifrenizi girin").max(128),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Adınızı girin").max(80, "Çok uzun"),
  email,
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .max(128, "Şifre çok uzun")
    .regex(/[A-Za-zÇĞİÖŞÜçğıöşü]/, "Şifre en az bir harf içermeli")
    .regex(/\d/, "Şifre en az bir rakam içermeli"),
  kvkk: z.boolean().refine((v) => v === true, { message: "KVKK aydınlatma metnini onaylamalısınız" }),
});

export type RegisterInput = z.input<typeof registerSchema>;