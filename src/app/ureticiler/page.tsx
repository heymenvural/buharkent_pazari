import type { Metadata } from "next";
import SellerDirectory from "@/components/pages/SellerDirectory";

export const metadata: Metadata = {
  title: "Üreticilerimiz",
  description: "Buharkent'in kadın girişimcileri ve genç çiftçileri.",
};

export default function SellersPage() {
  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <SellerDirectory />
    </main>
  );
}