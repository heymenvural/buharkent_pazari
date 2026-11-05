export const normalizeIban = (s: string) => s.replace(/\s+/g, "").toUpperCase();

export function isValidTrIban(raw: string) {
  const iban = normalizeIban(raw);
  if (!/^TR\d{24}$/.test(iban)) return false;
  // Uluslararası IBAN kontrol hanesi doğrulaması (mod 97)
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const digits = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rem = 0;
  for (const ch of digits) rem = (rem * 10 + Number(ch)) % 97;
  return rem === 1;
}

export const formatIban = (s: string) => normalizeIban(s).replace(/(.{4})/g, "$1 ").trim();

export const maskIban = (s: string) => {
  const i = normalizeIban(s);
  return i.length < 8 ? "" : `${i.slice(0, 4)} **** **** **** **** ${i.slice(-4, -2)} ${i.slice(-2)}`;
};