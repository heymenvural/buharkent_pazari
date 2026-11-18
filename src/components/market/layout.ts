import type { CatalogProduct, Offer, Seller } from "@/lib/catalog";

export const SPACING = 6; // sıralar arası mesafe (m)
export const STALL_X = 4.3; // tezgâhın sokak ortasına uzaklığı
export const MIN_STALLS = 8;

// Sokak ağı ölçüleri (metre)
export const WALK_HALF = 2.4; // yürünebilir yolun yarı genişliği
export const HOUSE_X = 11.5; // ev sırasının sokak ortasına uzaklığı (iç cephe 8 m)
export const HOUSE_INNER = 8;
export const GROUND_HALF = 12;
export const ENTRY_Z = 3.8;
export const STALLS_PER_STREET = 8; // 4 sıra × 2 yan
const FIRST_JUNCTION = 16; // ana caddede ilk kavşak (girişten uzaklık)
const JUNCTION_GAP = 34; // kavşaklar arası
const FIRST_ROW = 16; // yan sokakta ilk tezgâh sırası
const STREET_TAIL = 7; // son sıradan sonra sokak sonu duvarına mesafe

export type GoodsKind = "fig" | "olive" | "produce" | "egg" | "jar" | "bottle" | "textile" | "gift";

export type StallItem = {
  offer: Offer;
  product: CatalogProduct;
  kind: GoodsKind;
  color: string;
  price: number;
  label: string;
  image?: string;
};

export type StallInfo = {
  key: string;
  seller?: Seller;
  items: StallItem[];
  side: -1 | 1; // sokağa göre -1 sol, 1 sağ
  x: number;
  z: number;
  rotY: number;
  colors: [string, string]; // tente çizgileri
  cloth: string;
  street: string; // sokak kimliği
  stand: { x: number; z: number; yaw: number }; // tezgâha bakmak için durulacak yer
};

export type Rect = { x0: number; x1: number; z0: number; z1: number; street: string | null };

export type StreetPlan = {
  id: string;
  name: string;
  side: -1 | 1; // ana caddenin hangi yanında
  junction: number; // ana caddede kavşağın girişten uzaklığı
  theta: number; // sokak yönü (Y ekseninde dönüş)
  origin: [number, number]; // dünya koordinatı (sokak başlangıcı = kavşak merkezi)
  length: number; // kavşaktan sokak sonuna
  rows: number[]; // tezgâh sıralarının kavşağa uzaklığı
  stalls: StallInfo[];
  box: [number, number, number, number]; // minX, minZ, maxX, maxZ
};

export type MarketPlan = {
  streets: StreetPlan[];
  avenueEnd: number; // ana caddenin girişten uzunluğu
  junctions: { s: number; left?: string; right?: string }[];
  stalls: StallInfo[];
  rects: Rect[];
};

const AWNINGS: [string, string][] = [
  ["#b5532f", "#f6ead6"],
  ["#4a5627", "#f1e6cc"],
  ["#6e3b4e", "#f3e4d8"],
  ["#c98a2b", "#fcf2dd"],
  ["#2f5a6b", "#eef0e6"],
  ["#8a4b2a", "#f5e6cf"],
  ["#a63d40", "#f8efe0"],
  ["#5d7a3a", "#f4ecd6"],
];
const CLOTHS = ["#e9d3a8", "#d9b9a0", "#c9d2a7", "#e3c7c0", "#d7cfb6", "#cdd9d6"];

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

export function goodsFor(product: CatalogProduct): { kind: GoodsKind; color: string } {
  const n = product.name.toLocaleLowerCase("tr");
  switch (product.category) {
    case "incir-kuru-urunler":
      return n.includes("üzüm") ? { kind: "fig", color: "#5a3a22" } : { kind: "fig", color: "#6b4a2e" };
    case "zeytin-zeytinyagi":
      return n.includes("yağ") ? { kind: "bottle", color: "#8f9a2c" } : { kind: "olive", color: n.includes("siyah") ? "#2b2420" : "#6d7a2e" };
    case "bal-recel-pekmez":
      if (n.includes("bal")) return { kind: "jar", color: "#d99a24" };
      if (n.includes("pekmez")) return { kind: "jar", color: "#3b1a12" };
      if (n.includes("salça")) return { kind: "jar", color: "#b3261e" };
      return { kind: "jar", color: "#8b1e2d" };
    case "meyve-sebze":
      if (n.includes("incir")) return { kind: "produce", color: "#4b2340" };
      if (n.includes("domates")) return { kind: "produce", color: "#c8341f" };
      if (n.includes("biber")) return { kind: "produce", color: "#3f7a2a" };
      return { kind: "produce", color: "#d0612a" };
    case "sut-yumurta":
      return { kind: "egg", color: "#f1e2c6" };
    case "el-emegi":
      return { kind: "textile", color: "#b5532f" };
    default:
      return { kind: "gift", color: "#4a5627" };
  }
}


