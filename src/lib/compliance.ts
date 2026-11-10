import type { LucideIcon } from "lucide-react";
import { Apple, Cherry, Cookie, Droplets, Egg, Gem, Hexagon, Nut, Scissors, TreePine, Wheat } from "lucide-react";

export type DocKey = "cks" | "aks" | "hayvan" | "sikim" | "gikb" | "hijyen" | "muafiyet" | "levha";
export type Group = "tarla" | "hayvansal" | "ev-gida" | "el-emegi";
export type TaxStatus = "ciftci" | "muaf910" | "muaf96" | "mukellef";

export type DocInfo = {
  key: DocKey;
  name: string;
  what: string;
  where: string;
  steps: string[];
  cost: string;
  time: string;
  help?: string;
  link?: { label: string; href: string };
};

export type ProductType = {
  key: string;
  name: string;
  examples: string;
  group: Group;
  icon: LucideIcon;
  category: string; // sitedeki kategori
  docs: DocKey[];
  note?: string;
};

export const GROUPS: Record<Group, { title: string; text: string }> = {
  tarla: { title: "Tarladan ürünler", text: "Kendi bahçende, tarlanda yetiştirdiğin ürünler" },
  hayvansal: { title: "Arı ve tavuk ürünleri", text: "Kendi arılarının balı, kendi tavuklarının yumurtası" },
  "ev-gida": { title: "Ev yapımı gıdalar", text: "Kendi mutfağında pişirdiğin, fırınladığın, hazırladığın ürünler" },
  "el-emegi": { title: "El emeği", text: "Kendi ellerinle yaptığın, yiyecek olmayan ürünler" },
};

