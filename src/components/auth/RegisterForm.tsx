"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import GoogleButton from "@/components/auth/GoogleButton";
import { registerUser, type RegisterResult } from "@/app/actions/auth";

type Errors = NonNullable<RegisterResult["errors"]>;

const inputCls = (err?: string) =>
  `w-full rounded-2xl border bg-cream-100 px-4 py-3.5 text-ink outline-none transition-colors focus:border-olive-500 ${err ? "border-terra-500" : "border-sand-300"}`;

function strength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Za-zÇĞİÖŞÜçğıöşü]/.test(p) && /\d/.test(p)) s++;
  if (/[^A-Za-z0-9ÇĞİÖŞÜçğıöşü]/.test(p)) s++;
  if (p.length >= 12) s++;
  return s;
}
const levels = ["Çok zayıf", "Zayıf", "Orta", "İyi", "Güçlü"];
const colors = ["bg-terra-600", "bg-terra-500", "bg-[#e0a84a]", "bg-olive-500", "bg-olive-700"];

function Err({ msg }: { msg?: string }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 block text-xs font-medium text-terra-600">
          {msg}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export default function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", kvkk: false });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const score = strength(form.password);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined, form: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await registerUser(form);
    if (!res.ok) {
      setErrors(res.errors ?? {});
      setLoading(false);
      return;
    }
    const login = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (login?.error) {
      router.push("/giris");
      return;
    }
    router.push(next);
    router.refresh();
  };

  return (
    <div>
      <GoogleButton next={next} label="Google ile kayıt ol" />
      <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted">
        <span className="h-px flex-1 bg-sand-300" /> veya <span className="h-px flex-1 bg-sand-300" />
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Ad Soyad</span>
          <input autoComplete="name" maxLength={80} value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls(errors.name)} />
          <Err msg={errors.name} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">E-posta</span>
          <input type="email" autoComplete="email" maxLength={120} value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls(errors.email)} />
          <Err msg={errors.email} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Şifre</span>
          <span className="relative block">
            <input
              type={show ? "text" : "password"}
              autoComplete="new-password"
              maxLength={128}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              className={`${inputCls(errors.password)} pr-12`}
            />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label="Şifreyi göster" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted">
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </span>
          {form.password && (
            <span className="mt-2 flex items-center gap-2">
              <span className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <motion.span key={i} className={`h-1.5 flex-1 rounded-full ${i < score ? colors[score] : "bg-sand-300"}`} layout />
                ))}
              </span>
              <span className="w-16 text-right text-xs text-muted">{levels[score]}</span>
            </span>
          )}
          <span className="mt-1 block text-xs text-muted">En az 8 karakter, en az bir harf ve bir rakam.</span>
          <Err msg={errors.password} />
        </label>

        <label className="flex cursor-pointer items-start gap-3 pt-1">
          <input type="checkbox" checked={form.kvkk} onChange={(e) => set("kvkk", e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#4a5627]" />
          <span className="text-sm text-ink/80"><Link href="/kvkk" target="_blank" className="font-semibold text-olive-700 underline">KVKK Aydınlatma Metni</Link></span>
        </label>
        <Err msg={errors.kvkk} />

        <AnimatePresence>
          {errors.form && (
            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl bg-terra-500/10 px-4 py-3 text-sm font-medium text-terra-600">
              {errors.form}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-olive-700 py-4 font-semibold text-cream-50 transition-colors hover:bg-olive-900 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />} Kayıt ol
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Zaten hesabın var mı?{" "}
        <Link href={`/giris?next=${encodeURIComponent(next)}`} className="font-semibold text-olive-700 hover:underline">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}