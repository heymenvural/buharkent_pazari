"use client";

import { motion } from "framer-motion";
import { HeartHandshake, MapPin, ShieldCheck, Truck } from "lucide-react";

const items = [
  { icon: MapPin, title: "Yerel üretici", text: "Tüm satıcılar Buharkent'ten ve dernek onaylı" },
  { icon: ShieldCheck, title: "Güvenli alışveriş", text: "Bilgileriniz şifrelenerek korunur" },
  { icon: Truck, title: "Kargo takibi", text: "Siparişinizi adım adım izleyin" },
  { icon: HeartHandshake, title: "Destek", text: "Sorun olursa birlikte çözeriz" },
];

export default function TrustBar() {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <motion.div
            key={it.title}
            className="flex flex-col gap-3 rounded-3xl border border-sand-300 p-5 sm:flex-row sm:items-start sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.6 }}
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-olive-700/10 text-olive-700">
              <Icon className="h-6 w-6" />
            </span>
            <span>
              <span className="block font-semibold text-ink">{it.title}</span>
              <span className="mt-0.5 block text-xs text-muted">{it.text}</span>
            </span>
          </motion.div>
        );
      })}
    </section>
  );
}