import type { LucideIcon } from "lucide-react";
import { Apple, Cherry, Droplets, Egg, Gift, Grape, Hexagon, Milk, Nut, Scissors } from "lucide-react";

/* ---------- Tipler ---------- */
export type SellerType = "Kadın Girişimci" | "Genç Çiftçi";

export type Seller = {
  id: string;
  slug: string;
  name: string;
  owner: string;
  type: SellerType;
  rating: number;
  village: string;
  since: number;
  tagline: string;
  story: string[];
  verified: boolean;
};

export type Category = { slug: string; name: string; short: string; icon: LucideIcon; bg: string };

export type Variant = { id: string; label: string; size: number; price: number; oldPrice?: number; stock: number };

export type Offer = {
  id: string;
  productId: string;
  sellerId: string;
  variants: Variant[];
  shippingFee: number;
  shipsIn: string;
  rating: number;
  reviews: number;
  note: string; // üreticinin kendi anlatımı
  details: [string, string][]; // üretim bilgileri
  images?: string[];
};

export type Review = { id: string; offerId: string; name: string; rating: number; text: string; date: string };

export type Tag = "firsat" | "cok-satan" | "yeni";

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  icon: LucideIcon;
  bg: string;
  light?: boolean;
  images?: string[];
  tags: Tag[];
};

/* ---------- Kategoriler ---------- */
export const categories: Category[] = [
  { slug: "incir-kuru-urunler", name: "İncir & Kuru Ürünler", short: "İncir", icon: Nut, bg: "from-fig-600 to-[#3f1f2c]" },
  { slug: "zeytin-zeytinyagi", name: "Zeytin & Zeytinyağı", short: "Zeytinyağı", icon: Droplets, bg: "from-olive-500 to-olive-900" },
  { slug: "bal-recel-pekmez", name: "Bal, Reçel & Pekmez", short: "Bal & Pekmez", icon: Hexagon, bg: "from-[#e0a84a] to-terra-600" },
  { slug: "meyve-sebze", name: "Meyve & Sebze", short: "Meyve & Sebze", icon: Apple, bg: "from-terra-500 to-[#8c3f1c]" },
  { slug: "sut-yumurta", name: "Süt & Yumurta", short: "Süt & Yumurta", icon: Milk, bg: "from-sand-300 to-sand-400" },
  { slug: "el-emegi", name: "El Emeği", short: "El Emeği", icon: Scissors, bg: "from-[#a88d62] to-[#7a6342]" },
  { slug: "hediye-kutulari", name: "Hediye Kutuları", short: "Hediye", icon: Gift, bg: "from-olive-700 to-olive-900" },
];

