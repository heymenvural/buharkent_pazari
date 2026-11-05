"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Nut } from "lucide-react";

const ease = [0.76, 0, 0.24, 1] as const;

export default function NotFoundView() {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center text-center">
      <div className="relative flex items-center font-display text-[7rem] leading-none text-olive-900 md:text-[10rem]">
        <motion.span initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease }}>
          4
        </motion.span>
        <motion.span
          className="mx-2 grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-fig-600 to-[#3f1f2c] md:h-32 md:w-32"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 180, damping: 12 }}
        >
          <motion.span animate={{ rotate: [-10, 10, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <Nut className="h-12 w-12 text-cream-50 md:h-16 md:w-16" strokeWidth={1.2} />
          </motion.span>
        </motion.span>
        <motion.span initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.8, ease }}>
          4
        </motion.span>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
        <h1 className="mt-6 text-3xl text-olive-900 md:text-4xl">Bu sayfa hasat edilmiş gibi görünüyor</h1>
        <p className="mt-3 text-muted">Aradığın sayfa taşınmış, kaldırılmış ya da hiç var olmamış olabilir.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="group inline-flex items-center justify-center gap-2 rounded-full bg-olive-700 px-7 py-4 font-semibold text-cream-50 transition-colors hover:bg-olive-900">
            Ana sayfaya dön <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/urunler" className="inline-flex items-center justify-center rounded-full border border-olive-700 px-7 py-4 font-semibold text-olive-700 transition-colors hover:bg-olive-700 hover:text-cream-50">
            Ürünlere göz at
          </Link>
        </div>
      </motion.div>
    </div>
  );
}