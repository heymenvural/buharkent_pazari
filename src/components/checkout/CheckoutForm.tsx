"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Banknote, Landmark, Lock, ShieldCheck } from "lucide-react";
import { useLenis } from "lenis/react";
import { useCart, selectTotal, type CartItem } from "@/store/cart";
import { formatPrice } from "@/lib/catalog";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation/checkout";

const ease = [0.76, 0, 0.24, 1] as const;

const initial: CheckoutInput = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  district: "",
  address: "",
  note: "",
  payment: "havale",
  kvkk: false,
  contract: false,
};

type Errors = Partial<Record<keyof CheckoutInput, string>>;

// Aynı üreticiden alınan ürünler tek pakette gider: en yüksek kargo ücreti uygulanır
const shippingFor = (list: CartItem[]) => Math.max(0, ...list.map((i) => i.shippingFee ?? 0));

function Field({ label, error, children, className = "" }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 block text-xs font-medium text-terra-600">
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}

const inputCls = (err?: string) =>
  `w-full rounded-2xl border bg-cream-50 px-4 py-3.5 text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-olive-500 ${
    err ? "border-terra-500" : "border-sand-300"
  }`;

function Card({ title, step, children }: { title: string; step: string; children: React.ReactNode }) {
  return (
    <motion.section
      className="rounded-[1.75rem] bg-cream-50 p-5 shadow-soft md:p-7"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease }}
    >
      <h2 className="flex items-center gap-3 text-xl text-olive-900 md:text-2xl">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-olive-700 font-sans text-sm font-bold text-cream-50">{step}</span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}

