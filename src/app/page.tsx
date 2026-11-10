import Preloader from "@/components/home/Preloader";
import CampaignSlider from "@/components/home/CampaignSlider";
import CategoryRail from "@/components/home/CategoryRail";
import DailyDeals from "@/components/home/DailyDeals";
import LiveMarketCta from "@/components/home/LiveMarketCta";
import ProductTabs from "@/components/home/ProductTabs";
import PromoBanners from "@/components/home/PromoBanners";
import SellerStrip from "@/components/home/SellerStrip";
import TrustBar from "@/components/home/TrustBar";

export default function Home() {
  return (
    <>
      <Preloader />
      <main className="pb-16 pt-[164px] md:pb-24 md:pt-[136px]">
        <div className="mx-auto max-w-7xl space-y-14 px-4 md:space-y-20 md:px-8">
          <CampaignSlider />
          <CategoryRail />
          <LiveMarketCta />
          <DailyDeals />
          <ProductTabs />
          <PromoBanners />
          <SellerStrip />
          <TrustBar />
        </div>
      </main>
    </>
  );
}