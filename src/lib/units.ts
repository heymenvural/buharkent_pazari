// Gramaj / hacim / adet seçenekleri ve birim fiyat hesabı
export const UNITS = [
  { key: "g", label: "gram (g)" },
  { key: "kg", label: "kilogram (kg)" },
  { key: "ml", label: "mililitre (ml)" },
  { key: "L", label: "litre (L)" },
  { key: "adet", label: "adet" },
] as const;

export type Unit = (typeof UNITS)[number]["key"];

const fmt = (n: number) => String(n).replace(".", ",");

/** Seçenek etiketi ("500 g") ve sıralama için temel büyüklük (gram/ml/adet) */
export function makeVariant(amount: number, unit: Unit) {
  const size = unit === "kg" || unit === "L" ? amount * 1000 : amount;
  return { label: `${fmt(amount)} ${unit}`, size };
}

/** "500 g" gibi bir etiketten miktarı ve birimi geri çıkarır */
export function parseLabel(label: string): { amount: number; unit: Unit } | null {
  const m = label.trim().match(/^(\d+(?:[.,]\d+)?)\s*(g|gr|kg|ml|l|L|lt|adet)$/i);
  if (!m) return null;
  const amount = Number(m[1].replace(",", "."));
  const u = m[2].toLowerCase();
  const unit: Unit = u === "gr" || u === "g" ? "g" : u === "kg" ? "kg" : u === "ml" ? "ml" : u === "adet" ? "adet" : "L";
  return { amount, unit };
}

const tl = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 });

/** "250 ₺/kg" gibi birim fiyat; hesaplanamıyorsa null */
export function unitPrice(label: string, price: number): string | null {
  const p = parseLabel(label);
  if (!p || p.amount <= 0) return null;
  if (p.unit === "adet") return p.amount > 1 ? `${tl.format(price / p.amount)}/adet` : null;
  const base = p.unit === "kg" || p.unit === "L" ? p.amount * 1000 : p.amount;
  const per = p.unit === "g" || p.unit === "kg" ? "kg" : "L";
  if (base === 1000) return null; // zaten 1 kg / 1 L
  return `${tl.format((price / base) * 1000)}/${per}`;
}
