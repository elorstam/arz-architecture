"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";

const googleMapsUrl =
  "https://www.google.com/maps/search/?api=1&query=Arz%20Mimarl%C4%B1k%20Sancaktepe%20%C4%B0stanbul";

const instagramUrl = "https://www.instagram.com/arzmimarliknet/";
const linkedinUrl = "https://www.linkedin.com/company/90222590";

export default function ContactPage() {
  const pageRef = useRef<HTMLElement | null>(null);
  const labelRef = useRef<HTMLParagraphElement | null>(null);
  const titleLineOneRef = useRef<HTMLSpanElement | null>(null);
  const titleLineTwoRef = useRef<HTMLSpanElement | null>(null);
  const titleLineThreeRef = useRef<HTMLSpanElement | null>(null);
  const descriptionRef = useRef<HTMLParagraphElement | null>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const page = pageRef.current;

    if (!page) {
      return;
    }

    const context = gsap.context(() => {
      const titleLines = [
        titleLineOneRef.current,
        titleLineTwoRef.current,
        titleLineThreeRef.current,
      ].filter(Boolean);

      gsap.set(labelRef.current, {
        opacity: 0,
        y: 24,
      });

      gsap.set(titleLines, {
        opacity: 0,
        yPercent: 115,
      });

      gsap.set(descriptionRef.current, {
        opacity: 0,
        y: 35,
      });

      const heroTimeline = gsap.timeline({
        delay: 0.15,
        defaults: {
          ease: "power4.out",
        },
      });

      heroTimeline
        .to(labelRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.7,
        })
        .to(
          titleLines,
          {
            opacity: 1,
            yPercent: 0,
            duration: 1.15,
            stagger: 0.12,
          },
          "-=0.35",
        )
        .to(
          descriptionRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
          },
          "-=0.55",
        );

      const revealElements =
        page.querySelectorAll<HTMLElement>("[data-reveal]");

      revealElements.forEach((element) => {
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
              start: "top 88%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      const contactItems =
        page.querySelectorAll<HTMLElement>("[data-contact-item]");

      contactItems.forEach((element) => {
        gsap.fromTo(
          element,
          {
            opacity: 0,
            x: -35,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 93%",
              toggleActions: "play none none none",
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
      <Navbar />

      <section className="flex min-h-screen items-end px-6 pb-14 pt-36 md:px-10 md:pb-20 lg:px-16 lg:pb-24">
        <div className="mx-auto w-full max-w-[1800px]">
          <p
            ref={labelRef}
            className="text-[10px] uppercase tracking-[0.42em] text-white/40"
          >
            İletişim
          </p>

          <div className="mt-10 grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-24">
            <h1 className="text-[clamp(4rem,9vw,10rem)] font-light leading-[0.82] tracking-[-0.075em]">
              <span className="block overflow-hidden pb-[0.08em]">
                <span ref={titleLineOneRef} className="block">
                  Yeni bir
                </span>
              </span>

              <span className="block overflow-hidden pb-[0.08em]">
                <span ref={titleLineTwoRef} className="block">
                  proje üzerine
                </span>
              </span>

              <span className="block overflow-hidden pb-[0.08em]">
                <span
                  ref={titleLineThreeRef}
                  className="block text-white/40"
                >
                  konuşalım.
                </span>
              </span>
            </h1>

            <p
              ref={descriptionRef}
              className="max-w-xl text-base leading-7 text-white/55 md:text-lg md:leading-8"
            >
              Mimari tasarım, iç mimarlık, proje geliştirme ve danışmanlık
              hizmetleri hakkında bizimle doğrudan iletişime geçebilirsiniz.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/15 px-6 py-20 md:px-10 md:py-28 lg:px-16 lg:py-32">
        <div className="mx-auto grid max-w-[1800px] gap-16 lg:grid-cols-2 lg:gap-24">
          <div data-reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
              İletişim Bilgileri
            </p>

            <div className="mt-10 border-t border-white/15">
              <a
                data-contact-item
                href="tel:+905425704429"
                className="group flex items-center justify-between border-b border-white/15 py-7"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">
                    Telefon
                  </p>

                  <p className="mt-3 text-2xl font-light tracking-[-0.03em] md:text-3xl">
                    +90 542 570 44 29
                  </p>
                </div>

                <span className="text-xl text-white/35 transition-all duration-300 group-hover:translate-x-2 group-hover:text-white">
                  →
                </span>
              </a>

              <a
                data-contact-item
                href="mailto:info@arzmimarlik.net"
                className="group flex items-center justify-between border-b border-white/15 py-7"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">
                    E-posta
                  </p>

                  <p className="mt-3 break-all text-2xl font-light tracking-[-0.03em] md:text-3xl">
                    info@arzmimarlik.net
                  </p>
                </div>

                <span className="text-xl text-white/35 transition-all duration-300 group-hover:translate-x-2 group-hover:text-white">
                  →
                </span>
              </a>
            </div>
          </div>

          <div data-reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
              Ofis
            </p>

            <address className="mt-10 not-italic">
              <p className="max-w-xl text-2xl font-light leading-[1.45] tracking-[-0.03em] text-white/85 md:text-3xl">
                Abdurrahmangazi Mah.
                <br />
                Betül Sok.
                <br />
                Tuna İş Merkezi No: 2/4
                <br />
                Sancaktepe / İstanbul
              </p>
            </address>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-10 inline-flex items-center gap-5 border-b border-white/30 pb-3 text-[10px] uppercase tracking-[0.3em] transition-colors duration-300 hover:border-white"
            >
              Yol Tarifi

              <span className="text-lg transition-transform duration-300 group-hover:translate-x-2">
                →
              </span>
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-white/15 px-6 py-20 md:px-10 md:py-28 lg:px-16 lg:py-32">
        <div className="mx-auto grid max-w-[1800px] gap-16 lg:grid-cols-2 lg:gap-24">
          <div data-reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
              Sosyal Medya
            </p>

            <div className="mt-10 border-t border-white/15">
              <a
                data-contact-item
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between border-b border-white/15 py-7"
              >
                <span className="text-2xl font-light tracking-[-0.03em] md:text-3xl">
                  Instagram
                </span>

                <span className="text-xl text-white/35 transition-all duration-300 group-hover:translate-x-2 group-hover:text-white">
                  ↗
                </span>
              </a>

              <a
                data-contact-item
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between border-b border-white/15 py-7"
              >
                <span className="text-2xl font-light tracking-[-0.03em] md:text-3xl">
                  LinkedIn
                </span>

                <span className="text-xl text-white/35 transition-all duration-300 group-hover:translate-x-2 group-hover:text-white">
                  ↗
                </span>
              </a>
            </div>
          </div>

          <div data-reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
              Çalışma Saatleri
            </p>

            <div className="mt-10 border-t border-white/15">
              <div
                data-contact-item
                className="flex items-center justify-between border-b border-white/15 py-7"
              >
                <span className="text-lg font-light text-white/75">
                  Pazartesi – Cuma
                </span>

                <span className="text-sm tracking-[0.15em] text-white/45">
                  09:00 – 18:00
                </span>
              </div>

              <div
                data-contact-item
                className="flex items-center justify-between border-b border-white/15 py-7"
              >
                <span className="text-lg font-light text-white/75">
                  Cumartesi
                </span>

                <span className="text-sm tracking-[0.15em] text-white/45">
                  Randevu ile
                </span>
              </div>

              <div
                data-contact-item
                className="flex items-center justify-between border-b border-white/15 py-7"
              >
                <span className="text-lg font-light text-white/75">Pazar</span>

                <span className="text-sm tracking-[0.15em] text-white/45">
                  Kapalı
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/15 bg-[#070707] px-6 md:px-10 lg:px-16">
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
                  <Link
                    href="/"
                    className="group flex items-center gap-3 text-sm uppercase tracking-[0.1em] text-white/60 transition-colors duration-300 hover:text-white"
                  >
                    Anasayfa
                    <span className="translate-x-0 text-white/25 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>

                  <Link
                    href="/about"
                    className="group flex items-center gap-3 text-sm uppercase tracking-[0.1em] text-white/60 transition-colors duration-300 hover:text-white"
                  >
                    Hakkımızda
                    <span className="translate-x-0 text-white/25 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>

                  <Link
                    href="/projects"
                    className="group flex items-center gap-3 text-sm uppercase tracking-[0.1em] text-white/60 transition-colors duration-300 hover:text-white"
                  >
                    Projeler
                    <span className="translate-x-0 text-white/25 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>

                  <Link
                    href="/contact"
                    className="group flex items-center gap-3 text-sm uppercase tracking-[0.1em] text-white/60 transition-colors duration-300 hover:text-white"
                  >
                    İletişim
                    <span className="translate-x-0 text-white/25 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
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

            <div className="flex items-center gap-6">
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
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  })
                }
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
    </main>
  );
}