export const DOCS: Record<DocKey, DocInfo> = {
  cks: {
    key: "cks",
    name: "Çiftçi Kayıt Sistemi (ÇKS) Belgesi",
    what: "Tarım yaptığını gösteren resmi kayıt. Ürünlerinin gerçekten senin tarlandan geldiğini gösterir.",
    where: "Buharkent İlçe Tarım ve Orman Müdürlüğü",
    steps: [
      "Kimliğini ve arazinin tapusunu (ya da kira sözleşmesini) yanına al.",
      "İlçe Tarım ve Orman Müdürlüğü'ne git, ÇKS kaydı yaptırmak istediğini söyle.",
      "Kaydın zaten varsa (destek alıyorsan büyük ihtimalle vardır) güncel ÇKS belgesinin çıktısını iste.",
      "Belgenin fotoğrafını çek ve buraya yükle.",
    ],
    cost: "Genellikle ücretsiz",
    time: "Genellikle aynı gün",
  },
  aks: {
    key: "aks",
    name: "Arıcılık Kayıt Sistemi (AKS) Belgesi",
    what: "Arıcılık yapan herkesin kovanlarını kayıt altına aldırması zorunludur. Bu belge, kaydının olduğunu gösterir.",
    where: "Buharkent İlçe Tarım ve Orman Müdürlüğü veya bağlı olduğun Arı Yetiştiricileri Birliği",
    steps: [
      "Kimliğinle İlçe Tarım ve Orman Müdürlüğü'ne veya Arı Yetiştiricileri Birliği'ne başvur.",
      "Kovanlarının kayıt altına alınmasını iste. Kaydın varsa belgenin çıktısını iste.",
      "Belgenin fotoğrafını çek ve buraya yükle.",
    ],
    cost: "Genellikle ücretsiz",
    time: "Birkaç gün",
  },
  hayvan: {
    key: "hayvan",
    name: "Hayvancılık İşletme Tescil Belgesi",
    what: "Tavuklarının kayıtlı bir işletmede bulunduğunu gösterir. Yumurtayı internetten satabilmek için gereklidir.",
    where: "Buharkent İlçe Tarım ve Orman Müdürlüğü",
    steps: [
      "Kimliğinle İlçe Tarım ve Orman Müdürlüğü'ne başvur.",
      "Kümesini hayvancılık işletmesi olarak kayıt ettirmek istediğini söyle.",
      "Onaylı işletme tescil belgeni al, fotoğrafını çekip buraya yükle.",
    ],
    cost: "Değişebilir, müdürlüğe sor",
    time: "Birkaç gün – birkaç hafta",
  },
  sikim: {
    key: "sikim",
    name: "Yağhane / Fabrika Sıkım Fişi",
    what: "Zeytinini lisanslı bir yağhanede sıktırdığını gösteren fiş. Müşteriye yağının nereden ve nasıl çıktığını gösterir, güven verir.",
    where: "Zeytinini sıktırdığın yağhane veya fabrika",
    steps: [
      "Zeytinini sıktırırken yağhaneden sıkım fişini veya makbuzunu iste. Çoğu yağhane zaten verir.",
      "Fiş elindeyse fotoğrafını çek, yazılar okunacak şekilde olsun.",
      "Bu yılın sıkım fişini buraya yükle. Her sezon yeni fişini ekleyebilirsin.",
    ],
    cost: "Ücretsiz",
    time: "Hemen",
    help: "Fişi kaybettiysen sıktırdığın yağhaneden tekrar isteyebilirsin; kayıtlarında olur.",
  },
  hijyen: {
    key: "hijyen",
    name: "Hijyen Eğitimi Sertifikası",
    what: "Gıdayı temiz ve güvenli şekilde hazırlamayı öğrendiğini gösteren belge. Gıda İşletme Kayıt Belgesi almak için ilk adımdır.",
    where: "Buharkent Halk Eğitim Merkezi",
    steps: [
      "Buharkent Halk Eğitim Merkezi'ni ara ya da git; 'Hijyen eğitimi kursu ne zaman açılacak?' diye sor.",
      "Kurs açıldığında kimliğinle kaydol. Eğitim kısa sürer, birkaç gün içinde biter.",
      "Kursun sonunda verilen sertifikanın fotoğrafını çek ve buraya yükle.",
    ],
    cost: "Halk Eğitim'de çoğu zaman ücretsiz",
    time: "Birkaç gün (kursun açılmasına bağlı)",
    help: "Kurs açılmıyorsa derneğe haber ver. Yeterli kişi olunca Halk Eğitim Merkezi ile birlikte toplu kurs açtırmaya çalışıyoruz.",
  },
  gikb: {
    key: "gikb",
    name: "Gıda İşletme Kayıt Belgesi",
    what: "Gıda hazırladığın yerin (evdeki mutfağın dahil) temiz ve kayıtlı olduğunu gösterir. Reçel, salça, incir cipsi gibi işlenmiş gıdaları satmak için gereklidir.",
    where: "Buharkent İlçe Tarım ve Orman Müdürlüğü",
    steps: [
      "Önce Hijyen Eğitimi Sertifikanı al.",
      "Sertifikan ve kimliğinle İlçe Tarım ve Orman Müdürlüğü'ne git; evde ürettiğin gıdalar için 'İşletme Kayıt Belgesi' almak istediğini söyle.",
      "Görevliler üretim yaptığın mutfağı kontrol etmeye gelebilir; mutfağının temiz ve düzenli olması yeterlidir.",
      "Belgen düzenlenince fotoğrafını çek ve buraya yükle.",
    ],
    cost: "Harç ücreti var; güncel tutarı müdürlüğe sor",
    time: "Birkaç hafta",
    help: "Bu süreçte takılırsan derneğe yaz; hangi belgelerin istendiğini birlikte netleştirelim.",
  },
  muafiyet: {
    key: "muafiyet",
    name: "Esnaf Vergi Muafiyeti Belgesi",
    what: "Evde ürettiklerini internetten satarken vergi ödemeden ve defter tutmadan satış yapabileceğini gösterir.",
    where: "Vergi dairesi veya İnternet Vergi Dairesi",
    steps: [
      "İnternet Vergi Dairesi'ne (dijital.gib.gov.tr) e-Devlet şifrenle gir.",
      "'Esnaf Vergi Muafiyeti Talep Dilekçesi'ni bul ve doldur. İstersen kimliğinle vergi dairesine giderek de başvurabilirsin.",
      "Belgen hazır olunca bankadan internet satışların için ayrı bir hesap aç.",
      "Belgeni buraya yükle; IBAN olarak bu hesabı kullan.",
    ],
    cost: "Ücretsiz",
    time: "Genellikle birkaç gün",
    help: "e-Devlet şifren yoksa PTT'den kimliğinle birkaç liraya alabilirsin.",
    link: { label: "İnternet Vergi Dairesi", href: "https://dijital.gib.gov.tr" },
  },
  levha: {
    key: "levha",
    name: "Vergi Levhası",
    what: "Şahıs şirketin veya şirketin varsa, vergi mükellefi olduğunu gösterir.",
    where: "İnternet Vergi Dairesi",
    steps: ["İnternet Vergi Dairesi'nden güncel vergi levhanı indir.", "Buraya yükle."],
    cost: "Ücretsiz",
    time: "Hemen",
    link: { label: "İnternet Vergi Dairesi", href: "https://dijital.gib.gov.tr" },
  },
};

