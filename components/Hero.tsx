"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PremiumFooter from "@/components/PremiumFooter";

gsap.registerPlugin(ScrollTrigger);

const values = [
  {
    number: "01",
    title: "Modern\nTasarım",
    description:
      "Güncel tasarım anlayışını, zamana karşı değerini koruyacak sade ve güçlü bir mimari dille bir araya getiriyoruz.",
  },
  {
    number: "02",
    title: "İşlevsellik",
    description:
      "Her mekânın kullanıcı ihtiyaçlarına cevap vermesini, estetik kadar kullanışlı ve sürdürülebilir olmasını önemsiyoruz.",
  },
  {
    number: "03",
    title: "Hızlı\nÇözüm",
    description:
      "Tasarım ve uygulama süreçlerinde oluşabilecek problemlere hızlı, gerçekçi ve uygulanabilir çözümler üretiyoruz.",
  },
];

const services = [
  "Konut",
  "Villa",
  "Ticari Alan",
  "Ofis",
  "Kentsel Dönüşüm",
  "İç Mimarlık",
  "Mimari Proje",
  "Uygulama ve Danışmanlık",
];

export default function Hero() {
  const pageRef = useRef<HTMLElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const projectLinkRef = useRef<HTMLAnchorElement | null>(null);

  useLayoutEffect(() => {
    const page = pageRef.current;
    const hero = heroRef.current;

    if (!page || !hero) {
      return;
    }

    const context = gsap.context(() => {
      gsap.set("[data-hero-reveal]", {
        opacity: 0,
        y: 40,
      });

      gsap.set("[data-title-line]", {
        opacity: 0,
        yPercent: 120,
      });

      gsap.set("[data-project-line]", {
        scaleX: 0,
        transformOrigin: "left center",
      });

      gsap.set("[data-project-hover-line]", {
        scaleX: 0,
        transformOrigin: "left center",
      });

      gsap.set(backgroundRef.current, {
        scale: 1.08,
      });

      const heroTimeline = gsap.timeline({
        delay: 0.5,
        defaults: {
          ease: "power4.out",
        },
      });

      heroTimeline
        .to(backgroundRef.current, {
          scale: 1,
          duration: 2,
          ease: "power3.out",
        })
        .to(
          "[data-hero-eyebrow]",
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
          },
          "-=1.45",
        )
        .to(
          "[data-title-line]",
          {
            opacity: 1,
            yPercent: 0,
            duration: 1.1,
            stagger: 0.13,
          },
          "-=1.1",
        )
        .to(
          "[data-hero-description]",
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
          },
          "-=0.55",
        )
        .to(
          "[data-project-line]",
          {
            scaleX: 1,
            duration: 1,
          },
          "-=0.8",
        )
        .to(
          "[data-hero-project]",
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
          },
          "-=0.7",
        )
        .to(
          "[data-scroll-indicator]",
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
          },
          "-=0.55",
        );

      gsap.to(backgroundRef.current, {
        yPercent: 7,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      gsap.to("[data-hero-content]", {
        yPercent: -7,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom 20%",
          scrub: 1,
        },
      });

      gsap.fromTo(
        "[data-home-intro]",
        {
          opacity: 0,
          y: 80,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-home-intro]",
            start: "top 88%",
            once: true,
          },
        },
      );

      gsap.utils
        .toArray<HTMLElement>("[data-home-reveal]")
        .forEach((element) => {
          gsap.fromTo(
            element,
            {
              opacity: 0,
              y: 70,
            },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 86%",
                once: true,
              },
            },
          );
        });

      gsap.utils
        .toArray<HTMLElement>("[data-value-card]")
        .forEach((element, index) => {
          gsap.fromTo(
            element,
            {
              opacity: 0,
              y: 70,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.95,
              delay: index * 0.09,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 90%",
                once: true,
              },
            },
          );
        });

      gsap.utils
        .toArray<HTMLElement>("[data-service-item]")
        .forEach((element, index) => {
          gsap.fromTo(
            element,
            {
              opacity: 0,
              x: -30,
            },
            {
              opacity: 1,
              x: 0,
              duration: 0.75,
              delay: index * 0.04,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 93%",
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

  const handleProjectMouseEnter = () => {
    if (!projectLinkRef.current) {
      return;
    }

    gsap.to("[data-project-arrow]", {
      x: 10,
      duration: 0.45,
      ease: "power3.out",
      overwrite: true,
    });

    gsap.to("[data-project-title]", {
      x: 7,
      duration: 0.45,
      ease: "power3.out",
      overwrite: true,
    });

    gsap.to("[data-project-hover-line]", {
      scaleX: 1,
      duration: 0.65,
      ease: "power3.out",
      overwrite: true,
    });

    gsap.to(backgroundRef.current, {
      scale: 1.025,
      duration: 1.2,
      ease: "power3.out",
      overwrite: true,
    });
  };

  const handleProjectMouseLeave = () => {
    gsap.to("[data-project-arrow]", {
      x: 0,
      duration: 0.45,
      ease: "power3.out",
      overwrite: true,
    });

    gsap.to("[data-project-title]", {
      x: 0,
      duration: 0.45,
      ease: "power3.out",
      overwrite: true,
    });

    gsap.to("[data-project-hover-line]", {
      scaleX: 0,
      duration: 0.5,
      ease: "power3.out",
      overwrite: true,
    });

    gsap.to(backgroundRef.current, {
      scale: 1,
      duration: 1.2,
      ease: "power3.out",
      overwrite: true,
    });
  };

  return (
    <main
      ref={pageRef}
      className="min-h-screen overflow-hidden bg-[#090909] text-white"
    >
      {/* HERO */}
      <section
        ref={heroRef}
        className="relative min-h-[100svh] overflow-hidden bg-[#080808] text-white"
      >
        {/* Vespera arka plan görseli */}
        <div
          ref={backgroundRef}
          className="absolute -inset-y-[4%] inset-x-0 will-change-transform"
        >
          <Image
            src="/vespera.png"
            alt="ARZ Mimarlık Vespera Port projesi"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
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
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[8] h-[38vh] min-h-[280px] bg-gradient-to-b from-transparent via-[#090909]/65 to-[#090909]" />

        {/* Geçişi daha doğal yapan ikinci katman */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[9] h-[18vh] bg-gradient-to-b from-transparent to-[#090909]" />

        {/* İnce çerçeve */}
        <div className="pointer-events-none absolute inset-x-5 bottom-5 top-24 z-10 border border-white/[0.11] md:inset-x-8 md:bottom-8 md:top-28 lg:inset-x-12 lg:bottom-10 lg:top-32" />

        {/* Hero içeriği */}
        <div
          data-hero-content
          className="relative z-20 mx-auto flex min-h-[100svh] w-full max-w-[1920px] flex-col px-6 pb-8 pt-32 will-change-transform md:px-10 md:pb-12 md:pt-40 lg:px-16 lg:pb-14 lg:pt-44"
        >
          <div className="flex flex-1 items-start">
            <div className="w-full">
              <div className="flex items-center gap-4">
                <span
                  data-hero-eyebrow
                  data-hero-reveal
                  className="block h-px w-8 bg-white/70 opacity-0 md:w-12"
                />

                <p
                  data-hero-eyebrow
                  data-hero-reveal
                  className="text-[8px] font-medium uppercase tracking-[0.4em] text-white/80 opacity-0 sm:text-[9px] md:text-[10px]"
                >
                  Mimarlık · İç Mimarlık · Mühendislik · Danışmanlık
                </p>
              </div>

              <h1 className="mt-10 max-w-[1100px] text-[clamp(4.4rem,10.5vw,12.5rem)] font-light leading-[0.71] tracking-[-0.085em] text-white md:mt-12">
                <span className="block overflow-hidden pb-[0.08em]">
                  <span
                    data-title-line
                    className="block will-change-transform"
                  >
                    Sade.
                  </span>
                </span>

                <span className="block overflow-hidden pb-[0.08em]">
                  <span
                    data-title-line
                    className="block will-change-transform"
                  >
                    Modern.
                  </span>
                </span>

                <span className="block overflow-hidden pb-[0.08em]">
                  <span
                    data-title-line
                    className="block will-change-transform"
                  >
                    Kalıcı.
                  </span>
                </span>
              </h1>
            </div>
          </div>

          <div className="mt-16 grid items-end gap-14 md:mt-20 lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-24">
            <div>
              <p
                data-hero-description
                data-hero-reveal
                className="max-w-[560px] text-sm font-light leading-6 tracking-[-0.01em] text-white/85 opacity-0 md:text-[15px] md:leading-7"
              >
                Zamana direnen, işlev ve estetiği dengeli biçimde bir araya
                getiren; bulunduğu çevreyle güçlü bir ilişki kuran mimari
                mekânlar tasarlıyoruz.
              </p>

              <div
                data-scroll-indicator
                data-hero-reveal
                className="mt-8 hidden items-center gap-4 opacity-0 lg:flex"
              >
                <span className="relative block h-[46px] w-px overflow-hidden bg-white/30">
                  <span className="absolute left-0 top-0 h-4 w-px animate-[heroScroll_1.8s_ease-in-out_infinite] bg-white/90" />
                </span>

                <span className="text-[8px] uppercase tracking-[0.36em] text-white/60">
                  Aşağı Kaydır
                </span>
              </div>
            </div>

            {/* Vespera Port kartı */}
            <Link
              ref={projectLinkRef}
              data-hero-project
              data-hero-reveal
              href="/projects/vespera-port"
              aria-label="Vespera Port projesini incele"
              onMouseEnter={handleProjectMouseEnter}
              onMouseLeave={handleProjectMouseLeave}
              className="group relative block w-full opacity-0"
            >
              <span
                data-project-line
                className="absolute left-0 top-0 h-px w-full bg-white/65"
              />

              <span
                data-project-hover-line
                className="absolute left-0 top-0 h-px w-full origin-left scale-x-0 bg-white"
              />

              <div className="pb-2 pt-6">
                <div className="flex items-start justify-between gap-8">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.38em] text-white/70 md:text-[9px]">
                      Gelecek Proje
                    </p>

                    <h2
                      data-project-title
                      className="mt-5 text-[clamp(2rem,3vw,3.25rem)] font-light leading-none tracking-[-0.06em] text-white will-change-transform"
                    >
                      VESPERA PORT
                    </h2>
                  </div>

                  <span
                    data-project-arrow
                    className="mt-1 text-2xl font-light text-white/80 transition-colors duration-300 will-change-transform group-hover:text-white"
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
                    Projeyi Keşfet
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
          <div data-home-intro className="mb-16 opacity-0 md:mb-24">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
              Yaklaşımımız
            </p>

            <h2 className="mt-7 max-w-5xl text-[clamp(3rem,6vw,7rem)] font-light leading-[0.9] tracking-[-0.06em]">
              Tasarımda üç temel ilke.
            </h2>
          </div>

          <div className="grid border-t border-white/15 lg:grid-cols-3">
            {values.map((value) => (
              <article
                key={value.number}
                data-value-card
                className="group min-h-[430px] border-b border-white/15 py-10 opacity-0 transition-colors duration-500 hover:bg-white hover:text-black lg:border-b-0 lg:border-r lg:px-10 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
              >
                <div className="flex h-full flex-col justify-between">
                  <p className="text-xs tracking-[0.3em] text-white/35 transition-colors duration-500 group-hover:text-black/40">
                    {value.number}
                  </p>

                  <div className="mt-24">
                    <h3 className="whitespace-pre-line text-4xl font-light leading-[0.95] tracking-[-0.05em] md:text-5xl">
                      {value.title}
                    </h3>

                    <p className="mt-8 max-w-sm text-sm leading-7 text-white/50 transition-colors duration-500 group-hover:text-black/65 md:text-base">
                      {value.description}
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
            <div data-home-reveal className="opacity-0">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
                Çalışma Alanlarımız
              </p>

              <h2 className="mt-7 text-[clamp(3.4rem,6vw,7rem)] font-light leading-[0.88] tracking-[-0.06em]">
                Farklı ölçeklerde,
                <br />
                aynı yaklaşım.
              </h2>
            </div>

            <div className="border-t border-white/15">
              {services.map((service, index) => (
                <div
                  key={service}
                  data-service-item
                  className="group flex items-center justify-between border-b border-white/15 py-6 opacity-0 md:py-8"
                >
                  <div className="flex items-center gap-6 md:gap-10">
                    <span className="text-[10px] tracking-[0.25em] text-white/30">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h3 className="text-2xl font-light tracking-[-0.035em] transition-transform duration-300 group-hover:translate-x-3 md:text-4xl">
                      {service}
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
          data-home-reveal
          className="mx-auto flex max-w-[1800px] flex-col items-start opacity-0"
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
            Yeni Bir Proje
          </p>

          <h2 className="mt-8 max-w-6xl text-[clamp(3.8rem,8vw,9.5rem)] font-light leading-[0.84] tracking-[-0.07em]">
            Bir sonraki
            <br />
            projenizi
            <br />
            birlikte tasarlayalım.
          </h2>

          <Link
            href="/contact"
            className="group mt-14 inline-flex items-center gap-5 border-b border-white/30 pb-3 text-[10px] uppercase tracking-[0.32em] transition-colors duration-300 hover:border-white md:text-xs"
          >
            İletişime Geç

            <span className="text-lg transition-transform duration-300 group-hover:translate-x-2">
              →
            </span>
          </Link>
        </div>
      </section>

      <PremiumFooter />

      <style jsx global>{`
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