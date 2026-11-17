export const ORG = {
  name: "Buharkent Yerel Eylem Grubu Derneği",
  short: "BUHARYEG",
  platform: "Buharkent Pazarı",
  // Vercel'de NEXT_PUBLIC_ORG_ADDRESS / NEXT_PUBLIC_CONTACT_EMAIL / NEXT_PUBLIC_ORG_PHONE ile değiştirilebilir.
  // E-posta verilmezse sitenin e-posta gönderdiği adres (GMAIL_USER) kullanılır — bkz. next.config.ts
  address: process.env.NEXT_PUBLIC_ORG_ADDRESS?.trim() || "Buharkent / Aydın",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "",
  phone: process.env.NEXT_PUBLIC_ORG_PHONE?.trim() || "+90 554 441 11 67",
  registryNo: "09-024-196",
  site: (process.env.NEXT_PUBLIC_SITE_URL || "https://buharkent-pazari.vercel.app").replace(/\/$/, ""),
};

/** Henüz doldurulmamış mı? (boş ya da "[...]" ile yazılmış) */
export const isPlaceholder = (v: string) => !v.trim() || /\[.*\]/.test(v);

/** Açık adres girilmiş mi? (sadece "Buharkent / Aydın" yeterli değil) */
export const hasFullAddress = () => !!process.env.NEXT_PUBLIC_ORG_ADDRESS?.trim();

/** Yazılı başvuru kanalı: e-posta varsa e-posta, yoksa WhatsApp hattı */
export const contactChannel = () =>
  ORG.email ? `${ORG.email} e-posta adresine` : `${ORG.phone} numaralı WhatsApp hattına`;

export const LEGAL_UPDATED = "17 Kasım 2026";

export const legalLinks = [
  { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
  { href: "/gizlilik", label: "Gizlilik Politikası" },
  { href: "/mesafeli-satis", label: "Mesafeli Satış Sözleşmesi" },
  { href: "/cerez-politikasi", label: "Çerez Politikası" },
];