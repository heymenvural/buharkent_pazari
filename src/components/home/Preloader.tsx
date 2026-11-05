"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import { introSeen, markIntroSeen } from "@/lib/intro";

const WORD = "Buharkent";
const ease = [0.76, 0, 0.24, 1] as const;

export default function Preloader() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const [skip, setSkip] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    if (introSeen()) {
      setSkip(true);
      setDone(true);
      return;
    }
    let n = 0;
    let id: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      id = setInterval(() => {
        n = Math.min(100, n + Math.ceil(Math.random() * 9) + 3);
        setCount(n);
        if (n === 100) {
          clearInterval(id);
          setTimeout(() => {
            markIntroSeen();
            setDone(true);
          }, 250);
        }
      }, 30);
    }, 350);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (skip) return;
    if (!done) window.scrollTo(0, 0);
    document.documentElement.style.overflow = done ? "" : "hidden";
    if (lenis) (done ? lenis.start() : lenis.stop());
  }, [done, lenis, skip]);

  if (skip) return null;

  return (
    <AnimatePresence>
      {!done && [
        <motion.div
          key="curtain"
          className="fixed inset-0 z-[99] bg-olive-700"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease, delay: 0.15 }}
        />,
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream-200"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease }}
        >
          <div className="overflow-hidden pb-2">
            <h1 className="flex text-6xl text-olive-900 md:text-9xl">
              {WORD.split("").map((ch, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.1 + i * 0.04, duration: 0.6, ease }}
                >
                  {ch}
                </motion.span>
              ))}
            </h1>
          </div>
          <motion.p
            className="mt-4 text-xs uppercase tracking-[0.45em] text-muted md:text-sm"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Doğal Lezzetler Pazarı
          </motion.p>
          <div className="absolute bottom-8 left-6 right-6 flex items-end justify-between md:left-12 md:right-12">
            <span className="text-xs uppercase tracking-[0.3em] text-muted">BUHARYEG</span>
            <span className="font-display text-5xl tabular-nums text-olive-700 md:text-7xl">{count}</span>
          </div>
          <div
            className="absolute bottom-0 left-0 h-1 bg-terra-500"
            style={{ width: `${count}%`, transition: "width 0.15s ease-out" }}
          />
        </motion.div>,
      ]}
    </AnimatePresence>
  );
}