"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Eye, EyeOff, FileCheck2, Loader2, MapPin, ShieldCheck, Star } from "lucide-react";
import { registerSeller } from "@/app/actions/auth";
import Turnstile from "@/components/ui/Turnstile";
import { GROUPS, PRODUCT_TYPES, requirementsFor, taxOptionsFor, type Group, type TaxStatus } from "@/lib/compliance";
import { formatIban } from "@/lib/iban";
import type { SellerRegisterInput } from "@/lib/validation/auth";

const ease = [0.76, 0, 0.24, 1] as const;

const PROVINCES = ["Aydın", "Denizli", "Muğla"] as const;
type LocationData = Record<string, Record<string, string[]>>;

const STEPS = [
  "Seni tanıyalım",
  "Adresin",
  "Ne üretiyorsun?",
  "Kendini tanıt",
  "Vergi durumun",
  "Paran nereye gelsin?",
  "Hesap bilgileri",
  "Onay",
];

const FIELD_STEP: Record<string, number> = {
  name: 0, phone: 0, sellerType: 0,
  province: 1, district: 1, village: 1,
  productTypes: 2,
  since: 3, description: 3,
  taxStatus: 4,
  iban: 5, ibanName: 5,
  email: 6, password: 6,
  kvkk: 7, agreement: 7, form: 7,
};

const initial = {
  name: "", phone: "", sellerType: "kadin-girisimci",
  province: "", district: "", village: "",
  productTypes: [], since: undefined, description: "",
  taxStatus: undefined, iban: "", ibanName: "", email: "", password: "",
  kvkk: false, agreement: false,
} as unknown as SellerRegisterInput;

const SELLER_TYPES = [
  { key: "kadin-girisimci" as const, label: "Kadın girişimci" },
  { key: "genc-ciftci" as const, label: "Genç çiftçi" },
  { key: "diger" as const, label: "Diğer üretici" },
];

const PLEDGES = [
  "Sadece kendi ürettiğim ürünleri satacağım; başkasından alıp satmayacağım.",
  "Yüklediğim belgelerin doğru ve güncel olduğunu, değişiklik olursa bildireceğimi kabul ediyorum.",
  "Vergi, gıda güvenliği, etiketleme ve tüketici mevzuatından doğan sorumluluğun bana ait olduğunu kabul ediyorum.",
  "Siparişleri söz verdiğim sürede kargolayacağım ve müşterinin cayma hakkına uyacağım.",
  "Satıcının ben olduğumu, derneğin sadece aracı olduğunu ve para tahsil etmediğini; ödemelerin doğrudan IBAN'ıma yapılacağını biliyorum.",
  "Kurallara aykırı ürünlerin yayından kaldırılabileceğini ve mağazamın askıya alınabileceğini kabul ediyorum.",
];

const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: thisYear - 1949 }, (_, i) => thisYear - i);

const inputCls = (err?: string) =>
  `w-full rounded-2xl border-2 bg-cream-50 px-4 py-4 text-lg text-ink outline-none transition-colors focus:border-olive-500 ${err ? "border-terra-500" : "border-sand-300"}`;

