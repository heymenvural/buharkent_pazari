import type { Metadata } from "next";
import LiveMarket from "@/components/market/LiveMarket";

export const metadata: Metadata = {
  title: "Canlı Pazar",
  description: "Buharkent Pazarı'nı 3D gez: üreticilerin tezgâhlarını dolaş, ürünlere bak, sepetine ekle.",
};

export default function LiveMarketPage() {
  return <LiveMarket />;
}