const STREET_NAMES: Record<string, string> = {
  "incir-kuru-urunler": "İncir Sokağı",
  "zeytin-zeytinyagi": "Zeytin Sokağı",
  "bal-recel-pekmez": "Bal Sokağı",
  "meyve-sebze": "Bostan Sokağı",
  "sut-yumurta": "Yumurta Sokağı",
  "el-emegi": "El Emeği Sokağı",
  "hediye-kutulari": "Hediye Sokağı",
};
const NEW_STREET = "Yeni Tezgâhlar Sokağı";

/** Yerel (sokak) koordinatını dünyaya çevirir: sokak yerel -Z yönünde uzanır */
export function toWorld(origin: [number, number], theta: number, lx: number, lz: number): [number, number] {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return [origin[0] + lx * c + lz * s, origin[1] - lx * s + lz * c];
}

function itemsFor(seller: Seller, offers: Offer[], products: CatalogProduct[]): StallItem[] {
  return offers
    .filter((o) => o.sellerId === seller.id)
    .map((offer) => {
      const product = products.find((p) => p.id === offer.productId);
      if (!product || !offer.variants.length) return null;
      const v = [...offer.variants].sort((a, b) => a.price - b.price)[0];
      return { offer, product, ...goodsFor(product), price: v.price, label: v.label, image: offer.images?.[0] ?? product.images?.[0] } as StallItem;
    })
    .filter((x): x is StallItem => !!x);
}

