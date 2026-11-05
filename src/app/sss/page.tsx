import type { Metadata } from "next";
import Faq from "@/components/home/Faq";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
};

export default function FaqPage() {
  return (
    <main className="pt-[132px] md:pt-[110px]">
      <Faq />
    </main>
  );
}