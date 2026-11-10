import type { Metadata, Viewport } from "next";
import { ORG } from "@/lib/legal";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import AuthProvider from "@/components/providers/AuthProvider";
import CatalogProvider from "@/components/providers/CatalogProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { getCatalogSnapshot } from "@/lib/data/catalog.server";
import WelcomeModal from "@/components/home/WelcomeModal";

const fraunces = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-fraunces", display: "swap" });
const manrope = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-manrope", display: "swap" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2f3718",
};

export const metadata: Metadata = {
  metadataBase: new URL(ORG.site),
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
    siteName: "Buharkent Pazarı",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Buharkent Pazarı" }],
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const catalogData = await getCatalogSnapshot();

  return (
    <html lang="tr" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="min-h-screen bg-cream-100 text-ink antialiased">
        <CatalogProvider data={catalogData}>
          <AuthProvider>
            <SmoothScroll>
              <Navbar />
              <CartDrawer />
              {children}
              <WelcomeModal />
              <Footer />
            </SmoothScroll>
          </AuthProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}