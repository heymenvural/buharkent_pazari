"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowUpRight, Heart, LogOut, MapPin, Package, ShieldCheck, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Role } from "@/models/User";

const ease = [0.76, 0, 0.24, 1] as const;
const roleLabel: Record<Role, string> = { buyer: "Müşteri", seller: "Üretici", admin: "Yönetici" };

type Card = { icon: LucideIcon; title: string; text: string; href?: string };

export default function AccountView({ name, email, role }: { name: string; email: string; role: Role }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]?.toLocaleUpperCase("tr")).join("");

  const cards: Card[] = [
    { icon: Package, title: "Siparişlerim", text: "Siparişlerini ve kargo durumlarını takip et.", href: "/hesabim/siparisler" },
    { icon: MapPin, title: "Adreslerim", text: "Teslimat adreslerini kaydet, hızlı öde." },
    { icon: Heart, title: "Favorilerim", text: "Beğendiğin ürün ve üreticiler." },
    ...(role !== "buyer" ? [{ icon: Store, title: "Üretici paneli", text: "Ürünlerini ve mağazanı yönet.", href: "/panel" }] : []),
    ...(role === "admin" ? [{ icon: ShieldCheck, title: "Yönetim paneli", text: "Başvurular, ürün onayı, siparişler ve bildirimler.", href: "/yonetim/basvurular" }] : []),
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div
        className="flex flex-col gap-6 rounded-[2rem] bg-olive-900 p-7 text-cream-50 md:flex-row md:items-center md:justify-between md:p-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
      >
        <div className="flex items-center gap-5">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-terra-500 font-display text-3xl">{initials}</span>
          <div>
            <p className="text-sm text-cream-50/60">Hoş geldin</p>
            <h1 className="text-3xl md:text-4xl">{name}</h1>
            <p className="mt-1 text-sm text-cream-50/70">
              {email} · <span className="font-semibold text-sand-300">{roleLabel[role]}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ redirectTo: "/" })}
          className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-cream-50/30 px-5 py-3 text-sm font-semibold transition-colors hover:bg-cream-50/10 md:self-auto"
        >
          <LogOut className="h-4 w-4" /> Çıkış yap
        </button>
      </motion.div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => {
          const Icon = c.icon;
          const inner = (
            <>
              <span className={`absolute right-5 top-5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${c.href ? "bg-olive-700 text-cream-50" : "bg-sand-300 text-olive-900"}`}>
                {c.href ? <ArrowUpRight className="h-3.5 w-3.5" /> : "Yakında"}
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-olive-700/10 text-olive-700">
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-2xl text-olive-900">{c.title}</h2>
              <p className="mt-1 text-sm text-muted">{c.text}</p>
            </>
          );
          return (
            <motion.div key={c.title} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07, duration: 0.6, ease }}>
              {c.href ? (
                <Link href={c.href} className="relative block h-full rounded-[1.75rem] bg-cream-50 p-6 shadow-soft transition-transform hover:-translate-y-1">
                  {inner}
                </Link>
              ) : (
                <div className="relative h-full rounded-[1.75rem] bg-cream-50 p-6 shadow-soft">{inner}</div>
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        <Link href="/urunler" className="font-semibold text-olive-700 hover:underline">Alışverişe devam et</Link>
      </p>
    </div>
  );
}