function Err({ msg }: { msg?: string }) {
  return msg ? <span className="mt-1.5 block text-sm font-medium text-terra-600">{msg}</span> : null;
}

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="mb-2 block">
      <span className="block text-base font-semibold text-ink">{children}</span>
      {hint && <span className="block text-sm text-muted">{hint}</span>}
    </span>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  error,
}: {
  value: string | number | undefined;
  onChange: (v: string) => void;
  options: (string | number)[];
  placeholder: string;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <span className="relative block">
      <select
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls(error)} appearance-none pr-12 disabled:opacity-50`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
    </span>
  );
}

export default function SellerWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState<SellerRegisterInput>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [human, setHuman] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [loc, setLoc] = useState<LocationData | null>(null);

  // Mahalle listesi sadece gerektiğinde yüklenir (sayfa hızlı açılsın)
  useEffect(() => {
    import("@/data/locations.json").then((m) => setLoc(m.default as LocationData));
  }, []);

  // Satıcı rehberindeki seçimleri al
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("bp-seller-guide") ?? "null");
      if (saved?.selected?.length) setForm((f) => ({ ...f, productTypes: saved.selected, taxStatus: saved.tax ?? f.taxStatus }));
    } catch {}
  }, []);

  const set = <K extends keyof SellerRegisterInput>(k: K, v: SellerRegisterInput[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "", form: "" }));
  };

  const districts = useMemo(() => (loc && form.province ? Object.keys(loc[form.province] ?? {}).sort((a, b) => a.localeCompare(b, "tr")) : []), [loc, form.province]);
  const places = useMemo(() => (loc && form.province && form.district ? loc[form.province]?.[form.district] ?? [] : []), [loc, form.province, form.district]);

  const { options: taxOptions, recommended } = useMemo(() => taxOptionsFor(form.productTypes), [form.productTypes]);
  const req = useMemo(() => requirementsFor(form.productTypes, form.taxStatus), [form.productTypes, form.taxStatus]);

  useEffect(() => {
    if (form.taxStatus && !taxOptions.some((o) => o.key === form.taxStatus)) set("taxStatus", undefined as unknown as TaxStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxOptions]);

  // Basit adım kontrolü (asıl doğrulama sunucuda)
  const checkStep = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (form.name.trim().length < 2) e.name = "Adını ve soyadını yaz";
      if (form.phone.replace(/\D/g, "").length < 10) e.phone = "Cep telefonunu yaz";
    }
    if (s === 1) {
      if (!form.province) e.province = "İlini seç";
      if (!form.district) e.district = "İlçeni seç";
      if (!form.village) e.village = "Mahalleni veya köyünü seç";
    }
    if (s === 2 && !form.productTypes.length) e.productTypes = "En az bir ürün grubu seç";
    if (s === 3) {
      if (!form.since) e.since = "Ne zamandan beri ürettiğini seç";
      if (form.description.trim().length < 20) e.description = "Kendini biraz daha anlat (en az 20 karakter)";
    }
    if (s === 4 && !form.taxStatus) e.taxStatus = "Vergi durumunu seç";
    if (s === 5) {
      if (form.iban.replace(/\s/g, "").length !== 26) e.iban = "IBAN 26 karakter olmalı (TR ile başlar)";
      if (form.ibanName.trim().length < 3) e.ibanName = "Hesap sahibinin adını yaz";
    }
    if (s === 6) {
      if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Geçerli bir e-posta yaz";
      if (form.password.length < 8) e.password = "Şifre en az 8 karakter olmalı";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = () => checkStep(step) && go(step + 1);

  const submit = async () => {
    setLoading(true);
    const res = await registerSeller({ ...form, turnstile: human });
    if (!res.ok) {
      setLoading(false);
      setResetKey((k) => k + 1);
      const errs = res.errors ?? {};
      setErrors(errs);
      const first = Math.min(...Object.keys(errs).map((k) => FIELD_STEP[k] ?? 7));
      if (first < step) go(first);
      return;
    }
    const login = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    if (login?.error) {
      router.push("/giris?tab=uretici");
      return;
    }
    try {
      sessionStorage.removeItem("bp-seller-guide");
    } catch {}
    router.push("/basvurum");
    router.refresh();
  };

  return (
    <div>
      {/* İlerleme */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm font-semibold text-olive-900">
          <span>
            Adım {step + 1} / {STEPS.length}
          </span>
          <span className="text-muted">{STEPS[step]}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand-300">
          <motion.div className="h-full rounded-full bg-olive-700" animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.5, ease }} />
        </div>
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={step}
          custom={dir}
          initial={{ opacity: 0, x: dir * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -40 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <h2 className="text-3xl text-olive-900">{STEPS[step]}</h2>

          {/* 1. Kişisel */}
          {step === 0 && (
            <>
              <label className="block">
                <Label>Adın ve soyadın</Label>
                <input className={inputCls(errors.name)} value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={80} autoComplete="name" />
                <Err msg={errors.name} />
              </label>
              <label className="block">
                <Label hint="Ekibimiz bu numaradan seni arayacak">Cep telefonun</Label>
                <input type="tel" inputMode="tel" placeholder="05XX XXX XX XX" className={inputCls(errors.phone)} value={form.phone} onChange={(e) => set("phone", e.target.value)} maxLength={20} autoComplete="tel" />
                <Err msg={errors.phone} />
              </label>
              <div>
                <Label>Kendini nasıl tanımlarsın?</Label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {SELLER_TYPES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => set("sellerType", t.key)}
                      className={`min-h-[56px] rounded-2xl border-2 px-4 font-semibold transition-colors ${form.sellerType === t.key ? "border-olive-700 bg-olive-700 text-cream-50" : "border-sand-300 bg-cream-50 text-olive-900"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 2. Adres */}
          {step === 1 && (
            <>
              <p className="flex items-center gap-2 text-muted">
                <MapPin className="h-5 w-5 shrink-0" /> Üretim yaptığın yerin adresini listeden seç.
              </p>
              <div>
                <Label>İl</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PROVINCES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, province: p, district: "", village: "" }))}
                      className={`min-h-[56px] rounded-2xl border-2 font-semibold transition-colors ${form.province === p ? "border-olive-700 bg-olive-700 text-cream-50" : "border-sand-300 bg-cream-50 text-olive-900"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <Err msg={errors.province} />
              </div>
              <label className="block">
                <Label>İlçe</Label>
                <Select
                  value={form.district}
                  onChange={(v) => setForm((f) => ({ ...f, district: v, village: "" }))}
                  options={districts}
                  placeholder={!form.province ? "Önce il seç" : loc ? "İlçeni seç" : "Yükleniyor..."}
                  disabled={!form.province || !loc}
                  error={errors.district}
                />
                <Err msg={errors.district} />
              </label>
              <label className="block">
                <Label>Mahalle / köy</Label>
                <Select
                  value={form.village}
                  onChange={(v) => set("village", v)}
                  options={places}
                  placeholder={form.district ? "Mahalleni veya köyünü seç" : "Önce ilçe seç"}
                  disabled={!form.district}
                  error={errors.village}
                />
                <Err msg={errors.village} />
              </label>
            </>
          )}

          {/* 3. Ürün grupları */}
          {step === 2 && (
            <>
              <p className="text-muted">Hangi gruplarda ürün satmak istiyorsun? Birden fazla seçebilirsin. Ürünlerini tek tek, onaylandıktan sonra panelinden ekleyeceksin.</p>
              {(Object.keys(GROUPS) as Group[]).map((g) => (
                <div key={g}>
                  <p className="font-semibold text-olive-900">{GROUPS[g].title}</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {PRODUCT_TYPES.filter((t) => t.group === g).map((t) => {
                      const Icon = t.icon;
                      const on = form.productTypes.includes(t.key);
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => set("productTypes", on ? form.productTypes.filter((x) => x !== t.key) : [...form.productTypes, t.key])}
                          className={`flex min-h-[64px] items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors ${on ? "border-olive-700 bg-cream-50" : "border-sand-300 bg-cream-50/70"}`}
                        >
                          <Icon className="h-6 w-6 shrink-0 text-olive-700" />
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold text-ink">{t.name}</span>
                            <span className="block text-xs text-muted">{t.examples}</span>
                          </span>
                          <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 ${on ? "border-olive-700 bg-olive-700 text-cream-50" : "border-sand-400"}`}>
                            {on && <Check className="h-4 w-4" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <Err msg={errors.productTypes} />
            </>
          )}

          {/* 4. Kendini tanıt */}
          {step === 3 && (
            <>
              <label className="block">
                <Label>Ne zamandan beri üretiyorsun?</Label>
                <Select
                  value={form.since}
                  onChange={(v) => set("since", Number(v))}
                  options={YEARS}
                  placeholder="Yıl seç"
                  error={errors.since}
                />
                <Err msg={errors.since} />
              </label>
              <label className="block">
                <Label hint="Ailen, bahçen, nasıl başladığın... Müşteriler seni bu yazıyla tanıyacak.">Kendini kısaca tanıt</Label>
                <textarea
                  rows={5}
                  className={`${inputCls(errors.description)} resize-none`}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  maxLength={1000}
                  placeholder="Örn: 20 yıldır annemden öğrendiğim usulle incir kurutuyorum. Bahçemizde 40 incir ağacımız var..."
                />
                <span className="mt-1 block text-right text-xs text-muted">{form.description.length}/1000</span>
                <Err msg={errors.description} />
              </label>
            </>
          )}

          {/* 5. Vergi */}
          {step === 4 && (
            <>
              <p className="text-muted">
                Seçtiğin ürünlere uygun seçenekler aşağıda. Emin değilsen <b>Önerilen</b> seçeneği işaretle.{" "}
                <Link href="/satici-rehberi#ne-satacaksin" target="_blank" className="font-semibold text-olive-700 underline">Rehberde detaylı oku</Link>
              </p>
              <div className="space-y-3">
                {taxOptions.map((o) => {
                  const on = form.taxStatus === o.key;
                  return (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() => set("taxStatus", o.key)}
                      className={`relative w-full rounded-2xl border-2 p-5 text-left transition-colors ${on ? "border-olive-700 bg-cream-50" : "border-sand-300 bg-cream-50/70"}`}
                    >
                      {recommended === o.key && (
                        <span className="absolute -top-3 right-4 flex items-center gap-1 rounded-full bg-terra-500 px-3 py-1 text-xs font-bold text-cream-50">
                          <Star className="h-3 w-3 fill-cream-50" /> Önerilen
                        </span>
                      )}
                      <span className="flex items-center gap-3">
                        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${on ? "border-olive-700" : "border-sand-400"}`}>
                          {on && <span className="h-3 w-3 rounded-full bg-olive-700" />}
                        </span>
                        <span className="text-lg font-semibold text-ink">{o.title}</span>
                      </span>
                      <span className="mt-2 block pl-9 text-sm leading-relaxed text-muted">{o.text}</span>
                    </button>
                  );
                })}
              </div>
              <Err msg={errors.taxStatus} />
            </>
          )}

          {/* 6. IBAN */}
          {step === 5 && (
            <>
              <div className="flex gap-3 rounded-2xl bg-olive-500/15 p-4 text-olive-900">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm">Müşteriler ödemeyi doğrudan bu hesaba yapacak. Dernek hiçbir şekilde para almaz. IBAN&apos;ın sitede asla açıkça gösterilmez; sadece sipariş veren müşteriye ödeme için iletilir.</p>
              </div>
              {form.taxStatus === "muaf910" && (
                <p className="rounded-2xl bg-[#e0a84a]/15 p-4 text-sm text-[#7a4f10]">
                  Vergi muafiyeti belgesiyle satış yapacağın için, muafiyet sonrası bankada açtığın <b>internet satış hesabının</b> IBAN&apos;ını yazmalısın. Henüz açmadıysan şimdilik kendi IBAN&apos;ını yaz, sonra değiştirebiliriz.
                </p>
              )}
              <label className="block">
                <Label hint="TR ile başlayan 26 karakter">IBAN</Label>
                <input
                  className={`${inputCls(errors.iban)} font-mono tracking-wider`}
                  value={formatIban(form.iban)}
                  onChange={(e) => set("iban", e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 26))}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  autoCapitalize="characters"
                />
                <Err msg={errors.iban} />
              </label>
              <label className="block">
                <Label hint="Banka hesabında yazan ad soyad">Hesap sahibinin adı</Label>
                <input className={inputCls(errors.ibanName)} value={form.ibanName} onChange={(e) => set("ibanName", e.target.value)} maxLength={80} />
                <Err msg={errors.ibanName} />
              </label>
            </>
          )}

          {/* 7. Hesap */}
          {step === 6 && (
            <>
              <p className="text-muted">Başvurunu takip etmek ve belgelerini yüklemek için bu bilgilerle giriş yapacaksın.</p>
              <label className="block">
                <Label>E-posta adresin</Label>
                <input type="email" className={inputCls(errors.email)} value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={120} autoComplete="email" />
                <Err msg={errors.email} />
              </label>
              <label className="block">
                <Label hint="En az 8 karakter, en az bir harf ve bir rakam">Şifre belirle</Label>
                <span className="relative block">
                  <input type={show ? "text" : "password"} className={`${inputCls(errors.password)} pr-14`} value={form.password} onChange={(e) => set("password", e.target.value)} maxLength={128} autoComplete="new-password" />
                  <button type="button" onClick={() => setShow((s) => !s)} aria-label="Şifreyi göster" className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted">
                    {show ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                  </button>
                </span>
                <Err msg={errors.password} />
              </label>
            </>
          )}

          {/* 8. Onay */}
          {step === 7 && (
            <>
              <div className="rounded-2xl bg-cream-200 p-5">
                <p className="font-semibold text-olive-900">Başvurundan sonra yükleyeceğin belgeler</p>
                {req.docs.length ? (
                  <ul className="mt-3 space-y-2">
                    {req.docs.map((d) => (
                      <li key={d.doc.key} className="flex items-start gap-2 text-ink/80">
                        <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-olive-700" />
                        <span>
                          <b>{d.doc.name}</b> <span className="text-sm text-muted">({d.for.join(", ")})</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-ink/80">Seçtiğin ürünler için ek belge gerekmiyor.</p>
                )}
                <p className="mt-3 text-sm text-muted">Belgen henüz yoksa sorun değil; başvurduktan sonra istediğin zaman yükleyebilirsin.</p>
              </div>

              <div className="rounded-2xl border-2 border-olive-700 p-5">
                <p className="font-semibold text-olive-900">Üretici taahhütnamesi</p>
                <ul className="mt-3 space-y-2">
                  {PLEDGES.map((p) => (
                    <li key={p} className="flex gap-2 text-sm leading-relaxed text-ink/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-olive-700" /> {p}
                    </li>
                  ))}
                </ul>
                <label className="mt-4 flex cursor-pointer items-start gap-3">
                  <input type="checkbox" checked={form.agreement} onChange={(e) => set("agreement", e.target.checked)} className="mt-1 h-6 w-6 shrink-0 accent-[#4a5627]" />
                  <span className="font-semibold text-ink">Okudum, yukarıdaki maddeleri kabul ediyorum.</span>
                </label>
                <Err msg={errors.agreement} />
              </div>

              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={form.kvkk} onChange={(e) => set("kvkk", e.target.checked)} className="mt-1 h-6 w-6 shrink-0 accent-[#4a5627]" />
                <span className="text-ink/80">
                  <Link href="/kvkk" target="_blank" className="font-semibold text-olive-700 underline">KVKK Aydınlatma Metni</Link>&apos;ni okudum, başvurum için kişisel verilerimin işlenmesini onaylıyorum.
                </span>
              </label>
              <Err msg={errors.kvkk} />
              <Turnstile onToken={setHuman} resetKey={resetKey} />
              {errors.form && <p className="rounded-2xl bg-terra-500/10 px-4 py-3 font-medium text-terra-600">{errors.form}</p>}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Alt butonlar */}
      <div className="mt-10 flex gap-3">
        {step > 0 && (
          <button type="button" onClick={() => go(step - 1)} className="flex min-h-[56px] items-center justify-center gap-2 rounded-full border-2 border-olive-700 px-6 font-semibold text-olive-700">
            <ArrowLeft className="h-5 w-5" /> Geri
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={next} className="flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-full bg-olive-700 text-lg font-semibold text-cream-50 hover:bg-olive-900">
            Devam <ArrowRight className="h-5 w-5" />
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={loading} className="flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-full bg-terra-500 text-lg font-semibold text-cream-50 hover:bg-terra-600 disabled:opacity-60">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />} Başvuruyu gönder
          </button>
        )}
      </div>
    </div>
  );
}