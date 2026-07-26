"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navigationItems = [
  {
    label: "Anasayfa",
    href: "/",
  },
  {
    label: "Hakkımızda",
    href: "/about",
  },
  {
    label: "Projeler",
    href: "/projects",
  },
  {
    label: "İletişim",
    href: "/contact",
  },
];

const instagramUrl = "https://www.instagram.com/arzmimarliknet/";
const linkedinUrl = "https://www.linkedin.com/company/90222590";

export default function Navbar() {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-50 w-full transition-[background-color,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled
            ? "bg-black/70 shadow-[0_10px_35px_rgba(0,0,0,0.16)]"
            : "bg-transparent shadow-none"
        }`}
      >
        <div className="relative mx-auto flex h-[76px] w-full max-w-[1920px] items-center px-5 sm:px-8 md:h-[82px] md:px-10 lg:px-14 xl:px-16">
          {/* Logo */}
          <Link
            href="/"
            aria-label="ARZ Mimarlık ana sayfa"
            className="relative z-[70] block h-[66px] w-[138px] shrink-0 md:h-[72px] md:w-[152px]"
          >
            <Image
              src="/arz-logo-final.png"
              alt="ARZ Mimarlık"
              fill
              priority
              sizes="152px"
              className="object-contain object-left-center"
            />
          </Link>

          {/* Masaüstü menü */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 lg:flex xl:gap-14">
            {navigationItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative py-3 text-[14px] font-normal uppercase tracking-[0.075em] transition-all duration-300 xl:text-[15px] ${
                    active
                      ? "text-white"
                      : "text-white/80 hover:-translate-y-px hover:text-white"
                  }`}
                >
                  <span className="block whitespace-nowrap">{item.label}</span>

                  <span
                    className={`absolute bottom-[3px] left-1/2 h-px -translate-x-1/2 bg-white transition-all duration-300 ${
                      active
                        ? "w-full opacity-100"
                        : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Sosyal medya */}
          <div className="ml-auto hidden items-center gap-5 lg:flex">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ARZ Mimarlık Instagram"
              className="flex h-10 w-10 items-center justify-center text-white/80 transition-all duration-300 hover:-translate-y-1 hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-[22px] w-[22px]"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />

                <circle
                  cx="12"
                  cy="12"
                  r="4.25"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />

                <circle cx="17.3" cy="6.8" r="1.1" fill="currentColor" />
              </svg>
            </a>

            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ARZ Mimarlık LinkedIn"
              className="flex h-10 w-10 items-center justify-center text-white/80 transition-all duration-300 hover:-translate-y-1 hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-[22px] w-[22px]"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="1.8"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />

                <path
                  d="M7.3 10.1V17"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                <path
                  d="M7.3 7V7.1"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                <path
                  d="M11.1 17V10.1"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                <path
                  d="M11.1 13.1C11.1 11.45 12.05 10.05 13.9 10.05C15.75 10.05 16.7 11.25 16.7 13.45V17"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </a>
          </div>

          {/* Mobil menü butonu */}
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={menuOpen}
            className="relative z-[70] ml-auto flex h-11 w-11 flex-col items-end justify-center gap-[6px] lg:hidden"
          >
            <span
              className={`block h-px bg-white transition-all duration-300 ${
                menuOpen
                  ? "w-8 translate-y-[7px] rotate-45"
                  : "w-8 translate-y-0 rotate-0"
              }`}
            />

            <span
              className={`block h-px bg-white transition-all duration-300 ${
                menuOpen ? "w-0 opacity-0" : "w-6 opacity-100"
              }`}
            />

            <span
              className={`block h-px bg-white transition-all duration-300 ${
                menuOpen
                  ? "w-8 -translate-y-[7px] -rotate-45"
                  : "w-8 translate-y-0 rotate-0"
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobil menü */}
      <div
        className={`fixed inset-0 z-40 bg-[#080b10] transition-all duration-500 lg:hidden ${
          menuOpen
            ? "pointer-events-auto visible opacity-100"
            : "pointer-events-none invisible opacity-0"
        }`}
      >
        <div className="flex min-h-screen flex-col px-6 pb-8 pt-[105px] sm:px-8">
          <nav className="flex flex-col border-t border-white/15">
            {navigationItems.map((item, index) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="group flex items-center justify-between border-b border-white/15 py-7"
                >
                  <div className="flex items-center gap-5">
                    <span className="text-[9px] tracking-[0.3em] text-white/30">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span
                      className={`text-[clamp(2.3rem,10vw,4rem)] font-light leading-none tracking-[-0.035em] transition-all duration-300 ${
                        active
                          ? "text-white"
                          : "text-white/65 group-hover:translate-x-2 group-hover:text-white"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  <span className="text-xl text-white/35 transition-transform duration-300 group-hover:translate-x-2">
                    →
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-white/15 pt-7">
            <p className="text-[9px] uppercase tracking-[0.28em] text-white/30">
              Sosyal Medya
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-8">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm uppercase tracking-[0.1em] text-white/70 transition-colors duration-300 hover:text-white"
              >
                Instagram
              </a>

              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm uppercase tracking-[0.1em] text-white/70 transition-colors duration-300 hover:text-white"
              >
                LinkedIn
              </a>
            </div>

            <div className="mt-9 flex items-center justify-between text-[9px] uppercase tracking-[0.18em] text-white/25">
              <span>ARZ Mimarlık</span>
              <span>İstanbul</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}