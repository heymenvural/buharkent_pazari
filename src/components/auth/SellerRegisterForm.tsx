"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Send } from "lucide-react";
import { categories } from "@/lib/catalog";
import { registerSeller } from "@/app/actions/auth";
import { Err } from "@/components/auth/RegisterForm";
import type { SellerRegisterInput } from "@/lib/validation/auth";

const ease = [0.76, 0, 0.24, 1] as const;

const initial: SellerRegisterInput = {
  name: "",
  email: "",
  password: "",
  phone: "",
  village: "",
  sellerType: "kadin-girisimci",
  categories: [],
  description: "",
  kvkk: false,
};

const types = [
  { key: "kadin-girisimci" as const, label: "Kadın girişimci" },
  { key: "genc-ciftci" as const, label: "Genç çiftçi" },
  { key: "diger" as const, label: "Diğer üretici" },
];

const inputCls = (err?: string) =>
  `w-full rounded-2xl border bg-cream-100 px-4 py-3.5 text-ink outline-none transition-colors focus:border-olive-500 ${err ? "border-terra-500" : "border-sand-300"}`;

export default function SellerRegisterForm() {
  const [form, setForm] = useState<SellerRegisterInput>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = <K extends keyof SellerRegisterInput>(k: K, v: SellerRegisterInput[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "", form: "" }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await registerSeller(form);
    setLoading(false);
    if (!res.ok) return setErrors(res.errors ?? {});
    setDone(true);
  };

  return (
    <AnimatePresence mode="wait">
      {done ? (
        <motion.div key="ok" className="flex flex-col items-center py-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.svg viewBox="0 0 100 100" className="h-24 w-24" initial="hidden" animate="show">
            <motion.circle cx="50" cy="50" r="45" fill="none" stroke="#6b7a3a" strokeWidth="5" variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1 } }} transition={{ duration: 0.8, ease }} />
            <motion.path d="M30 52 L44 66 L71 37" fill="none" stroke="#6b7a3a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1 } }} transition={{ delay: 0.7, duration: 0.5, ease }} />
          </motion.svg>
          <h2 className="mt-6 text-3xl text-olive-900">Başvurun alındı!</h2>
          <p className="mt-3 max-w-md text-muted">
            Ekibimiz başvurunu inceleyip seni arayacak. Onaylandığında e-posta ile bilgilendirileceksin ve giriş sayfasındaki
            <b> Üretici</b> sekmesinden giriş yapabileceksin.
          </p>
          <Link href="/" className="mt-8 rounded-full bg-olive-700 px-7 py-4 font-semibold text-cream-50">Ana sayfaya dön</Link>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={onSubmit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-ink">Ad Soyad</span>
              <input className={inputCls(errors.name)} value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={80} autoComplete="name" />
              <Err msg={errors.name} />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-ink">E-posta</span>
              <input type="email" className={inputCls(errors.email)} value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={120} autoComplete="email" />
              <Err msg={errors.email} />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-ink">Cep telefonu</span>
              <input type="tel" inputMode="tel" placeholder="05XX XXX XX XX" className={inputCls(errors.phone)} value={form.phone} onChange={(e) => set("phone", e.target.value)} maxLength={20} autoComplete="tel" />
              <Err msg={errors.phone} />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-ink">Şifre</span>
              <span className="relative block">
                <input type={show ? "text" : "password"} autoComplete="new-password" maxLength={128} value={form.password} onChange={(e) => set("password", e.target.value)} className={`${inputCls(errors.password)} pr-12`} />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label="Şifreyi göster" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted">
                  {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </span>
              <Err msg={errors.password} />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-ink">Mahalle / köy</span>
              <input className={inputCls(errors.village)} value={form.village} onChange={(e) => set("village", e.target.value)} maxLength={60} />
              <Err msg={errors.village} />
            </label>
          </div>

          <div>
            <p className="text-sm font-medium text-ink">Üretici tipi</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {types.map((t) => {
                const active = form.sellerType === t.key;
                return (
                  <button
                    type="button"
                    key={t.key}
                    onClick={() => set("sellerType", t.key)}
                    className={`relative rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${active ? "border-olive-700 text-olive-900" : "border-sand-300 text-ink/70 hover:border-sand-400"}`}
                  >
                    {active && <motion.span layoutId="seller-type" className="absolute inset-0 rounded-2xl bg-olive-500/10" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                    <span className="relative">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-ink">Hangi ürünleri üretiyorsun?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((c) => {
                const active = form.categories.includes(c.slug);
                return (
                  <button
                    type="button"
                    key={c.slug}
                    onClick={() => set("categories", active ? form.categories.filter((x) => x !== c.slug) : [...form.categories, c.slug])}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? "bg-olive-700 text-cream-50" : "border border-sand-400 text-olive-900 hover:border-olive-700"}`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
            <Err msg={errors.categories} />
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Ürünlerini ve üretim şeklini kısaca anlat</span>
            <textarea rows={4} className={`${inputCls(errors.description)} resize-none`} value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={1000} placeholder="Örn: Kendi bahçemizdeki incirleri güneşte kurutuyoruz, yılda yaklaşık 500 kg üretiyoruz..." />
            <span className="mt-1 block text-right text-xs text-muted">{form.description.length}/1000</span>
            <Err msg={errors.description} />
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={form.kvkk} onChange={(e) => set("kvkk", e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#4a5627]" />
            <span className="text-sm text-ink/80">
              <Link href="/kvkk" target="_blank" className="font-semibold text-olive-700 underline">KVKK Aydınlatma Metni</Link>&apos;ni okudum, başvurum için kişisel verilerimin işlenmesini onaylıyorum.
            </span>
          </label>
          <Err msg={errors.kvkk} />

          {errors.form && <p className="rounded-2xl bg-terra-500/10 px-4 py-3 text-sm font-medium text-terra-600">{errors.form}</p>}

          <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-full bg-olive-700 py-4 font-semibold text-cream-50 transition-colors hover:bg-olive-900 disabled:opacity-60">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            Başvuruyu gönder
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}