import type { Metadata } from "next";
import SellerGuide from "@/components/pages/SellerGuide";

export const metadata: Metadata = {
  title: "Satıcı Rehberi",
  description: "Buharkent Pazarı'nda satış yapmak için gerekli belgeler ve adımlar.",
};

export default function SellerGuidePage() {
  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <SellerGuide />
    </main>
  );
}