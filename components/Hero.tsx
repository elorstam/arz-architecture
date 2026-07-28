"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import PremiumFooter from "@/components/PremiumFooter";

const valueKeys = ["modern", "functionality", "solutions"] as const;

const serviceKeys = [
  "residential",
  "villa",
  "commercial",
  "office",
  "urbanTransformation",
  "interiorArchitecture",
  "architecturalProject",
  "implementationConsulting",
] as const;

export default function Hero() {
  const pageRef = useRef<HTMLElement | null>(null);
  const locale = useLocale();
  const t = useTranslations("Hero");

  const projectsHref = `/${locale}/${locale === "tr" ? "projeler" : "projects"}/vespera-port`;
  const contactHref = `/${locale}/${locale === "tr" ? "iletisim" : "contact"}`;

  useEffect(() => {
    const page = pageRef.current;

    if (!page || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      page?.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
        element.classList.remove("opacity-0", "translate-y-12", "translate-y-8");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target as HTMLElement;
          element.classList.remove("opacity-0", "translate-y-12", "translate-y-8");
          observer.unobserve(element);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    page.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main
      ref={pageRef}
      className="min-h-screen overflow-hidden bg-[#090909] text-white"
    >
      {/* HERO */}
      <section
        className="theme-dark-surface relative min-h-[100svh] overflow-hidden bg-[#080808] text-white"
      >
        {/* Vespera arka plan görseli */}
        <div
          className="absolute -inset-y-[4%] inset-x-0 animate-[heroImageIn_1.8s_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none"
        >
          <Image
            src="/vespera.png"
            alt={t("imageAlt")}
            fill
            priority
            sizes="100vw"
            className="hero-image-dark object-cover object-center"
          />
          <Image
            src="/images/vespera-port/cover.png"
            alt={t("imageAlt")}
            fill
            priority
            sizes="100vw"
            className="hero-image-light object-cover object-center"
          />
        </div>

        {/* Genel karartma */}
        <div className="pointer-events-none absolute inset-0 bg-black/[0.06]" />

        {/* Sol taraftaki yazılar için karartma */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />

        {/* Alt bölüm karartması */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />

        {/* Köşe gölgesi */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,transparent_0%,transparent_42%,rgba(0,0,0,0.18)_100%)]" />

        {/* Vespera görselinden siyah bölüme yumuşak geçiş */}
        <div className="hero-transition-primary pointer-events-none absolute inset-x-0 bottom-0 z-[8] h-[38vh] min-h-[280px] bg-gradient-to-b from-transparent via-[#090909]/65 to-[#090909]" />

        {/* Geçişi daha doğal yapan ikinci katman */}
        <div className="hero-transition-secondary pointer-events-none absolute inset-x-0 bottom-0 z-[9] h-[18vh] bg-gradient-to-b from-transparent to-[#090909]" />

        {/* İnce çerçeve */}
        <div className="pointer-events-none absolute inset-x-5 bottom-5 top-24 z-10 border border-white/[0.11] md:inset-x-8 md:bottom-8 md:top-28 lg:inset-x-12 lg:bottom-10 lg:top-32" />

        {/* Hero içeriği */}
        <div
          className="relative z-20 mx-auto flex min-h-[100svh] w-full max-w-[1920px] flex-col px-6 pb-8 pt-32 md:px-10 md:pb-12 md:pt-40 lg:px-16 lg:pb-14 lg:pt-44"
        >
          <div className="flex flex-1 items-start">
            <div className="w-full">
              <div className="flex items-center gap-4">
                <span
                  className="block h-px w-8 animate-[heroFadeUp_.7s_.2s_cubic-bezier(0.22,1,0.36,1)_both] bg-white/70 motion-reduce:animate-none md:w-12"
                />

                <p
                  className="animate-[heroFadeUp_.7s_.25s_cubic-bezier(0.22,1,0.36,1)_both] text-[8px] font-medium uppercase tracking-[0.4em] text-white/80 motion-reduce:animate-none sm:text-[9px] md:text-[10px]"
                >
                  {t("eyebrow")}
                </p>
              </div>

              <h1 className="mt-10 max-w-[1100px] text-[clamp(4.4rem,10.5vw,12.5rem)] font-light leading-[0.71] tracking-[-0.085em] text-white md:mt-12">
                <span className="block overflow-hidden pb-[0.08em]">
                  <span
                    className="block animate-[heroTitleIn_.95s_.3s_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none"
                  >
                    {t("titleLine1")}
                  </span>
                </span>

                <span className="block overflow-hidden pb-[0.08em]">
                  <span
                    className="block animate-[heroTitleIn_.95s_.42s_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none"
                  >
                    {t("titleLine2")}
                  </span>
                </span>

                <span className="block overflow-hidden pb-[0.08em]">
                  <span
                    className="block animate-[heroTitleIn_.95s_.54s_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none"
                  >
                    {t("titleLine3")}
                  </span>
                </span>
              </h1>
            </div>
          </div>

          <div className="mt-16 grid items-end gap-14 md:mt-20 lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-24">
            <div>
              <p
                className="max-w-[560px] animate-[heroFadeUp_.8s_.65s_cubic-bezier(0.22,1,0.36,1)_both] text-sm font-light leading-6 tracking-[-0.01em] text-white/85 motion-reduce:animate-none md:text-[15px] md:leading-7"
              >
                {t("intro")}
              </p>

              <div
                className="mt-8 hidden animate-[heroFadeUp_.8s_.85s_cubic-bezier(0.22,1,0.36,1)_both] items-center gap-4 motion-reduce:animate-none lg:flex"
              >
                <span className="relative block h-[46px] w-px overflow-hidden bg-white/30">
                  <span className="absolute left-0 top-0 h-4 w-px animate-[heroScroll_1.8s_ease-in-out_infinite] bg-white/90" />
                </span>

                <span className="text-[8px] uppercase tracking-[0.36em] text-white/60">
                  {t("scroll")}
                </span>
              </div>
            </div>

            {/* Vespera Port kartı */}
            <Link
              href={projectsHref}
              aria-label={t("featuredProject.ariaLabel")}
              className="group relative block w-full animate-[heroFadeUp_.85s_.75s_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none"
            >
              <span
                className="absolute left-0 top-0 h-px w-full origin-left animate-[heroLineIn_1s_.8s_cubic-bezier(0.22,1,0.36,1)_both] bg-white/65 motion-reduce:animate-none"
              />

              <span
                className="absolute left-0 top-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100"
              />

              <div className="pb-2 pt-6">
                <div className="flex items-start justify-between gap-8">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.38em] text-white/70 md:text-[9px]">
                      {t("featuredProject.label")}
                    </p>

                    <h2
                      className="mt-5 text-[clamp(2rem,3vw,3.25rem)] font-light leading-none tracking-[-0.06em] text-white transition-transform duration-500 ease-out group-hover:translate-x-2"
                    >
                      VESPERA PORT
                    </h2>
                  </div>

                  <span
                    className="mt-1 text-2xl font-light text-white/80 transition-all duration-500 ease-out group-hover:translate-x-2 group-hover:text-white"
                  >
                    →
                  </span>
                </div>

                <div className="mt-7 grid grid-cols-3 border-t border-white/25 pt-4">
                  <div>
                    <p className="text-[7px] uppercase tracking-[0.28em] text-white/55">
                      Tip
                    </p>

                    <p className="mt-2 text-[9px] uppercase tracking-[0.22em] text-white/85">
                      Commercial
                    </p>
                  </div>

                  <div>
                    <p className="text-[7px] uppercase tracking-[0.28em] text-white/55">
                      Konum
                    </p>

                    <p className="mt-2 text-[9px] uppercase tracking-[0.22em] text-white/85">
                      Ankara
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[7px] uppercase tracking-[0.28em] text-white/55">
                      Yıl
                    </p>

                    <p className="mt-2 text-[9px] uppercase tracking-[0.22em] text-white/85">
                      2026–2027
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-[8px] uppercase tracking-[0.34em] text-white/70 transition-colors duration-500 group-hover:text-white">
                    {t("featuredProject.cta")}
                  </span>

                  <span className="h-px w-10 bg-white/45 transition-all duration-500 group-hover:w-16 group-hover:bg-white" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* YAKLAŞIMIMIZ */}
      <section className="relative z-20 -mt-px bg-[#090909] px-6 pb-24 pt-28 md:px-10 md:pb-32 md:pt-40 lg:px-16 lg:pb-40 lg:pt-52">
        <div className="mx-auto max-w-[1800px]">
          <div data-reveal className="mb-16 translate-y-12 opacity-0 transition-all duration-1000 ease-out md:mb-24">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
              {t("approach.eyebrow")}
            </p>

            <h2 className="mt-7 max-w-5xl text-[clamp(3rem,6vw,7rem)] font-light leading-[0.9] tracking-[-0.06em]">
              {t("approach.title")}
            </h2>
          </div>

          <div className="grid border-t border-white/15 lg:grid-cols-3">
            {valueKeys.map((valueKey, index) => (
              <article
                key={valueKey}
                data-reveal
                className="group min-h-[430px] translate-y-12 border-b border-white/15 py-10 opacity-0 transition-all duration-700 ease-out hover:bg-white hover:text-black lg:border-b-0 lg:border-r lg:px-10 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
              >
                <div className="flex h-full flex-col justify-between">
                  <p className="text-xs tracking-[0.3em] text-white/35 transition-colors duration-500 group-hover:text-black/40">
                    {String(index + 1).padStart(2, "0")}
                  </p>

                  <div className="mt-24">
                    <h3 className="whitespace-pre-line text-4xl font-light leading-[0.95] tracking-[-0.05em] md:text-5xl">
                      {t(`approach.values.${valueKey}.title`)}
                    </h3>

                    <p className="mt-8 max-w-sm text-sm leading-7 text-white/50 transition-colors duration-500 group-hover:text-black/65 md:text-base">
                      {t(`approach.values.${valueKey}.description`)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ÇALIŞMA ALANLARIMIZ */}
      <section className="border-t border-white/15 px-6 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40">
        <div className="mx-auto max-w-[1800px]">
          <div className="grid gap-16 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <div data-reveal className="translate-y-12 opacity-0 transition-all duration-1000 ease-out">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
                {t("services.eyebrow")}
              </p>

              <h2 className="mt-7 text-[clamp(3.4rem,6vw,7rem)] font-light leading-[0.88] tracking-[-0.06em]">
                {t("services.titleLine1")}
                <br />
                {t("services.titleLine2")}
              </h2>
            </div>

            <div className="border-t border-white/15">
              {serviceKeys.map((serviceKey, index) => (
                <div
                  key={serviceKey}
                  data-reveal
                  className="group flex translate-y-8 items-center justify-between border-b border-white/15 py-6 opacity-0 transition-all duration-700 ease-out md:py-8"
                >
                  <div className="flex items-center gap-6 md:gap-10">
                    <span className="text-[10px] tracking-[0.25em] text-white/30">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h3 className="text-2xl font-light tracking-[-0.035em] transition-transform duration-300 group-hover:translate-x-3 md:text-4xl">
                      {t(`services.items.${serviceKey}`)}
                    </h3>
                  </div>

                  <span className="text-xl text-white/30 transition-all duration-300 group-hover:translate-x-2 group-hover:text-white">
                    →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    

      {/* İLETİŞİM YÖNLENDİRMESİ */}
      <section className="border-t border-white/15 px-6 py-28 md:px-10 md:py-40 lg:px-16 lg:py-48">
        <div
          data-reveal
          className="mx-auto flex max-w-[1800px] translate-y-12 flex-col items-start opacity-0 transition-all duration-1000 ease-out"
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
            {t("contact.eyebrow")}
          </p>

          <h2 className="mt-8 max-w-6xl text-[clamp(3.8rem,8vw,9.5rem)] font-light leading-[0.84] tracking-[-0.07em]">
            {t("contact.titleLine1")}
            <br />
            {t("contact.titleLine2")}
            <br />
            {t("contact.titleLine3")}
          </h2>

          <Link
            href={contactHref}
            className="group mt-14 inline-flex items-center gap-5 border-b border-white/30 pb-3 text-[10px] uppercase tracking-[0.32em] transition-colors duration-300 hover:border-white md:text-xs"
          >
            {t("contact.cta")}

            <span className="text-lg transition-transform duration-300 group-hover:translate-x-2">
              →
            </span>
          </Link>
        </div>
      </section>

      <PremiumFooter />

      <style jsx global>{`
        @keyframes heroImageIn {
          from { transform: scale(1.06); }
          to { transform: scale(1); }
        }

        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes heroTitleIn {
          from { opacity: 0; transform: translateY(115%); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes heroLineIn {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        @keyframes heroScroll {
          0% {
            transform: translateY(-18px);
            opacity: 0;
          }

          30% {
            opacity: 1;
          }

          70% {
            opacity: 1;
          }

          100% {
            transform: translateY(48px);
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}