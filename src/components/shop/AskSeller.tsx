import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/whatsapp";

/** "Üreticiye sor": sadece üretici izin verdiyse görünür, WhatsApp'ı hazır mesajla açar */
export default function AskSeller({ number, sellerName, productName, className = "" }: { number?: string; sellerName: string; productName?: string; className?: string }) {
  if (!number) return null;
  const text = productName
    ? `Merhaba ${sellerName}, Buharkent Pazarı'ndaki "${productName}" ürününüz hakkında bir sorum var: `
    : `Merhaba ${sellerName}, Buharkent Pazarı'ndaki mağazanız hakkında bir sorum var: `;
  return (
    <a
      href={waLink(number, text)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe5b] ${className}`}
    >
      <MessageCircle className="h-4 w-4" /> Üreticiye sor
    </a>
  );
}
