import type { Metadata } from "next";
import About from "@/components/pages/About";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Buharkent Pazarı ve Buharkent Yerel Eylem Grubu Derneği hakkında.",
};

export default function AboutPage() {
  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <About />
    </main>
  );
}