export default function CheckoutForm() {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<CheckoutInput>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectTotal);
  const clear = useCart((s) => s.clear);
  const lenis = useLenis();

  useEffect(() => setMounted(true), []);

  const groups = useMemo(() => {
    const map = new Map<string, CartItem[]>();
    items.forEach((i) => map.set(i.seller, [...(map.get(i.seller) ?? []), i]));
    return [...map.entries()].map(([seller, list]) => ({ seller, list, shipping: shippingFor(list) }));
  }, [items]);

  const shipping = groups.reduce((a, g) => a + g.shipping, 0);
  const grandTotal = subtotal + shipping;

  const set = <K extends keyof CheckoutInput>(key: K, value: CheckoutInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      const next: Errors = {};
      result.error.issues.forEach((iss) => {
        const k = iss.path[0] as keyof CheckoutInput;
        if (!next[k]) next[k] = iss.message;
      });
      setErrors(next);
      lenis?.scrollTo(0, { duration: 1 });
      return;
    }
    // DEMO: Veritabanı adımında sipariş sunucuya gönderilecek, fiyatlar sunucuda yeniden hesaplanacak
    setOrderNo("BP-" + Date.now().toString().slice(-6));
    clear();
    lenis?.scrollTo(0, { duration: 1 });
  };

  if (!mounted) return <div className="min-h-[60vh]" />;

  if (orderNo) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center text-center">
        <motion.svg viewBox="0 0 100 100" className="h-28 w-28" initial="hidden" animate="show">
          <motion.circle cx="50" cy="50" r="45" fill="none" stroke="#6b7a3a" strokeWidth="5"
            variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1 } }} transition={{ duration: 0.8, ease }} />
          <motion.path d="M30 52 L44 66 L71 37" fill="none" stroke="#6b7a3a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
            variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1 } }} transition={{ delay: 0.7, duration: 0.5, ease }} />
        </motion.svg>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
          <h1 className="mt-6 text-4xl text-olive-900 md:text-5xl">Siparişin alındı!</h1>
          <p className="mt-3 text-muted">
            Sipariş numaran <span className="font-bold text-olive-900">{orderNo}</span>. Detaylar e-posta adresine gönderilecek.
          </p>
          <Link href="/" className="mt-8 inline-flex rounded-full bg-olive-700 px-7 py-4 font-semibold text-cream-50 transition-colors hover:bg-olive-900">
            Ana sayfaya dön
          </Link>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center text-center">
        <h1 className="text-4xl text-olive-900">Sepetin boş</h1>
        <p className="mt-3 text-muted">Ödeme yapabilmek için önce sepetine ürün ekle.</p>
        <Link href="/urunler" className="mt-8 rounded-full bg-olive-700 px-7 py-4 font-semibold text-cream-50">
          Ürünlere göz at
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-olive-700">
        <ArrowLeft className="h-4 w-4" /> Alışverişe dön
      </Link>
      <h1 className="mt-4 text-4xl text-olive-900 md:text-6xl">
        Siparişi <span className="italic text-terra-500">tamamla.</span>
      </h1>
      <p className="mt-2 text-muted">Üye olmadan sipariş verebilirsin.</p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
        <form id="checkout-form" onSubmit={onSubmit} noValidate className="space-y-6">
          <Card step="1" title="İletişim bilgileri">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Ad Soyad" error={errors.fullName} className="md:col-span-2">
                <input className={inputCls(errors.fullName)} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} autoComplete="name" maxLength={80} />
              </Field>
              <Field label="E-posta" error={errors.email}>
                <input type="email" className={inputCls(errors.email)} value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" maxLength={120} />
              </Field>
              <Field label="Cep telefonu" error={errors.phone}>
                <input type="tel" inputMode="tel" placeholder="05XX XXX XX XX" className={inputCls(errors.phone)} value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" maxLength={20} />
              </Field>
            </div>
          </Card>

          <Card step="2" title="Teslimat adresi">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="İl" error={errors.city}>
                <input className={inputCls(errors.city)} value={form.city} onChange={(e) => set("city", e.target.value)} autoComplete="address-level1" maxLength={40} />
              </Field>
              <Field label="İlçe" error={errors.district}>
                <input className={inputCls(errors.district)} value={form.district} onChange={(e) => set("district", e.target.value)} autoComplete="address-level2" maxLength={40} />
              </Field>
              <Field label="Açık adres" error={errors.address} className="md:col-span-2">
                <textarea rows={3} className={`${inputCls(errors.address)} resize-none`} value={form.address} onChange={(e) => set("address", e.target.value)} autoComplete="street-address" maxLength={300} />
              </Field>
              <Field label="Sipariş notu (isteğe bağlı)" error={errors.note} className="md:col-span-2">
                <input className={inputCls(errors.note)} value={form.note} onChange={(e) => set("note", e.target.value)} maxLength={300} />
              </Field>
            </div>
          </Card>

          <Card step="3" title="Ödeme yöntemi">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { key: "havale" as const, title: "Havale / EFT", desc: "Banka bilgileri e-postana gelir", icon: Landmark },
                { key: "kapida" as const, title: "Kapıda ödeme", desc: "Teslimatta nakit veya kart", icon: Banknote },
              ].map((o) => {
                const active = form.payment === o.key;
                const Icon = o.icon;
                return (
                  <button
                    type="button"
                    key={o.key}
                    onClick={() => set("payment", o.key)}
                    className={`relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
                      active ? "border-olive-700" : "border-sand-300 hover:border-sand-400"
                    }`}
                  >
                    {active && (
                      <motion.span layoutId="pay-active" className="absolute inset-0 rounded-2xl bg-olive-500/10" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                    )}
                    <Icon className="relative mt-0.5 h-5 w-5 text-olive-700" />
                    <span className="relative">
                      <span className="block font-semibold text-ink">{o.title}</span>
                      <span className="block text-xs text-muted">{o.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted">
              <Lock className="h-3.5 w-3.5" /> Kredi kartı ile güvenli ödeme çok yakında.
            </p>
          </Card>

          <Card step="4" title="Onaylar">
            <div className="space-y-3">
              {[
                { key: "kvkk" as const, text: "KVKK Aydınlatma Metni'ni okudum, kişisel verilerimin işlenmesini onaylıyorum." },
                { key: "contract" as const, text: "Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi'ni okudum, kabul ediyorum." },
              ].map((c) => (
                <div key={c.key}>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input type="checkbox" checked={form[c.key]} onChange={(e) => set(c.key, e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#4a5627]" />
                    <span className="text-sm text-ink/80">{c.text}</span>
                  </label>
                  {errors[c.key] && <p className="ml-8 mt-1 text-xs font-medium text-terra-600">{errors[c.key]}</p>}
                </div>
              ))}
            </div>
          </Card>
        </form>

        <aside className="lg:sticky lg:top-36 lg:self-start">
          <motion.div
            className="rounded-[1.75rem] bg-olive-900 p-5 text-cream-50 md:p-7"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease }}
          >
            <h2 className="text-2xl">Sipariş özeti</h2>

            <div className="mt-5 space-y-4">
              {groups.map((g) => (
                <div key={g.seller} className="rounded-2xl bg-cream-50/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">{g.seller}</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {g.list.map((i) => (
                      <li key={i.id} className="flex justify-between gap-3">
                        <span className="text-cream-50/80">
                          {i.qty} × {i.name} <span className="text-cream-50/50">({i.unit})</span>
                        </span>
                        <span className="shrink-0">{formatPrice(i.qty * i.price)}</span>
                      </li>
                    ))}
                    <li className="flex justify-between gap-3 border-t border-cream-50/10 pt-2 text-cream-50/60">
                      <span>Kargo</span>
                      <span className={g.shipping === 0 ? "font-semibold text-sand-300" : ""}>
                        {g.shipping === 0 ? "Ücretsiz" : formatPrice(g.shipping)}
                      </span>
                    </li>
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 border-t border-cream-50/10 pt-5 text-sm">
              <div className="flex justify-between text-cream-50/70">
                <span>Ara toplam</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-cream-50/70">
                <span>Kargo ({groups.length} üretici)</span>
                <span>{shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}</span>
              </div>
              <div className="flex items-end justify-between pt-2">
                <span className="font-semibold">Toplam</span>
                <span className="font-display text-3xl">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button type="submit" form="checkout-form" className="mt-6 w-full rounded-full bg-terra-500 py-4 font-semibold transition-colors hover:bg-terra-600">
              Siparişi Onayla
            </button>
            <p className="mt-3 flex items-center justify-center gap-2 text-xs text-cream-50/50">
              <ShieldCheck className="h-4 w-4" /> Bilgilerin güvenle korunur
            </p>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}