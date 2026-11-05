"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, MailCheck } from "lucide-react";
import { resendCode, verifyEmail } from "@/app/actions/auth";

export default function VerifyForm({ initialEmail, notice }: { initialEmail: string; notice: boolean }) {
  const [email, setEmail] = useState(initialEmail);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [info, setInfo] = useState(notice ? "Bu e-postayla daha önce kayıt başlatılmış; yeni kod gönderdik." : "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [wait, setWait] = useState(60);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const setAt = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "");
    if (clean.length > 1) {
      const arr = clean.slice(0, 6).split("");
      setDigits((d) => d.map((_, j) => arr[j] ?? ""));
      refs.current[Math.min(arr.length, 5)]?.focus();
      return;
    }
    setDigits((d) => d.map((x, j) => (j === i ? clean : x)));
    setError("");
    if (clean && i < 5) refs.current[i + 1]?.focus();
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) return setError("6 haneli kodu gir.");
    setLoading(true);
    const res = await verifyEmail({ email, code });
    setLoading(false);
    if (!res.ok) {
      setError(res.errors?.code ?? res.errors?.email ?? res.errors?.form ?? "Doğrulama başarısız.");
      setDigits(Array(6).fill(""));
      refs.current[0]?.focus();
      return;
    }
    setDone(true);
  };

  const resend = async () => {
    setError("");
    const res = await resendCode(email);
    if (res.wait) return setWait(res.wait);
    if (!res.ok) return setError(res.errors?.form ?? "Kod gönderilemedi.");
    setInfo("Yeni kod gönderildi. Gelen kutunu ve gereksiz klasörünü kontrol et.");
    setWait(60);
  };

  if (done) {
    return (
      <motion.div className="text-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-olive-500/15 text-olive-700">
          <MailCheck className="h-10 w-10" />
        </span>
        <p className="mt-5 font-display text-2xl text-olive-900">E-postan doğrulandı!</p>
        <Link href="/giris?verified=1" className="mt-6 inline-flex rounded-full bg-olive-700 px-7 py-4 font-semibold text-cream-50">
          Giriş yap
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">E-posta</span>
        <input
          type="email"
          value={email}
          maxLength={120}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-sand-300 bg-cream-100 px-4 py-3.5 text-ink outline-none focus:border-olive-500"
        />
      </label>

      <p className="mt-6 text-sm font-medium text-ink">E-postana gelen 6 haneli kod</p>
      <div className="mt-3 flex justify-between gap-2">
        {digits.map((d, i) => (
          <motion.input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={6}
            onChange={(e) => setAt(i, e.target.value)}
            onKeyDown={(e) => e.key === "Backspace" && !d && i > 0 && refs.current[i - 1]?.focus()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            aria-label={`${i + 1}. hane`}
            className={`h-14 w-full rounded-2xl border bg-cream-100 text-center font-display text-2xl text-olive-900 outline-none transition-colors focus:border-olive-500 md:h-16 ${
              error ? "border-terra-500" : "border-sand-300"
            }`}
          />
        ))}
      </div>

      {error && <p className="mt-3 text-sm font-medium text-terra-600">{error}</p>}
      {info && !error && <p className="mt-3 text-sm text-olive-700">{info}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-olive-700 py-4 font-semibold text-cream-50 transition-colors hover:bg-olive-900 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-5 w-5 animate-spin" />} Doğrula
      </button>

      <p className="mt-5 text-center text-sm text-muted">
        Kod gelmedi mi?{" "}
        {wait > 0 ? (
          <span>{wait} sn sonra tekrar gönderebilirsin</span>
        ) : (
          <button type="button" onClick={resend} className="font-semibold text-olive-700 hover:underline">
            Tekrar gönder
          </button>
        )}
      </p>
    </form>
  );
}