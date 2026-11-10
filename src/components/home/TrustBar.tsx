import { BadgeCheck, HandCoins, Truck } from "lucide-react";

const items = [
  { icon: HandCoins, title: "Komisyon yok", text: "Ödemeni doğrudan üreticinin hesabına yaparsın." },
  { icon: BadgeCheck, title: "Dernek onaylı üreticiler", text: "Her üreticinin belgeleri tek tek kontrol edilir." },
  { icon: Truck, title: "Siparişini takip et", text: "Kargo bilgisi ve sipariş durumu tek sayfada." },
];

export default function TrustBar() {
  return (
    <section className="grid gap-3 md:grid-cols-3">
      {items.map(({ icon: Icon, title, text }) => (
        <div key={title} className="flex items-start gap-4 rounded-2xl bg-cream-200 p-5">
          <Icon className="mt-0.5 h-6 w-6 shrink-0 text-olive-700" />
          <span>
            <span className="block font-semibold text-ink">{title}</span>
            <span className="mt-0.5 block text-[15px] text-muted">{text}</span>
          </span>
        </div>
      ))}
    </section>
  );
}