/** Üreticinin en çok ürün sattığı kategori → sokağı */
function mainCategory(items: StallItem[]): string | null {
  const n = new Map<string, number>();
  for (const it of items) n.set(it.product.category, (n.get(it.product.category) ?? 0) + 1);
  return [...n.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

/**
 * Pazarın planı: girişten uzanan ana cadde ve ona bağlanan yan sokaklar.
 * Üreticiler ana ürün gruplarına göre sokaklara dağılır; bir sokak dolunca "… 2" açılır.
 * Her zaman en az bir sokakta "Üretici ol" davetli boş tezgâhlar bulunur.
 */
export function buildMarket(sellers: Seller[], offers: Offer[], products: CatalogProduct[]): MarketPlan {
  const ordered = [...sellers].sort((a, b) => Number(b.verified) - Number(a.verified) || b.rating - a.rating);

  // 1) Üreticileri gruplara ayır
  const groups = new Map<string, { seller?: Seller; items: StallItem[] }[]>();
  for (const seller of ordered) {
    const items = itemsFor(seller, offers, products);
    const cat = mainCategory(items);
    const name = (cat && STREET_NAMES[cat]) || NEW_STREET;
    groups.set(name, [...(groups.get(name) ?? []), { seller, items }]);
  }

  // 2) Sokaklara böl (sokak başına en fazla 8 tezgâh), kalabalık sokaklar önce
  const streetsRaw: { name: string; list: { seller?: Seller; items: StallItem[] }[] }[] = [];
  for (const [name, list] of [...groups.entries()].sort((a, b) => b[1].length - a[1].length)) {
    for (let i = 0; i < list.length; i += STALLS_PER_STREET) {
      const part = Math.floor(i / STALLS_PER_STREET);
      streetsRaw.push({ name: part ? `${name} ${part + 1}` : name, list: list.slice(i, i + STALLS_PER_STREET) });
    }
  }

  // 3) Boş tezgâhlar: toplam en az 8 tezgâh ve her zaman birkaç davet tezgâhı
  const filled = streetsRaw.reduce((a, s) => a + s.list.length, 0);
  let empties = Math.max(MIN_STALLS - filled, 2);
  const newIdx = streetsRaw.findIndex((s) => s.name === NEW_STREET && s.list.length < STALLS_PER_STREET);
  if (newIdx >= 0) {
    const room = STALLS_PER_STREET - streetsRaw[newIdx].list.length;
    const add = Math.min(room, empties);
    for (let i = 0; i < add; i++) streetsRaw[newIdx].list.push({ items: [] });
    empties -= add;
  }
  while (empties > 0) {
    const add = Math.min(STALLS_PER_STREET, empties);
    streetsRaw.push({ name: streetsRaw.some((s) => s.name === NEW_STREET) ? `${NEW_STREET} ${streetsRaw.length + 1}` : NEW_STREET, list: Array.from({ length: add }, () => ({ items: [] })) });
    empties -= add;
  }

  // 4) Yerleşim: kavşak başına sol ve sağ birer sokak
  const streets: StreetPlan[] = [];
  const stalls: StallInfo[] = [];
  const rects: Rect[] = [];
  const junctions: MarketPlan["junctions"] = [];

  streetsRaw.forEach((raw, i) => {
    const j = Math.floor(i / 2);
    const side: -1 | 1 = i % 2 === 0 ? -1 : 1;
    const junction = FIRST_JUNCTION + j * JUNCTION_GAP;
    if (!junctions[j]) junctions[j] = { s: junction };
    const theta = side === 1 ? -Math.PI / 2 : Math.PI / 2;
    const origin: [number, number] = [0, -junction];
    const id = `sokak-${i}`;
    if (side === -1) junctions[j].left = raw.name;
    else junctions[j].right = raw.name;

    const rowCount = Math.max(1, Math.ceil(raw.list.length / 2));
    const rows = Array.from({ length: rowCount }, (_, r) => FIRST_ROW + r * SPACING);
    const length = rows[rows.length - 1] + STREET_TAIL;

    const st: StallInfo[] = raw.list.map((s, k) => {
      const sideS: -1 | 1 = k % 2 === 0 ? -1 : 1;
      const row = rows[Math.floor(k / 2)];
      const key = s.seller?.id ?? `bos-${i}-${k}`;
      const h = hash(key);
      const [x, z] = toWorld(origin, theta, sideS * STALL_X, -row);
      const [sx, sz] = toWorld(origin, theta, 0, -row + 1.2);
      return {
        key,
        seller: s.seller,
        items: s.items,
        side: sideS,
        x,
        z,
        rotY: (sideS === -1 ? Math.PI / 2 : -Math.PI / 2) + theta,
        colors: s.seller ? AWNINGS[h % AWNINGS.length] : ["#9b9283", "#ece6da"],
        cloth: s.seller ? CLOTHS[h % CLOTHS.length] : "#ddd5c6",
        street: id,
        stand: { x: sx, z: sz, yaw: (sideS === -1 ? 1.15 : -1.15) + theta },
      };
    });
    stalls.push(...st);

    const corners = [toWorld(origin, theta, -GROUND_HALF - 4, 0), toWorld(origin, theta, GROUND_HALF + 4, -length - 2)];
    const box: StreetPlan["box"] = [
      Math.min(corners[0][0], corners[1][0]),
      Math.min(corners[0][1], corners[1][1]),
      Math.max(corners[0][0], corners[1][0]),
      Math.max(corners[0][1], corners[1][1]),
    ];
    streets.push({ id, name: raw.name, side, junction, theta, origin, length, rows, stalls: st, box });

    // Yan sokakta yürünebilir alan (kavşaktan sokak sonuna)
    const a = toWorld(origin, theta, -WALK_HALF, 0);
    const b = toWorld(origin, theta, WALK_HALF, -(length - 3));
    rects.push({ x0: Math.min(a[0], b[0]), x1: Math.max(a[0], b[0]), z0: Math.min(a[1], b[1]), z1: Math.max(a[1], b[1]), street: id });
  });

  const lastJ = junctions.length ? junctions[junctions.length - 1].s : 0;
  const avenueEnd = lastJ + 14;
  rects.push({ x0: -WALK_HALF, x1: WALK_HALF, z0: -(avenueEnd - 3), z1: ENTRY_Z, street: null });

  return { streets, avenueEnd, junctions, stalls, rects };
}

export const inside = (rects: Rect[], x: number, z: number) => rects.some((r) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1);
export const streetAt = (rects: Rect[], x: number, z: number) => {
  // Kavşakta ana cadde ile yan sokak üst üste biner; yan sokağı tercih et
  let found: string | null = null;
  for (const r of rects) if (x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) found = r.street ?? found;
  return found;
};
