"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import Navbar from "@/components/Navbar";
import PremiumFooter from "@/components/PremiumFooter";

export default function AboutPage() {
  const pageRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const page = pageRef.current;

    if (!page) {
      return;
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        delay: 0.15,
        defaults: {
          ease: "power3.out",
        },
      });

      timeline
        .fromTo(
          "[data-about-label]",
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
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
            stagger: 0.11,
          },
          "-=0.35",
        )
        .fromTo(
          "[data-about-info]",
          {
            opacity: 0,
            y: 45,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.14,
          },
          "-=0.55",
        );
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
      <Navbar />

      <section className="relative flex min-h-screen items-end px-6 pb-20 pt-36 md:px-10 md:pb-24 md:pt-40 lg:px-16 lg:pb-28 lg:pt-44">
        <div className="mx-auto w-full max-w-[1800px]">
          <p
            data-about-label
            className="text-[10px] uppercase tracking-[0.45em] text-white/40 opacity-0"
          >
            Hakkımızda
          </p>

          <div className="mt-10 grid gap-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-24 xl:gap-32">
            {/* Sol taraf */}
            <div>
              <h1
                data-about-title
                className="text-[clamp(4rem,8.7vw,10rem)] font-light leading-[0.82] tracking-[-0.075em]"
              >
                <span className="block opacity-0">Mimarlık,</span>

                <span className="block opacity-0">yaşamın</span>

                <span className="block opacity-0">kalitesini</span>

                <span className="block text-white/40 opacity-0">
                  şekillendirir.
                </span>
              </h1>
            </div>

            {/* Sağ taraf */}
            <div className="border-t border-white/15 lg:border-l lg:border-t-0 lg:pl-14 xl:pl-20">
              {/* Kuruluş */}
              <div
                data-about-info
                className="grid gap-8 border-b border-white/15 py-10 opacity-0 md:grid-cols-[150px_1fr] md:py-12"
              >
                <div>
                  <p className="text-[9px] uppercase tracking-[0.4em] text-white/35">
                    Kuruluş
                  </p>

                  <p className="mt-5 text-5xl font-light leading-none tracking-[-0.06em] md:text-6xl">
                    2023
                  </p>

                  <p className="mt-4 text-[9px] uppercase tracking-[0.3em] text-white/40">
                    İstanbul
                  </p>
                </div>

                <div className="md:pt-1">
                  <p className="text-xl font-light leading-[1.45] tracking-[-0.03em] text-white/90 md:text-2xl">
                    ARZ Mimarlık, Şubat 2023&apos;te iki kardeş tarafından
                    kurulan bağımsız bir mimarlık ve iç mimarlık ofisidir.
                  </p>

                  <p className="mt-6 text-sm leading-7 text-white/50 md:text-base md:leading-8">
                    Mimari tasarım, iç mimarlık, proje geliştirme, uygulama ve
                    danışmanlık süreçlerini bütüncül bir yaklaşımla yürütüyoruz.
                    Projeleri estetik, işlevsellik ve teknik uygulanabilirlik
                    açısından birlikte değerlendiriyoruz.
                  </p>
                </div>
              </div>

              {/* Ekip */}
              <div
                data-about-info
                className="grid gap-8 py-10 opacity-0 md:grid-cols-[150px_1fr] md:py-12"
              >
                <div>
                  <p className="text-[9px] uppercase tracking-[0.4em] text-white/35">
                    Ekip
                  </p>

                  <p className="mt-5 text-5xl font-light leading-none tracking-[-0.06em] md:text-6xl">
                    02
                  </p>

                  <p className="mt-4 text-[9px] uppercase tracking-[0.3em] text-white/40">
                    Kardeş
                  </p>
                </div>

                <div className="md:pt-1">
                  <p className="text-xl font-light leading-[1.45] tracking-[-0.03em] text-white/90 md:text-2xl">
                    Küçük bir ekip yapısıyla çalışıyor, proje sahipleriyle
                    doğrudan iletişim kuruyoruz.
                  </p>

                  <p className="mt-6 text-sm leading-7 text-white/50 md:text-base md:leading-8">
                    Çekirdek tasarım ekibimiz, mühendislik alanındaki deneyimli
                    aile desteğiyle birlikte çalışmaktadır. Bu yapı sayesinde
                    karar süreçlerini hızlandırıyor ve projenin her aşamasını
                    yakından takip ediyoruz.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        
      </section>

      <PremiumFooter />
    </main>
  );
}