import type { Metadata } from "next";
import SellerDirectory from "@/components/pages/SellerDirectory";

export const metadata: Metadata = {
  title: "Üreticiler",
  description: "Buharkent Pazarı'nda satış yapan, dernek onaylı kadın girişimciler ve genç çiftçiler.",
};

export default function SellersPage() {
  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <SellerDirectory />
    </main>
  );
}
