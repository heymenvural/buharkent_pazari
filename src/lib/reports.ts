import type { ReportReason } from "@/models/Report";

export const REPORT_REASONS: { key: ReportReason; label: string }[] = [
  { key: "baskasinin-urunu", label: "Üretici bu ürünü kendisi üretmiyor" },
  { key: "sahte", label: "Sahte veya taklit ürün" },
  { key: "saglik", label: "Sağlık veya hijyen sorunu" },
  { key: "yaniltici", label: "Yanıltıcı bilgi veya fotoğraf" },
  { key: "yasak", label: "Satışı yasak veya izinsiz ürün" },
  { key: "diger", label: "Diğer" },
];

export const reasonLabel = (k: string) => REPORT_REASONS.find((r) => r.key === k)?.label ?? k;
