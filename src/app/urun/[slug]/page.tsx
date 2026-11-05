import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/shop/ProductDetail";
import { getProduct, getSellerBySlug } from "@/lib/catalog";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ uretici?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return { title: "Ürün bulunamadı" };
  return { title: p.name, description: p.description };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  if (!getProduct(slug)) notFound();

  const raw = Array.isArray(sp.uretici) ? sp.uretici[0] : sp.uretici;
  const seller = raw && /^[a-z0-9-]{1,60}$/.test(raw) && getSellerBySlug(raw) ? raw : undefined;

  return (
    <main className="px-4 pb-32 pt-[164px] md:px-8 md:pt-[150px] lg:pb-24">
      <ProductDetail key={slug} slug={slug} initialSeller={seller} />
    </main>
  );
}