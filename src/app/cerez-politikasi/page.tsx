import type { Metadata } from "next";
import LegalPage, { type Section } from "@/components/legal/LegalPage";
import { ORG } from "@/lib/legal";

export const metadata: Metadata = { title: "Çerez Politikası" };

const sections: Section[] = [
  {
    id: "cerez-nedir",
    title: "Çerez nedir?",
    blocks: [
      "Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınıza kaydedilen küçük metin dosyalarıdır. Benzer şekilde tarayıcının yerel depolama alanı da bazı tercihlerinizi hatırlamak için kullanılır.",
    ],
  },
  {
    id: "zorunlu",
    title: "Zorunlu çerezler",
    blocks: [
      "Platformun çalışması için gereklidir ve kapatılamaz:",
      {
        list: [
          "Oturum çerezi: giriş yaptığınızı hatırlar (authjs.session-token)",
          "Güvenlik çerezi: sahte form gönderimlerini engeller (authjs.csrf-token)",
          "Yönlendirme çerezi: giriş sonrası kaldığınız sayfaya dönmenizi sağlar (authjs.callback-url)",
        ],
      },
    ],
  },
  {
    id: "yerel-depolama",
    title: "Yerel depolama",
    blocks: [
      {
        list: [
          "Sepet bilgisi: üye olmadan da sepetinizin korunmasını sağlar (buharkent-cart)",
          "Giriş animasyonu tercihi: açılış animasyonunun her sayfada tekrar oynamamasını sağlar (bp-intro)",
        ],
      },
      "Bu veriler yalnızca sizin tarayıcınızda tutulur ve sunucularımıza gönderilmez.",
    ],
  },
  {
    id: "analitik",
    title: "Analitik ve pazarlama çerezleri",
    blocks: [
      "Platform şu anda analitik veya reklam amaçlı çerez kullanmamaktadır. İleride kullanılması halinde bu politika güncellenecek ve bu çerezler yalnızca açık onayınızla etkinleştirilecektir.",
    ],
  },
  {
    id: "yonetim",
    title: "Çerezleri nasıl yönetebilirsiniz?",
    blocks: [
      "Tarayıcınızın ayarlarından çerezleri silebilir veya engelleyebilirsiniz. Zorunlu çerezleri engellemeniz halinde giriş yapma ve sepet gibi özellikler çalışmayabilir.",
      `Sorularınız için: ${ORG.email}`,
    ],
  },
];

export default function CookiePage() {
  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <LegalPage
        current="/cerez-politikasi"
        title="Çerez Politikası"
        intro="Buharkent Pazarı yalnızca sitenin çalışması için gerekli çerezleri kullanır. Reklam veya takip amaçlı çerez kullanmıyoruz."
        sections={sections}
      />
    </main>
  );
}