import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import CustomCursor from "@/components/ui/CustomCursor";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Buharkent Pazarı | Buharkent'in Doğal Lezzetleri",
    template: "%s | Buharkent Pazarı",
  },
  description:
    "Buharkent'te üreten kadın girişimciler ve genç çiftçilerden doğrudan sofranıza: incir, zeytinyağı, bal, el emeği ürünler.",
  keywords: ["Buharkent", "yerel ürün", "incir", "zeytinyağı", "kadın girişimci", "genç çiftçi", "BUHARYEG"],
  openGraph: {
    title: "Buharkent Pazarı",
    description: "Buharkent'in doğal lezzetleri, üreticisinden sofranıza.",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="min-h-screen bg-cream-100 text-ink antialiased">
        <SmoothScroll>
          <CustomCursor />
          <Navbar />
          <CartDrawer />
          {children}
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}