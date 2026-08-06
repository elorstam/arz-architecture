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

export const legalFooterLinks = [
  {
    label: "Ön Bilgilendirme",
    slug: "on-bilgilendirme-formu",
  },
  {
    label: "Mesafeli Hizmet Sözleşmesi",
    slug: "mesafeli-hizmet-sozlesmesi",
  },
  {
    label: "İptal ve İade",
    slug: "iptal-cayma-iade-kosullari",
  },
  {
    label: "Hizmet Teslim Koşulları",
    slug: "hizmet-teslim-ve-ifa-kosullari",
  },
  {
    label: "KVKK",
    slug: "kvkk-aydinlatma-metni",
  },
  {
    label: "Gizlilik ve Çerez",
    slug: "gizlilik-ve-cerez-politikasi",
  },
  {
    label: "Ödeme ve Güvenlik",
    slug: "odeme-ve-guvenlik",
  },
  {
    label: "Ticari Bilgiler",
    slug: "ticari-bilgiler",
  },
] as const;

export default function PremiumFooter() {
  const locale = useLocale();
  const t = useTranslations("Footer");

  const getHref = (href: string) => {
    if (href === "/") {
      return `/${locale}`;
    }

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
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
                Yasal
              </p>

              <nav
                aria-label="Yasal sayfalar"
                className="mt-6 flex flex-col items-start gap-3"
              >
                <Link
                  href={`/${locale}/online-odeme`}
                  className="text-xs font-medium leading-5 text-white/80 transition-colors duration-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Online Ödeme
                </Link>

                {legalFooterLinks.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/${locale}/yasal/${item.slug}`}
                    className="text-xs leading-5 text-white/55 transition-colors duration-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    {item.label}
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
            aria-label="Güvenli ödeme altyapısı"
          >
            <p className="text-center text-[8px] uppercase tracking-[0.24em] text-white/30">
              Güvenli ödeme altyapısı
            </p>

            <div className="paymentLogo paymentLogoColored">
              <Image
                src="/images/payments/logo-band-colored.png"
                alt="iyzico ile Öde, Mastercard, Visa, American Express ve Troy"
                width={520}
                height={60}
                className="h-auto w-[220px] object-contain md:w-[250px]"
                sizes="(max-width: 767px) 220px, 250px"
              />
            </div>

            <div className="paymentLogo paymentLogoWhite">
              <Image
                src="/images/payments/logo-band-white1.png"
                alt="iyzico ile Öde, Mastercard, Visa, American Express ve Troy"
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