"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { companyLegalConfig } from "@/lib/legal/company-config";

const instagramUrl = "https://www.instagram.com/arzmimarliknet/";
const linkedinUrl = "https://www.linkedin.com/company/90222590";

const pageLinks = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "projects", href: "/projects" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact" },
] as const;

const legalFooterLinks = [
  { key: "preInfo", slug: "on-bilgilendirme-formu" },
  { key: "distance", slug: "mesafeli-hizmet-sozlesmesi" },
  { key: "refund", slug: "iptal-cayma-iade-kosullari" },
  { key: "delivery", slug: "hizmet-teslim-ve-ifa-kosullari" },
  { key: "kvkk", slug: "kvkk-aydinlatma-metni" },
  { key: "privacy", slug: "gizlilik-ve-cerez-politikasi" },
  { key: "security", slug: "odeme-ve-guvenlik" },
  { key: "commercial", slug: "ticari-bilgiler" },
] as const;

const legalLabels: Record<
  string,
  {
    title: string;
    onlinePayment: string;
    preInfo: string;
    distance: string;
    refund: string;
    delivery: string;
    kvkk: string;
    privacy: string;
    security: string;
    commercial: string;
    paymentInfrastructure: string;
  }
> = {
  tr: {
    title: "Yasal",
    onlinePayment: "Online Ödeme",
    preInfo: "Ön Bilgilendirme",
    distance: "Mesafeli Hizmet Sözleşmesi",
    refund: "İptal ve İade",
    delivery: "Hizmet Teslim Koşulları",
    kvkk: "KVKK",
    privacy: "Gizlilik ve Çerez",
    security: "Ödeme ve Güvenlik",
    commercial: "Ticari Bilgiler",
    paymentInfrastructure: "Güvenli ödeme altyapısı",
  },
  en: {
    title: "Legal",
    onlinePayment: "Online Payment",
    preInfo: "Pre-Information",
    distance: "Distance Service Agreement",
    refund: "Cancellation & Refund",
    delivery: "Service Delivery Terms",
    kvkk: "Data Protection",
    privacy: "Privacy & Cookies",
    security: "Payment & Security",
    commercial: "Commercial Information",
    paymentInfrastructure: "Secure payment infrastructure",
  },
  de: {
    title: "Rechtliches",
    onlinePayment: "Online-Zahlung",
    preInfo: "Vorabinformation",
    distance: "Fernabsatz-Dienstleistungsvertrag",
    refund: "Stornierung & Rückerstattung",
    delivery: "Leistungs- und Lieferbedingungen",
    kvkk: "Datenschutz",
    privacy: "Datenschutz & Cookies",
    security: "Zahlung & Sicherheit",
    commercial: "Unternehmensangaben",
    paymentInfrastructure: "Sichere Zahlungsinfrastruktur",
  },
  fr: {
    title: "Mentions légales",
    onlinePayment: "Paiement en ligne",
    preInfo: "Information préalable",
    distance: "Contrat de service à distance",
    refund: "Annulation & remboursement",
    delivery: "Conditions de prestation",
    kvkk: "Protection des données",
    privacy: "Confidentialité & cookies",
    security: "Paiement & sécurité",
    commercial: "Informations commerciales",
    paymentInfrastructure: "Infrastructure de paiement sécurisée",
  },
  es: {
    title: "Legal",
    onlinePayment: "Pago en línea",
    preInfo: "Información previa",
    distance: "Contrato de servicios a distancia",
    refund: "Cancelación y reembolso",
    delivery: "Condiciones de prestación",
    kvkk: "Protección de datos",
    privacy: "Privacidad y cookies",
    security: "Pago y seguridad",
    commercial: "Información comercial",
    paymentInfrastructure: "Infraestructura de pago segura",
  },
  nl: {
    title: "Juridisch",
    onlinePayment: "Online betalen",
    preInfo: "Voorafgaande informatie",
    distance: "Overeenkomst dienstverlening op afstand",
    refund: "Annulering & terugbetaling",
    delivery: "Leveringsvoorwaarden",
    kvkk: "Gegevensbescherming",
    privacy: "Privacy & cookies",
    security: "Betaling & veiligheid",
    commercial: "Bedrijfsinformatie",
    paymentInfrastructure: "Veilige betaalinfrastructuur",
  },
  ja: {
    title: "法的情報",
    onlinePayment: "オンライン決済",
    preInfo: "事前情報",
    distance: "遠隔サービス契約",
    refund: "キャンセル・返金",
    delivery: "サービス提供条件",
    kvkk: "個人情報保護",
    privacy: "プライバシー・Cookie",
    security: "決済・セキュリティ",
    commercial: "事業者情報",
    paymentInfrastructure: "安全な決済基盤",
  },
  zh: {
    title: "法律信息",
    onlinePayment: "在线支付",
    preInfo: "事前信息",
    distance: "远程服务协议",
    refund: "取消与退款",
    delivery: "服务交付条款",
    kvkk: "数据保护",
    privacy: "隐私与 Cookie",
    security: "支付与安全",
    commercial: "商业信息",
    paymentInfrastructure: "安全支付基础设施",
  },
  ko: {
    title: "법적 정보",
    onlinePayment: "온라인 결제",
    preInfo: "사전 안내",
    distance: "원격 서비스 계약",
    refund: "취소 및 환불",
    delivery: "서비스 제공 조건",
    kvkk: "개인정보 보호",
    privacy: "개인정보 및 쿠키",
    security: "결제 및 보안",
    commercial: "사업자 정보",
    paymentInfrastructure: "안전한 결제 인프라",
  },
  ar: {
    title: "المعلومات القانونية",
    onlinePayment: "الدفع عبر الإنترنت",
    preInfo: "المعلومات المسبقة",
    distance: "عقد الخدمة عن بُعد",
    refund: "الإلغاء والاسترداد",
    delivery: "شروط تقديم الخدمة",
    kvkk: "حماية البيانات",
    privacy: "الخصوصية وملفات تعريف الارتباط",
    security: "الدفع والأمان",
    commercial: "المعلومات التجارية",
    paymentInfrastructure: "بنية دفع آمنة",
  },
};

