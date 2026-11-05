import type { Metadata } from "next";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Ödeme",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <main className="px-5 pb-20 pt-28 md:px-8 md:pt-36">
      <CheckoutForm />
    </main>
  );
}