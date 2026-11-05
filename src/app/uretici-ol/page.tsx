import type { Metadata } from "next";
import SellerCta from "@/components/home/SellerCta";
import SellerRegisterForm from "@/components/auth/SellerRegisterForm";

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
          <div className="mx-auto max-w-3xl rounded-[2rem] bg-cream-50 p-6 shadow-soft md:p-10">
            <h2 className="text-3xl text-olive-900 md:text-4xl">Başvuru formu</h2>
            <p className="mb-8 mt-2 text-sm text-muted">
              Formu doldur, hesabın oluşsun. Dernek ekibimiz başvurunu onayladığında giriş yapabilirsin. Başvuru ücretsizdir.
            </p>
            <SellerRegisterForm />
          </div>
        </section>
      </div>
    </main>
  );
}