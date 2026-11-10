"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Banknote, CheckCircle2, Clock, ExternalLink, FileCheck2, Loader2, LogOut, Package, Pencil, Plus, Receipt, Save, Store, Truck, XCircle,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { setListingActive, updateShop } from "@/app/actions/seller";
import { formatPrice } from "@/lib/catalog";
import { SingleImage } from "@/components/seller/ImageUploader";
import SellerOrders from "@/components/orders/SellerOrders";
import type { OrderView } from "@/lib/data/orders.server";

export type PanelListing = {
  id: string;
  productName: string;
  image?: string;
  status: "active" | "paused" | "pending" | "rejected";
  locked: boolean;
  adminNote?: string;
  minPrice: number;
  stock: number;
  variants: string[];
};

export type PanelShop = {
  name: string;
  slug?: string;
  shopName: string;
  tagline: string;
  story: string;
  avatar: string;
  cover: string;
  freeShippingOver: string;
  cod: boolean;
};

const statusChip = {
  active: { label: "Satışta", cls: "bg-olive-500/20 text-olive-700", icon: CheckCircle2 },
  paused: { label: "Durduruldu", cls: "bg-sand-300 text-olive-900", icon: Clock },
  pending: { label: "Onay bekliyor", cls: "bg-[#e0a84a]/20 text-[#7a4f10]", icon: Clock },
  rejected: { label: "Düzeltme gerekli", cls: "bg-terra-500/15 text-terra-600", icon: XCircle },
};

const inputCls = (err?: string) =>
  `w-full rounded-2xl border-2 bg-cream-50 px-4 py-3 text-base text-ink outline-none transition-colors focus:border-olive-500 ${err ? "border-terra-500" : "border-sand-300"}`;

