"use client";

import Link from "next/link";

const instagramUrl = "https://www.instagram.com/arzmimarliknet/";
const linkedinUrl = "https://www.linkedin.com/company/90222590";

const pageLinks = [
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

export default function PremiumFooter() {
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
              href="/"
              className="inline-block text-[clamp(2.8rem,5vw,6rem)] font-light leading-none tracking-[-0.065em] transition-opacity duration-300 hover:opacity-65"
            >
              ARZ
              <br />
              Mimarlık
            </Link>

            <p className="mt-8 max-w-md text-sm leading-7 text-white/40">
              Mimari tasarım, iç mimarlık, proje geliştirme ve danışmanlık
              hizmetleri.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <p className="text-[9px] uppercase tracking-[0.32em] text-white/30">
                Sayfalar
              </p>

              <nav className="mt-6 flex flex-col items-start gap-4">
                {pageLinks.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="group flex items-center gap-3 text-sm uppercase tracking-[0.1em] text-white/60 transition-colors duration-300 hover:text-white"
                  >
                    {page.label}

                    <span className="text-white/25 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.32em] text-white/30">
                İletişim
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
            <p>© 2026 ARZ Mimarlık</p>
            <p>Tüm hakları saklıdır</p>
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
              Yukarı

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