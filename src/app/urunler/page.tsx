import type { Metadata } from "next";
import ProductListing from "@/components/shop/ProductListing";

export const metadata: Metadata = { title: "Ürünler" };

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const q = (raw ?? "").trim().slice(0, 60);
  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <ProductListing key={q} query={q || undefined} />
    </main>
  );
}