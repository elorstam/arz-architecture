import Link from "next/link";

import PremiumFooter from "@/components/PremiumFooter";
import {
  companyLegalConfig as company,
  displayCompanyValue,
} from "@/lib/legal/company-config";
import type {
  LegalDocument,
  LegalSlug,
} from "@/lib/legal/legal-content";
import { getSiteMessages } from "@/lib/site-translation-store";

import PrintButton from "./PrintButton";
import styles from "./LegalPage.module.css";

type Props = {
  document: LegalDocument;
  locale: string;
  slug: LegalSlug;
};

export default async function LegalPage({
  document,
  locale,
  slug,
}: Props) {
  const messages =
    await getSiteMessages(locale);

  const t = (
    key: string,
    fallback: string,
  ) => {
    const value = messages[key];

    return value?.trim()
      ? value
      : fallback;
  };

  const prefix = `legal.${slug}`;

  const localizedDocument: LegalDocument = {
    title: t(
      `${prefix}.title`,
      document.title,
    ),

    shortTitle: t(
      `${prefix}.shortTitle`,
      document.shortTitle,
    ),

    description: t(
      `${prefix}.description`,
      document.description,
    ),

    sections: document.sections.map(
      (section, sectionIndex) => {
        const sectionPrefix =
          `${prefix}.sections.${sectionIndex + 1}`;

        return {
          ...section,

          title: t(
            `${sectionPrefix}.title`,
            section.title,
          ),

          paragraphs:
            section.paragraphs.map(
              (
                paragraph,
                paragraphIndex,
              ) =>
                t(
                  `${sectionPrefix}.paragraphs.${paragraphIndex + 1}`,
                  paragraph,
                ),
            ),
        };
      },
    ),
  };

  const date =
    new Intl.DateTimeFormat(
      locale === "tr"
        ? "tr-TR"
        : locale,
      {
        dateStyle: "long",
        timeZone:
          "Europe/Istanbul",
      },
    ).format(
      new Date(
        `${company.lastUpdatedAt}T12:00:00+03:00`,
      ),
    );

  const labels: [
    string,
    string | undefined,
  ][] = [
    [
      t(
        "legal.company.brandName",
        "Marka adı",
      ),
      company.brandName,
    ],

    [
      t(
        "legal.company.legalName",
        "Resmî ticari unvan",
      ),
      company.legalName,
    ],

    [
      t(
        "legal.company.companyType",
        "Şirket türü",
      ),
      company.companyType,
    ],

    [
      t(
        "legal.company.taxOffice",
        "Vergi dairesi",
      ),
      company.taxOffice,
    ],

    [
      t(
        "legal.company.taxNumber",
        "Vergi numarası",
      ),
      company.taxNumber,
    ],

    [
      t(
        "legal.company.mersisNumber",
        "MERSİS",
      ),
      company.mersisNumber,
    ],

    [
      t(
        "legal.company.tradeRegistryNumber",
        "Ticaret sicili",
      ),
      company.tradeRegistryNumber,
    ],

    [
      t(
        "legal.company.registeredAddress",
        "Açık adres",
      ),
      company.registeredAddress,
    ],

    [
      t(
        "legal.company.phone",
        "Telefon",
      ),
      company.phone,
    ],

    [
      t(
        "legal.company.email",
        "E-posta",
      ),
      company.email,
    ],

    [
      t(
        "legal.company.legalNoticeEmail",
        "Hukuki bildirim",
      ),
      company.legalNoticeEmail,
    ],

    [
      t(
        "legal.company.kvkkApplicationEmail",
        "KVKK başvurusu",
      ),
      company.kvkkApplicationEmail,
    ],

    [
      t(
        "legal.company.kepAddress",
        "KEP",
      ),
      company.kepAddress,
    ],

    [
      t(
        "legal.company.websiteUrl",
        "Web sitesi",
      ),
      company.websiteUrl,
    ],
  ];

  const homeLabel = t(
    "legal.ui.home",
    "Ana Sayfa",
  );

  const legalLabel = t(
    "legal.ui.legal",
    "Yasal",
  );

  const breadcrumbLabel = t(
    "legal.ui.breadcrumb",
    "İçerik yolu",
  );

  const contentsLabel = t(
    "legal.ui.contents",
    "İçindekiler",
  );

  const companyInfoLabel = t(
    "legal.ui.companyInfo",
    "Şirket ve iletişim bilgileri",
  );

  return (
    <main className={styles.page}>
      {locale !== "tr" && (
        <p
          className={styles.fallback}
          lang={locale}
        >
          {t(
            "legal.ui.translationNotice",
            "Bu çeviri bilgilendirme amacıyla sunulmaktadır. Hukuki uyuşmazlıklarda Türkçe metin esas alınır.",
          )}
        </p>
      )}

      <div
        className={styles.shell}
        lang={locale}
      >
        <nav
          aria-label={
            breadcrumbLabel
          }
          className={
            styles.breadcrumb
          }
        >
          <Link
            href={`/${locale}`}
          >
            {homeLabel}
          </Link>

          <span aria-hidden>
            {" / "}
          </span>

          <span>
            {legalLabel}
          </span>

          <span aria-hidden>
            {" / "}
          </span>

          <span aria-current="page">
            {
              localizedDocument.shortTitle
            }
          </span>
        </nav>

        <header
          className={styles.header}
        >
          <p
            className={
              styles.eyebrow
            }
          >
            ARZ Mimarlık ·{" "}
            {legalLabel}
          </p>

          <h1
            className={
              styles.title
            }
          >
            {
              localizedDocument.title
            }
          </h1>

          <p
            className={
              styles.description
            }
          >
            {
              localizedDocument.description
            }
          </p>

          <div
            className={styles.meta}
          >
            <span>
              {t(
                "legal.ui.lastUpdated",
                "Son güncelleme",
              )}
              :{" "}

              <time
                dateTime={
                  company.lastUpdatedAt
                }
              >
                {date}
              </time>
            </span>

            <PrintButton />
          </div>
        </header>

        <div
          className={styles.grid}
        >
          <nav
            aria-label={
              contentsLabel
            }
            className={styles.toc}
          >
            <p
              className={
                styles.tocTitle
              }
            >
              {contentsLabel}
            </p>

            <ol>
              {localizedDocument.sections.map(
                (
                  item,
                  index,
                ) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                    >
                      {index + 1}.{" "}
                      {item.title}
                    </a>
                  </li>
                ),
              )}

              <li>
                <a href="#sirket-bilgileri">
                  {
                    companyInfoLabel
                  }
                </a>
              </li>
            </ol>
          </nav>

          <article
            className={
              styles.article
            }
          >
            {localizedDocument.sections.map(
              (
                item,
                index,
              ) => (
                <section
                  id={item.id}
                  className={
                    styles.section
                  }
                  key={item.id}
                >
                  <h2>
                    {index + 1}.{" "}
                    {item.title}
                  </h2>

                  {item.paragraphs.map(
                    (
                      paragraph,
                      paragraphIndex,
                    ) => (
                      <p
                        key={`${item.id}-${paragraphIndex}`}
                      >
                        {
                          paragraph
                        }
                      </p>
                    ),
                  )}

                  {item.review && (
                    <aside
                      className={
                        styles.review
                      }
                    >
                      {t(
                        "legal.ui.reviewNote",
                        "Hukuki inceleme gerekli: Bu bölüm somut hizmet, müşteri sıfatı ve güncel mevzuata göre yetkili hukuk danışmanı tarafından doğrulanmalıdır.",
                      )}
                    </aside>
                  )}
                </section>
              ),
            )}

            <section
              id="sirket-bilgileri"
              className={
                styles.card
              }
            >
              <h2>
                {
                  companyInfoLabel
                }
              </h2>

              <dl
                className={
                  styles.details
                }
              >
                {labels.map(
                  ([
                    label,
                    value,
                  ]) => (
                    <div key={label}>
                      <dt>
                        {label}
                      </dt>

                      <dd>
                        {displayCompanyValue(
                          value,
                          label,
                        )}
                      </dd>
                    </div>
                  ),
                )}
              </dl>

              {slug ===
                "kvkk-aydinlatma-metni" && (
                <div
                  className={
                    styles.providers
                  }
                >
                  <h3>
                    {t(
                      "legal.ui.providerCategories",
                      "Yapılandırılmış sağlayıcı kategorileri",
                    )}
                  </h3>

                  <table
                    className={
                      styles.table
                    }
                  >
                    <tbody>
                      {company.providers.map(
                        (
                          provider,
                        ) => (
                          <tr
                            key={
                              provider.name
                            }
                          >
                            <th>
                              {
                                provider.name
                              }
                            </th>

                            <td>
                              {
                                provider.purpose
                              }
                              ;{" "}

                              {t(
                                "legal.ui.providerTransferSuffix",
                                "yurt dışı aktarım ihtimali yayımdan önce doğrulanacaktır.",
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </article>
        </div>
      </div>

      <PremiumFooter />
    </main>
  );
}