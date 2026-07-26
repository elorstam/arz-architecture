"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
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

export default function AboutPage() {
  const pageRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const introTimeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      introTimeline
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
          "[data-about-intro]",
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
          },
          "-=0.45",
        );

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
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
              start: "top 85%",
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
              y: 60,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              delay: index * 0.08,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 88%",
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
              x: -25,
            },
            {
              opacity: 1,
              x: 0,
              duration: 0.7,
              delay: index * 0.04,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 92%",
                once: true,
              },
            },
          );
        });

      ScrollTrigger.refresh();
    }, pageRef);

    return () => context.revert();
  }, []);

  return (
    <main
      ref={pageRef}
      className="min-h-screen overflow-hidden bg-[#090909] text-white"
    >
      <Navbar />

      {/* Giriş */}
      <section className="relative flex min-h-screen items-end px-6 pb-16 pt-36 md:px-10 md:pb-20 lg:px-16 lg:pb-24">
        <div className="mx-auto w-full max-w-[1800px]">
          <p
            data-about-label
            className="text-[10px] uppercase tracking-[0.45em] text-white/40 opacity-0"
          >
            Hakkımızda
          </p>

          <div className="mt-10 grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-24">
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

            <p
              data-about-intro
              className="max-w-xl text-base leading-7 text-white/55 opacity-0 md:text-lg md:leading-8"
            >
              Mekânları yalnızca tasarlamıyor; kullanıcıların ihtiyaçlarını,
              yapının çevresini ve uygulama koşullarını birlikte değerlendirerek
              şekillendiriyoruz.
            </p>
          </div>
        </div>
      </section>

      {/* Kuruluş ve hikâye */}
      <section className="border-t border-white/15 px-6 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40">
        <div className="mx-auto grid max-w-[1800px] gap-16 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
          <div data-reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
              Kuruluş
            </p>

            <p className="mt-6 text-[clamp(5rem,10vw,11rem)] font-light leading-none tracking-[-0.08em]">
              2023
            </p>

            <p className="mt-5 text-sm uppercase tracking-[0.24em] text-white/45">
              İstanbul
            </p>
          </div>

          <div data-reveal className="lg:pt-10">
            <p className="max-w-4xl text-2xl font-light leading-[1.35] tracking-[-0.035em] text-white/90 md:text-4xl md:leading-[1.3]">
              ARZ Mimarlık, Şubat 2023&apos;te iki kardeş tarafından kurulan,
              mimarlık ve iç mimarlık alanlarında hizmet veren bağımsız bir
              tasarım ofisidir.
            </p>

            <div className="mt-12 grid gap-8 border-t border-white/15 pt-10 md:grid-cols-2 md:gap-12">
              <p className="text-sm leading-7 text-white/55 md:text-base md:leading-8">
                Çekirdek tasarım ekibimiz; mimari tasarım, iç mimarlık, proje
                geliştirme ve uygulama süreçlerini birlikte yürütmektedir.
                Mühendislik alanındaki aile deneyimimiz sayesinde projeleri
                yalnızca görsel açıdan değil, teknik uygulanabilirlik açısından
                da değerlendiriyoruz.
              </p>

              <p className="text-sm leading-7 text-white/55 md:text-base md:leading-8">
                Her projeyi kendi ihtiyaçları ve koşulları doğrultusunda ele
                alıyoruz. Gereksiz karmaşıklıktan uzak, modern, işlevsel ve uzun
                ömürlü çözümler geliştirmeyi hedefliyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Değerler */}
      <section className="border-t border-white/15 px-6 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40">
        <div className="mx-auto max-w-[1800px]">
          <div data-reveal className="mb-16 md:mb-24">
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

      {/* Hizmet alanları */}
      <section className="border-t border-white/15 px-6 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40">
        <div className="mx-auto max-w-[1800px]">
          <div className="grid gap-16 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <div data-reveal>
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

      {/* Ekip */}
      <section className="border-t border-white/15 px-6 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40">
        <div className="mx-auto max-w-[1800px]">
          <div
            data-reveal
            className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
                Ekip
              </p>

              <h2 className="mt-7 max-w-4xl text-[clamp(3.4rem,6.5vw,7.5rem)] font-light leading-[0.88] tracking-[-0.065em]">
                Küçük bir ekip,
                <br />
                doğrudan iletişim.
              </h2>
            </div>

            <div className="flex flex-col justify-end">
              <p className="max-w-2xl text-xl font-light leading-[1.5] tracking-[-0.025em] text-white/75 md:text-2xl">
                İki kardeşten oluşan çekirdek tasarım ekibimiz, mühendislik
                alanındaki deneyimli aile desteğiyle birlikte çalışmaktadır.
              </p>

              <p className="mt-8 max-w-xl text-sm leading-7 text-white/50 md:text-base md:leading-8">
                Küçük ekip yapımız sayesinde proje sahipleriyle doğrudan iletişim
                kuruyor, karar süreçlerini hızlandırıyor ve projenin her
                aşamasını yakından takip ediyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* İletişim yönlendirmesi */}
      <section className="border-t border-white/15 px-6 py-28 md:px-10 md:py-40 lg:px-16 lg:py-48">
        <div
          data-reveal
          className="mx-auto flex max-w-[1800px] flex-col items-start"
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

</main>
  );
}