import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductListing from "@/components/shop/ProductListing";
import { categories, getCategory } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = getCategory(slug);
  return { title: c ? c.name : "Kategori bulunamadı" };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  if (!getCategory(slug)) notFound();
  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <ProductListing key={slug} category={slug} />
    </main>
  );
}