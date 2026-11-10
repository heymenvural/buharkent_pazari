"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Sparkles, Store, X } from "lucide-react";
import { decideListing } from "@/app/actions/admin";
import { formatPrice } from "@/lib/catalog";

export type AdminListing = {
  id: string;
  product: string;
  productType: string;
  newProduct: boolean;
  seller: string;
  sellerSlug?: string;
  note: string;
  images: string[];
  variants: { label: string; price: number; oldPrice?: number; stock: number }[];
  shippingFee: number;
  shipsIn: string;
  details: { k: string; v: string }[];
  updatedAt: string;
};

function Card({ l, onError }: { l: AdminListing; onError: (e: string) => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [big, setBig] = useState(0);

  const act = (decision: "approve" | "reject") =>
    start(async () => {
      const res = await decideListing(l.id, decision, note);
      if (!res.ok) return onError(res.error ?? "İşlem başarısız.");
      router.refresh();
    });

  return (
    <motion.article layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 60 }} className="grid gap-6 rounded-[1.75rem] bg-cream-50 p-5 shadow-soft md:grid-cols-[280px_1fr] md:p-6">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-sand-300">
          {l.images[big] && <Image src={l.images[big]} alt="" fill sizes="280px" className="object-cover" />}
        </div>
        {(l.images?.length ?? 0) > 1 && (
          <div className="mt-2 grid grid-cols-6 gap-1.5">
            {l.images.map((src, i) => (
              <button key={src} onClick={() => setBig(i)} className={`relative aspect-square overflow-hidden rounded-lg ${big === i ? "ring-2 ring-olive-700" : "opacity-70"}`}>
                <Image src={src} alt="" fill sizes="48px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl text-olive-900">{l.product}</h2>
          {l.newProduct && (
            <span className="flex items-center gap-1 rounded-full bg-fig-600/10 px-2.5 py-1 text-xs font-semibold text-fig-600">
              <Sparkles className="h-3.5 w-3.5" /> Yeni ürün · katalogda da açılacak
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted">{l.productType}</p>
        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-olive-700">
          <Store className="h-4 w-4" />
          {l.sellerSlug ? <a href={`/uretici/${l.sellerSlug}`} target="_blank" className="underline">{l.seller}</a> : l.seller}
        </p>

        <p className="mt-4 whitespace-pre-line rounded-2xl bg-cream-100 p-4 text-sm leading-relaxed text-ink/80">{l.note}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {l.variants.map((v) => (
            <span key={v.label} className="rounded-full border border-sand-400 px-3 py-1.5 text-sm">
              <b>{v.label}</b> · {formatPrice(v.price)}
              {v.oldPrice && <span className="ml-1 text-muted line-through">{formatPrice(v.oldPrice)}</span>} · stok {v.stock}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          Kargo: {l.shippingFee === 0 ? "Ücretsiz" : formatPrice(l.shippingFee)} · {l.shipsIn} içinde
        </p>
        {l.details.length > 0 && (
          <dl className="mt-3 grid gap-1 text-sm">
            {l.details.map((d) => (
              <div key={d.k}><dt className="inline text-muted">{d.k}: </dt><dd className="inline">{d.v}</dd></div>
            ))}
          </dl>
        )}

        <div className="mt-5 border-t border-sand-300 pt-4">
          {rejecting ? (
            <div className="space-y-2">
              <textarea rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Örn: Fotoğraflar çok karanlık, gün ışığında tekrar çek." className="w-full resize-none rounded-2xl border border-sand-300 bg-cream-100 px-4 py-3 text-sm outline-none focus:border-olive-500" />
              <div className="flex gap-2">
                <button onClick={() => act("reject")} disabled={pending} className="flex items-center gap-1.5 rounded-full bg-terra-600 px-5 py-2.5 text-sm font-semibold text-cream-50 disabled:opacity-60">
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />} Düzeltme iste
                </button>
                <button onClick={() => setRejecting(false)} className="rounded-full px-5 py-2.5 text-sm font-semibold text-olive-900">Vazgeç</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => act("approve")} disabled={pending} className="flex items-center gap-1.5 rounded-full bg-olive-700 px-5 py-2.5 text-sm font-semibold text-cream-50 hover:bg-olive-900 disabled:opacity-60">
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Onayla ve yayına al
              </button>
              <button onClick={() => setRejecting(true)} className="flex items-center gap-1.5 rounded-full border border-terra-500 px-5 py-2.5 text-sm font-semibold text-terra-600 hover:bg-terra-500/10">
                <X className="h-4 w-4" /> Düzeltme iste
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function ListingsAdmin({ items }: { items: AdminListing[] }) {
  const [error, setError] = useState("");
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-4xl text-olive-900 md:text-5xl">Ürün onayı</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Üreticinin ilk ürünü ve yeni eklenen ürün çeşitleri burada onaylanır. İlk ürünü onaylanan üreticinin sonraki ürünleri doğrudan yayına girer.
      </p>
      {error && (
        <button onClick={() => setError("")} className="mt-5 block w-full rounded-2xl bg-terra-500/10 px-4 py-3 text-left text-sm font-medium text-terra-600">{error}</button>
      )}
      <div className="mt-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {items.length === 0 && (
            <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl bg-cream-50 p-10 text-center text-muted shadow-soft">
              Onay bekleyen ürün yok.
            </motion.p>
          )}
          {items.map((l) => <Card key={l.id} l={l} onError={setError} />)}
        </AnimatePresence>
      </div>
    </div>
  );
}
