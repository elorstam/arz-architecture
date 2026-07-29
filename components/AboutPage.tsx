"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PremiumFooter from "@/components/PremiumFooter";
import {useLocale, useTranslations} from "next-intl";

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const pageRef = useRef<HTMLElement | null>(null);
  const t = useTranslations("CMS");
  const locale = useLocale();
  const isCjk = ["ja", "zh", "ko"].includes(locale);
  const isArabic = locale === "ar";
  const services = [
    {number: "01", title: t("about.service1.title"), text: t("about.service1.text")},
    {number: "02", title: t("about.service2.title"), text: t("about.service2.text")},
    {number: "03", title: t("about.service3.title"), text: t("about.service3.text")},
  ];

  useLayoutEffect(() => {
    const page = pageRef.current;

    if (!page) {
      return;
    }

    const context = gsap.context(() => {
      const heroTimeline = gsap.timeline({
        delay: 0.12,
        defaults: {
          ease: "power3.out",
        },
      });

      heroTimeline
        .fromTo(
          "[data-about-label]",
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
          },
        )
        .fromTo(
          "[data-about-title] span",
          {
            opacity: 0,
            y: 90,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.1,
          },
          "-=0.3",
        )
        .fromTo(
          "[data-hero-copy]",
          {
            opacity: 0,
            y: 40,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.12,
          },
          "-=0.55",
        );

      gsap.utils
        .toArray<HTMLElement>("[data-reveal-section]")
        .forEach((section) => {
          gsap.fromTo(
            section,
            {
              opacity: 0,
              y: 60,
            },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 82%",
                once: true,
              },
            },
          );
        });

      gsap.utils
        .toArray<HTMLElement>("[data-service-item]")
        .forEach((item, index) => {
          gsap.fromTo(
            item,
            {
              opacity: 0,
              y: 45,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: index * 0.08,
              ease: "power3.out",
              scrollTrigger: {
                trigger: item,
                start: "top 88%",
                once: true,
              },
            },
          );
        });

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, page);

    return () => {
      context.revert();
    };
  }, []);

  return (
    <main
      ref={pageRef}
      className="min-h-screen overflow-hidden bg-[#090909] text-white"
    >

      {/* Hero */}
      <section className="relative flex min-h-screen items-end px-6 pb-20 pt-36 md:px-10 md:pb-24 md:pt-40 lg:px-16 lg:pb-28 lg:pt-44">
        <div className="mx-auto w-full max-w-[1800px]">
          <p
            data-about-label
            className="text-[10px] uppercase tracking-[0.45em] text-white/40 opacity-0"
          >
            {t("about.label")}
          </p>

          <div className="mt-10 grid gap-16 lg:grid-cols-[1.16fr_0.84fr] lg:items-end lg:gap-24 xl:gap-32">
            <div>
              <h1
                data-about-title
                className={`font-light ${
                  isCjk
                    ? "text-[clamp(3.2rem,7vw,8rem)] leading-[0.98] tracking-[-0.045em]"
                    : isArabic
                      ? "text-[clamp(3.4rem,7vw,8rem)] leading-[1.08] tracking-[-0.03em]"
                      : "text-[clamp(4rem,8.7vw,10rem)] leading-[0.82] tracking-[-0.075em]"
                }`}
              >
                <span className="block opacity-0">{t("about.hero.line1")}</span>
                <span className="block opacity-0">{t("about.hero.line2")}</span>
                <span className="block opacity-0">{t("about.hero.line3")}</span>
                <span className="block text-white/40 opacity-0">
                  {t("about.hero.line4")}
                </span>
              </h1>
            </div>

            <div className="border-t border-white/15 pt-8 lg:border-l lg:border-t-0 lg:pl-14 lg:pt-0 xl:pl-20">
              <p
                data-hero-copy
                className="text-2xl font-light leading-[1.4] tracking-[-0.035em] text-white/95 opacity-0 md:text-3xl"
              >
                {t("about.hero.lead")}
              </p>

              <p
                data-hero-copy
                className="mt-8 max-w-2xl text-sm leading-7 text-white/50 opacity-0 md:text-base md:leading-8"
              >
                {t("about.hero.body")}
              </p>

              <div
                data-hero-copy
                className="mt-10 flex items-center gap-4 text-[9px] uppercase tracking-[0.36em] text-white/40 opacity-0"
              >
                <span>{t("about.city")}</span>
                <span className="h-px w-10 bg-white/20" />
                <span>2023</span>
              </div>
            </div>
          </div>
        </div>
      </section>

  

      {/* Hikâye */}
      <section
        data-reveal-section
        className="px-6 pb-28 md:px-10 md:pb-36 lg:px-16 lg:pb-44"
      >
        <div className="mx-auto grid w-full max-w-[1800px] gap-14 border-t border-white/15 pt-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24 lg:pt-16">
          <div>
            <p className="text-[10px] uppercase tracking-[0.45em] text-white/40">
              {t("about.story.eyebrow")}
            </p>

            <h2 className="mt-8 max-w-xl text-[clamp(2.7rem,5vw,6.5rem)] font-light leading-[0.95] tracking-[-0.06em]">
              {t("about.story.title")}
            </h2>
          </div>

          <div className="lg:pt-16">
            <p className="max-w-3xl text-2xl font-light leading-[1.45] tracking-[-0.03em] text-white/90 md:text-3xl">
              {t("about.story.lead")}
            </p>

            <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-12">
              <p className="text-sm leading-7 text-white/50 md:text-base md:leading-8">
                {t("about.story.body1")}
              </p>

              <p className="text-sm leading-7 text-white/50 md:text-base md:leading-8">
                {t("about.story.body2")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hizmetler / çalışma biçimi */}
      <section className="px-6 pb-28 md:px-10 md:pb-36 lg:px-16 lg:pb-44">
        <div className="mx-auto w-full max-w-[1800px]">
          <div
            data-reveal-section
            className="flex flex-col gap-8 border-t border-white/15 pt-12 md:flex-row md:items-end md:justify-between lg:pt-16"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.45em] text-white/40">
                {t("about.process.eyebrow")}
              </p>

              <h2 className="mt-8 max-w-3xl text-[clamp(2.7rem,5.4vw,7rem)] font-light leading-[0.92] tracking-[-0.065em]">
                {t("about.process.title1")}<span className="block text-white/40">{t("about.process.title2")}</span>
              </h2>
            </div>

            <p className="max-w-md text-sm leading-7 text-white/45 md:text-right md:text-base md:leading-8">
              {t("about.process.body")}
            </p>
          </div>

          <div className="mt-16 border-t border-white/15">
            {services.map((service) => (
              <article
                key={service.number}
                data-service-item
                className="grid gap-6 border-b border-white/15 py-10 opacity-0 md:grid-cols-[110px_0.72fr_1.28fr] md:items-start md:gap-10 md:py-12"
              >
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/35">
                  {service.number}
                </p>

                <h3 className="text-2xl font-light tracking-[-0.035em] md:text-3xl">
                  {service.title}
                </h3>

                <p className="max-w-2xl text-sm leading-7 text-white/50 md:text-base md:leading-8">
                  {service.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section
        data-reveal-section
        className="px-6 pb-28 md:px-10 md:pb-36 lg:px-16 lg:pb-44"
      >
        <div className="mx-auto w-full max-w-[1800px] py-16 md:py-24 lg:py-32">
          <p className="text-[10px] uppercase tracking-[0.45em] text-white/35">
            {t("about.manifesto.eyebrow")}
          </p>

          <p className="mt-10 max-w-[1500px] text-[clamp(2.8rem,6.4vw,8.5rem)] font-light leading-[0.94] tracking-[-0.07em]">
            {t("about.manifesto.line1")}<span className="text-white/40"> {t("about.manifesto.line2")}</span>
          </p>
        </div>
      </section>

      <PremiumFooter />
    </main>
  );
}
