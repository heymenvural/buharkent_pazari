"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

/** Beklenmeyen bir hata olursa boş beyaz sayfa yerine bu gösterilir */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <div className="mx-auto flex max-w-lg flex-col items-center rounded-3xl border border-sand-300 bg-cream-50 px-6 py-14 text-center">
        <h1 className="text-3xl text-olive-900">Bir şeyler ters gitti</h1>
        <p className="mt-3 text-muted">
          Sayfa yüklenirken beklenmeyen bir sorun oldu. Sepetin ve siparişlerin güvende; tekrar denemen genelde yeterli.
        </p>
        {error.digest && <p className="mt-2 text-xs text-muted">Hata kodu: {error.digest}</p>}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-full bg-olive-700 px-6 py-3 font-semibold text-cream-50 hover:bg-olive-900">
            <RotateCcw className="h-4 w-4" /> Tekrar dene
          </button>
          <Link href="/" className="rounded-full border border-olive-700 px-6 py-3 font-semibold text-olive-700">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    </main>
  );
}