export const PRODUCT_TYPES: ProductType[] = [
  { key: "taze-meyve-sebze", name: "Taze meyve ve sebze", examples: "Taze incir, üzüm, domates, biber", group: "tarla", icon: Apple, category: "meyve-sebze", docs: ["cks"] },
  {
    key: "kuru-meyve", name: "Kuru incir ve kuru meyve", examples: "Güneşte kurutulmuş bütün incir, kuru üzüm", group: "tarla", icon: Nut, category: "incir-kuru-urunler", docs: ["cks"],
    note: "Bu seçenek, meyveyi bütün halde güneşte kuruttuğun durumlar için. Dilimleyip fırında veya kurutucuda hazırlıyorsan 'İncir cipsi' seçeneğini seç.",
  },
  {
    key: "zeytinyagi", name: "Zeytinyağı", examples: "Kendi zeytinini yağhanede sıktırdığın yağ", group: "tarla", icon: Droplets, category: "zeytin-zeytinyagi", docs: ["cks", "sikim"],
    note: "Yağı kendin şişeleyip etiketliyorsan ek kayıt gerekip gerekmediğini İlçe Tarım'a sor.",
  },
  {
    key: "bal", name: "Bal ve arı ürünleri", examples: "Süzme bal, petek bal, polen", group: "hayvansal", icon: Hexagon, category: "bal-recel-pekmez", docs: ["aks"],
    note: "Balı kavanozlayıp kendi etiketinle satıyorsan Gıda İşletme Kayıt Belgesi de gerekebilir; İlçe Tarım'a sor.",
  },
  {
    key: "yumurta", name: "Yumurta", examples: "Kendi tavuklarının köy yumurtası", group: "hayvansal", icon: Egg, category: "sut-yumurta", docs: ["hayvan", "gikb"],
    note: "Küçük üreticiye tanınan kolaylık internetten satışı kapsamıyor; bu yüzden işletme kaydı şart.",
  },
  {
    key: "incir-cipsi", name: "İncir cipsi ve fırınlanmış atıştırmalık", examples: "İncir cipsi, meyve cipsi, fırında kurutulmuş domates", group: "ev-gida", icon: Cookie, category: "incir-kuru-urunler", docs: ["hijyen", "gikb"],
    note: "Dilimleyip fırında, kurutucuda veya özel bir işlemle hazırladığın ürünler 'işlenmiş gıda' sayılır.",
  },
  { key: "recel-pekmez-salca", name: "Reçel, pekmez, salça", examples: "İncir reçeli, üzüm pekmezi, domates salçası", group: "ev-gida", icon: Cherry, category: "bal-recel-pekmez", docs: ["hijyen", "gikb"] },
  { key: "tarhana-eriste", name: "Tarhana, erişte, kuru gıda", examples: "Ev tarhanası, erişte, kuskus", group: "ev-gida", icon: Wheat, category: "incir-kuru-urunler", docs: ["hijyen", "gikb"] },
  { key: "sofralik-zeytin", name: "Sofralık zeytin", examples: "Kırma zeytin, salamura zeytin", group: "ev-gida", icon: Droplets, category: "zeytin-zeytinyagi", docs: ["hijyen", "gikb"] },
  { key: "orgu-dokuma", name: "Örgü ve dokuma", examples: "Patik, yelek, kilim, dantel", group: "el-emegi", icon: Scissors, category: "el-emegi", docs: [] },
  { key: "taki-aksesuar", name: "Takı ve aksesuar", examples: "Boncuk, oya, el yapımı takı", group: "el-emegi", icon: Gem, category: "el-emegi", docs: [] },
  { key: "ahsap-dekor", name: "Ahşap ve dekorasyon", examples: "Ahşap kaşık, sepet, süs eşyası", group: "el-emegi", icon: TreePine, category: "el-emegi", docs: [] },
];

