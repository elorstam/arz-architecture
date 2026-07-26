"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const projectLinkRef = useRef<HTMLAnchorElement | null>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const hero = heroRef.current;

    if (!hero) {
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

      const timeline = gsap.timeline({
        delay: 0.5,
        defaults: {
          ease: "power4.out",
        },
      });

      timeline
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
        yPercent: 5,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      gsap.to("[data-hero-content]", {
        yPercent: -8,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom 25%",
          scrub: 1,
        },
      });

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, hero);

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
    <section
      ref={heroRef}
      className="relative min-h-[100svh] overflow-hidden bg-[#080808] text-white"
    >
      {/* Arka plan görseli */}
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

      {/* Hafif genel karartma */}
      <div className="pointer-events-none absolute inset-0 bg-black/[0.06]" />

      {/* Yazıların bulunduğu sol taraf için kontrollü karartma */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />

      {/* Alt metinler için hafif taban karartması */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />

      {/* Çok hafif köşe gölgesi */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,transparent_0%,transparent_42%,rgba(0,0,0,0.18)_100%)]" />

      {/* İnce çerçeve */}
      <div className="pointer-events-none absolute inset-x-5 bottom-5 top-24 z-10 border border-white/[0.11] md:inset-x-8 md:bottom-8 md:top-28 lg:inset-x-12 lg:bottom-10 lg:top-32" />

      {/* Ana içerik */}
      <div
        data-hero-content
        className="relative z-20 mx-auto flex min-h-[100svh] w-full max-w-[1920px] flex-col px-6 pb-8 pt-32 will-change-transform md:px-10 md:pb-12 md:pt-40 lg:px-16 lg:pb-14 lg:pt-44"
      >
        {/* Üst bölüm */}
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

        {/* Alt bölüm */}
        <div className="mt-16 grid items-end gap-14 md:mt-20 lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-24">
          {/* Açıklama */}
          <div>
            <p
              data-hero-description
              data-hero-reveal
              className="max-w-[560px] text-sm font-light leading-6 tracking-[-0.01em] text-white/85 opacity-0 md:text-[15px] md:leading-7"
            >
              Zamana direnen, işlev ve estetiği dengeli biçimde bir araya
              getiren; bulunduğu çevreyle güçlü bir ilişki kuran mimari mekânlar
              tasarlıyoruz.
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

          {/* Vespera Port proje kartı */}
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
    </section>
  );
}