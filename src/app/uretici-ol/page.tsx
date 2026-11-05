import type { Metadata } from "next";
import Link from "next/link";
import SellerCta from "@/components/home/SellerCta";
import SellerWizard from "@/components/seller/SellerWizard";

export const metadata: Metadata = {
  title: "Üretici Ol",
  description: "Buharkent'te üretiyorsan ürünlerini Buharkent Pazarı'nda sat.",
};

export default function BecomeSellerPage() {
  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <div className="mx-auto max-w-7xl space-y-14 md:space-y-20">
        <SellerCta />
        <section id="basvuru" className="scroll-mt-40">
          <div className="mx-auto max-w-2xl rounded-[2rem] bg-cream-50 p-6 shadow-soft md:p-10">
            <p className="mb-6 text-muted">
              Başvurmadan önce hangi belgelere ihtiyacın olduğunu görmek istersen{" "}
              <Link href="/satici-rehberi" className="font-semibold text-olive-700 underline">Satıcı Rehberi</Link>&apos;ne göz at.
            </p>
            <SellerWizard />
          </div>
        </section>
      </div>
    </main>
  );
}