/* ---------- Üreticiler (örnek veri) ---------- */
export const sellers: Seller[] = [
  {
    id: "s1", slug: "ayse-teyzenin-bahcesi", name: "Ayşe Teyze'nin Bahçesi", owner: "Ayşe K.", type: "Kadın Girişimci",
    rating: 4.9, village: "Cumhuriyet Mahallesi", since: 2008, verified: true,
    tagline: "Annemden öğrendiğim usulle, güneşin kuruttuğu incir.",
    story: [
      "Bahçemizdeki incir ağaçlarının çoğunu rahmetli babam dikti. Yıllarca ürünümüzü tüccara yok pahasına verdik.",
      "Kooperatif eğitimlerinden sonra kendi markamı kurdum. Bugün incirimi, reçelimi ve pekmezimi aracısız olarak tüm Türkiye'ye gönderiyorum. Her paketi kendi ellerimle hazırlıyorum.",
    ],
  },
  {
    id: "s2", slug: "yamac-zeytinligi", name: "Yamaç Zeytinliği", owner: "Mehmet T.", type: "Genç Çiftçi",
    rating: 4.8, village: "Yeni Mahalle", since: 2019, verified: true,
    tagline: "Dedemin zeytinliğini modern yöntemlerle yeniden canlandırdım.",
    story: [
      "Ziraat mühendisliğini bitirince şehirde kalmak yerine köye döndüm. Dedemden kalan 300 ağaçlık zeytinliği budamadan hasada kadar yeniden düzenledim.",
      "Zeytinlerimizi hasattan sonra aynı gün soğuk sıkım yapan tesise götürüyoruz. Asitliği düşük, meyvemsi bir yağ elde ediyoruz.",
    ],
  },
  {
    id: "s3", slug: "kovan-bal-evi", name: "Kovan Bal Evi", owner: "Can D.", type: "Genç Çiftçi",
    rating: 4.9, village: "Fatih Mahallesi", since: 2020, verified: true,
    tagline: "Arıcılığı üniversiteden sonra memleketimde meslek edindim.",
    story: [
      "40 kovanla başladım, bugün 180 kovanım var. Kovanlarımı mevsime göre yayla ile ova arasında taşıyorum.",
      "Balımıza ısıl işlem uygulamıyoruz, sadece süzüyoruz. Her partinin analizini yaptırıyoruz.",
    ],
  },
  {
    id: "s4", slug: "fatma-ana-mutfagi", name: "Fatma Ana Mutfağı", owner: "Fatma Y.", type: "Kadın Girişimci",
    rating: 4.8, village: "Kurtuluş Mahallesi", since: 2012, verified: true,
    tagline: "Kazanda kaynayan her pekmezde köyümüzün emeği var.",
    story: [
      "Mahalledeki kadınlarla birlikte her yaz salça, pekmez ve tarhana yapıyoruz. Eskiden sadece komşulara satardık.",
      "Şimdi altı kadın birlikte çalışıyoruz ve kazancımız doğrudan ailelerimize gidiyor.",
    ],
  },
  {
    id: "s5", slug: "ilmek-ilmek-atolye", name: "İlmek İlmek Atölye", owner: "Elif S.", type: "Kadın Girişimci",
    rating: 5.0, village: "Atatürk Mahallesi", since: 2016, verified: true,
    tagline: "İlmek ilmek ördüğüm her ürün artık kendi gelirim demek.",
    story: [
      "Halk Eğitim Merkezi'nin kursunda örgüye başladım. Ninelerimizin motiflerini yaşatmak istiyorum.",
      "Doğal yün kullanıyorum ve her ürün tek tek elde örülüyor. Hiçbiri birbirinin aynısı değil.",
    ],
  },
  {
    id: "s6", slug: "cinar-ciftligi", name: "Çınar Çiftliği", owner: "Zehra A.", type: "Genç Çiftçi",
    rating: 4.7, village: "Bahçelievler Mahallesi", since: 2021, verified: true,
    tagline: "Gezen tavuklarımın yumurtası artık şehirdeki çocukların kahvaltısında.",
    story: [
      "Genç çiftçi hibesiyle küçük bir çiftlik kurdum. Tavuklarımız gün boyu bahçede serbest dolaşıyor.",
      "Mevsiminde taze incir ve bal da topluyoruz. Ürünlerimizi sabah toplayıp aynı gün kargoya veriyoruz.",
    ],
  },
];

