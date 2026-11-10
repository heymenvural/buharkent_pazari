"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronDown, Info, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { saveListing } from "@/app/actions/seller";
import { SHIPS_IN } from "@/lib/validation/listing";
import { UNITS, makeVariant, unitPrice, type Unit } from "@/lib/units";
import ImageUploader from "@/components/seller/ImageUploader";

export type PickProduct = { id: string; name: string; productType: string; typeName: string; pending: boolean };
export type TypeOption = { key: string; name: string };

type VRow = { id?: string; amount: string; unit: Unit; price: string; oldPrice: string; stock: string };

export type ListingInitial = {
  id: string;
  productName: string;
  status: string;
  adminNote?: string;
  note: string;
  images: string[];
  variants: VRow[];
  shippingFee: string;
  shipsIn: string;
  details: { k: string; v: string }[];
};

const num = (s: string) => {
  const n = Number(s.replace(",", ".").trim());
  return s.trim() === "" || !Number.isFinite(n) ? NaN : n;
};

const inputCls = (err?: string) =>
  `w-full rounded-2xl border-2 bg-cream-50 px-4 py-3 text-base text-ink outline-none transition-colors focus:border-olive-500 ${err ? "border-terra-500" : "border-sand-300"}`;

function Err({ msg }: { msg?: string }) {
  return msg ? <span className="mt-1 block text-sm font-medium text-terra-600">{msg}</span> : null;
}

const emptyRow = (): VRow => ({ amount: "", unit: "g", price: "", oldPrice: "", stock: "" });

