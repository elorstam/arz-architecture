"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  getNavbarSurfaceState,
  navbarSurfaceData,
} from "@/lib/navbar-surface";

const navigationItems = [
  {
    key: "home",
    href: "/",
  },
  {
    key: "about",
    href: "/about",
  },
  {
    key: "projects",
    href: "/projects",
  },
  {
    key: "blog",
    href: "/blog",
  },
  {
    key: "contact",
    href: "/contact",
  },
] as const;

const instagramUrl = "https://www.instagram.com/arzmimarliknet/";
const linkedinUrl = "https://www.linkedin.com/company/90222590";

export default function Navbar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Navbar");

  const localizedHomeHref = `/${locale}`;

  const pathWithoutLocale =
    pathname.replace(
      /^\/(tr|en|de|fr|es|nl|ja|zh|ko|ar)(?=\/|$)/,
      "",
    ) || "/";

  const isHomePage = pathWithoutLocale === "/";
  const usesDarkHeaderOverlay = isHomePage;

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const surfaceState = getNavbarSurfaceState(scrolled, isHomePage);

  const mobileSurfaceState = getNavbarSurfaceState(
    scrolled,
    isHomePage,
    true,
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY >= 30);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const getHref = (href: string) => {
    if (href === "/") {
      return localizedHomeHref;
    }

    const routes =
      locale === "tr"
        ? {
            "/about": "/hakkimizda",
            "/projects": "/projeler",
            "/contact": "/iletisim",
          }
        : {
            "/about": "/about",
            "/projects": "/projects",
            "/contact": "/contact",
          };

    return `/${locale}${routes[href as keyof typeof routes] ?? href}`;
  };

  const isActive = (href: string) => {
    const resolvedHref = getHref(href);

    if (href === "/") {
      return pathname === resolvedHref || pathname === "/";
    }

    return (
      pathname === resolvedHref ||
      pathname.startsWith(`${resolvedHref}/`)
    );
  };

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header
        data-overlay={
          usesDarkHeaderOverlay && !scrolled ? "true" : "false"
        }
        {...navbarSurfaceData(surfaceState)}
        className="site-header fixed left-0 top-0 z-50 w-full"
      >
        <div className="relative mx-auto flex h-[72px] w-full max-w-[1920px] items-center px-5 sm:px-8 md:h-[80px] md:px-10 xl:px-12 2xl:px-16">
          <Link
            href={localizedHomeHref}
            scroll
            aria-label={t("logoAriaLabel")}
            className="relative z-[70] block h-[60px] w-[126px] shrink-0 md:h-[68px] md:w-[144px]"
          >
            <Image
              src="/arz-logo-final.png"
              alt="ARZ Mimarlık"
              fill
              priority
              sizes="144px"
              className="site-logo object-contain object-left-center"
            />
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 font-sans xl:flex 2xl:gap-14">
            {navigationItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.key}
                  href={getHref(item.href)}
                  scroll
                  className={`group relative py-3 text-[12px] font-normal uppercase tracking-[0.11em] transition-[color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] 2xl:text-[14px] 2xl:tracking-[0.13em] ${
                    active
                      ? "text-white/90"
                      : "text-white/62 hover:-translate-y-px hover:text-white/90"
                  }`}
                >
                  <span className="block whitespace-nowrap">
                    {t(`items.${item.key}`)}
                  </span>

                  <span
                    className={`absolute bottom-[2px] left-1/2 h-px -translate-x-1/2 bg-white/80 transition-[width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      active
                        ? "w-full opacity-80"
                        : "w-0 opacity-0 group-hover:w-full group-hover:opacity-70"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden items-center gap-3 xl:flex 2xl:gap-5">
            <ThemeToggle />

            <LanguageSwitcher surfaceState={surfaceState} />

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ARZ Mimarlık Instagram"
              className="flex h-10 w-10 items-center justify-center text-white/58 transition-[color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:text-white/90"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-[21px] w-[21px]"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                  stroke="currentColor"
                  strokeWidth="1.45"
                />

                <circle
                  cx="12"
                  cy="12"
                  r="4.25"
                  stroke="currentColor"
                  strokeWidth="1.45"
                />

                <circle
                  cx="17.3"
                  cy="6.8"
                  r="1"
                  fill="currentColor"
                />
              </svg>
            </a>

            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ARZ Mimarlık LinkedIn"
              className="flex h-10 w-10 items-center justify-center text-white/58 transition-[color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:text-white/90"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-[21px] w-[21px]"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="1.8"
                  stroke="currentColor"
                  strokeWidth="1.45"
                />

                <path
                  d="M7.3 10.1V17"
                  stroke="currentColor"
                  strokeWidth="1.55"
                  strokeLinecap="round"
                />

                <path
                  d="M7.3 7V7.1"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                />

                <path
                  d="M11.1 17V10.1"
                  stroke="currentColor"
                  strokeWidth="1.55"
                  strokeLinecap="round"
                />

                <path
                  d="M11.1 13.1C11.1 11.45 12.05 10.05 13.9 10.05C15.75 10.05 16.7 11.25 16.7 13.45V17"
                  stroke="currentColor"
                  strokeWidth="1.55"
                  strokeLinecap="round"
                />
              </svg>
            </a>
          </div>

          <button
            type="button"
            onClick={() => {
              setMenuOpen((current) => !current);
            }}
            aria-label={
              menuOpen ? t("closeMenu") : t("openMenu")
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="relative z-[70] ml-auto flex h-11 w-11 flex-col items-end justify-center gap-[6px] xl:hidden"
          >
            <span
              className={`mobile-menu-line block h-px transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                menuOpen
                  ? "w-8 translate-y-[7px] rotate-45"
                  : "w-8 translate-y-0 rotate-0"
              }`}
            />

            <span
              className={`mobile-menu-line block h-px transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                menuOpen
                  ? "w-0 opacity-0"
                  : "w-6 opacity-100"
              }`}
            />

            <span
              className={`mobile-menu-line block h-px transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                menuOpen
                  ? "w-8 -translate-y-[7px] -rotate-45"
                  : "w-8 translate-y-0 rotate-0"
              }`}
            />
          </button>
        </div>
      </header>

      <div
        id="mobile-navigation"
        aria-hidden={!menuOpen}
        {...navbarSurfaceData(mobileSurfaceState)}
        className={`mobile-menu-surface fixed inset-0 z-40 overflow-y-auto overscroll-y-contain transition-[opacity,visibility] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] xl:hidden ${
          menuOpen
            ? "pointer-events-auto visible opacity-100"
            : "pointer-events-none invisible opacity-0"
        }`}
        style={{
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="flex min-h-[100dvh] flex-col px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[105px] font-sans sm:px-8 md:px-10">
          <nav className="mobile-menu-border flex flex-col border-t">
            {navigationItems.map((item, index) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.key}
                  href={getHref(item.href)}
                  scroll
                  onClick={() => setMenuOpen(false)}
                  className="mobile-menu-border group flex min-h-[108px] items-center justify-between border-b py-7 md:min-h-[120px]"
                >
                  <div className="flex min-w-0 items-center gap-5 md:gap-8">
                    <span className="mobile-menu-muted shrink-0 text-[9px] font-normal tracking-[0.28em] md:text-[10px]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span
                      className={`min-w-0 text-[clamp(2.1rem,9vw,3.7rem)] font-normal leading-none tracking-[-0.025em] transition-[color,transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:text-[clamp(3rem,7vw,5rem)] ${
                        active
                          ? "opacity-95"
                          : "opacity-60 group-hover:translate-x-2 group-hover:opacity-90"
                      }`}
                    >
                      {t(`items.${item.key}`)}
                    </span>
                  </div>

                  <span className="mobile-menu-muted ml-4 shrink-0 text-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 md:text-2xl">
                    →
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mobile-menu-border mt-10 border-t pt-7">
            <p className="mobile-menu-muted text-[9px] font-normal uppercase tracking-[0.28em]">
              {t("socialMedia")}
            </p>

            <div className="mt-5 flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-5 md:gap-8">
                <ThemeToggle className="mr-1" />

                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mobile-menu-secondary text-[12px] font-normal uppercase tracking-[0.12em] transition-opacity duration-500 hover:opacity-100"
                >
                  Instagram
                </a>

                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mobile-menu-secondary text-[12px] font-normal uppercase tracking-[0.12em] transition-opacity duration-500 hover:opacity-100"
                >
                  LinkedIn
                </a>
              </div>

              <div className="relative z-[60] w-full">
                <LanguageSwitcher
                  mobile
                  surfaceState={mobileSurfaceState}
                  onNavigate={() => setMenuOpen(false)}
                />
              </div>
            </div>

            <div className="mobile-menu-muted mt-9 flex items-center justify-between text-[9px] font-normal uppercase tracking-[0.18em]">
              <span>{t("brand")}</span>
              <span>{t("city")}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .mobile-menu-surface {
          background: #f3f2ee;
          color: #111318;
        }

        .mobile-menu-border {
          border-color: rgba(17, 19, 24, 0.14);
        }

        .mobile-menu-muted {
          color: rgba(17, 19, 24, 0.38);
        }

        .mobile-menu-secondary {
          color: rgba(17, 19, 24, 0.62);
        }

        .mobile-menu-line {
          background: rgba(255, 255, 255, 0.88);
        }

        html[data-theme="light"] .mobile-menu-line {
          background: rgba(17, 19, 24, 0.85);
        }

        html[data-theme="dark"] .mobile-menu-surface,
        html.dark .mobile-menu-surface {
          background: #080b10;
          color: rgba(255, 255, 255, 0.95);
        }

        html[data-theme="dark"] .mobile-menu-border,
        html.dark .mobile-menu-border {
          border-color: rgba(255, 255, 255, 0.12);
        }

        html[data-theme="dark"] .mobile-menu-muted,
        html.dark .mobile-menu-muted {
          color: rgba(255, 255, 255, 0.3);
        }

        html[data-theme="dark"] .mobile-menu-secondary,
        html.dark .mobile-menu-secondary {
          color: rgba(255, 255, 255, 0.58);
        }

        html[data-theme="dark"] .mobile-menu-line,
        html.dark .mobile-menu-line {
          background: rgba(255, 255, 255, 0.88);
        }
      `}</style>
    </>
  );
}