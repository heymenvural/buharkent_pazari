"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, ExternalLink, Landmark, MapPin, Package, Phone, Truck } from "lucide-react";
import { formatPrice } from "@/lib/catalog";
import { PAYMENT_DAYS, STATUS, trackingUrl } from "@/lib/orders";
import type { OrderView } from "@/lib/data/orders.server";
import OrderTimeline from "./OrderTimeline";
import ReviewForm from "./ReviewForm";

const ease = [0.76, 0, 0.24, 1] as const;

function CopyField({ label, value, display, mono }: { label: string; value: string; display?: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="flex w-full items-center justify-between gap-3 rounded-2xl bg-cream-50 px-4 py-3 text-left"
    >
      <span className="min-w-0">
        <span className="block text-xs text-muted">{label}</span>
        <span className={`block break-all font-semibold text-ink ${mono ? "font-mono text-sm" : ""}`}>{display ?? value}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-olive-700">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Kopyalandı" : "Kopyala"}
      </span>
    </button>
  );
}

export default function CustomerOrder({ order, isNew, token }: { order: OrderView; isNew: boolean; token?: string }) {
  const firstName = order.customer.name.split(" ")[0] ?? "";
  const shortName = `${firstName} ${order.customer.name.split(" ").slice(1).map((w) => w[0] + ".").join(" ")}`.trim();
  const havaleParts = order.parts.filter((p) => p.iban);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {isNew ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="text-center">
          <motion.svg viewBox="0 0 100 100" className="mx-auto h-24 w-24" initial="hidden" animate="show">
            <motion.circle cx="50" cy="50" r="45" fill="none" stroke="#6b7a3a" strokeWidth="5" variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1 } }} transition={{ duration: 0.8, ease }} />
            <motion.path d="M30 52 L44 66 L71 37" fill="none" stroke="#6b7a3a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1 } }} transition={{ delay: 0.7, duration: 0.5, ease }} />
          </motion.svg>
          <h1 className="mt-4 text-4xl text-olive-900 md:text-5xl">Siparişin alındı!</h1>
          <p className="mt-2 text-muted">
            Sipariş numaran <b className="text-olive-900">{order.orderNo}</b>. Özetini <b>{order.customer.email}</b> adresine gönderdik.
          </p>
        </motion.div>
      ) : (
        <div>
          <p className="text-sm text-muted">{new Date(order.createdAt).toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" })}</p>
          <h1 className="text-4xl text-olive-900 md:text-5xl">Sipariş {order.orderNo}</h1>
        </div>
      )}

      {/* Havale talimatı */}
      {havaleParts.length > 0 && (
        <section className="rounded-[2rem] border-2 border-[#e0a84a] bg-[#fff7e6] p-5 md:p-7">
          <h2 className="flex items-center gap-2 text-2xl text-[#7a4f10]">
            <Landmark className="h-6 w-6" /> Ödemeyi doğrudan üreticiye gönder
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#7a4f10]">
            Buharkent Pazarı parayı hiç görmez. {havaleParts.length > 1 ? `Her üreticiye ayrı havale/EFT yap (${havaleParts.length} havale).` : "Aşağıdaki hesaba havale/EFT yap."} Açıklamaya mutlaka sipariş numaranı yaz. {PAYMENT_DAYS} gün içinde ödenmeyen siparişler iptal edilebilir.
          </p>
          <div className="mt-4 space-y-4">
            {havaleParts.map((p) => (
              <div key={p.id} className="space-y-2 rounded-3xl bg-[#fdebc4]/60 p-3">
                <p className="px-1 text-xs font-bold uppercase tracking-widest text-[#7a4f10]">{p.sellerName}</p>
                <CopyField label="Alıcı adı" value={p.ibanName ?? p.sellerName} />
                <CopyField label="IBAN" value={p.iban!} display={p.iban!.replace(/(.{4})/g, "$1 ").trim()} mono />
                <div className="grid gap-2 sm:grid-cols-2">
                  <CopyField label="Tutar" value={String(p.total)} display={formatPrice(p.total)} />
                  <CopyField label="Açıklama" value={order.orderNo} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Paketler */}
      {order.parts.map((p) => {
        const track = trackingUrl(p.cargoCompany, p.trackingNo);
        return (
          <section key={p.id} className="rounded-[2rem] bg-cream-50 p-5 shadow-soft md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-xl text-olive-900"><Package className="h-5 w-5" /> {p.sellerName}</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS[p.status].cls}`}>{STATUS[p.status].label}</span>
            </div>
            <div className="mt-5">
              <OrderTimeline status={p.status} payment={order.payment} history={p.history} />
            </div>

            {p.status === "shipped" && p.trackingNo && (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-[#2f5a6b]/10 p-4 text-sm text-[#2f5a6b]">
                <Truck className="h-5 w-5" />
                <span>
                  <b>{p.cargoCompany}</b> · Takip no: <b className="font-mono">{p.trackingNo}</b>
                </span>
                {track && (
                  <a href={track} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 font-semibold underline">
                    Kargonu takip et <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
            {p.status === "cancelled" && p.cancelReason && <p className="mt-3 text-sm text-terra-600">Sebep: {p.cancelReason}</p>}

            <ul className="mt-5 divide-y divide-sand-300">
              {p.items.map((i) => (
                <li key={`${i.slug}-${i.label}`} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sand-300">
                    {i.image && <Image src={i.image} alt="" fill sizes="56px" className="object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <Link href={`/urun/${i.slug}`} className="block truncate font-semibold text-ink hover:text-olive-700">{i.name}</Link>
                    <span className="text-sm text-muted">{i.qty} × {i.label} · {formatPrice(i.price)}</span>
                  </span>
                  <span className="shrink-0 font-semibold">{formatPrice(i.price * i.qty)}</span>
                  {p.status === "delivered" && (
                    <div className="w-full">
                      {i.reviewed ? (
                        <span className="text-sm text-muted">✓ Bu ürünü değerlendirdin</span>
                      ) : (
                        <ReviewForm orderNo={order.orderNo} token={token} listingId={i.listing} defaultName={shortName} />
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-2 space-y-1 border-t border-sand-300 pt-3 text-sm">
              <div className="flex justify-between text-muted"><span>Kargo</span><span>{p.shipping === 0 ? "Ücretsiz" : formatPrice(p.shipping)}</span></div>
              <div className="flex justify-between font-semibold"><span>Bu paket</span><span>{formatPrice(p.total)}</span></div>
            </div>
            {p.sellerPhone && p.status !== "delivered" && p.status !== "cancelled" && (
              <a href={`tel:${p.sellerPhone}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-olive-700">
                <Phone className="h-4 w-4" /> Üreticiyi ara
              </a>
            )}
          </section>
        );
      })}

      {/* Özet */}
      <section className="grid gap-4 rounded-[2rem] bg-olive-900 p-5 text-cream-50 md:grid-cols-2 md:p-7">
        <div>
          <p className="flex items-center gap-2 text-sm text-cream-50/60"><MapPin className="h-4 w-4" /> Teslimat adresi</p>
          <p className="mt-1">{order.customer.name} · {order.customer.phone}</p>
          <p className="text-cream-50/80">{order.address.address}, {order.address.district} / {order.address.city}</p>
          {order.note && <p className="mt-2 text-sm text-cream-50/60">Not: {order.note}</p>}
        </div>
        <div className="space-y-1 text-sm md:text-right">
          <p className="text-cream-50/60">Ödeme: {order.payment === "havale" ? "Havale / EFT (üreticiye doğrudan)" : "Kapıda ödeme"}</p>
          <p className="text-cream-50/70">Ara toplam {formatPrice(order.subtotal)} · Kargo {order.shipping === 0 ? "ücretsiz" : formatPrice(order.shipping)}</p>
          <p className="font-display text-3xl">{formatPrice(order.total)}</p>
        </div>
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-olive-700 px-6 py-3 font-semibold text-cream-50">Alışverişe devam et</Link>
        <Link href="/siparis-takip" className="rounded-full border-2 border-olive-700 px-6 py-3 font-semibold text-olive-700">Başka sipariş sorgula</Link>
      </div>
    </div>
  );
}
