// Sipariş durumları ve kuralları: hem sunucu hem tarayıcı kullanır

export type PartStatus = "pending_payment" | "preparing" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "havale" | "kapida";

export const STATUS: Record<PartStatus, { label: string; short: string; cls: string }> = {
  pending_payment: { label: "Ödeme bekleniyor", short: "Ödeme bekleniyor", cls: "bg-[#e0a84a]/20 text-[#7a4f10]" },
  preparing: { label: "Hazırlanıyor", short: "Hazırlanıyor", cls: "bg-fig-600/10 text-fig-600" },
  shipped: { label: "Kargoya verildi", short: "Kargoda", cls: "bg-[#2f5a6b]/15 text-[#2f5a6b]" },
  delivered: { label: "Teslim edildi", short: "Teslim edildi", cls: "bg-olive-500/20 text-olive-700" },
  cancelled: { label: "İptal edildi", short: "İptal", cls: "bg-terra-500/15 text-terra-600" },
};

export const OPEN_STATUSES: PartStatus[] = ["pending_payment", "preparing", "shipped"];

// Hangi durumdan hangisine geçilebilir (üretici ve admin için)
export const NEXT: Record<PartStatus, PartStatus[]> = {
  pending_payment: ["preparing", "cancelled"],
  preparing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export const CARGO_COMPANIES = ["PTT Kargo", "Yurtiçi Kargo", "Aras Kargo", "MNG Kargo", "Sürat Kargo", "DHL eCommerce", "Kolay Gelsin", "Diğer"] as const;

/** Kargo firmasının takip sayfası (bilinmiyorsa null) */
export function trackingUrl(company?: string, no?: string) {
  if (!company || !no) return null;
  const n = encodeURIComponent(no);
  switch (company) {
    case "PTT Kargo":
      return `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${n}`;
    case "Yurtiçi Kargo":
      return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${n}`;
    case "Aras Kargo":
      return `https://www.araskargo.com.tr/tr/cargo_tracking_detail.aspx?query=1&querydetail=2&ref_no=${n}`;
    case "MNG Kargo":
      return `https://www.mngkargo.com.tr/gonderi-takip/?takipNo=${n}`;
    default:
      return null;
  }
}

/** Bir üreticiye ait paketin kargo ücreti: en yüksek kargo ücreti, ücretsiz kargo sınırı aşılırsa 0 */
export function shippingForPart(subtotal: number, fees: number[], freeOver?: number) {
  if (freeOver && freeOver > 0 && subtotal >= freeOver) return 0;
  return Math.max(0, ...fees);
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

/** Havale ile ödenmeyen sipariş kaç gün sonra iptal edilebilir */
export const PAYMENT_DAYS = 3;
