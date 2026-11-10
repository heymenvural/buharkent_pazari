/** Türkiye cep numarasını WhatsApp bağlantısı biçimine çevirir (905XXXXXXXXX) */
export function toWaNumber(phone?: string) {
  const d = (phone ?? "").replace(/\D/g, "");
  const ten = d.length === 12 && d.startsWith("90") ? d.slice(2) : d.length === 11 && d.startsWith("0") ? d.slice(1) : d;
  return /^5\d{9}$/.test(ten) ? `90${ten}` : null;
}

export const waLink = (number: string, text: string) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
