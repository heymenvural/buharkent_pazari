"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Footprints, Hand, List, Loader2, MousePointerClick, ShoppingBag, Store, X,
} from "lucide-react";
import { catalog, offers, sellers } from "@/lib/catalog";
import { useCart, selectCount } from "@/store/cart";
import { useUI } from "@/store/ui";
import { buildStalls } from "./layout";
import { START_Z, useMarket } from "./store";
import StallSheet from "./StallSheet";

const Scene = dynamic(() => import("./Scene"), { ssr: false });
const ease = [0.76, 0, 0.24, 1] as const;

// Cihaz özellikleri sadece tarayıcıda bir kez ölçülür
let device: { webgl: boolean; low: boolean } | null = null;
function getDevice() {
  if (!device) {
    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {}
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    device = { webgl, low: coarse || (navigator.hardwareConcurrency ?? 8) <= 4 };
  }
  return device;
}
const noop = () => () => {};

/** Basılı tutuldukça çalışan yön butonu */
function HoldButton({ k, label, children }: { k: "forward" | "back" | "left" | "right"; label: string; children: React.ReactNode }) {
  const setKey = useMarket((s) => s.setKey);
  return (
    <button
      aria-label={label}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setKey(k, true);
      }}
      onPointerUp={() => setKey(k, false)}
      onPointerCancel={() => setKey(k, false)}
      onContextMenu={(e) => e.preventDefault()}
      className="grid h-12 w-12 touch-none select-none place-items-center rounded-2xl bg-cream-50/90 text-olive-900 shadow-md backdrop-blur active:scale-95 active:bg-sand-300"
    >
      {children}
    </button>
  );
}

