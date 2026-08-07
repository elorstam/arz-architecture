import {
  legalDocuments,
  legalSlugs,
} from "@/lib/legal/legal-content";

export const legalTranslationSource: Record<string, string> = (() => {
  const source: Record<string, string> = {
    "legal.ui.home": "Ana Sayfa",
    "legal.ui.legal": "Yasal",
    "legal.ui.breadcrumb": "İçerik yolu",
    "legal.ui.contents": "İçindekiler",
    "legal.ui.companyInfo": "Şirket ve iletişim bilgileri",
    "legal.ui.lastUpdated": "Son güncelleme",

    "legal.ui.translationNotice":
      "Bu çeviri bilgilendirme amacıyla sunulmaktadır. Hukuki uyuşmazlıklarda Türkçe metin esas alınır.",

    "legal.ui.reviewNote":
      "Hukuki inceleme gerekli: Bu bölüm somut hizmet, müşteri sıfatı ve güncel mevzuata göre yetkili hukuk danışmanı tarafından doğrulanmalıdır.",

    "legal.ui.providerCategories":
      "Yapılandırılmış sağlayıcı kategorileri",

    "legal.ui.providerTransferSuffix":
      "yurt dışı aktarım ihtimali yayımdan önce doğrulanacaktır.",

    "legal.company.brandName": "Marka adı",
    "legal.company.legalName": "Resmî ticari unvan",
    "legal.company.companyType": "Şirket türü",
    "legal.company.taxOffice": "Vergi dairesi",
    "legal.company.taxNumber": "Vergi numarası",
    "legal.company.mersisNumber": "MERSİS",
    "legal.company.tradeRegistryNumber": "Ticaret sicili",
    "legal.company.registeredAddress": "Açık adres",
    "legal.company.phone": "Telefon",
    "legal.company.email": "E-posta",
    "legal.company.legalNoticeEmail": "Hukuki bildirim",
    "legal.company.kvkkApplicationEmail": "KVKK başvurusu",
    "legal.company.kepAddress": "KEP",
    "legal.company.websiteUrl": "Web sitesi",
  };

  for (const slug of legalSlugs) {
    const document = legalDocuments[slug];
    const prefix = `legal.${slug}`;

    source[`${prefix}.title`] = document.title;
    source[`${prefix}.shortTitle`] = document.shortTitle;
    source[`${prefix}.description`] = document.description;

    document.sections.forEach((section, sectionIndex) => {
      const sectionPrefix =
        `${prefix}.sections.${sectionIndex + 1}`;

      source[`${sectionPrefix}.title`] = section.title;

      section.paragraphs.forEach((paragraph, paragraphIndex) => {
        source[
          `${sectionPrefix}.paragraphs.${paragraphIndex + 1}`
        ] = paragraph;
      });
    });
  }

  return source;
})();