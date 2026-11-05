"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, Loader2, ShoppingBag, Sprout } from "lucide-react";
import GoogleButton from "@/components/auth/GoogleButton";

type Tab = "musteri" | "uretici";

const inputCls =
  "w-full rounded-2xl border border-sand-300 bg-cream-100 px-4 py-3.5 text-ink outline-none transition-colors focus:border-olive-500";

const pageErrors: Record<string, string> = {
  AccessDenied: "Giriş izni verilmedi. Lütfen tekrar dene veya e-posta ile giriş yap.",
  Configuration: "Giriş sisteminde geçici bir sorun var. Lütfen biraz sonra tekrar dene.",
  OAuthSignin: "Google ile bağlantı kurulamadı. Lütfen tekrar dene.",
  OAuthCallbackError: "Google ile giriş tamamlanamadı. Lütfen tekrar dene.",
  OAuthAccountNotLinked: "Bu e-posta başka bir giriş yöntemiyle kayıtlı.",
  SellerPending: "Üreticilik başvurunuz henüz onaylanmamıştır. Ekibimiz sizinle iletişime geçecektir.",
  SellerRejected: "Üreticilik başvurunuz onaylanmadı. Detaylar için bizimle iletişime geçebilirsiniz.",
};

const codeErrors: Record<string, string> = {
  rate_limited: "Çok fazla hatalı deneme. Lütfen 15 dakika sonra tekrar dene.",
  seller_pending: pageErrors.SellerPending,
  seller_rejected: pageErrors.SellerRejected,
};

export function AuthTabs({ value, onChange }: { value: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="mb-7 grid grid-cols-2 gap-1 rounded-full bg-cream-200 p-1">
      {[
        { key: "musteri" as const, label: "Müşteri", icon: ShoppingBag },
        { key: "uretici" as const, label: "Üretici", icon: Sprout },
      ].map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`relative flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-colors ${
            value === key ? "text-cream-50" : "text-olive-900"
          }`}
        >
          {value === key && (
            <motion.span layoutId="auth-tab" className="absolute inset-0 rounded-full bg-olive-700" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
          )}
          <Icon className="relative h-4 w-4" />
          <span className="relative">{label}</span>
        </button>
      ))}
    </div>
  );
}

export default function LoginForm({
  next,
  initialError,
  initialTab = "musteri",
  verified = false,
}: {
  next: string;
  initialError?: string;
  initialTab?: Tab;
  verified?: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(initialError ? pageErrors[initialError] ?? "Giriş sırasında bir sorun oluştu." : "");
  const [unverified, setUnverified] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUnverified(false);
    if (!email || !password) return setError("E-posta ve şifreni gir.");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      if (res.code === "email_unverified") {
        setUnverified(true);
        setError("E-posta adresin henüz doğrulanmadı.");
        return;
      }
      setError(codeErrors[res.code ?? ""] ?? "E-posta veya şifre hatalı.");
      return;
    }
    router.push(tab === "uretici" ? "/hesabim" : next);
    router.refresh();
  };

  return (
    <div>
      <AuthTabs value={tab} onChange={(t) => { setTab(t); setError(""); }} />

      <AnimatePresence>
        {verified && !error && (
          <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex items-center gap-2 rounded-2xl bg-olive-500/15 px-4 py-3 text-sm font-medium text-olive-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> E-postan doğrulandı. Şimdi giriş yapabilirsin.
          </motion.p>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-5 rounded-2xl bg-terra-500/10 px-4 py-3 text-sm font-medium text-terra-600">
            {error}
            {unverified && (
              <Link href={`/dogrula?email=${encodeURIComponent(email)}`} className="mt-1 block font-semibold underline">
                Doğrulama kodunu gir
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {tab === "musteri" ? (
        <>
          <GoogleButton next={next} />
          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted">
            <span className="h-px flex-1 bg-sand-300" /> veya <span className="h-px flex-1 bg-sand-300" />
          </div>
        </>
      ) : (
        <p className="mb-5 rounded-2xl bg-cream-200 px-4 py-3 text-sm text-olive-900">
          Üretici hesabınla giriş yap. Başvurun onaylandıktan sonra ürünlerini yönetebilirsin.
        </p>
      )}

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
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-olive-700 py-4 font-semibold text-cream-50 transition-colors hover:bg-olive-900 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />} {tab === "uretici" ? "Üretici girişi" : "Giriş yap"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {tab === "uretici" ? "Henüz üretici değil misin?" : "Hesabın yok mu?"}{" "}
        <Link
          href={tab === "uretici" ? "/kayit?tip=uretici" : `/kayit?next=${encodeURIComponent(next)}`}
          className="font-semibold text-olive-700 hover:underline"
        >
          {tab === "uretici" ? "Üretici başvurusu yap" : "Kayıt ol"}
        </Link>
      </p>
    </div>
  );
}