/* ---------- Ürünler (katalog) ---------- */
export const catalog: CatalogProduct[] = [
  { id: "p1", slug: "ekstra-kuru-incir", name: "Ekstra Kuru İncir", category: "incir-kuru-urunler", description: "Güneşte doğal yollarla kurutulmuş, katkısız Buharkent inciri.", icon: Nut, bg: "from-fig-600 to-[#3f1f2c]", tags: ["cok-satan"] },
  { id: "p2", slug: "incir-receli", name: "Ev Yapımı İncir Reçeli", category: "bal-recel-pekmez", description: "Bakır kazanda, az şekerle kaynatılmış incir reçeli.", icon: Cherry, bg: "from-[#8a4a68] to-fig-600", tags: ["yeni"] },
  { id: "p3", slug: "erken-hasat-zeytinyagi", name: "Erken Hasat Sızma Zeytinyağı", category: "zeytin-zeytinyagi", description: "Ekim ayında hasat edilen yeşil zeytinlerden soğuk sıkım.", icon: Droplets, bg: "from-olive-500 to-olive-900", tags: ["yeni", "cok-satan"] },
  { id: "p4", slug: "kirma-yesil-zeytin", name: "Kırma Yeşil Zeytin", category: "zeytin-zeytinyagi", description: "Limon ve kekikle hafif tuzlanmış, taş kırma yeşil zeytin.", icon: Droplets, bg: "from-[#8a9a4a] to-olive-700", tags: [] },
  { id: "p5", slug: "suzme-cicek-bali", name: "Süzme Çiçek Balı", category: "bal-recel-pekmez", description: "Buharkent yaylalarından, ısıl işlem görmemiş süzme bal.", icon: Hexagon, bg: "from-[#e0a84a] to-terra-600", tags: ["cok-satan", "firsat"] },
  { id: "p6", slug: "gun-kurusu-uzum-pekmezi", name: "Gün Kurusu Üzüm Pekmezi", category: "bal-recel-pekmez", description: "Güneşte kurutulmuş üzümlerden, şeker ilavesiz geleneksel pekmez.", icon: Grape, bg: "from-[#6e3b4e] to-[#3f1f2c]", tags: ["firsat"] },
  { id: "p7", slug: "ev-yapimi-domates-salcasi", name: "Ev Yapımı Domates Salçası", category: "bal-recel-pekmez", description: "Güneşte kurutulmuş domatesten, katkısız köy salçası.", icon: Apple, bg: "from-terra-500 to-[#8c3f1c]", tags: [] },
  { id: "p8", slug: "gezen-tavuk-koy-yumurtasi", name: "Gezen Tavuk Köy Yumurtası", category: "sut-yumurta", description: "Doğada serbest dolaşan tavuklardan günlük toplanan yumurta.", icon: Egg, bg: "from-cream-50 to-sand-300", light: true, tags: ["firsat", "yeni"] },
  { id: "p9", slug: "el-orgusu-yun-patik", name: "El Örgüsü Yün Patik", category: "el-emegi", description: "Doğal yünden, geleneksel motiflerle elde örülmüş patik.", icon: Scissors, bg: "from-sand-300 to-sand-400", light: true, tags: [] },
  { id: "p10", slug: "buharkent-lezzet-kutusu", name: "Buharkent Lezzet Kutusu", category: "hediye-kutulari", description: "İncir, pekmez, bal ve zeytinyağından oluşan hediye kutusu.", icon: Gift, bg: "from-olive-700 to-olive-900", tags: ["firsat"] },
  { id: "p11", slug: "taze-siyah-incir", name: "Taze Siyah İncir", category: "meyve-sebze", description: "Sabah toplanıp aynı gün kargolanan mevsim inciri.", icon: Nut, bg: "from-[#4a2634] to-[#2a141d]", tags: ["yeni"] },
];