export default function LiveMarket() {
  const dev = useSyncExternalStore(noop, getDevice, () => null);
  const support = !dev ? "checking" : dev.webgl ? "ok" : "no";
  const low = !!dev?.low;
  const [fontsReady, setFontsReady] = useState(false);
  const [ready, setReady] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [hint, setHint] = useState(false);
  const area = useRef<HTMLDivElement>(null);

  const started = useMarket((s) => s.started);
  const nearKey = useMarket((s) => s.near);
  const selectedKey = useMarket((s) => s.selected);
  const start = useMarket((s) => s.start);
  const count = useCart(selectCount);
  const openCart = useUI((s) => s.openCart);

  const stalls = useMemo(() => buildStalls(sellers, offers, catalog), []);
  const near = stalls.find((s) => s.key === nearKey) ?? null;
  const selected = stalls.find((s) => s.key === selectedKey) ?? null;

  useEffect(() => {
    // Sayfa her açıldığında pazarın girişinden başla
    useMarket.setState({ started: false, selected: null, near: null, hovered: null, targetYaw: 0, targetZ: START_Z });
    // Tabela yazıları doğru yazı tipiyle çizilsin
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]).then(() => setFontsReady(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      document.body.style.cursor = "";
    };
  }, []);

  // Fare tekerleği, sürükleme ve klavye
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    const st = () => useMarket.getState();

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const d = e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY;
      st().walk(-Math.max(-2, Math.min(2, d * 0.011)));
    };

    let last: { x: number; y: number } | null = null;
    let pid: number | null = null;
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-hud]")) return;
      last = { x: e.clientX, y: e.clientY };
      pid = e.pointerId;
      st().set({ dragDistance: 0 });
    };
    const onMove = (e: PointerEvent) => {
      if (!last || e.pointerId !== pid) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      st().set({ dragDistance: st().dragDistance + Math.abs(dx) + Math.abs(dy) });
      st().look(dx * 0.0045);
      st().walk(dy * 0.028);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId === pid) last = null;
    };

    const map: Record<string, "forward" | "back" | "left" | "right"> = {
      ArrowUp: "forward", KeyW: "forward", ArrowDown: "back", KeyS: "back", ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
    };
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.("input, textarea, select")) return;
      if (e.code === "Escape" && down) {
        st().set({ selected: null });
        setListOpen(false);
        return;
      }
      if (e.code === "Enter" && down && st().near && !st().selected && st().started) {
        st().set({ selected: st().near });
        return;
      }
      const k = map[e.code];
      if (!k) return;
      e.preventDefault();
      st().setKey(k, down);
    };
    const kd = onKey(true);
    const ku = onKey(false);
    const blur = () => (["forward", "back", "left", "right"] as const).forEach((k) => st().setKey(k, false));

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    window.addEventListener("blur", blur);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("blur", blur);
    };
  }, [support]);

  const enter = () => {
    start();
    setHint(true);
    setTimeout(() => setHint(false), 6000);
  };

  const goToStall = (key: string) => {
    const s = stalls.find((x) => x.key === key);
    if (!s) return;
    setListOpen(false);
    useMarket.getState().goTo(s.z + 1.2, s.side === -1 ? 1.15 : -1.15);
  };

  if (support === "no") {
    return (
      <main className="grid min-h-dvh place-items-center bg-cream-100 px-6 text-center">
        <div className="max-w-md">
          <Store className="mx-auto h-12 w-12 text-olive-700" />
          <h1 className="mt-4 text-3xl text-olive-900">Canlı Pazar bu cihazda açılamıyor</h1>
          <p className="mt-3 text-muted">Tarayıcın 3D görüntülemeyi desteklemiyor. Ürünlere normal görünümden ulaşabilirsin.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/urunler" className="rounded-full bg-olive-700 px-6 py-3 font-semibold text-cream-50">Ürünlere git</Link>
            <Link href="/" className="rounded-full border-2 border-olive-700 px-6 py-3 font-semibold text-olive-700">Ana sayfa</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main ref={area} data-lenis-prevent className="fixed inset-0 touch-none select-none overflow-hidden bg-[#efdcbc]">
      {support === "ok" && fontsReady && <Scene stalls={stalls} low={low} onReady={() => setReady(true)} />}

      {/* Üst çubuk */}
      <div data-hud className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3 md:p-5">
        <Link href="/" className="pointer-events-auto flex items-center gap-2 rounded-full bg-cream-50/90 px-4 py-2.5 text-sm font-semibold text-olive-900 shadow-md backdrop-blur">
          <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Siteye dön</span>
        </Link>
        <div className="pointer-events-auto hidden items-center gap-2 rounded-full bg-olive-900/85 px-4 py-2.5 text-sm font-semibold text-cream-50 shadow-md backdrop-blur sm:flex">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terra-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-terra-500" />
          </span>
          Canlı Pazar
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button onClick={() => setListOpen((o) => !o)} className="flex items-center gap-2 rounded-full bg-cream-50/90 px-4 py-2.5 text-sm font-semibold text-olive-900 shadow-md backdrop-blur">
            <List className="h-4 w-4" /> <span className="hidden sm:inline">Tezgâhlar</span>
          </button>
          <button id="cart-icon" onClick={openCart} aria-label="Sepet" className="relative grid h-10 w-10 place-items-center rounded-full bg-cream-50/90 text-olive-900 shadow-md backdrop-blur">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-terra-500 px-1 text-[11px] font-bold text-cream-50">{count}</span>}
          </button>
        </div>
      </div>

      {/* Tezgâh listesi */}
      <AnimatePresence>
        {listOpen && (
          <motion.div
            data-hud
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-3 top-16 z-30 max-h-[70dvh] w-[min(92vw,340px)] overflow-y-auto rounded-3xl bg-cream-50 p-2 shadow-2xl md:right-5 md:top-20"
          >
            <div className="flex items-center justify-between px-3 py-2">
              <p className="font-semibold text-olive-900">Tezgâhlar</p>
              <button onClick={() => setListOpen(false)} aria-label="Kapat" className="grid h-8 w-8 place-items-center rounded-full hover:bg-cream-200"><X className="h-4 w-4" /></button>
            </div>
            {stalls.filter((s) => s.seller).map((s) => (
              <button key={s.key} onClick={() => goToStall(s.key)} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-cream-200">
                <span className="h-9 w-9 shrink-0 rounded-xl" style={{ background: `repeating-linear-gradient(90deg, ${s.colors[0]} 0 6px, ${s.colors[1]} 6px 12px)` }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink">{s.seller!.name}</span>
                  <span className="block truncate text-xs text-muted">{s.items.map((x) => x.product.name).join(", ") || "Tezgâh kuruluyor"}</span>
                </span>
                <span className="text-xs font-semibold text-muted">{s.side === -1 ? "solda" : "sağda"}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Yakındaki tezgâh */}
      <AnimatePresence mode="wait">
        {started && near && !selected && (
          <motion.div
            data-hud
            key={near.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-[8.5rem] left-1/2 z-20 w-[min(92vw,420px)] -translate-x-1/2 lg:bottom-8"
          >
            <button
              onClick={() => useMarket.getState().set({ selected: near.key })}
              className="flex w-full items-center gap-3 rounded-full bg-cream-50/95 p-2 pr-5 text-left shadow-xl backdrop-blur"
            >
              <span className="h-11 w-11 shrink-0 rounded-full" style={{ background: `repeating-linear-gradient(90deg, ${near.colors[0]} 0 7px, ${near.colors[1]} 7px 14px)` }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-ink">{near.seller?.name ?? "Boş tezgâh"}</span>
                <span className="block truncate text-xs text-muted">{near.seller ? `${near.items.length} ürün · tezgâha bak` : "Üretici olarak başvur"}</span>
              </span>
              <span className="rounded-full bg-olive-700 px-4 py-2 text-sm font-semibold text-cream-50">Bak</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Yön butonları */}
      {started && !selected && (
        <div data-hud className="absolute bottom-4 right-3 z-20 grid grid-cols-3 gap-1.5 md:bottom-6 md:right-6">
          <span />
          <HoldButton k="forward" label="İleri yürü"><ChevronUp className="h-6 w-6" /></HoldButton>
          <span />
          <HoldButton k="left" label="Sola bak"><ChevronLeft className="h-6 w-6" /></HoldButton>
          <HoldButton k="back" label="Geri yürü"><ChevronDown className="h-6 w-6" /></HoldButton>
          <HoldButton k="right" label="Sağa bak"><ChevronRight className="h-6 w-6" /></HoldButton>
        </div>
      )}

      {/* İpucu */}
      <AnimatePresence>
        {hint && !selected && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute left-1/2 top-20 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/70 px-4 py-2 text-sm text-cream-50 backdrop-blur"
          >
            {low ? "Yukarı kaydırarak yürü, yana kaydırarak bak" : "Tekerlekle veya ↑ ↓ ile yürü, sürükleyerek bak"}
          </motion.p>
        )}
      </AnimatePresence>

      <div data-hud>
        <StallSheet stall={selected} onClose={() => useMarket.getState().set({ selected: null })} />
      </div>

      {/* Giriş ekranı */}
      <AnimatePresence>
        {!started && (
          <motion.div
            data-hud
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-40 grid place-items-center bg-gradient-to-b from-ink/30 via-ink/10 to-ink/50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease }}
              className="w-full max-w-md rounded-[2rem] bg-cream-50/95 p-6 text-center shadow-2xl backdrop-blur md:p-8"
            >
              <span className="mx-auto flex w-fit items-center gap-2 rounded-full bg-terra-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-terra-600">
                <span className="h-2 w-2 rounded-full bg-terra-500" /> Canlı Pazar
              </span>
              <h1 className="mt-4 text-3xl leading-tight text-olive-900 md:text-4xl">Pazarı gez, tezgâhtan al</h1>
              <p className="mt-3 text-ink/75">Buharkent&apos;in üreticileri tezgâhlarını kurdu. Sokakta yürü, beğendiğin tezgâha yaklaş, ürünlere bak ve sepetine ekle.</p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-xs text-muted">
                <span className="flex flex-col items-center gap-1.5 rounded-2xl bg-cream-200 p-3"><Footprints className="h-5 w-5 text-olive-700" />{low ? "Yukarı kaydır" : "Tekerlek / ↑"}<br />yürü</span>
                <span className="flex flex-col items-center gap-1.5 rounded-2xl bg-cream-200 p-3"><Hand className="h-5 w-5 text-olive-700" />Yana sürükle<br />etrafına bak</span>
                <span className="flex flex-col items-center gap-1.5 rounded-2xl bg-cream-200 p-3"><MousePointerClick className="h-5 w-5 text-olive-700" />Tezgâha dokun<br />ürünlere bak</span>
              </div>
              <button
                onClick={enter}
                disabled={!ready}
                className="mt-6 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-olive-700 text-lg font-semibold text-cream-50 transition-colors hover:bg-olive-900 disabled:opacity-70"
              >
                {ready ? <>Pazara gir <Footprints className="h-5 w-5" /></> : <><Loader2 className="h-5 w-5 animate-spin" /> Tezgâhlar kuruluyor...</>}
              </button>
              <Link href="/urunler" className="mt-3 block text-sm font-semibold text-olive-700 underline">Klasik görünümle alışveriş yap</Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
