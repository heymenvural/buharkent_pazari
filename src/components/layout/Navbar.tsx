"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ChevronDown, Footprints, LayoutGrid, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useLenis } from "lenis/react";
import { useCart, selectCount } from "@/store/cart";
import { useUI } from "@/store/ui";
import { categories } from "@/lib/catalog";
import { introDelay } from "@/lib/intro";

const ease = [0.76, 0, 0.24, 1] as const;

const messages = [
  "Buharkent'in kadın girişimcileri ve genç çiftçilerinden doğrudan sofranıza",
  "Lezzet kutularında ücretsiz kargo",
  "Yeni hasat zeytinyağında %10'a varan indirim",
];

const extraLinks = [
  { href: "/canli-pazar", label: "Canlı Pazar (3D)" },
  { href: "/ureticiler", label: "Üreticiler" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/uretici-ol", label: "Üretici Ol" },
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
  const [delay] = useState(() => (pathname === "/" ? introDelay(1.4) : 0));
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [msg, setMsg] = useState(0);
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
    const show = () => setHidden(false);
    window.addEventListener("cart:fly", show);
    const id = setInterval(() => setMsg((m) => (m + 1) % messages.length), 4500);
    return () => {
      window.removeEventListener("cart:fly", show);
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
    setCatOpen(false);
    lenis?.start();
  }, [pathname, lenis]);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 20);
    setHidden(y > prev && y > 160 && !open);
  });

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
      <motion.div
        className="fixed inset-x-0 top-0 z-50"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.7, ease }}
      >
        <motion.header
          animate={{ y: hidden ? "-100%" : "0%" }}
          transition={{ duration: 0.45, ease }}
          className={`border-b border-sand-300/70 bg-cream-50/90 backdrop-blur-md transition-shadow ${scrolled ? "shadow-soft" : ""}`}
        >
          <div className="relative h-8 overflow-hidden bg-olive-900 text-cream-50">
            <AnimatePresence mode="wait">
              <motion.p
                key={msg}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-100%" }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 grid place-items-center truncate px-4 text-center text-[11px] font-medium tracking-wide md:text-xs"
              >
                {messages[msg]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:h-20 md:gap-6 md:px-8">
            <Link href="/" onClick={close} className="flex shrink-0 items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-olive-700 font-display text-lg text-cream-50">B</span>
              <span className="font-display text-xl text-olive-900">
                Buharkent<span className="text-terra-500">.</span>
              </span>
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
                    className="absolute left-0 top-full pt-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="grid w-[520px] grid-cols-2 gap-1 rounded-3xl border border-sand-300 bg-cream-50 p-3 shadow-2xl">
                      {categories.map((c) => {
                        const Icon = c.icon;
                        return (
                          <Link key={c.slug} href={`/kategori/${c.slug}`} className="group flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-cream-200">
                            <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${c.bg}`}>
                              <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${c.slug === "sut-yumurta" ? "text-olive-900" : "text-cream-50"}`} />
                            </span>
                            <span className="text-sm font-semibold text-ink">{c.name}</span>
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
              className="hidden shrink-0 items-center gap-2 rounded-full bg-terra-500/10 px-4 py-2.5 text-sm font-semibold text-terra-600 transition-colors hover:bg-terra-500/20 lg:flex"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terra-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-terra-500" />
              </span>
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
        </motion.header>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            data-lenis-prevent
            className="fixed inset-0 z-40 overflow-y-auto bg-cream-100 px-4 pb-10 pt-40 lg:hidden"
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.7, ease }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">Kategoriler</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {categories.map((c, i) => {
                const Icon = c.icon;
                return (
                  <motion.div key={c.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.04 }}>
                    <Link href={`/kategori/${c.slug}`} onClick={close} className="flex items-center gap-3 rounded-2xl bg-cream-50 p-3">
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${c.bg}`}>
                        <Icon className={`h-5 w-5 ${c.slug === "sut-yumurta" ? "text-olive-900" : "text-cream-50"}`} />
                      </span>
                      <span className="text-sm font-semibold text-ink">{c.short}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <ul className="mt-8 space-y-1">
              {extraLinks.map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.05 }}>
                  <Link href={l.href} onClick={close} className="block py-2 font-display text-3xl text-olive-900">
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>

            <motion.div className="mt-8 flex flex-col gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}