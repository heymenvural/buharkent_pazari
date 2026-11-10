"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Banknote, Landmark, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useLenis } from "lenis/react";
import { useCart, selectTotal, type CartItem } from "@/store/cart";
import { formatPrice, offers, sellers } from "@/lib/catalog";
import { shippingForPart } from "@/lib/orders";
import { createOrder } from "@/app/actions/order";
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

type Errors = Partial<Record<keyof CheckoutInput | "form", string>>;

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
  const router = useRouter();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<CheckoutInput>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectTotal);
  const clear = useCart((s) => s.clear);
  const patch = useCart((s) => s.patch);
  const lenis = useLenis();

  useEffect(() => setMounted(true), []);

  // Giriş yapmış kullanıcının adı ve e-postası hazır gelsin
  const [prefilled, setPrefilled] = useState(false);
  if (session?.user && !prefilled) {
    const u = session.user;
    setPrefilled(true);
    setForm((f) => ({ ...f, fullName: f.fullName || u.name || "", email: f.email || u.email || "" }));
  }

  // Ürünler üreticiye göre ayrı paketlenir; kargo ve ücretsiz kargo sınırı üretici bazında
  const groups = useMemo(() => {
    const map = new Map<string, CartItem[]>();
    items.forEach((i) => {
      const sid = offers.find((o) => o.id === i.offerId)?.sellerId ?? i.seller;
      map.set(sid, [...(map.get(sid) ?? []), i]);
    });
    return [...map.entries()].map(([sid, list]) => {
      const seller = sellers.find((s) => s.id === sid);
      const sub = list.reduce((a, i) => a + i.qty * i.price, 0);
      const shipping = shippingForPart(sub, list.map((i) => i.shippingFee ?? 0), seller?.freeShippingOver);
      const missing = seller?.freeShippingOver && shipping > 0 ? seller.freeShippingOver - sub : 0;
      return { key: sid, seller: seller?.name ?? list[0].seller, list, shipping, cod: !!seller?.cod, missing };
    });
  }, [items]);

  const shipping = groups.reduce((a, g) => a + g.shipping, 0);
  const grandTotal = subtotal + shipping;
  const codAllowed = groups.length > 0 && groups.every((g) => g.cod);

  // Kapıda ödeme sadece sepetteki tüm üreticiler kabul ediyorsa seçilebilir
  const payment = codAllowed ? form.payment : "havale";

  const set = <K extends keyof CheckoutInput>(key: K, value: CheckoutInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key] || errors.form) setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = checkoutSchema.safeParse({ ...form, payment });
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

    setLoading(true);
    const res = await createOrder({
      form: { ...form, payment },
      items: items
        .filter((i) => i.offerId && i.variantId)
        .map((i) => ({ offerId: i.offerId!, variantId: i.variantId!, qty: i.qty, price: i.price })),
    });

    if (!res.ok) {
      setLoading(false);
      // Fiyat/stok değiştiyse sepet sunucudaki doğru bilgilerle güncellenir
      res.fixes?.forEach((f) => {
        const id = `${f.offerId}:${f.variantId}`;
        if (f.removed) patch(id, { qty: 0 });
        else patch(id, { ...(f.price !== undefined ? { price: f.price } : {}), ...(f.maxQty !== undefined ? { maxQty: f.maxQty } : {}) });
      });
      setErrors(res.errors ?? { form: "Sipariş oluşturulamadı." });
      lenis?.scrollTo(0, { duration: 1 });
      return;
    }

    setDone(true);
    clear();
    router.push(`/siparis/${res.orderNo}?t=${res.token}&yeni=1`);
  };

  if (!mounted) return <div className="min-h-[60vh]" />;

  if (done) {
    return (
      <div className="mx-auto flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Loader2 className="h-10 w-10 animate-spin text-olive-700" />
        <p className="mt-4 text-muted">Siparişin oluşturuldu, yönlendiriliyorsun...</p>
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
      {errors.form && (
        <p className="mt-6 flex gap-2 rounded-2xl bg-terra-500/10 px-4 py-3 font-medium text-terra-600">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /> {errors.form}
        </p>
      )}

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
                { key: "havale" as const, title: "Havale / EFT", desc: "Doğrudan üreticinin hesabına", icon: Landmark, disabled: false },
                { key: "kapida" as const, title: "Kapıda ödeme", desc: codAllowed ? "Teslimatta öde" : "Sepetindeki her üretici kabul etmiyor", icon: Banknote, disabled: !codAllowed },
              ].map((o) => {
                const active = payment === o.key;
                const Icon = o.icon;
                return (
                  <button
                    type="button"
                    key={o.key}
                    disabled={o.disabled}
                    onClick={() => set("payment", o.key)}
                    className={`relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
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
            {errors.payment && <p className="mt-3 text-sm font-medium text-terra-600">{errors.payment}</p>}
            {payment === "havale" && (
              <p className="mt-4 rounded-2xl bg-olive-500/10 p-4 text-sm leading-relaxed text-olive-900">
                Buharkent Pazarı&apos;nda para aracıdan geçmez. Siparişi onayladıktan sonra her üreticinin IBAN&apos;ını ve ödeyeceğin tutarı göreceksin; aynı bilgiler e-postana da gelir.
                {groups.length > 1 && <b> Sepetinde {groups.length} üretici var, {groups.length} ayrı havale yapacaksın.</b>}
              </p>
            )}
            <p className="mt-4 flex items-center gap-2 text-xs text-muted">
              <Lock className="h-3.5 w-3.5" /> Kredi kartı ile güvenli ödeme çok yakında.
            </p>
          </Card>

          <Card step="4" title="Onaylar">
            <div className="space-y-3">
              {[
                { key: "kvkk" as const, text: <><Link href="/kvkk" target="_blank" className="font-semibold text-olive-700 underline">KVKK Aydınlatma Metni</Link>&apos;ni okudum, kişisel verilerimin işlenmesini onaylıyorum.</> },
                { key: "contract" as const, text: <>Ön Bilgilendirme Formu ve <Link href="/mesafeli-satis" target="_blank" className="font-semibold text-olive-700 underline">Mesafeli Satış Sözleşmesi</Link>&apos;ni okudum, kabul ediyorum.</> },
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
                <div key={g.key} className="rounded-2xl bg-cream-50/5 p-4">
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
                    {g.missing > 0 && (
                      <li className="text-xs text-sand-300">Bu üreticiden {formatPrice(g.missing)} daha eklersen kargo ücretsiz.</li>
                    )}
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

            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-terra-500 py-4 font-semibold transition-colors hover:bg-terra-600 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />} Siparişi Onayla
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