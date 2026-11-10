"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUp, Mail, MapPin, Phone } from "lucide-react";
import { useLenis } from "lenis/react";
import { ORG, isPlaceholder, legalLinks } from "@/lib/legal";

const cols = [
  {
    title: "Alışveriş",
    links: [
      { label: "Tüm Ürünler", href: "/urunler" },
      { label: "Canlı Pazar", href: "/canli-pazar" },
      { label: "Sipariş Takibi", href: "/siparis-takip" },
      { label: "İncir & Kuru Ürünler", href: "/kategori/incir-kuru-urunler" },
      { label: "Zeytinyağı", href: "/kategori/zeytin-zeytinyagi" },
      { label: "Bal & Pekmez", href: "/kategori/bal-recel-pekmez" },
      { label: "Hediye Kutuları", href: "/kategori/hediye-kutulari" },
    ],
  },
  {
    title: "Kurumsal",
    links: [
      { label: "Hakkımızda", href: "/hakkimizda" },
      { label: "Üreticilerimiz", href: "/ureticiler" },
      { label: "Üretici Ol", href: "/uretici-ol" },
      { label: "Sıkça Sorulanlar", href: "/sss" },
    ],
  },
  { title: "Yasal", links: legalLinks },
];

export default function Footer() {
  const lenis = useLenis();
  const pathname = usePathname();
  if (pathname === "/canli-pazar") return null;

  return (
    <footer id="iletisim" className="bg-olive-900 text-cream-50">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-12 md:px-8 md:pt-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {cols.map((c) => (
            <div key={c.title}>
              <h3 className="font-sans text-sm font-semibold text-cream-50/60">{c.title}</h3>
              <ul className="mt-3 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-[15px] text-cream-50/85 hover:text-cream-50 hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 md:col-span-1">
            <h3 className="font-sans text-sm font-semibold text-cream-50/60">İletişim</h3>
            <ul className="mt-3 space-y-2.5 text-[15px] text-cream-50/85">
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {isPlaceholder(ORG.address) ? "Buharkent, Aydın" : ORG.address}</li>
              {!isPlaceholder(ORG.email) && (
                <li><a href={`mailto:${ORG.email}`} className="flex items-center gap-2 hover:underline"><Mail className="h-4 w-4 shrink-0" /> {ORG.email}</a></li>
              )}
              {!isPlaceholder(ORG.phone) && (
                <li><a href={`tel:${ORG.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 hover:underline"><Phone className="h-4 w-4 shrink-0" /> {ORG.phone}</a></li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-cream-50/15 pt-6 text-sm text-cream-50/60 md:flex-row md:items-center">
          <div>
            <p>© {new Date().getFullYear()} Buharkent Pazarı · Buharkent Yerel Eylem Grubu Derneği girişimidir.</p>
            <p className="mt-1">Tüm hakları Harun Eymen Vural&apos;da saklıdır.</p>
          </div>
          <button
            onClick={() => (lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0))}
            className="inline-flex items-center gap-2 rounded-full border border-cream-50/25 px-4 py-2 text-cream-50/85 hover:border-cream-50"
          >
            Başa dön <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}