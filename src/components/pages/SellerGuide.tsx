"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle, ArrowRight, BadgeCheck, Building2, Check, ChevronDown, Clock, ExternalLink,
  FileCheck2, HandCoins, Lightbulb, MessageCircle, PackageCheck, Star, Truck, Upload, UserCheck, Wallet,
} from "lucide-react";
import {
  DOCS, GROUPS, PRODUCT_TYPES, requirementsFor, taxOptionsFor, whatsappLink,
  type DocInfo, type Group, type TaxStatus,
} from "@/lib/compliance";

const ease = [0.76, 0, 0.24, 1] as const;
const STORAGE_KEY = "bp-seller-guide";

function DocCard({ doc, forList, index, helpText }: { doc: DocInfo; forList: string[]; index: number; helpText: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.05 }}
      className="overflow-hidden rounded-3xl border border-sand-300 bg-cream-50"
    >
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-4 p-5 text-left">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-olive-700/10 text-olive-700">
          <FileCheck2 className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold text-ink">{doc.name}</span>
          <span className="mt-0.5 block text-sm text-muted">Gerekli olduğu yer: {forList.join(", ")}</span>
        </span>
        <span className="hidden shrink-0 text-sm font-semibold text-olive-700 sm:block">{open ? "Kapat" : "Nasıl alırım?"}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="shrink-0 text-muted">
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.35, ease }} className="overflow-hidden">
            <div className="border-t border-sand-300 px-5 pb-5 pt-4">
              <p className="leading-relaxed text-ink/80">{doc.what}</p>
              <p className="mt-3 text-sm text-muted">
                <b className="text-ink">Nereden:</b> {doc.where}
              </p>
              <p className="mt-4 text-sm font-semibold text-olive-900">Adım adım:</p>
              <ol className="mt-2 space-y-2.5">
                {doc.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 leading-relaxed text-ink/80">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-olive-700 text-sm font-bold text-cream-50">{i + 1}</span>
                    <span className="pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span className="flex items-center gap-1.5 rounded-full bg-cream-200 px-3 py-1.5"><Wallet className="h-4 w-4" /> {doc.cost}</span>
                <span className="flex items-center gap-1.5 rounded-full bg-cream-200 px-3 py-1.5"><Clock className="h-4 w-4" /> {doc.time}</span>
                {doc.link && (
                  <a href={doc.link.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full bg-olive-700 px-3 py-1.5 font-semibold text-cream-50">
                    {doc.link.label} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              {doc.help && (
                <div className="mt-4 flex gap-3 rounded-2xl bg-[#e0a84a]/15 p-4 text-sm text-[#7a4f10]">
                  <Lightbulb className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>{doc.help}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SellerGuide() {
  const [selected, setSelected] = useState<string[]>([]);
  const [tax, setTax] = useState<TaxStatus | undefined>();

  // Seçimler kayıt formuna taşınabilsin diye tarayıcıda hatırlanır
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
      if (saved?.selected) setSelected(saved.selected);
      if (saved?.tax) setTax(saved.tax);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ selected, tax }));
    } catch {}
  }, [selected, tax]);

  const { options: taxOptions, recommended } = useMemo(() => taxOptionsFor(selected), [selected]);

  // Seçilen ürünlere uymayan vergi seçeneği seçiliyse sıfırla
  useEffect(() => {
    if (tax && !taxOptions.some((o) => o.key === tax)) setTax(undefined);
  }, [taxOptions, tax]);

  const req = useMemo(() => requirementsFor(selected, tax), [selected, tax]);
  const toggle = (k: string) => setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  const groups = Object.keys(GROUPS) as Group[];

  const selectedNames = req.types.map((t) => t.name).join(", ");
  const helpText = selectedNames ? `Satmak istediğim ürünler: ${selectedNames}.` : "";

  return (
    <div className="mx-auto max-w-6xl space-y-16 md:space-y-24">
      {/* Giriş */}
      <section className="text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-terra-500">Satıcı Rehberi</span>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl leading-tight text-olive-900 md:text-6xl">
          Buharkent Pazarı&apos;nda <span className="italic text-terra-500">satış yapmak</span> için neler gerekir?
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          Ne sattığını seç, sana hangi belgelerin gerektiğini ve bunları nasıl alacağını adım adım gösterelim.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            { icon: HandCoins, text: "Komisyon yok" },
            { icon: Wallet, text: "Para doğrudan sana gelir" },
            { icon: BadgeCheck, text: "Başvuru ücretsiz" },
          ].map(({ icon: I, text }) => (
            <span key={text} className="flex items-center gap-2 rounded-full bg-olive-700/10 px-4 py-2 font-semibold text-olive-700">
              <I className="h-5 w-5" /> {text}
            </span>
          ))}
        </div>
      </section>

      {/* Kimler satış yapabilir */}
      <section className="rounded-[2rem] border-2 border-olive-700 bg-cream-50 p-6 md:p-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-olive-700 text-cream-50">
            <UserCheck className="h-7 w-7" />
          </span>
          <div>
            <h2 className="text-3xl text-olive-900">Burada sadece kendi ürettiğini satabilirsin</h2>
            <p className="mt-3 text-lg leading-relaxed text-ink/80">
              Buharkent Pazarı, üreticiyi doğrudan alıcıyla buluşturmak için kuruldu. Bu yüzden:
            </p>
            <ul className="mt-4 space-y-2 text-lg text-ink/80">
              <li className="flex gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-olive-700" /> Kendi tarlanda yetiştirdiğin, kendi mutfağında yaptığın veya kendi ellerinle ürettiğin ürünleri satabilirsin.</li>
                            <li className="flex gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-olive-700" /> Satıcı Aydın, Denizli veya Muğla&apos;da yaşamalı ve üretimini burada yapmalı.</li>
              <li className="flex gap-3"><AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-terra-500" /> Başkasından alıp satmak (aracılık, tüccarlık) bu platformda yoktur. Böyle bir durum tespit edilirse mağaza kapatılır.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Nasıl işler */}
      <section>
        <h2 className="text-center text-3xl text-olive-900 md:text-4xl">4 adımda satışa başla</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: FileCheck2, title: "Başvur", text: "Formu doldur, ne ürettiğini seç." },
            { icon: Upload, title: "Belgelerini yükle", text: "Telefonla fotoğrafını çekmen yeterli." },
            { icon: BadgeCheck, title: "Dernek onaylar", text: "Ekibimiz belgelerini kontrol eder, seni arar." },
            { icon: PackageCheck, title: "Satışa başla", text: "Ürünlerini ekle, siparişlerini al." },
          ].map(({ icon: I, title, text }, i) => (
            <motion.div
              key={title}
              className="rounded-[1.75rem] bg-cream-50 p-6 shadow-soft"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <span className="font-display text-5xl text-terra-500">{i + 1}</span>
              <I className="mt-3 h-7 w-7 text-olive-700" />
              <h3 className="mt-3 text-2xl text-olive-900">{title}</h3>
              <p className="mt-1 text-muted">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Etkileşimli seçim */}
      <section id="ne-satacaksin" className="scroll-mt-40 rounded-[2rem] bg-cream-200 p-5 md:p-10">
        {/* 1. Ürünler */}
        <h2 className="text-3xl text-olive-900 md:text-4xl">1. Ne satmak istiyorsun?</h2>
        <p className="mt-2 text-muted">Birden fazla seçebilirsin. Örneğin hem kuru incir hem örgü.</p>

        <div className="mt-8 space-y-8">
          {groups.map((g) => (
            <div key={g}>
              <p className="font-semibold text-olive-900">{GROUPS[g].title}</p>
              <p className="text-sm text-muted">{GROUPS[g].text}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PRODUCT_TYPES.filter((t) => t.group === g).map((t) => {
                  const Icon = t.icon;
                  const on = selected.includes(t.key);
                  return (
                    <button
                      key={t.key}
                      onClick={() => toggle(t.key)}
                      className={`flex min-h-[72px] items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${
                        on ? "border-olive-700 bg-cream-50" : "border-transparent bg-cream-50/70 hover:border-sand-400"
                      }`}
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-olive-700/10 text-olive-700">
                        <Icon className="h-5 w-5" />
                      </span>
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
        </div>

        {/* 2. Vergi durumu */}
        <h2 className="mt-14 text-3xl text-olive-900 md:text-4xl">2. Vergi durumun hangisi?</h2>
        {selected.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-cream-50 p-5 text-muted">Önce yukarıdan ne satmak istediğini seç; sana uygun seçenekleri gösterelim.</p>
        ) : (
          <>
            <p className="mt-2 text-muted">Seçtiğin ürünlere uygun seçenekler aşağıda. Emin değilsen <b>Önerilen</b> seçeneği işaretle.</p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {taxOptions.map((o) => {
                const on = tax === o.key;
                const rec = recommended === o.key;
                return (
                  <motion.button
                    layout
                    key={o.key}
                    onClick={() => setTax(o.key)}
                    className={`relative rounded-2xl border-2 p-5 text-left transition-colors ${on ? "border-olive-700 bg-cream-50" : "border-transparent bg-cream-50/70 hover:border-sand-400"}`}
                  >
                    {rec && (
                      <span className="absolute -top-3 right-4 flex items-center gap-1 rounded-full bg-terra-500 px-3 py-1 text-xs font-bold text-cream-50">
                        <Star className="h-3 w-3 fill-cream-50" /> Önerilen
                      </span>
                    )}
                    <span className="flex items-center gap-3">
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${on ? "border-olive-700" : "border-sand-400"}`}>
                        {on && <span className="h-3 w-3 rounded-full bg-olive-700" />}
                      </span>
                      <span className="font-semibold text-ink">{o.title}</span>
                    </span>
                    <span className="mt-2 block pl-9 text-sm leading-relaxed text-muted">{o.text}</span>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}

        {/* 3. Sonuç */}
        <div className="mt-14">
          <h2 className="text-3xl text-olive-900 md:text-4xl">3. Senin için gerekli belgeler</h2>

          {selected.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-cream-50 p-5 text-muted">Ürün seçtiğinde gerekli belgeler burada görünecek.</p>
          ) : (
            <div className="mt-6 space-y-5">
              {/* Ürün ürün özet */}
              <div className="rounded-3xl bg-cream-50 p-5 md:p-6">
                <p className="font-semibold text-olive-900">Ürün ürün özet</p>
                <ul className="mt-3 divide-y divide-sand-300">
                  {req.types.map((t) => {
                    const Icon = t.icon;
                    return (
                      <li key={t.key} className="py-3">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                          <span className="flex items-center gap-2 font-semibold text-ink">
                            <Icon className="h-5 w-5 text-olive-700" /> {t.name}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted" />
                          {t.docs.length ? (
                            t.docs.map((d) => (
                              <span key={d} className="rounded-full bg-olive-700/10 px-3 py-1 text-sm font-semibold text-olive-700">
                                {DOCS[d].name}
                              </span>
                            ))
                          ) : (
                            <span className="rounded-full bg-olive-500/15 px-3 py-1 text-sm font-semibold text-olive-700">Ek belge gerekmiyor</span>
                          )}
                        </div>
                        {t.note && <p className="mt-2 text-sm text-muted">{t.note}</p>}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {req.docs.length === 0 ? (
                <div className="flex gap-3 rounded-2xl bg-olive-500/15 p-5 text-olive-900">
                  <BadgeCheck className="h-5 w-5 shrink-0" />
                  <p>Seçtiğin ürünler için ek bir belge gerekmiyor{!tax && "; vergi durumunu da seç"}. Hemen başvurabilirsin!</p>
                </div>
              ) : (
                <>
                  <p className="font-semibold text-olive-900">Belgeleri nasıl alırsın? (Üzerine dokun)</p>
                  <AnimatePresence mode="popLayout">
                    {req.docs.map((d, i) => (
                      <DocCard key={d.doc.key} doc={d.doc} forList={d.for} index={i} helpText={helpText} />
                    ))}
                  </AnimatePresence>
                </>
              )}

              {!tax && <p className="text-sm text-muted">Vergi durumunu seçtiğinde, varsa vergi belgesi de listeye eklenir.</p>}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/kayit?tip=uretici" className="group inline-flex items-center justify-center gap-2 rounded-full bg-olive-700 px-8 py-4 text-lg font-semibold text-cream-50 hover:bg-olive-900">
              Başvuruya başla <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={whatsappLink(`Merhaba, Buharkent Pazarı'nda satış yapmak istiyorum, yardım alabilir miyim? ${helpText}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-olive-700 px-8 py-4 text-lg font-semibold text-olive-700"
            >
              <MessageCircle className="h-5 w-5" /> WhatsApp&apos;tan yardım iste
            </a>
          </div>
          <p className="mt-3 text-sm text-muted">Belgen henüz yoksa da başvurabilirsin. Eksik belgelerini sonra yükleyebilirsin.</p>
        </div>
      </section>

      {/* Para ve sorumluluklar */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[2rem] bg-olive-900 p-7 text-cream-50 md:p-10">
          <Wallet className="h-8 w-8 text-sand-300" />
          <h2 className="mt-4 text-3xl">Paran nasıl gelir?</h2>
          <ul className="mt-5 space-y-3 text-cream-50/85">
            <li className="flex gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-sand-300" /> Müşteri ödemeyi <b>doğrudan senin IBAN&apos;ına</b> yapar veya kapıda öder.</li>
            <li className="flex gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-sand-300" /> Dernek hiçbir şekilde para almaz, komisyon kesmez.</li>
            <li className="flex gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-sand-300" /> Fiyatını ve kargo ücretini sen belirlersin.</li>
          </ul>
        </div>
        <div className="rounded-[2rem] bg-cream-50 p-7 shadow-soft md:p-10">
          <Building2 className="h-8 w-8 text-olive-700" />
          <h2 className="mt-4 text-3xl text-olive-900">Senin sorumlulukların</h2>
          <ul className="mt-5 space-y-3 text-ink/80">
            <li className="flex gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-olive-700" /> Sadece <b>kendi ürettiğin</b> ürünleri satmak.</li>
            <li className="flex gap-3"><Truck className="mt-1 h-5 w-5 shrink-0 text-olive-700" /> Siparişi söz verdiğin sürede kargoya vermek.</li>
            <li className="flex gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-olive-700" /> Müşterinin 14 günlük cayma hakkına uymak (taze ve çabuk bozulan ürünler hariç).</li>
            <li className="flex gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-olive-700" /> Vergi ve gıda kurallarına uymak; belgelerini güncel tutmak.</li>
          </ul>
        </div>
      </section>

      <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-muted">
        Bu rehber bilgilendirme amaçlıdır ve 2026 yılı kurallarına göre hazırlanmıştır. Tutarlar ve şartlar değişebilir.
        Kesin bilgi için Buharkent İlçe Tarım ve Orman Müdürlüğü, vergi dairesi veya bir mali müşavire danışabilirsin.
      </p>
    </div>
  );
}