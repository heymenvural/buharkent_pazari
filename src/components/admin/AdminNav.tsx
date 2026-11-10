import Link from "next/link";
import { ClipboardCheck, Flag, Package, Receipt } from "lucide-react";

const links = [
  { href: "/yonetim/basvurular", label: "Başvurular", icon: ClipboardCheck },
  { href: "/yonetim/urunler", label: "Ürün onayı", icon: Package },
  { href: "/yonetim/siparisler", label: "Siparişler", icon: Receipt },
  { href: "/yonetim/bildirimler", label: "Bildirimler", icon: Flag },
];

export default function AdminNav({ active, counts }: { active: string; counts?: Record<string, number> }) {
  return (
    <nav className="mx-auto mb-8 flex max-w-6xl flex-wrap gap-2">
      {links.map(({ href, label, icon: Icon }) => {
        const on = active === href;
        const n = counts?.[href];
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
              on ? "bg-olive-900 text-cream-50" : "bg-cream-50 text-olive-900 shadow-soft hover:bg-cream-200"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
            {!!n && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-terra-500 px-1.5 text-xs text-cream-50">{n}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
