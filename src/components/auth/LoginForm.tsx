"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import GoogleButton from "@/components/auth/GoogleButton";

const inputCls =
  "w-full rounded-2xl border border-sand-300 bg-cream-100 px-4 py-3.5 text-ink outline-none transition-colors focus:border-olive-500";

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("E-posta ve şifrenizi girin.");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError(
        res.code === "rate_limited"
          ? "Çok fazla hatalı deneme. Lütfen 15 dakika sonra tekrar deneyin."
          : "E-posta veya şifre hatalı."
      );
      return;
    }
    router.push(next);
    router.refresh();
  };

  return (
    <div>
      <GoogleButton next={next} />
      <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted">
        <span className="h-px flex-1 bg-sand-300" /> veya <span className="h-px flex-1 bg-sand-300" />
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">E-posta</span>
          <input type="email" autoComplete="email" maxLength={120} value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Şifre</span>
          <span className="relative block">
            <input
              type={show ? "text" : "password"}
              autoComplete="current-password"
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputCls} pr-12`}
            />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label="Şifreyi göster" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted">
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </span>
        </label>

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl bg-terra-500/10 px-4 py-3 text-sm font-medium text-terra-600">
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-olive-700 py-4 font-semibold text-cream-50 transition-colors hover:bg-olive-900 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />} Giriş yap
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Hesabın yok mu?{" "}
        <Link href={`/kayit?next=${encodeURIComponent(next)}`} className="font-semibold text-olive-700 hover:underline">
          Kayıt ol
        </Link>
      </p>
    </div>
  );
}