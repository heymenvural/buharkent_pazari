"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { registerSchema } from "@/lib/validation/auth";
import { rateLimit } from "@/lib/rateLimit";

type Field = "name" | "email" | "password" | "kvkk" | "form";
export type RegisterResult = { ok: boolean; errors?: Partial<Record<Field, string>> };

export async function registerUser(input: unknown): Promise<RegisterResult> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`register:${ip}`, 5, 60 * 60_000)) {
    return { ok: false, errors: { form: "Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin." } };
  }

  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Partial<Record<Field, string>> = {};
    parsed.error.issues.forEach((i) => {
      const k = i.path[0] as Field;
      if (!errors[k]) errors[k] = i.message;
    });
    return { ok: false, errors };
  }

  const { name, email, password } = parsed.data;

  try {
    await connectDB();
    if (await User.exists({ email })) {
      return { ok: false, errors: { email: "Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin." } };
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ name, email, passwordHash, providers: ["credentials"], role: "buyer" });
    return { ok: true };
  } catch (e) {
    if (typeof e === "object" && e && "code" in e && (e as { code: number }).code === 11000) {
      return { ok: false, errors: { email: "Bu e-posta ile zaten bir hesap var." } };
    }
    console.error("register error", e);
    return { ok: false, errors: { form: "Bir sorun oluştu, lütfen tekrar deneyin." } };
  }
}