function ListingCard({ l }: { l: PanelListing }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");
  const c = statusChip[l.locked ? "rejected" : l.status];
  const Icon = c.icon;
  const canToggle = !l.locked && (l.status === "active" || l.status === "paused");

  const toggle = () =>
    start(async () => {
      setErr("");
      const res = await setListingActive(l.id, l.status !== "active");
      if (!res.ok) return setErr(res.errors?.form ?? "İşlem başarısız.");
      router.refresh();
    });

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-cream-50 p-4 shadow-soft sm:flex-row sm:items-center">
      <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-2xl bg-sand-300 sm:h-20 sm:w-20">
        {l.image ? <Image src={l.image} alt="" fill sizes="(max-width: 640px) 100vw, 80px" className="object-cover" /> : <Package className="absolute inset-0 m-auto h-8 w-8 text-olive-700/40" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-lg font-semibold text-ink">{l.productName}</p>
          <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${c.cls}`}>
            <Icon className="h-3.5 w-3.5" /> {l.locked ? "Yönetim kaldırdı" : c.label}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">
          {l.variants.join(" · ")} · {formatPrice(l.minPrice)}&apos;den başlayan · stok {l.stock}
        </p>
        {l.status === "rejected" && l.adminNote && <p className="mt-1 text-sm text-terra-600">Not: {l.adminNote}</p>}
        {err && <p className="mt-1 text-sm text-terra-600">{err}</p>}
      </div>
      <div className="flex shrink-0 gap-2">
        {canToggle && (
          <button onClick={toggle} disabled={pending} className="flex min-h-[44px] items-center gap-1.5 rounded-full border-2 border-sand-400 px-4 text-sm font-semibold text-olive-900 disabled:opacity-60">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} {l.status === "active" ? "Satışı durdur" : "Satışa aç"}
          </button>
        )}
        {!l.locked && (
          <Link href={`/panel/urun/${l.id}`} className="flex min-h-[44px] items-center gap-1.5 rounded-full bg-olive-700 px-4 text-sm font-semibold text-cream-50 hover:bg-olive-900">
            <Pencil className="h-4 w-4" /> Düzenle
          </Link>
        )}
      </div>
    </div>
  );
}

function ShopForm({ shop }: { shop: PanelShop }) {
  const router = useRouter();
  const [f, setF] = useState(shop);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const set = <K extends keyof PanelShop>(k: K, v: PanelShop[K]) => {
    setF((x) => ({ ...x, [k]: v }));
    setErrors({});
    setSaved(false);
  };

  const save = () =>
    start(async () => {
      const n = Number(f.freeShippingOver.replace(",", "."));
      const res = await updateShop({
        shopName: f.shopName,
        tagline: f.tagline,
        story: f.story,
        avatar: f.avatar,
        cover: f.cover,
        freeShippingOver: f.freeShippingOver.trim() && Number.isFinite(n) ? n : null,
        codEnabled: f.cod,
      });
      if (!res.ok) return setErrors(res.errors ?? { form: "Bir sorun oluştu." });
      setSaved(true);
      router.refresh();
    });

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-cream-50 p-5 shadow-soft md:p-7">
        <h2 className="text-xl font-semibold text-olive-900">Fotoğraflar</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Profil fotoğrafı veya logo</p>
            <SingleImage value={f.avatar} onChange={(v) => set("avatar", v)} label="Fotoğraf" round />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Kapak fotoğrafı (bahçen, atölyen...)</p>
            <SingleImage value={f.cover} onChange={(v) => set("cover", v)} label="Kapak" />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[2rem] bg-cream-50 p-5 shadow-soft md:p-7">
        <h2 className="text-xl font-semibold text-olive-900">Mağaza bilgileri</h2>
        <label className="block">
          <span className="mb-1.5 block font-semibold text-ink">Mağaza adı</span>
          <input value={f.shopName} maxLength={80} onChange={(e) => set("shopName", e.target.value)} placeholder="Örn: Ayşe Teyze'nin Bahçesi" className={inputCls(errors.shopName)} />
          {errors.shopName && <span className="text-sm text-terra-600">{errors.shopName}</span>}
        </label>
        <label className="block">
          <span className="mb-1.5 block font-semibold text-ink">Kısa slogan <span className="font-normal text-muted">(isteğe bağlı)</span></span>
          <input value={f.tagline} maxLength={160} onChange={(e) => set("tagline", e.target.value)} placeholder="Örn: Annemden öğrendiğim usulle, güneşte kurutulmuş incir" className={inputCls(errors.tagline)} />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-semibold text-ink">Hikâyen</span>
          <textarea rows={7} maxLength={3000} value={f.story} onChange={(e) => set("story", e.target.value)} className={`${inputCls(errors.story)} resize-none`} />
          <span className="block text-xs text-muted">Paragrafları boş bir satırla ayırabilirsin. {f.story.length}/3000</span>
          {errors.story && <span className="text-sm text-terra-600">{errors.story}</span>}
        </label>
      </section>

      <section className="rounded-[2rem] bg-cream-50 p-5 shadow-soft md:p-7">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-olive-900"><Truck className="h-5 w-5" /> Kargo kampanyası</h2>
        <p className="mt-1 text-sm text-muted">Müşteri senden bu tutar ve üzerinde alışveriş yaparsa kargo ücretsiz olur. İstemiyorsan boş bırak.</p>
        <label className="mt-4 block sm:w-1/2">
          <span className="mb-1.5 block font-semibold text-ink">Ücretsiz kargo sınırı (₺)</span>
          <input inputMode="decimal" value={f.freeShippingOver} onChange={(e) => set("freeShippingOver", e.target.value)} placeholder="Örn: 750" className={inputCls(errors.freeShippingOver)} />
        </label>
      </section>

      <section className="rounded-[2rem] bg-cream-50 p-5 shadow-soft md:p-7">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-olive-900"><Banknote className="h-5 w-5" /> Kapıda ödeme</h2>
        <label className="mt-3 flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={f.cod} onChange={(e) => set("cod", e.target.checked)} className="mt-1 h-6 w-6 shrink-0 accent-[#4a5627]" />
          <span className="text-ink/80">
            <b className="text-ink">Kapıda ödeme kabul ediyorum.</b> Sadece çalıştığın kargo firması tahsilatlı gönderim yapıyorsa işaretle; tahsil edilen para kargo firması üzerinden sana gelir.
          </span>
        </label>
      </section>

      {errors.form && <p className="rounded-2xl bg-terra-500/10 px-4 py-3 font-medium text-terra-600">{errors.form}</p>}
      <button onClick={save} disabled={pending} className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-olive-700 text-lg font-semibold text-cream-50 hover:bg-olive-900 disabled:opacity-60">
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : saved ? <CheckCircle2 className="h-5 w-5" /> : <Save className="h-5 w-5" />} {saved ? "Kaydedildi" : "Kaydet"}
      </button>
    </div>
  );
}

type Tab = "siparisler" | "urunler" | "magaza";

export default function SellerPanel({ listings, shop, orders }: { listings: PanelListing[]; shop: PanelShop; orders: OrderView[] }) {
  const params = useSearchParams();
  const openOrders = orders.filter((o) => ["pending_payment", "preparing", "shipped"].includes(o.parts[0].status)).length;
  const [tab, setTab] = useState<Tab>(() => {
    const q = params.get("sekme");
    if (q === "magaza" || q === "urunler" || q === "siparisler") return q;
    return openOrders ? "siparisler" : "urunler";
  });
  const savedStatus = params.get("kaydedildi");

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Merhaba {shop.name}</p>
          <h1 className="text-4xl text-olive-900 md:text-5xl">Üretici paneli</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {shop.slug && (
            <Link href={`/uretici/${shop.slug}`} target="_blank" className="flex items-center gap-1.5 rounded-full border-2 border-olive-700 px-4 py-2 text-sm font-semibold text-olive-700">
              <ExternalLink className="h-4 w-4" /> Mağazamı gör
            </Link>
          )}
          <Link href="/basvurum" className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-olive-900 hover:bg-cream-200">
            <FileCheck2 className="h-4 w-4" /> Belgelerim
          </Link>
          <button onClick={() => signOut({ redirectTo: "/" })} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-ink">
            <LogOut className="h-4 w-4" /> Çıkış
          </button>
        </div>
      </div>

      {savedStatus && (
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center gap-2 rounded-2xl bg-olive-500/15 px-4 py-3 font-medium text-olive-900">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {savedStatus === "pending" ? "Ürünün kaydedildi. Ekibimiz kontrol edip onayladıktan sonra sitede görünecek." : "Ürünün kaydedildi ve sitede yayında (en geç 1 dakika içinde görünür)."}
        </motion.p>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {[
          { key: "siparisler" as const, label: "Siparişler", icon: Receipt, n: openOrders },
          { key: "urunler" as const, label: "Ürünlerim", icon: Package, n: 0 },
          { key: "magaza" as const, label: "Mağazam", icon: Store, n: 0 },
        ].map(({ key, label, icon: Icon, n }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors sm:px-5 sm:text-base ${tab === key ? "bg-olive-900 text-cream-50" : "bg-cream-50 text-olive-900 shadow-soft"}`}
          >
            <Icon className="h-4 w-4" /> {label}
            {n > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-terra-500 px-1.5 text-xs text-cream-50">{n}</span>}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "siparisler" ? (
          <SellerOrders orders={orders} />
        ) : tab === "urunler" ? (
          <div className="space-y-3">
            <Link href="/panel/urun/yeni" className="flex min-h-[64px] items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-olive-700 font-semibold text-olive-700 hover:bg-olive-700/5">
              <Plus className="h-5 w-5" /> Yeni ürün ekle
            </Link>
            {listings.length === 0 && <p className="rounded-3xl bg-cream-50 p-8 text-center text-muted shadow-soft">Henüz ürün eklemedin. İlk ürününü ekleyerek başla!</p>}
            {listings.map((l) => <ListingCard key={l.id} l={l} />)}
          </div>
        ) : (
          <ShopForm shop={shop} />
        )}
      </div>
    </div>
  );
}