export default function PremiumFooter() {
  const locale = useLocale();
  const t = useTranslations("Footer");
  const legal = legalLabels[locale] ?? legalLabels.en;

  const getHref = (href: string) => {
    if (href === "/") return `/${locale}`;

    const routes: Record<string, Record<string, string>> = {
      tr: {
        "/about": "/hakkimizda",
        "/projects": "/projeler",
        "/contact": "/iletisim",
      },
      en: {
        "/about": "/about",
        "/projects": "/projects",
        "/contact": "/contact",
      },
    };

    return `/${locale}${routes[locale]?.[href] ?? href}`;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-white/15 bg-[#070707] px-6 text-white md:px-10 lg:px-16">
      <div className="mx-auto max-w-[1800px]">
        <div
          data-reveal
          className="grid gap-14 py-16 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24"
        >
          <div>
            <Link
              href={`/${locale}`}
              className="inline-block text-[clamp(2.8rem,5vw,6rem)] font-light leading-none tracking-[-0.065em] transition-opacity duration-300 hover:opacity-65"
            >
              {t("brandLine1")}
              <br />
              {t("brandLine2")}
            </Link>

            <p className="mt-8 max-w-md text-sm leading-7 text-white/40">
              {t("description")}
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-[9px] uppercase tracking-[0.32em] text-white/30">
                {t("pagesTitle")}
              </p>

              <nav className="mt-6 flex flex-col items-start gap-4">
                {pageLinks.map((page) => (
                  <Link
                    key={page.key}
                    href={getHref(page.href)}
                    className="group flex items-center gap-3 text-sm uppercase tracking-[0.1em] text-white/60 transition-colors duration-300 hover:text-white"
                  >
                    {t(`links.${page.key}`)}
                    <span className="text-white/25 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.32em] text-white/30">
                {legal.title}
              </p>

              <nav
                aria-label={legal.title}
                className="mt-6 flex flex-col items-start gap-3"
              >
                <Link
                  href={`/${locale}/online-odeme`}
                  className="text-xs font-medium leading-5 text-white/80 transition-colors duration-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  {legal.onlinePayment}
                </Link>

                {legalFooterLinks.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/${locale}/yasal/${item.slug}`}
                    className="text-xs leading-5 text-white/55 transition-colors duration-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    {legal[item.key]}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.32em] text-white/30">
                {t("contactTitle")}
              </p>

              <div className="mt-6 flex flex-col items-start gap-4">
                <a
                  href={`tel:${companyLegalConfig.phone?.replace(/\s/g, "")}`}
                  className="text-sm leading-6 text-white/60 transition-colors duration-300 hover:text-white"
                >
                  {companyLegalConfig.phone}
                </a>

                <a
                  href={`mailto:${companyLegalConfig.email}`}
                  className="text-sm leading-6 text-white/60 transition-colors duration-300 hover:text-white"
                >
                  {companyLegalConfig.email}
                </a>

                <p className="whitespace-pre-line text-sm leading-6 text-white/40">
                  {companyLegalConfig.registeredAddress}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-7 border-t border-white/10 py-7 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[9px] uppercase tracking-[0.22em] text-white/25 md:justify-start">
            <p>{t("copyright")}</p>
            <p>{t("rights")}</p>
          </div>

          <div
            className="flex flex-col items-center justify-center gap-2"
            aria-label={legal.paymentInfrastructure}
          >
            <p className="text-center text-[8px] uppercase tracking-[0.24em] text-white/30">
              {legal.paymentInfrastructure}
            </p>

            <div className="paymentLogo paymentLogoColored">
              <Image
                src="/images/payments/logo-band-colored.png"
                alt="iyzico, Mastercard, Visa, American Express ve Troy"
                width={520}
                height={60}
                className="h-auto w-[220px] object-contain md:w-[250px]"
                sizes="(max-width: 767px) 220px, 250px"
              />
            </div>

            <div className="paymentLogo paymentLogoWhite">
              <Image
                src="/images/payments/logo-band-white1.png"
                alt="iyzico, Mastercard, Visa, American Express ve Troy"
                width={520}
                height={60}
                className="h-auto w-[220px] object-contain md:w-[250px]"
                sizes="(max-width: 767px) 220px, 250px"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-end">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] uppercase tracking-[0.22em] text-white/35 transition-colors duration-300 hover:text-white"
            >
              Instagram ↗
            </a>

            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] uppercase tracking-[0.22em] text-white/35 transition-colors duration-300 hover:text-white"
            >
              LinkedIn ↗
            </a>

            <button
              type="button"
              onClick={scrollToTop}
              className="group flex items-center gap-2 text-[9px] uppercase tracking-[0.22em] text-white/35 transition-colors duration-300 hover:text-white"
            >
              {t("backToTop")}
              <span className="transition-transform duration-300 group-hover:-translate-y-1">
                ↑
              </span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .paymentLogo {
          line-height: 0;
        }

        .paymentLogoColored {
          display: block;
        }

        .paymentLogoWhite {
          display: none;
        }

        :global(html[data-theme="dark"]) .paymentLogoColored {
          display: none;
        }

        :global(html[data-theme="dark"]) .paymentLogoWhite {
          display: block;
        }
      `}</style>
    </footer>
  );
}