import type { Metadata } from "next";
import LegalPage, { type Section } from "@/components/legal/LegalPage";
import { ORG } from "@/lib/legal";

export const metadata: Metadata = { title: "KVKK Aydınlatma Metni" };

const sections: Section[] = [
  {
    id: "veri-sorumlusu",
    title: "Veri sorumlusu",
    blocks: [
      `6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca kişisel verileriniz, veri sorumlusu sıfatıyla ${ORG.name} ("Dernek") tarafından, ${ORG.platform} platformu ("Platform") aracılığıyla aşağıda açıklanan kapsamda işlenmektedir.`,
      `Adres: ${ORG.address} · E-posta: ${ORG.email} · Telefon: ${ORG.phone}`,
    ],
  },
  {
    id: "islenen-veriler",
    title: "İşlenen kişisel veriler",
    blocks: [
      {
        list: [
          "Kimlik bilgileri: ad, soyad",
          "İletişim bilgileri: e-posta adresi, telefon numarası, teslimat adresi",
          "Müşteri işlem bilgileri: sipariş, sepet, ödeme yöntemi tercihi, talep ve şikâyet kayıtları",
          "İşlem güvenliği bilgileri: IP adresi, oturum ve giriş kayıtları",
          "Google ile girişte: Google hesabınıza ait ad, e-posta adresi ve profil fotoğrafı",
          "Üretici başvurularında: mahalle/köy bilgisi, üretilen ürünler ve üretim bilgileri",
          "Pazarlama bilgileri: yalnızca açık rızanız bulunması halinde bülten aboneliği",
        ],
      },
    ],
  },
  {
    id: "amaclar",
    title: "İşleme amaçları",
    blocks: [
      {
        list: [
          "Üyelik hesabının oluşturulması ve yönetilmesi",
          "Siparişlerin alınması, ilgili üreticiye iletilmesi, teslimat ve iade süreçlerinin yürütülmesi",
          "Ödeme süreçlerinin yürütülmesi",
          "Talep, soru ve şikâyetlerin yanıtlanması",
          "Bilgi güvenliğinin sağlanması, dolandırıcılık ve kötüye kullanımın önlenmesi",
          "Mevzuattan kaynaklanan yükümlülüklerin yerine getirilmesi",
          "Üretici başvurularının değerlendirilmesi",
          "Açık rızanız olması halinde kampanya ve bilgilendirme iletilerinin gönderilmesi",
        ],
      },
    ],
  },
  {
    id: "hukuki-sebepler",
    title: "Hukuki sebepler",
    blocks: [
      "Kişisel verileriniz KVKK'nın 5/2 maddesinde yer alan; bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (c), veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi (ç) ve temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaatlerimiz için zorunlu olması (f) hukuki sebeplerine dayanılarak işlenir.",
      "Pazarlama amaçlı iletişim gibi bu sebeplerin kapsamı dışında kalan işlemler yalnızca KVKK'nın 5/1 maddesi uyarınca açık rızanıza dayanılarak yapılır.",
    ],
  },
  {
    id: "aktarim",
    title: "Kişisel verilerin aktarılması",
    blocks: [
      "Kişisel verileriniz yukarıdaki amaçlarla sınırlı olarak aşağıdaki taraflara aktarılabilir:",
      {
        list: [
          "Siparişinizin satıcısı olan üreticiye: teslimatın yapılabilmesi için ad, soyad, telefon ve teslimat adresi",
          "Kargo ve lojistik firmalarına",
          "Ödeme hizmeti sağlayan kuruluşlara",
          "Talep halinde yetkili kamu kurum ve kuruluşlarına",
          "Platformun barındırma, veritabanı ve e-posta altyapısını sağlayan hizmet sağlayıcılara",
        ],
      },
      "Platformun barındırma ve veritabanı hizmetleri yurt dışında bulunan sunucular üzerinden sağlanmaktadır. Bu kapsamdaki aktarımlar KVKK'nın 9. maddesinde öngörülen şartlara uygun olarak gerçekleştirilir.",
    ],
  },
  {
    id: "toplama-yontemi",
    title: "Toplama yöntemi",
    blocks: [
      "Kişisel verileriniz; Platformdaki üyelik, sipariş, iletişim ve başvuru formları, Google ile giriş hizmeti ve zorunlu çerezler aracılığıyla elektronik ortamda, otomatik veya kısmen otomatik yöntemlerle toplanır.",
    ],
  },
  {
    id: "haklariniz",
    title: "Haklarınız",
    blocks: [
      "KVKK'nın 11. maddesi uyarınca veri sorumlusuna başvurarak:",
      {
        list: [
          "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
          "İşlenmişse buna ilişkin bilgi talep etme",
          "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme",
          "Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme",
          "Eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme",
          "KVKK'nın 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme",
          "Düzeltme ve silme işlemlerinin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme",
          "Münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme",
          "Kanuna aykırı işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme",
        ],
      },
      "haklarına sahipsiniz.",
    ],
  },
  {
    id: "basvuru",
    title: "Başvuru yöntemi",
    blocks: [
      `Taleplerinizi, kimliğinizi tespit edici bilgilerle birlikte ${ORG.email} adresine e-posta göndererek veya ${ORG.address} adresine yazılı olarak iletebilirsiniz.`,
      "Başvurunuz, talebin niteliğine göre en kısa sürede ve en geç otuz gün içinde ücretsiz olarak sonuçlandırılır. İşlemin ayrıca bir maliyet gerektirmesi halinde Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret alınabilir.",
    ],
  },
];

export default function KvkkPage() {
  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <LegalPage
        current="/kvkk"
        title="KVKK Aydınlatma Metni"
        intro="Kişisel verilerinizin güvenliği bizim için önemlidir. Bu metin, Buharkent Pazarı'nı kullanırken hangi verilerinizin, hangi amaçlarla ve nasıl işlendiğini açıklar."
        sections={sections}
      />
    </main>
  );
}