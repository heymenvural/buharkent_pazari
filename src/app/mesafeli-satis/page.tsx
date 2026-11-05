import type { Metadata } from "next";
import LegalPage, { type Section } from "@/components/legal/LegalPage";
import { ORG } from "@/lib/legal";

export const metadata: Metadata = { title: "Mesafeli Satış Sözleşmesi" };

const sections: Section[] = [
  {
    id: "taraflar",
    title: "Taraflar",
    blocks: [
      "SATICI: Siparişe konu ürünü üreten ve satan üretici. Satıcının adı ve iletişim bilgileri ürün sayfasında ve sipariş özetinde ayrıca belirtilir.",
      "ALICI: Platform üzerinden sipariş veren gerçek kişi.",
      `ARACI HİZMET SAĞLAYICI: ${ORG.name} (${ORG.short}), ${ORG.address}, ${ORG.email}. Dernek, 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun kapsamında Satıcı ile Alıcı arasında aracılık hizmeti sunar; satışa konu ürünlerin satıcısı değildir.`,
    ],
  },
  {
    id: "konu",
    title: "Sözleşmenin konusu",
    blocks: [
      "Bu sözleşme, Alıcı'nın Platform üzerinden elektronik ortamda sipariş verdiği ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerini düzenler.",
    ],
  },
  {
    id: "urun-ve-fiyat",
    title: "Ürün, fiyat ve kargo bilgileri",
    blocks: [
      "Ürünün temel nitelikleri, miktarı, satış fiyatı (vergiler dahil), kargo ücreti ve toplam ödenecek tutar sipariş özetinde gösterilir ve sipariş onayıyla birlikte Alıcı'ya e-posta ile iletilir.",
      "Aynı satıcıdan alınan ürünler tek paket halinde gönderilir ve tek kargo ücreti uygulanır.",
    ],
  },
  {
    id: "odeme",
    title: "Ödeme",
    blocks: [
      "Ödeme, sipariş sırasında seçilen yöntemle (havale/EFT veya kapıda ödeme) yapılır. Havale/EFT ile ödemelerde ödemenin [2] iş günü içinde yapılmaması halinde sipariş iptal edilebilir.",
    ],
  },
  {
    id: "teslimat",
    title: "Teslimat",
    blocks: [
      "Satıcı, ürünü ürün sayfasında belirtilen süre içinde kargoya verir. Teslimat, her halükârda siparişin onaylanmasından itibaren yasal süre olan otuz gün içinde gerçekleştirilir.",
      "Ürünün teslim edilememesi halinde Alıcı bilgilendirilir ve ödenen tutar on dört gün içinde iade edilir.",
    ],
  },
  {
    id: "cayma-hakki",
    title: "Cayma hakkı",
    blocks: [
      "Alıcı, ürünü teslim aldığı tarihten itibaren on dört gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.",
      `Cayma hakkının kullanılması için bu süre içinde ${ORG.email} adresine yazılı bildirimde bulunulması yeterlidir. Ürün bedeli, cayma bildiriminin ulaşmasından itibaren on dört gün içinde iade edilir.`,
    ],
  },
  {
    id: "cayma-istisnalari",
    title: "Cayma hakkının istisnaları",
    blocks: [
      "Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi uyarınca aşağıdaki ürünlerde cayma hakkı kullanılamaz:",
      {
        list: [
          "Çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler (taze meyve ve sebze, yumurta, süt ürünleri gibi)",
          "Teslimden sonra ambalajı açılmış olan ve sağlık ile hijyen açısından iadesi uygun olmayan gıda ürünleri",
          "Alıcı'nın istekleri veya kişisel ihtiyaçları doğrultusunda özel olarak hazırlanan ürünler",
        ],
      },
    ],
  },
  {
    id: "ayipli-mal",
    title: "Ayıplı ürün",
    blocks: [
      "Teslim edilen ürünün ayıplı olması halinde Alıcı, 6502 sayılı Kanun'un 11. maddesinde sayılan seçimlik haklarını (sözleşmeden dönme, bedel indirimi, ücretsiz onarım veya ayıpsız misli ile değişim) kullanabilir. Bu durumda kargo ücreti Satıcı'ya aittir.",
    ],
  },
  {
    id: "uyusmazlik",
    title: "Uyuşmazlıkların çözümü",
    blocks: [
      "Bu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığınca her yıl ilan edilen parasal sınırlar dahilinde Alıcı'nın yerleşim yerindeki veya işlemin yapıldığı yerdeki tüketici hakem heyetleri, bu sınırları aşan durumlarda tüketici mahkemeleri yetkilidir.",
    ],
  },
  {
    id: "yururluk",
    title: "Yürürlük",
    blocks: [
      "Alıcı, sipariş sırasında bu sözleşmeyi ve ön bilgilendirme formunu okuduğunu ve kabul ettiğini elektronik ortamda onaylar. Sözleşme bu onayla yürürlüğe girer.",
    ],
  },
];

export default function DistanceSalesPage() {
  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <LegalPage
        current="/mesafeli-satis"
        title="Mesafeli Satış Sözleşmesi"
        intro="Buharkent Pazarı üzerinden yaptığınız alışverişlerde sizin, üreticinin ve derneğin hak ve sorumluluklarını bu sözleşme belirler."
        sections={sections}
      />
    </main>
  );
}