export const TAX_OPTIONS: { key: TaxStatus; title: string; text: string; doc?: DocKey; groups: Group[] }[] = [
  {
    key: "ciftci",
    title: "Sadece kendi tarım ürünümü satıyorum",
    text: "Kendi tarlanda, bahçende yetiştirdiğin veya kendi arılarından, tavuklarından elde ettiğin ürünleri satıyorsan çiftçi olarak satış yaparsın.",
    groups: ["tarla", "hayvansal"],
  },
  {
    key: "muaf910",
    title: "Sadece internetten satıyorum (esnaf muafiyeti)",
    text: "Evde ürettiklerini sadece internetten satıyorsan vergi muafiyeti belgesi alırsın. 2026 için yıllık satış sınırı 1.900.000 TL. Bankan bu hesaba gelen paradan %4 vergiyi kendisi keser, senin ek bir işin olmaz.",
    doc: "muafiyet",
    groups: ["tarla", "hayvansal", "ev-gida", "el-emegi"],
  },
  {
    key: "muaf96",
    title: "Pazarda, kermeste de satıyorum (esnaf muafiyeti)",
    text: "Hem internetten hem pazar/kermes gibi yerlerde satıyorsan belge almana gerek yok; ama internet satışların yılda 396.360 TL'yi (2026) geçmemeli.",
    groups: ["tarla", "hayvansal", "ev-gida", "el-emegi"],
  },
  {
    key: "mukellef",
    title: "Vergi levham / şirketim var",
    text: "Şahıs şirketin veya şirketin varsa normal vergi düzenine göre satış yaparsın. Burada da sadece kendi ürettiğin ürünleri satabilirsin.",
    doc: "levha",
    groups: ["tarla", "hayvansal", "ev-gida", "el-emegi"],
  },
];

export const HELP_WHATSAPP = "905544411167";

export const whatsappLink = (text: string) => `https://wa.me/${HELP_WHATSAPP}?text=${encodeURIComponent(text)}`;

/** Seçilen ürünlere uyan vergi seçenekleri ve önerilen seçenek */
export function taxOptionsFor(typeKeys: string[]) {
  const groups = new Set(PRODUCT_TYPES.filter((t) => typeKeys.includes(t.key)).map((t) => t.group));
  const options = groups.size ? TAX_OPTIONS.filter((o) => [...groups].every((g) => o.groups.includes(g))) : TAX_OPTIONS;
  const onlyFarm = groups.size > 0 && [...groups].every((g) => g === "tarla" || g === "hayvansal");
  const recommended: TaxStatus | undefined = groups.size === 0 ? undefined : onlyFarm ? "ciftci" : "muaf910";
  return { options, recommended };
}

/** Seçimlere göre gerekli belgeler; her belgenin hangi ürün için istendiği de döner */
export function requirementsFor(typeKeys: string[], tax?: TaxStatus) {
  const types = PRODUCT_TYPES.filter((t) => typeKeys.includes(t.key));
  const map = new Map<DocKey, string[]>();
  types.forEach((t) => t.docs.forEach((d) => map.set(d, [...(map.get(d) ?? []), t.name])));

  const taxOpt = TAX_OPTIONS.find((o) => o.key === tax);
  if (taxOpt?.doc) map.set(taxOpt.doc, [...(map.get(taxOpt.doc) ?? []), "Vergi durumun"]);

  return {
    types,
    docs: [...map.entries()].map(([k, forList]) => ({ doc: DOCS[k], for: forList })),
  };
}
/** Esnaf muafiyetinde yıllık internet satış sınırları (2026). Her yıl güncellenmeli. */
export const SALES_LIMITS: Partial<Record<TaxStatus, { limit: number; year: number; text: string }>> = {
  muaf910: { limit: 1_900_000, year: 2026, text: "Sadece internetten satış (GVK 9/10) yıllık sınırı" },
  muaf96: { limit: 396_360, year: 2026, text: "Pazar + internet satışında (GVK 9/6) internet satış sınırı" },
};
