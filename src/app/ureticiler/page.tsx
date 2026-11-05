import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SellerProfile from "@/components/shop/SellerProfile";
import { getSellerBySlug } from "@/lib/catalog";
import { ensureCatalog } from "@/lib/data/catalog.server";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await ensureCatalog();
  const s = getSellerBySlug(slug);
  return s ? { title: s.name, description: s.tagline } : { title: "Üretici bulunamadı" };
}

export default async function SellerPage({ params }: Props) {
  const { slug } = await params;
  await ensureCatalog();
  if (!getSellerBySlug(slug)) notFound();
  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <SellerProfile slug={slug} />
    </main>
  );
}