/* ---------- Üretici ilanları ---------- */
export const offers: Offer[] = [
  {
    id: "o1", productId: "p1", sellerId: "s1", shippingFee: 80, shipsIn: "1-2 gün", rating: 4.9, reviews: 128,
    note: "İncirlerimizi ağaçta tam olgunlaşıp kendiliğinden düşünce topluyoruz. Hasır sergilerde 7-10 gün güneşte kurutup tek tek elden geçiriyoruz. Kükürt ve koruyucu kullanmıyoruz.",
    details: [["Hasat", "Ağustos - Eylül 2026"], ["Üretim yöntemi", "Hasır üzerinde güneşte kurutma"], ["Üretim yeri", "Cumhuriyet Mah., Buharkent"], ["Katkı", "Kükürtsüz, koruyucusuz"], ["Saklama", "Serin ve kuru yerde, açtıktan sonra buzdolabında"]],
    variants: [
      { id: "v1", label: "250 g", size: 250, price: 85, stock: 40 },
      { id: "v2", label: "500 g", size: 500, price: 160, stock: 30 },
      { id: "v3", label: "1 kg", size: 1000, price: 300, oldPrice: 340, stock: 12 },
    ],
  },
  {
    id: "o2", productId: "p1", sellerId: "s4", shippingFee: 70, shipsIn: "2-3 gün", rating: 4.8, reviews: 54,
    note: "Mahallemizin yaşlı incir ağaçlarından topluyoruz. Kuruttuktan sonra kısa süre buharda bekletip yumuşatıyoruz; çocuklar için de çok seviliyor.",
    details: [["Hasat", "Eylül 2026"], ["Üretim yöntemi", "Güneşte kurutma, buharla yumuşatma"], ["Üretim yeri", "Kurtuluş Mah., Buharkent"], ["Saklama", "Serin ve kuru yerde"]],
    variants: [
      { id: "v1", label: "500 g", size: 500, price: 150, stock: 20 },
      { id: "v2", label: "1 kg", size: 1000, price: 280, stock: 4 },
    ],
  },
  {
    id: "o3", productId: "p1", sellerId: "s6", shippingFee: 90, shipsIn: "1-2 gün", rating: 4.7, reviews: 21,
    note: "Çiftliğimizdeki genç ağaçların ilk mahsulü. İri taneli ve bal gibi tatlı.",
    details: [["Hasat", "Eylül 2026"], ["Üretim yöntemi", "Güneşte kurutma"], ["Üretim yeri", "Bahçelievler Mah., Buharkent"]],
    variants: [{ id: "v1", label: "1 kg", size: 1000, price: 290, stock: 15 }],
  },
  {
    id: "o4", productId: "p2", sellerId: "s1", shippingFee: 80, shipsIn: "1-2 gün", rating: 4.9, reviews: 40,
    note: "Kendi bahçemizin incirini bakır kazanda, odun ateşinde pişiriyoruz. Şekeri az, meyvesi bol.",
    details: [["Üretim", "Ekim 2026"], ["İçindekiler", "İncir, şeker, limon tuzu yerine limon suyu"], ["Saklama", "Açtıktan sonra buzdolabında"]],
    variants: [{ id: "v1", label: "380 g", size: 380, price: 140, stock: 25 }],
  },
  {
    id: "o5", productId: "p2", sellerId: "s4", shippingFee: 70, shipsIn: "2-3 gün", rating: 4.8, reviews: 33,
    note: "Taneli reçel sevenler için incirleri bütün halde bırakıyoruz.",
    details: [["Üretim", "Ekim 2026"], ["İçindekiler", "İncir, şeker, limon suyu"], ["Saklama", "Açtıktan sonra buzdolabında"]],
    variants: [
      { id: "v1", label: "380 g", size: 380, price: 130, stock: 18 },
      { id: "v2", label: "700 g", size: 700, price: 220, stock: 10 },
    ],
  },
  {
    id: "o6", productId: "p3", sellerId: "s2", shippingFee: 100, shipsIn: "1-2 gün", rating: 4.8, reviews: 96,
    note: "Zeytinlerimizi henüz yeşilken elle topluyoruz ve aynı gün soğuk sıkıma götürüyoruz. Boğazda hafif yakıcılık bırakan, meyvemsi ve taze çimen kokulu bir yağ.",
    details: [["Hasat", "Ekim 2026"], ["Üretim yöntemi", "Erken hasat, soğuk sıkım (27°C altı)"], ["Asitlik", "%0,3"], ["Üretim yeri", "Yeni Mah., Buharkent"], ["Saklama", "Güneş görmeyen serin yerde"]],
    variants: [
      { id: "v1", label: "500 ml", size: 500, price: 260, stock: 50 },
      { id: "v2", label: "1 L", size: 1000, price: 450, stock: 40 },
      { id: "v3", label: "5 L", size: 5000, price: 2000, oldPrice: 2250, stock: 8 },
    ],
  },
  {
    id: "o7", productId: "p3", sellerId: "s6", shippingFee: 90, shipsIn: "2-3 gün", rating: 4.7, reviews: 18,
    note: "Çiftliğimizin sınırındaki yaşlı zeytin ağaçlarından, sınırlı miktarda.",
    details: [["Hasat", "Kasım 2026"], ["Üretim yöntemi", "Soğuk sıkım"], ["Üretim yeri", "Bahçelievler Mah., Buharkent"]],
    variants: [{ id: "v1", label: "1 L", size: 1000, price: 420, stock: 12 }],
  },
  {
    id: "o8", productId: "p4", sellerId: "s2", shippingFee: 100, shipsIn: "1-2 gün", rating: 4.8, reviews: 27,
    note: "Taşla tek tek kırıp suda acısını alıyoruz, sonra limon ve kekikle hafifçe tuzluyoruz.",
    details: [["Hasat", "Ekim 2026"], ["İçindekiler", "Yeşil zeytin, su, tuz, limon, kekik"], ["Saklama", "Buzdolabında, kendi suyunda"]],
    variants: [
      { id: "v1", label: "500 g", size: 500, price: 140, stock: 30 },
      { id: "v2", label: "1 kg", size: 1000, price: 250, stock: 20 },
    ],
  },
  {
    id: "o9", productId: "p5", sellerId: "s3", shippingFee: 85, shipsIn: "1-2 gün", rating: 4.9, reviews: 74,
    note: "Kovanlarımız bahar boyunca yaylada. Balı süzmekten başka hiçbir işlem uygulamıyoruz; zamanla kristalleşmesi doğallığının işaretidir.",
    details: [["Hasat", "Haziran 2026"], ["Üretim yöntemi", "Isıl işlemsiz süzme"], ["Analiz", "Her parti laboratuvar analizli"], ["Saklama", "Oda sıcaklığında, buzdolabına koymayın"]],
    variants: [
      { id: "v1", label: "460 g", size: 460, price: 220, stock: 35 },
      { id: "v2", label: "850 g", size: 850, price: 390, oldPrice: 450, stock: 5 },
    ],
  },
  {
    id: "o10", productId: "p5", sellerId: "s6", shippingFee: 90, shipsIn: "2-3 gün", rating: 4.7, reviews: 12,
    note: "Çiftliğimizdeki 20 kovanın ovadaki çiçeklerden yaptığı açık renkli bal.",
    details: [["Hasat", "Temmuz 2026"], ["Üretim yöntemi", "Süzme"], ["Saklama", "Oda sıcaklığında"]],
    variants: [{ id: "v1", label: "850 g", size: 850, price: 370, stock: 9 }],
  },
  {
    id: "o11", productId: "p6", sellerId: "s4", shippingFee: 70, shipsIn: "2-3 gün", rating: 4.8, reviews: 51,
    note: "Üzümleri damlarda kurutup kazanlarda saatlerce kaynatıyoruz. Hiç şeker eklemiyoruz.",
    details: [["Üretim", "Eylül 2026"], ["İçindekiler", "Sadece üzüm"], ["Üretim yöntemi", "Odun ateşinde kazan pekmezi"]],
    variants: [{ id: "v1", label: "700 g", size: 700, price: 160, oldPrice: 190, stock: 22 }],
  },
  {
    id: "o12", productId: "p6", sellerId: "s1", shippingFee: 80, shipsIn: "1-2 gün", rating: 4.9, reviews: 19,
    note: "Bağımızın siyah üzümünden, koyu kıvamlı pekmez.",
    details: [["Üretim", "Eylül 2026"], ["İçindekiler", "Sadece üzüm"]],
    variants: [{ id: "v1", label: "700 g", size: 700, price: 170, stock: 14 }],
  },
  {
    id: "o13", productId: "p7", sellerId: "s4", shippingFee: 70, shipsIn: "2-3 gün", rating: 4.8, reviews: 63,
    note: "Domatesleri tepsilerde güneşte koyulaştırıyoruz, ocak görmüyor. Sadece tuz ekliyoruz.",
    details: [["Üretim", "Ağustos 2026"], ["İçindekiler", "Domates, tuz"], ["Üretim yöntemi", "Güneşte koyulaştırma"]],
    variants: [
      { id: "v1", label: "1 kg", size: 1000, price: 210, stock: 25 },
      { id: "v2", label: "2 kg", size: 2000, price: 400, stock: 10 },
    ],
  },
  {
    id: "o14", productId: "p8", sellerId: "s6", shippingFee: 90, shipsIn: "Aynı gün", rating: 4.7, reviews: 42,
    note: "Tavuklarımız gün boyu bahçede dolaşıyor, mısır ve buğdayla besleniyor. Yumurtaları her sabah toplayıp aynı gün kargoluyoruz.",
    details: [["Toplama", "Her sabah"], ["Besleme", "Mısır, buğday, serbest otlatma"], ["Saklama", "Buzdolabında"]],
    variants: [
      { id: "v1", label: "15'li", size: 15, price: 70, stock: 60 },
      { id: "v2", label: "30'lu", size: 30, price: 130, oldPrice: 150, stock: 40 },
    ],
  },
  {
    id: "o15", productId: "p9", sellerId: "s5", shippingFee: 60, shipsIn: "3-5 gün", rating: 5.0, reviews: 38,
    note: "Her patik yaklaşık iki günde örülüyor. Motifleri ninemin sandığındaki eski patiklerden aldım.",
    details: [["Malzeme", "%100 doğal yün"], ["Üretim", "Tamamen el örgüsü"], ["Bakım", "Soğuk suda elde yıkama"]],
    variants: [{ id: "v1", label: "1 çift", size: 1, price: 350, stock: 6 }],
  },
  {
    id: "o16", productId: "p10", sellerId: "s1", shippingFee: 0, shipsIn: "1-2 gün", rating: 4.9, reviews: 112,
    note: "Komşu üreticilerle birlikte hazırladığımız kutu: incir, pekmez, bal ve zeytinyağı. El yazısı bir notla gönderiyoruz.",
    details: [["İçerik (küçük)", "İncir, pekmez, reçel"], ["İçerik (büyük)", "İncir, pekmez, bal, zeytinyağı, reçel, zeytin"], ["Paketleme", "Geri dönüştürülebilir kutu"]],
    variants: [
      { id: "v1", label: "Küçük kutu", size: 1, price: 490, stock: 20 },
      { id: "v2", label: "Büyük kutu", size: 2, price: 890, oldPrice: 990, stock: 10 },
    ],
  },
  {
    id: "o17", productId: "p11", sellerId: "s1", shippingFee: 80, shipsIn: "Aynı gün", rating: 4.9, reviews: 25,
    note: "Sabah serinliğinde topluyoruz, yaprakla sarıp aynı gün yola çıkarıyoruz.",
    details: [["Hasat", "Her sabah (sezonda)"], ["Saklama", "Buzdolabında, 3 gün içinde tüketin"]],
    variants: [{ id: "v1", label: "1 kg", size: 1000, price: 120, stock: 30 }],
  },
  {
    id: "o18", productId: "p11", sellerId: "s6", shippingFee: 90, shipsIn: "Aynı gün", rating: 4.7, reviews: 9,
    note: "Çiftliğimizin siyah incirleri, iri ve sulu.",
    details: [["Hasat", "Her sabah (sezonda)"], ["Saklama", "Buzdolabında"]],
    variants: [
      { id: "v1", label: "1 kg", size: 1000, price: 110, stock: 25 },
      { id: "v2", label: "3 kg", size: 3000, price: 300, stock: 8 },
    ],
  },
];

