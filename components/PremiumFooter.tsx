"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

const instagramUrl = "https://www.instagram.com/arzmimarliknet/";
const linkedinUrl = "https://www.linkedin.com/company/90222590";

const pageLinks = [
  {key: "home", href: "/"},
  {key: "about", href: "/about"},
    {key: "projects", href: "/projects"},
    {key: "blog", href: "/blog"},
  {key: "contact", href: "/contact"},
] as const;

export default function PremiumFooter() {
  const locale = useLocale();
  const t = useTranslations("Footer");

  const getHref = (href: string) => {
    if (href === "/") return `/${locale}`;
    const routes: Record<string, Record<string, string>> = {
      tr: {"/about": "/hakkimizda", "/projects": "/projeler", "/contact": "/iletisim"},
      en: {"/about": "/about", "/projects": "/projects", "/contact": "/contact"}
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

          <div className="grid gap-10 sm:grid-cols-2">
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
                {t("contactTitle")}
              </p>

              <div className="mt-6 flex flex-col items-start gap-4">
                <a
                  href="tel:+905425704429"
                  className="text-sm leading-6 text-white/60 transition-colors duration-300 hover:text-white"
                >
                  +90 542 570 44 29
                </a>

                <a
                  href="mailto:info@arzmimarlik.net"
                  className="text-sm leading-6 text-white/60 transition-colors duration-300 hover:text-white"
                >
                  info@arzmimarlik.net
                </a>

                <p className="text-sm leading-6 text-white/40">
                  Sancaktepe
                  <br />
                  İstanbul
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 border-t border-white/10 py-7 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 text-[9px] uppercase tracking-[0.22em] text-white/25">
            <p>{t("copyright")}</p>
            <p>{t("rights")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
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
    </footer>
  );
}
