import type { Metadata } from "next";
import LegalPage, { type Section } from "@/components/legal/LegalPage";
import { ORG } from "@/lib/legal";

export const metadata: Metadata = { title: "Gizlilik Politikası" };

const sections: Section[] = [
  {
    id: "kapsam",
    title: "Kapsam",
    blocks: [
      `Bu Gizlilik Politikası, ${ORG.name} tarafından işletilen ${ORG.platform} platformunu (${ORG.site}) kullanan ziyaretçi, üye, alıcı ve üreticilerin bilgilerinin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar. Kişisel verilerin işlenmesine ilişkin ayrıntılar KVKK Aydınlatma Metni'nde yer alır.`,
    ],
  },
  {
    id: "toplanan-bilgiler",
    title: "Topladığımız bilgiler",
    blocks: [
      {
        list: [
          "Üyelik sırasında verdiğiniz ad, soyad ve e-posta adresi",
          "Sipariş sırasında verdiğiniz telefon numarası ve teslimat adresi",
          "Siparişlerinize ve sepetinize ilişkin bilgiler",
          "Güvenlik amacıyla tutulan oturum ve giriş kayıtları",
        ],
      },
    ],
  },
  {
    id: "google-ile-giris",
    title: "Google ile giriş",
    blocks: [
      "Google ile giriş yapmayı seçtiğinizde Google'dan yalnızca adınızı, e-posta adresinizi ve profil fotoğrafınızı alırız. Google hesabınızın şifresine, e-postalarınıza, kişilerinize veya diğer Google verilerinize hiçbir şekilde erişmeyiz.",
      "Bu bilgiler yalnızca hesabınızı oluşturmak, sizi tanımak ve siparişlerinizi yönetmek için kullanılır.",
    ],
  },
  {
    id: "kullanim",
    title: "Bilgileri nasıl kullanıyoruz",
    blocks: [
      {
        list: [
          "Hesabınızı oluşturmak ve yönetmek",
          "Siparişlerinizi üreticiye iletmek ve teslimatı sağlamak",
          "Sorularınızı ve taleplerinizi yanıtlamak",
          "Platformun güvenliğini sağlamak ve kötüye kullanımı önlemek",
          "İzin vermeniz halinde kampanya ve hasat haberleri göndermek",
        ],
      },
    ],
  },
  {
    id: "paylasim",
    title: "Bilgilerin paylaşılması",
    blocks: [
      "Bilgilerinizi hiçbir şekilde satmaz veya reklam amacıyla üçüncü kişilere kiralamayız. Bilgileriniz yalnızca siparişinizi yerine getirmek için gerekli olduğu ölçüde ilgili üreticiyle, kargo ve ödeme kuruluşlarıyla ve yasal zorunluluk halinde yetkili kurumlarla paylaşılır.",
    ],
  },
  {
    id: "guvenlik",
    title: "Güvenlik",
    blocks: [
      {
        list: [
          "Platformla aranızdaki tüm bağlantılar şifrelenir (HTTPS).",
          "Şifreler açık metin olarak saklanmaz; geri döndürülemez şekilde şifrelenerek (hash) tutulur.",
          "Verilere erişim yalnızca yetkili kişilerle sınırlıdır.",
          "Giriş ve kayıt denemeleri kötüye kullanıma karşı sınırlandırılır.",
        ],
      },
    ],
  },
  {
    id: "saklama",
    title: "Saklama süresi",
    blocks: [
      "Bilgileriniz üyeliğiniz devam ettiği sürece ve ilgili mevzuatta öngörülen saklama süreleri boyunca saklanır. Bu sürelerin sonunda silinir, yok edilir veya anonim hale getirilir.",
    ],
  },
  {
    id: "hesap-silme",
    title: "Hesabınızı silme",
    blocks: [
      `Hesabınızın ve bilgilerinizin silinmesini istediğinizde ${ORG.email} adresine yazmanız yeterlidir. Yasal olarak saklanması zorunlu kayıtlar dışındaki bilgileriniz silinir.`,
    ],
  },
  {
    id: "cocuklar",
    title: "Çocukların gizliliği",
    blocks: ["Platform 18 yaşından küçüklere yönelik değildir ve bilerek 18 yaşından küçüklerden kişisel bilgi toplamayız."],
  },
  {
    id: "degisiklikler",
    title: "Değişiklikler ve iletişim",
    blocks: [
      "Bu politika gerektiğinde güncellenebilir; güncel sürüm her zaman bu sayfada yayımlanır.",
      `Sorularınız için: ${ORG.email} · ${ORG.phone}`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <LegalPage
        current="/gizlilik"
        title="Gizlilik Politikası"
        intro="Buharkent Pazarı'nda hangi bilgileri topladığımızı, bunları nasıl kullandığımızı ve nasıl koruduğumuzu sade bir dille açıklıyoruz."
        sections={sections}
      />
    </main>
  );
}