/* ---------- Yorumlar (örnek) ---------- */
export const reviewsData: Review[] = [
  { id: "r1", offerId: "o1", name: "Selin A.", rating: 5, text: "Çocukluğumdaki incirin tadı. Paketlemesi de çok özenliydi.", date: "Ekim 2026" },
  { id: "r2", offerId: "o1", name: "Murat K.", rating: 5, text: "Hiç şekerli değil ama bal gibi tatlı, ikinci siparişim.", date: "Ekim 2026" },
  { id: "r3", offerId: "o1", name: "Deniz Y.", rating: 4, text: "Lezzet harika, kargo bir gün gecikti.", date: "Eylül 2026" },
  { id: "r4", offerId: "o2", name: "Ebru T.", rating: 5, text: "Yumuşacık, kahvaltıda çok güzel gidiyor.", date: "Ekim 2026" },
  { id: "r5", offerId: "o6", name: "Kerem B.", rating: 5, text: "Boğazda yakan gerçek erken hasat. Kokusu muazzam.", date: "Kasım 2026" },
  { id: "r6", offerId: "o6", name: "Aylin Ş.", rating: 4, text: "Çok kaliteli, 5 litreliği alacağım.", date: "Kasım 2026" },
  { id: "r7", offerId: "o9", name: "Hakan E.", rating: 5, text: "Kristalleşti, demek ki gerçek bal. Teşekkürler!", date: "Eylül 2026" },
  { id: "r8", offerId: "o11", name: "Nur G.", rating: 5, text: "Annemin yaptığı pekmezin aynısı.", date: "Ekim 2026" },
  { id: "r9", offerId: "o14", name: "Burcu O.", rating: 5, text: "Sarısı turuncu, gerçek köy yumurtası.", date: "Kasım 2026" },
  { id: "r10", offerId: "o15", name: "Gamze İ.", rating: 5, text: "Kızım için aldım, el emeği belli oluyor.", date: "Ekim 2026" },
  { id: "r11", offerId: "o16", name: "Ozan C.", rating: 5, text: "Hediye olarak gönderdim, içindeki el yazısı not çok hoştu.", date: "Ekim 2026" },
];

