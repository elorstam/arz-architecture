import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import PremiumFooter from "@/components/PremiumFooter";
import OnlinePaymentMotion from "@/components/online-payment/OnlinePaymentMotion";
import { locales } from "@/i18n/locales";
import {
  companyLegalConfig as company,
  displayCompanyValue,
} from "@/lib/legal/company-config";
import { getSiteMessages } from "@/lib/site-translation-store";
import{appLoginUrl}from"@/lib/routing/app-domains";

import styles from "./OnlinePaymentPage.module.css";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!locales.includes(locale as (typeof locales)[number])) {
    return {};
  }

  const messages = await getSiteMessages(locale);
  const title =
    messages["payment.meta.title"] ||
    "Güvenli Online Ödeme | ARZ Mimarlık";
  const description =
    messages["payment.meta.description"] ||
    "ARZ Mimarlık güvenli online ödeme bilgilendirmesi.";

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://arzmimarlik.net/${locale}/online-odeme`,
      languages: Object.fromEntries(
        locales.map((item) => [
          item,
          `https://arzmimarlik.net/${item}/online-odeme`,
        ]),
      ),
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://arzmimarlik.net/${locale}/online-odeme`,
      siteName: company.brandName,
    },
  };
}

export default async function OnlinePaymentPage({
  params,
}: PageProps) {
  const { locale } = await params;

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  const messages = await getSiteMessages(locale);
  const clientFinanceHref=appLoginUrl("client","/client/finance");
  const t = (key: string) => messages[key] || key;

  const contactHref = `/${locale}/${
    locale === "tr" ? "iletisim" : "contact"
  }`;

  const steps = Array.from(
    { length: 8 },
    (_, index) => t(`payment.process.step${index + 1}`),
  );

  const paymentTypes = [
    t("payment.types.deposit"),
    t("payment.types.interim"),
    t("payment.types.progress"),
    t("payment.types.balance"),
    t("payment.types.approvedQuote"),
    t("payment.types.correction"),
  ];

  const pricing = Array.from(
    { length: 12 },
    (_, index) => t(`payment.pricing.item${index + 1}`),
  );

  const securityItems = Array.from(
    { length: 6 },
    (_, index) => t(`payment.security.item${index + 1}`),
  );

  const legalLinks = [
    [t("payment.legal.refund"), "iptal-cayma-iade-kosullari"],
    [t("payment.legal.distance"), "mesafeli-hizmet-sozlesmesi"],
    [t("payment.legal.preinfo"), "on-bilgilendirme-formu"],
    [t("payment.legal.delivery"), "hizmet-teslim-ve-ifa-kosullari"],
    [t("payment.legal.security"), "odeme-ve-guvenlik"],
    [t("payment.legal.kvkk"), "kvkk-aydinlatma-metni"],
  ] as const;

  const services = [
    [
      t("payment.services.arch.title"),
      t("payment.services.arch.copy"),
    ],
    [
      t("payment.services.interior.title"),
      t("payment.services.interior.copy"),
    ],
    [
      t("payment.services.villa.title"),
      t("payment.services.villa.copy"),
    ],
    [
      t("payment.services.commercial.title"),
      t("payment.services.commercial.copy"),
    ],
    [
      t("payment.services.render.title"),
      t("payment.services.render.copy"),
    ],
    [
      t("payment.services.permit.title"),
      t("payment.services.permit.copy"),
    ],
  ] as const;

  const companyRows = [
    [t("payment.company.brand"), company.brandName],
    [t("payment.company.legalName"), company.legalName],
    [t("payment.company.type"), company.companyType],
    [t("payment.company.taxOffice"), company.taxOffice],
    [t("payment.company.taxNumber"), company.taxNumber],
    [t("payment.company.address"), company.registeredAddress],
    [t("payment.company.phone"), company.phone],
    [t("payment.company.email"), company.email],
    [t("payment.company.web"), company.websiteUrl],
  ] as const;

  return (
    <main
      className={styles.page}
      lang={locale}
      data-payment-page
    >
      <OnlinePaymentMotion />

      <section className={`${styles.shell} ${styles.hero}`}>
        <p className={styles.eyebrow}>
          {t("payment.hero.eyebrow")}
        </p>

        <h1 className={styles.title}>
          {t("payment.hero.title")}
        </h1>

        <p className={styles.lead}>
          {t("payment.hero.lead")}
        </p>

        <p className={styles.notice}>
          {t("payment.hero.notice")}
        </p>

        <div className={styles.actions}>
          <Link className={styles.primary} href={contactHref}>
            {t("payment.actions.quote")}
          </Link>

          <a
            className={styles.secondary}
            href={`mailto:${company.email}?subject=${encodeURIComponent(
              t("payment.actions.verify"),
            )}`}
          >
            {t("payment.actions.verify")}
          </a>

          <Link
            className={styles.iyzicoAction}
            href={clientFinanceHref}
            aria-label={
              locale === "tr"
                ? "iyzico ile Öde"
                : "Pay with iyzico"
            }
          >
            <Image
              src={
                locale === "tr"
                  ? "/images/payments/iyzico_ile_ode_horizontal_white.png"
                  : "/images/payments/pay_with_iyzico_horizontal_white.png"
              }
              alt={
                locale === "tr"
                  ? "iyzico ile Öde"
                  : "Pay with iyzico"
              }
              width={220}
              height={44}
              className={styles.paymentLogo}
              priority
            />
          </Link>
        </div>

        <div className={styles.paymentTrust}>
          <p className={styles.paymentText}>
            {t("payment.trust.text")}
          </p>

          <p className={styles.paymentSmall}>
            {t("payment.trust.security")}
          </p>
        </div>
      </section>

      <section
        className={`${styles.shell} ${styles.section}`}
        aria-labelledby="surec"
      >
        <header className={styles.sectionHeader}>
          <p className={styles.kicker}>
            {t("payment.process.kicker")}
          </p>
          <h2 id="surec" className={styles.heading}>
            {t("payment.process.heading")}
          </h2>
        </header>

        <ol className={styles.steps}>
          {steps.map((step) => (
            <li className={styles.step} key={step}>
              <h3>{step}</h3>
            </li>
          ))}
        </ol>
      </section>

      <section
        className={`${styles.shell} ${styles.section}`}
        aria-labelledby="odeme-turleri"
      >
        <header className={styles.sectionHeader}>
          <p className={styles.kicker}>
            {t("payment.types.kicker")}
          </p>
          <h2 id="odeme-turleri" className={styles.heading}>
            {t("payment.types.heading")}
          </h2>
          <p className={styles.intro}>
            {t("payment.types.intro")}
          </p>
        </header>

        <div className={styles.cards}>
          {paymentTypes.map((type) => (
            <article className={styles.card} key={type}>
              <h3>{type}</h3>
              <p>{t("payment.types.cardText")}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className={`${styles.shell} ${styles.section}`}
        aria-labelledby="link-modeli"
      >
        <div className={styles.split}>
          <div>
            <header className={styles.sectionHeader}>
              <p className={styles.kicker}>
                {t("payment.link.kicker")}
              </p>
              <h2 id="link-modeli" className={styles.heading}>
                {t("payment.link.heading")}
              </h2>
            </header>

            <p className={styles.intro}>
              {t("payment.link.intro")}
            </p>

            <ul className={styles.list}>
              <li>{t("payment.link.item1")}</li>
              <li>{t("payment.link.item2")}</li>
              <li>{t("payment.link.item3")}</li>
              <li>{t("payment.link.item4")}</li>
            </ul>
          </div>

          <aside className={styles.check}>
            <strong>{t("payment.link.checkTitle")}</strong>

            <p>{t("payment.link.checkText")}</p>

            <p>
              {t("payment.link.suspiciousBefore")}{" "}
              <a href={`mailto:${company.email}`}>
                {company.email}
              </a>{" "}
              {t("payment.link.suspiciousBetween")}{" "}
              <a
                href={`tel:${company.phone?.replace(/\s/g, "")}`}
              >
                {company.phone}
              </a>{" "}
              {t("payment.link.suspiciousAfter")}
            </p>
          </aside>
        </div>
      </section>

      <section
        className={`${styles.shell} ${styles.section}`}
        aria-labelledby="fiyat"
      >
        <div className={styles.split}>
          <header className={styles.sectionHeader}>
            <p className={styles.kicker}>
              {t("payment.pricing.kicker")}
            </p>
            <h2 id="fiyat" className={styles.heading}>
              {t("payment.pricing.heading")}
            </h2>
            <p className={styles.intro}>
              {t("payment.pricing.intro")}
            </p>
          </header>

          <ul className={styles.list}>
            {pricing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className={`${styles.shell} ${styles.section}`}
        aria-labelledby="guvenlik"
      >
        <div className={styles.security}>
          <header className={styles.sectionHeader}>
            <p className={styles.kicker}>
              {t("payment.security.kicker")}
            </p>
            <h2 id="guvenlik" className={styles.heading}>
              {t("payment.security.heading")}
            </h2>
          </header>

          <ul>
            {securityItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className={`${styles.shell} ${styles.section}`}
        aria-labelledby="hizmetler"
      >
        <header className={styles.sectionHeader}>
          <p className={styles.kicker}>
            {t("payment.services.kicker")}
          </p>
          <h2 id="hizmetler" className={styles.heading}>
            {t("payment.services.heading")}
          </h2>
        </header>

        <div className={styles.services}>
          {services.map(([name, copy]) => (
            <article className={styles.service} key={name}>
              <h3>{name}</h3>
              <p>{copy}</p>
              <p>{t("payment.services.note")}</p>
              <Link href={contactHref}>
                {t("payment.actions.quote")}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section
        className={`${styles.shell} ${styles.section}`}
        aria-labelledby="iade"
      >
        <div className={styles.split}>
          <div>
            <header className={styles.sectionHeader}>
              <p className={styles.kicker}>
                {t("payment.refund.kicker")}
              </p>
              <h2 id="iade" className={styles.heading}>
                {t("payment.refund.heading")}
              </h2>
            </header>

            <p className={styles.intro}>
              {t("payment.refund.intro")}
            </p>
          </div>

          <nav
            className={styles.legalLinks}
            aria-label={t("payment.legal.aria")}
          >
            {legalLinks.map(([label, slug]) => (
              <Link
                href={`/${locale}/yasal/${slug}`}
                key={slug}
              >
                <span>{label}</span>
                <span aria-hidden>→</span>
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section
        className={`${styles.shell} ${styles.section}`}
        aria-labelledby="sirket"
      >
        <header className={styles.sectionHeader}>
          <p className={styles.kicker}>
            {t("payment.company.kicker")}
          </p>
          <h2 id="sirket" className={styles.heading}>
            ARZ Mimarlık
          </h2>
        </header>

        <dl className={styles.company}>
          {companyRows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{displayCompanyValue(value, label)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <PremiumFooter />
    </main>
  );
}
