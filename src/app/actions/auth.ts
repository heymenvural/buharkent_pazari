"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { SellerProfile } from "@/models/SellerProfile";
import { registerSchema, sellerRegisterSchema, verifySchema } from "@/lib/validation/auth";
import { rateLimit } from "@/lib/rateLimit";
import { checkCode, issueCode } from "@/lib/verification";
import { sendSellerReceivedEmail } from "@/lib/mailer";

export type FormResult = {
  ok: boolean;
  email?: string;
  notice?: string;
  wait?: number;
  errors?: Record<string, string>;
};

const clientIp = async () => (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

const collect = (issues: { path: PropertyKey[]; message: string }[]) => {
  const out: Record<string, string> = {};
  issues.forEach((i) => {
    const k = String(i.path[0] ?? "form");
    if (!out[k]) out[k] = i.message;
  });
  return out;
};

const tooMany: FormResult = { ok: false, errors: { form: "Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin." } };
const failed: FormResult = { ok: false, errors: { form: "Bir sorun oluştu, lütfen tekrar deneyin." } };

/* ---------- Müşteri kaydı ---------- */
export async function registerUser(input: unknown): Promise<FormResult> {
  if (!rateLimit(`register:${await clientIp()}`, 5, 60 * 60_000)) return tooMany;
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: collect(parsed.error.issues) };
  const { name, email, password } = parsed.data;

  try {
    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.role === "buyer" && !existing.emailVerified && existing.providers.includes("credentials")) {
        await issueCode(existing._id, existing.email, existing.name).catch(() => null);
        return { ok: true, email, notice: "Bu e-postayla daha önce kayıt başlatılmış. Doğrulama kodunu tekrar gönderdik." };
      }
      return { ok: false, errors: { email: "Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin." } };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, providers: ["credentials"], role: "buyer" });
    try {
      await issueCode(user._id, user.email, user.name);
    } catch (e) {
      console.error("mail error", e);
      return { ok: true, email, notice: "Kod e-postası gönderilemedi. Doğrulama ekranından tekrar gönderebilirsin." };
    }
    return { ok: true, email };
  } catch (e) {
    console.error("register error", e);
    return failed;
  }
}

/* ---------- Üretici kaydı ---------- */
export async function registerSeller(input: unknown): Promise<FormResult> {
  if (!rateLimit(`seller-register:${await clientIp()}`, 3, 60 * 60_000)) return tooMany;
  const parsed = sellerRegisterSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: collect(parsed.error.issues) };
  const d = parsed.data;

  try {
    await connectDB();
    if (await User.exists({ email: d.email })) {
      return { ok: false, errors: { email: "Bu e-posta ile zaten bir hesap var." } };
    }
    const passwordHash = await bcrypt.hash(d.password, 12);
    const user = await User.create({
      name: d.name,
      email: d.email,
      passwordHash,
      phone: d.phone,
      providers: ["credentials"],
      role: "seller",
      sellerStatus: "pending",
    });
    await SellerProfile.create({
      user: user._id,
      phone: d.phone,
      village: d.village,
      sellerType: d.sellerType,
      categories: d.categories,
      description: d.description,
    });
    await sendSellerReceivedEmail(user.email, user.name).catch((e) => console.error("mail error", e));
    return { ok: true, email: user.email };
  } catch (e) {
    console.error("seller register error", e);
    return failed;
  }
}

/* ---------- E-posta doğrulama ---------- */
export async function verifyEmail(input: unknown): Promise<FormResult> {
  const parsed = verifySchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: collect(parsed.error.issues) };
  const { email, code } = parsed.data;
  if (!rateLimit(`verify:${await clientIp()}:${email}`, 10, 15 * 60_000)) return tooMany;

  try {
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) return { ok: false, errors: { code: "Kod hatalı veya süresi dolmuş." } };
    if (user.emailVerified) return { ok: true, email };

    const result = await checkCode(user._id, code);
    if (result === "ok") {
      user.emailVerified = new Date();
      await user.save();
      return { ok: true, email };
    }
    const msg = {
      invalid: "Kod hatalı. Tekrar dene.",
      expired: "Kodun süresi dolmuş. Yeni kod iste.",
      locked: "Çok fazla hatalı deneme. Yeni kod iste.",
    }[result];
    return { ok: false, errors: { code: msg } };
  } catch (e) {
    console.error("verify error", e);
    return failed;
  }
}

export async function resendCode(rawEmail: unknown): Promise<FormResult> {
  if (!rateLimit(`resend:${await clientIp()}`, 10, 60 * 60_000)) return tooMany;
  const parsed = verifySchema.shape.email.safeParse(rawEmail);
  if (!parsed.success) return { ok: false, errors: { form: "Geçerli bir e-posta girin." } };

  try {
    await connectDB();
    const user = await User.findOne({ email: parsed.data });
    // Hesabın var olup olmadığı belli edilmez; her durumda aynı cevap döner
    if (user && user.role === "buyer" && !user.emailVerified) {
      const r = await issueCode(user._id, user.email, user.name);
      if (!r.ok && r.wait) return { ok: false, wait: r.wait };
    }
    return { ok: true };
  } catch (e) {
    console.error("resend error", e);
    return failed;
  }
}