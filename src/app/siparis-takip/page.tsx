import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import LookupForm from "@/components/orders/LookupForm";

export const metadata: Metadata = { title: "Sipariş takibi", description: "Sipariş numaran ve e-postanla siparişinin durumunu öğren." };

export default async function OrderLookupPage() {
  const session = await auth();
  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <div className="mx-auto max-w-md">
        <h1 className="text-4xl text-olive-900 md:text-5xl">Sipariş takibi</h1>
        <p className="mt-3 text-muted">Sipariş numaran, sipariş onay e-postasında yazıyor.</p>
        <div className="mt-8 rounded-[2rem] bg-cream-50 p-6 shadow-soft">
          <LookupForm />
        </div>
        {session?.user ? (
          <Link href="/hesabim/siparisler" className="mt-6 block text-center font-semibold text-olive-700 underline">Tüm siparişlerimi gör</Link>
        ) : (
          <p className="mt-6 text-center text-sm text-muted">
            Üyeysen <Link href="/giris?next=/hesabim/siparisler" className="font-semibold text-olive-700 underline">giriş yaparak</Link> tüm siparişlerini görebilirsin.
          </p>
        )}
      </div>
    </main>
  );
}