export default function ListingForm({ products, types, initial }: { products: PickProduct[]; types: TypeOption[]; initial?: ListingInitial }) {
  const router = useRouter();
  const editing = !!initial;

  const [productId, setProductId] = useState("");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(() => !initial && products.length === 0);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState(types.length === 1 ? types[0].key : "");

  const [note, setNote] = useState(initial?.note ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [rows, setRows] = useState<VRow[]>(initial?.variants.length ? initial.variants : [emptyRow()]);
  const [showOld, setShowOld] = useState(() => !!initial?.variants.some((v) => v.oldPrice));
  const [shippingFee, setShippingFee] = useState(initial?.shippingFee ?? "");
  const [shipsIn, setShipsIn] = useState(initial?.shipsIn ?? "1-2 gün");
  const [details, setDetails] = useState(initial?.details.length ? initial.details : [{ k: "", v: "" }]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return q ? products.filter((p) => p.name.toLocaleLowerCase("tr").includes(q)) : products;
  }, [products, query]);

  const setRow = (i: number, patch: Partial<VRow>) => {
    setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
    setErrors({});
  };

  const submit = async () => {
    setLoading(true);
    const res = await saveListing({
      id: initial?.id,
      productId: !editing && !creating ? productId || undefined : undefined,
      newProduct: !editing && creating ? { name: newName, productType: newType } : undefined,
      note,
      images,
      variants: rows.map((r) => ({
        id: r.id,
        amount: num(r.amount),
        unit: r.unit,
        price: num(r.price),
        oldPrice: showOld && r.oldPrice.trim() ? num(r.oldPrice) : undefined,
        stock: num(r.stock),
      })),
      shippingFee: num(shippingFee),
      shipsIn,
      details,
    });
    setLoading(false);
    if (!res.ok) {
      setErrors(res.errors ?? { form: "Bir sorun oluştu." });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push(`/panel?kaydedildi=${res.status}`);
    router.refresh();
  };

  const rowErr = (i: number, k: string) => errors[`variants.${i}.${k}`];

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/panel" className="inline-flex items-center gap-1.5 text-sm font-semibold text-olive-700">
        <ArrowLeft className="h-4 w-4" /> Ürünlerime dön
      </Link>
      <h1 className="mt-3 text-3xl text-olive-900 md:text-4xl">{editing ? initial.productName : "Yeni ürün ekle"}</h1>

      {initial?.status === "rejected" && initial.adminNote && (
        <p className="mt-4 flex gap-2 rounded-2xl bg-terra-500/10 p-4 text-sm text-terra-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0" /> Düzeltme isteği: {initial.adminNote}
        </p>
      )}
      {errors.form && <p className="mt-4 rounded-2xl bg-terra-500/10 px-4 py-3 font-medium text-terra-600">{errors.form}</p>}

      <div className="mt-8 space-y-8">
        {/* 1. Ürün */}
        {!editing && (
          <section className="rounded-[2rem] bg-cream-50 p-5 shadow-soft md:p-7">
            <h2 className="text-xl font-semibold text-olive-900">1. Hangi ürünü satacaksın?</h2>
            {!creating ? (
              <>
                <label className="relative mt-4 block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ürün ara..." className={`${inputCls()} pl-12`} />
                </label>
                <div className="mt-3 grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2" data-lenis-prevent>
                  {filtered.map((p) => {
                    const on = productId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setProductId(p.id);
                          setErrors({});
                        }}
                        className={`flex min-h-[60px] items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors ${on ? "border-olive-700 bg-olive-500/10" : "border-sand-300"}`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-ink">{p.name}</span>
                          <span className="block text-xs text-muted">{p.typeName}{p.pending && " · onay bekliyor"}</span>
                        </span>
                        {on && <Check className="h-5 w-5 shrink-0 text-olive-700" />}
                      </button>
                    );
                  })}
                  {filtered.length === 0 && (
                    <p className="text-sm text-muted sm:col-span-2">
                      {products.length === 0 ? "Başvurduğun ürün grupları için katalogda henüz hazır ürün yok. Aşağıdan kendi ürününü ekleyebilirsin." : "Aradığın ürün listede yok."}
                    </p>
                  )}
                </div>
                <Err msg={errors.productId} />
                <button type="button" onClick={() => setCreating(true)} className="mt-4 flex items-center gap-2 font-semibold text-olive-700">
                  <Plus className="h-5 w-5" /> Ürünüm listede yok, yeni ürün ekle
                </button>
              </>
            ) : (
              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block font-semibold text-ink">Ürünün adı</span>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={80} placeholder="Örn: Kuşburnu Marmelatı" className={inputCls(errors["newProduct.name"])} />
                  <Err msg={errors["newProduct.name"]} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block font-semibold text-ink">Hangi gruba giriyor?</span>
                  <select value={newType} onChange={(e) => setNewType(e.target.value)} className={inputCls(errors["newProduct.productType"])}>
                    <option value="" disabled>Seç</option>
                    {types.map((t) => (
                      <option key={t.key} value={t.key}>{t.name}</option>
                    ))}
                  </select>
                  <Err msg={errors["newProduct.productType"]} />
                </label>
                <p className="text-sm text-muted">Yeni ürünler ekibimizin onayından sonra sitede görünür. Sadece başvurunda seçtiğin gruplardan ürün ekleyebilirsin.</p>
                <button type="button" onClick={() => setCreating(false)} className="text-sm font-semibold text-olive-700">Listeden seç</button>
              </div>
            )}
          </section>
        )}

        {/* 2. Fotoğraflar */}
        <section className="rounded-[2rem] bg-cream-50 p-5 shadow-soft md:p-7">
          <h2 className="text-xl font-semibold text-olive-900">{editing ? "Fotoğraflar" : "2. Fotoğraflar (isteğe bağlı)"}</h2>
          <p className="mb-4 mt-1 text-sm text-muted">İsteğe bağlı. Fotoğraf eklemezsen ürün genel bir fotoğrafla görünür; ama kendi ürününün fotoğrafı her zaman daha çok satar.</p>
          <ImageUploader value={images} onChange={(v) => { setImages(v); setErrors({}); }} error={errors.images} />
        </section>

        {/* 3. Açıklama */}
        <section className="rounded-[2rem] bg-cream-50 p-5 shadow-soft md:p-7">
          <h2 className="text-xl font-semibold text-olive-900">{editing ? "Açıklama" : "3. Ürününü anlat"}</h2>
          <textarea
            rows={5}
            maxLength={2000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nasıl ürettin, ne zaman hasat ettin, neyi farklı? Müşteri bu yazıyı okuyacak."
            className={`${inputCls(errors.note)} mt-4 resize-none`}
          />
          <span className="block text-right text-xs text-muted">{note.length}/2000</span>
          <Err msg={errors.note} />

          <p className="mt-5 font-semibold text-ink">Ek bilgiler <span className="font-normal text-muted">(isteğe bağlı)</span></p>
          <div className="mt-2 space-y-2">
            {details.map((d, i) => (
              <div key={i} className="flex gap-2">
                <input value={d.k} maxLength={40} onChange={(e) => setDetails((x) => x.map((y, j) => (j === i ? { ...y, k: e.target.value } : y)))} placeholder="Örn: Hasat" className={`${inputCls()} w-2/5`} />
                <input value={d.v} maxLength={200} onChange={(e) => setDetails((x) => x.map((y, j) => (j === i ? { ...y, v: e.target.value } : y)))} placeholder="Örn: Ağustos 2026" className={inputCls()} />
                {details.length > 1 && (
                  <button type="button" onClick={() => setDetails((x) => x.filter((_, j) => j !== i))} aria-label="Sil" className="grid w-12 shrink-0 place-items-center text-muted hover:text-terra-600">
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {details.length < 6 && (
            <button type="button" onClick={() => setDetails((x) => [...x, { k: "", v: "" }])} className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-olive-700">
              <Plus className="h-4 w-4" /> Bilgi ekle
            </button>
          )}
        </section>

        {/* 4. Seçenekler */}
        <section className="rounded-[2rem] bg-cream-50 p-5 shadow-soft md:p-7">
          <h2 className="text-xl font-semibold text-olive-900">{editing ? "Miktar, fiyat ve stok" : "4. Miktar, fiyat ve stok"}</h2>
          <p className="mt-1 text-sm text-muted">Farklı paketler satıyorsan (250 g, 500 g, 1 kg gibi) her biri için ayrı satır ekle.</p>
          {errors.variants && <Err msg={errors.variants} />}

          <div className="mt-4 space-y-3">
            {rows.map((r, i) => {
              const a = num(r.amount);
              const p = num(r.price);
              const up = Number.isFinite(a) && Number.isFinite(p) && a > 0 ? unitPrice(makeVariant(a, r.unit).label, p) : null;
              return (
                <div key={i} className="rounded-2xl border-2 border-sand-300 p-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-muted">Miktar</span>
                      <input inputMode="decimal" value={r.amount} onChange={(e) => setRow(i, { amount: e.target.value })} placeholder="500" className={inputCls(rowErr(i, "amount"))} />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-muted">Birim</span>
                      <select value={r.unit} onChange={(e) => setRow(i, { unit: e.target.value as Unit })} className={inputCls()}>
                        {UNITS.map((u) => (
                          <option key={u.key} value={u.key}>{u.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-muted">Fiyat (₺)</span>
                      <input inputMode="decimal" value={r.price} onChange={(e) => setRow(i, { price: e.target.value })} placeholder="150" className={inputCls(rowErr(i, "price"))} />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-muted">Stok (adet)</span>
                      <input inputMode="numeric" value={r.stock} onChange={(e) => setRow(i, { stock: e.target.value.replace(/\D/g, "") })} placeholder="20" className={inputCls(rowErr(i, "stock"))} />
                    </label>
                  </div>
                  {showOld && (
                    <label className="mt-3 block sm:w-1/2">
                      <span className="mb-1 block text-xs font-semibold text-muted">İndirimden önceki fiyat (₺, boş bırakılabilir)</span>
                      <input inputMode="decimal" value={r.oldPrice} onChange={(e) => setRow(i, { oldPrice: e.target.value })} className={inputCls(rowErr(i, "oldPrice"))} />
                    </label>
                  )}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-sm text-muted">
                      {Number.isFinite(a) && a > 0 && <b className="text-ink">{makeVariant(a, r.unit).label}</b>}
                      {up && <> · {up}</>}
                    </span>
                    {rows.length > 1 && (
                      <button type="button" onClick={() => setRows((x) => x.filter((_, j) => j !== i))} className="flex items-center gap-1 text-sm text-muted hover:text-terra-600">
                        <Trash2 className="h-4 w-4" /> Sil
                      </button>
                    )}
                  </div>
                  {(rowErr(i, "amount") || rowErr(i, "price") || rowErr(i, "stock") || rowErr(i, "oldPrice")) && (
                    <Err msg={rowErr(i, "amount") ?? rowErr(i, "price") ?? rowErr(i, "stock") ?? rowErr(i, "oldPrice")} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-4">
            {rows.length < 10 && (
              <button type="button" onClick={() => setRows((x) => [...x, { ...emptyRow(), unit: x[x.length - 1]?.unit ?? "g" }])} className="flex items-center gap-1.5 font-semibold text-olive-700">
                <Plus className="h-5 w-5" /> Seçenek ekle
              </button>
            )}
            <button type="button" onClick={() => setShowOld((s) => !s)} className="flex items-center gap-1.5 text-sm font-semibold text-terra-600">
              <ChevronDown className={`h-4 w-4 transition-transform ${showOld ? "rotate-180" : ""}`} /> {showOld ? "İndirimi kaldır" : "İndirim göster"}
            </button>
          </div>
        </section>

        {/* 5. Kargo */}
        <section className="rounded-[2rem] bg-cream-50 p-5 shadow-soft md:p-7">
          <h2 className="text-xl font-semibold text-olive-900">{editing ? "Kargo" : "5. Kargo"}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block font-semibold text-ink">Kargo ücreti (₺)</span>
              <input inputMode="decimal" value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} placeholder="0 yazarsan ücretsiz" className={inputCls(errors.shippingFee)} />
              <Err msg={errors.shippingFee} />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-semibold text-ink">Kaç günde kargolarsın?</span>
              <select value={shipsIn} onChange={(e) => setShipsIn(e.target.value)} className={inputCls()}>
                {SHIPS_IN.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-3 text-sm text-muted">Belirli bir tutarın üzerinde kargoyu ücretsiz yapmak istersen bunu Mağazam sekmesinden ayarlayabilirsin.</p>
        </section>

        <button onClick={submit} disabled={loading} className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-olive-700 text-lg font-semibold text-cream-50 hover:bg-olive-900 disabled:opacity-60">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />} {editing ? "Değişiklikleri kaydet" : "Ürünü kaydet"}
        </button>
      </div>
    </div>
  );
}
