import Hero from "@/components/home/Hero";
import CategoryRail from "@/components/home/CategoryRail";
import LiveMarketCta from "@/components/home/LiveMarketCta";
import ProductTabs from "@/components/home/ProductTabs";
import SellerStrip from "@/components/home/SellerStrip";
import TrustBar from "@/components/home/TrustBar";

export default function Home() {
  return (
    <main className="pb-16 pt-[164px] md:pb-24 md:pt-[124px]">
      <div className="mx-auto max-w-7xl space-y-12 px-4 md:space-y-16 md:px-8">
        <Hero />
        <TrustBar />
        <CategoryRail />
        <ProductTabs />
        <LiveMarketCta />
        <SellerStrip />
      </div>
    </main>
  );
}
