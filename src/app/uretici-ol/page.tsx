import type { Metadata } from "next";
import SellerCta from "@/components/home/SellerCta";
import SellerApplicationForm from "@/components/pages/SellerApplicationForm";

export const metadata: Metadata = {
  title: "Üretici Ol",
  description: "Buharkent'te üretiyorsan ürünlerini Buharkent Pazarı'nda sat.",
};

export default function BecomeSellerPage() {
  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <div className="mx-auto max-w-7xl space-y-14 md:space-y-20">
        <SellerCta />
        <SellerApplicationForm />
      </div>
    </main>
  );
}