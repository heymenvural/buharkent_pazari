"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Footprints, LayoutGrid, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useLenis } from "lenis/react";
import { useCart, selectCount } from "@/store/cart";
import { useUI } from "@/store/ui";
import { categories } from "@/lib/catalog";

const ANNOUNCEMENT = "Komisyon yok · Ödemeni doğrudan üreticiye yaparsın";

const extraLinks = [
  { href: "/urunler", label: "Tüm ürünler" },
  { href: "/canli-pazar", label: "Canlı Pazar" },
  { href: "/ureticiler", label: "Üreticiler" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/uretici-ol", label: "Üretici Ol" },
  { href: "/siparis-takip", label: "Sipariş Takibi" },
  { href: "/sss", label: "Sıkça Sorulanlar" },
];

function SearchBox({ className = "", onDone }: { className?: string; onDone?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      className={`relative ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        const v = q.trim().slice(0, 60);
        if (!v) return;
        router.push(`/urunler?q=${encodeURIComponent(v)}`);
        onDone?.();
      }}
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        maxLength={60}
        aria-label="Ürün ara"
        placeholder="İncir, zeytinyağı, bal ara..."
        className="w-full rounded-full border border-sand-300 bg-cream-100 py-2.5 pl-11 pr-4 text-sm outline-none transition-colors focus:border-olive-500 focus:bg-cream-50"
      />
    </form>
  );
}

const iconBtn =
  "relative grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-sand-300/60 [&_svg]:h-5 [&_svg]:w-5";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const lenis = useLenis();
  const count = useCart(selectCount);
  const openCart = useUI((s) => s.openCart);

  const user = session?.user;
  const userInitials = user?.name
    ?.split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toLocaleUpperCase("tr"))
    .join("");

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setCatOpen(false);
    lenis?.start();
  }, [pathname, lenis]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) lenis?.stop();
    else lenis?.start();
  };

  const close = () => {
    setOpen(false);
    lenis?.start();
  };

  // Canlı Pazar tam ekran çalışır, kendi menüsü var
  if (pathname === "/canli-pazar") return null;

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50">
        <header className={`border-b border-sand-300 bg-cream-50 transition-shadow ${scrolled ? "shadow-soft" : ""}`}>
          <p className="truncate bg-olive-900 px-4 py-1.5 text-center text-[13px] font-medium text-cream-50">{ANNOUNCEMENT}</p>

          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:h-[72px] md:gap-5 md:px-8">
            <Link href="/" onClick={close} className="flex shrink-0 items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-olive-700 font-display text-lg text-cream-50">B</span>
              <span className="font-display text-xl text-olive-900">Buharkent Pazarı</span>
            </Link>

            <div className="relative hidden lg:block" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
              <button className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-olive-900 transition-colors hover:bg-sand-300/60">
                <LayoutGrid className="h-4 w-4" />
                Kategoriler
                <ChevronDown className={`h-4 w-4 transition-transform ${catOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {catOpen && (
                  <motion.div
                    className="absolute left-0 top-full pt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="grid w-[480px] grid-cols-2 gap-1 rounded-2xl border border-sand-300 bg-cream-50 p-2 shadow-soft">
                      {categories.map((c) => {
                        const Icon = c.icon;
                        return (
                          <Link key={c.slug} href={`/kategori/${c.slug}`} className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-cream-200">
                            <span className="grid h-9 w-9 place-items-center rounded-full bg-cream-200 text-olive-700">
                              <Icon className="h-5 w-5" />
                            </span>
                            <span className="text-[15px] font-semibold text-ink">{c.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/canli-pazar"
              className="hidden shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-olive-900 transition-colors hover:bg-sand-300/60 lg:flex"
            >
              <Footprints className="h-4 w-4" />
              Canlı Pazar
            </Link>

            <SearchBox className="hidden max-w-xl flex-1 md:block" />

            <div className="ml-auto flex items-center gap-0.5 md:gap-2">
              <Link href={user ? "/hesabim" : "/giris"} aria-label={user ? "Hesabım" : "Giriş yap"} className={`${iconBtn} hidden sm:grid`}>
                {mounted && status === "authenticated" && userInitials ? (
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-olive-700 text-xs font-bold text-cream-50">{userInitials}</span>
                ) : (
                  <User />
                )}
              </Link>
              <button id="cart-icon" aria-label="Sepet" onClick={openCart} className={iconBtn}>
                <ShoppingBag />
                <AnimatePresence>
                  {mounted && count > 0 && (
                    <motion.span
                      key={count}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 18 }}
                      className="absolute right-0 top-0 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-terra-500 px-1 text-[10px] font-bold text-cream-50"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <button aria-label="Menü" onClick={toggle} className={`${iconBtn} lg:hidden`}>
                {open ? <X /> : <Menu />}
              </button>
            </div>
          </div>

          <div className="px-4 pb-3 md:hidden">
            <SearchBox onDone={close} />
          </div>
        </header>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            data-lenis-prevent
            className="fixed inset-0 z-40 overflow-y-auto bg-cream-100 px-4 pb-10 pt-[150px] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm font-semibold text-muted">Kategoriler</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {categories.map((c) => {
                const Icon = c.icon;
                return (
                  <Link key={c.slug} href={`/kategori/${c.slug}`} onClick={close} className="flex items-center gap-3 rounded-2xl border border-sand-300 bg-cream-50 p-3">
                    <Icon className="h-5 w-5 shrink-0 text-olive-700" />
                    <span className="text-[15px] font-semibold text-ink">{c.short}</span>
                  </Link>
                );
              })}
            </div>

            <ul className="mt-6 divide-y divide-sand-300 rounded-2xl border border-sand-300 bg-cream-50">
              {extraLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={close} className="block px-4 py-3.5 text-[17px] font-semibold text-olive-900">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-3">
              {user ? (
                <>
                  <Link href="/hesabim" onClick={close} className="w-full rounded-full bg-olive-700 py-4 text-center font-semibold text-cream-50">
                    Hesabım
                  </Link>
                  <button
                    onClick={() => {
                      close();
                      signOut({ redirectTo: "/" });
                    }}
                    className="w-full rounded-full border border-olive-700 py-4 font-semibold text-olive-700"
                  >
                    Çıkış yap
                  </button>
                </>
              ) : (
                <>
                  <Link href="/giris" onClick={close} className="w-full rounded-full bg-olive-700 py-4 text-center font-semibold text-cream-50">
                    Giriş Yap
                  </Link>
                  <Link href="/kayit" onClick={close} className="w-full rounded-full border border-olive-700 py-4 text-center font-semibold text-olive-700">
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}