/* ---------- Yardımcılar ---------- */
const tl = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
export const formatPrice = (n: number) => tl.format(n);

export const getSeller = (id: string) => sellers.find((s) => s.id === id)!;
export const getSellerBySlug = (slug: string) => sellers.find((s) => s.slug === slug);
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const getProduct = (slug: string) => catalog.find((p) => p.slug === slug);
export const getProductById = (id: string) => catalog.find((p) => p.id === id);
export const offersFor = (productId: string) => offers.filter((o) => o.productId === productId);
export const sellerOffers = (sellerId: string) => offers.filter((o) => o.sellerId === sellerId);
export const offerReviews = (offerId: string) => reviewsData.filter((r) => r.offerId === offerId);

export const initials = (n: string) =>
  n
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

export const sellerGradient = (type: SellerType) =>
  type === "Kadın Girişimci" ? "from-fig-600 to-[#3f1f2c]" : "from-olive-500 to-olive-900";

export const discountPct = (price: number, oldPrice?: number) =>
  oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;

export function priceInfo(productId: string) {
  let min = Infinity;
  let oldPrice: number | undefined;
  let maxDiscount = 0;
  for (const o of offersFor(productId)) {
    for (const v of o.variants) {
      if (v.price < min) min = v.price;
      const d = discountPct(v.price, v.oldPrice);
      if (d > maxDiscount) {
        maxDiscount = d;
        oldPrice = v.oldPrice;
      }
    }
  }
  return { min, oldPrice, maxDiscount, sellerCount: offersFor(productId).length };
}

export function productRating(productId: string) {
  const list = offersFor(productId);
  const reviews = list.reduce((a, o) => a + o.reviews, 0);
  const rating = reviews ? list.reduce((a, o) => a + o.rating * o.reviews, 0) / reviews : 0;
  return { rating, reviews };
}

export function variantLabels(productId: string) {
  const map = new Map<string, number>();
  offersFor(productId).forEach((o) => o.variants.forEach((v) => map.set(v.label, v.size)));
  return [...map.entries()].sort((a, b) => a[1] - b[1]).map(([label]) => label);
}

export type Line = { offer: Offer; variant: Variant; seller: Seller };

export function linesFor(productId: string, label: string): Line[] {
  return offersFor(productId)
    .flatMap((o) => o.variants.filter((v) => v.label === label).map((v) => ({ offer: o, variant: v, seller: getSeller(o.sellerId) })))
    .sort((a, b) => a.variant.price - b.variant.price);
}