"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import PremiumFooter from "@/components/PremiumFooter";

const projects = [
  {
    image: "/images/vespera-port/cover.png",
    title: "VESPERA PORT",
    location: "Ankara",
    category: "Commercial",
    year: "2026–2027",
    href: "/projects/vespera-port",
    position: "object-center",
  },
];

export default function ProjectsPage() {
  const pageRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const page = pageRef.current;

    if (!page) {
      return;
    }

    const context = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-project-card]");
      const images = gsap.utils.toArray<HTMLElement>(
        "[data-project-card-image]",
      );

      gsap.set(headingRef.current, {
        opacity: 0,
        y: 28,
      });

      gsap.set(cards, {
        opacity: 0,
        y: 65,
      });

      gsap.set(images, {
        scale: 1.08,
      });

      const introTimeline = gsap.timeline({
        delay: 0.15,
        defaults: {
          ease: "power4.out",
        },
      });

      introTimeline
        .to(headingRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.9,
        })
        .to(
          cards,
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            stagger: 0.12,
          },
          "-=0.55",
        )
        .to(
          images,
          {
            scale: 1,
            duration: 1.6,
            stagger: 0.1,
          },
          "-=1.25",
        );

      const cleanupFunctions: Array<() => void> = [];

      cards.forEach((card) => {
        const image = card.querySelector<HTMLElement>(
          "[data-project-card-image]",
        );

        const overlay = card.querySelector<HTMLElement>(
          "[data-project-overlay]",
        );

        const projectInfo = card.querySelector<HTMLElement>(
          "[data-project-info]",
        );

        const projectLine = card.querySelector<HTMLElement>(
          "[data-project-line]",
        );

        const projectArrow = card.querySelector<HTMLElement>(
          "[data-project-arrow]",
        );

        const bottomInfo = card.querySelector<HTMLElement>(
          "[data-bottom-info]",
        );

        const hoverTimeline = gsap.timeline({
          paused: true,
          defaults: {
            ease: "power3.out",
          },
        });

        hoverTimeline
          .to(
            image,
            {
              scale: 1.055,
              duration: 0.9,
            },
            0,
          )
          .to(
            overlay,
            {
              opacity: 1,
              duration: 0.55,
            },
            0,
          )
          .to(
            bottomInfo,
            {
              opacity: 0,
              y: 10,
              duration: 0.3,
            },
            0,
          )
          .fromTo(
            projectInfo,
            {
              opacity: 0,
              y: 24,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.55,
            },
            0.08,
          )
          .fromTo(
            projectLine,
            {
              scaleX: 0,
              transformOrigin: "left center",
            },
            {
              scaleX: 1,
              duration: 0.55,
            },
            0.16,
          )
          .fromTo(
            projectArrow,
            {
              opacity: 0,
              x: -10,
            },
            {
              opacity: 1,
              x: 0,
              duration: 0.45,
            },
            0.2,
          );

        const handleMouseEnter = () => {
          hoverTimeline.play();
        };

        const handleMouseLeave = () => {
          hoverTimeline.reverse();
        };

        card.addEventListener("mouseenter", handleMouseEnter);
        card.addEventListener("mouseleave", handleMouseLeave);

        cleanupFunctions.push(() => {
          card.removeEventListener("mouseenter", handleMouseEnter);
          card.removeEventListener("mouseleave", handleMouseLeave);
        });
      });

      return () => {
        cleanupFunctions.forEach((cleanup) => cleanup());
      };
    }, page);

    return () => {
      context.revert();
    };
  }, []);

  return (
    <main
      ref={pageRef}
      className="min-h-screen overflow-x-hidden bg-black text-white"
    >

      <section className="border-b border-white/10 bg-black px-5 pb-7 pt-28 md:px-8 md:pb-8 md:pt-32 lg:px-10">
        <div
          ref={headingRef}
          className="mx-auto flex max-w-[1900px] flex-col gap-5 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="text-[9px] uppercase tracking-[0.4em] text-white/35">
              Selected Works
            </p>

            <h1 className="mt-4 text-[clamp(2.6rem,5vw,5.8rem)] font-light leading-none tracking-[-0.06em]">
              Projeler
            </h1>
          </div>

          <p className="max-w-md text-sm leading-6 text-white/45 md:text-right">
            Mimari yaklaşımımızı, bağlam ve kullanıcı ihtiyaçları doğrultusunda
            şekillendirdiğimiz seçili çalışmalar.
          </p>
        </div>
      </section>

      <section className="bg-black">
        <div className="grid grid-cols-1 gap-[3px] bg-black md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => (
            <Link
              key={project.href}
              href={project.href}
              data-project-card
              className="relative block h-[65vh] min-h-[480px] overflow-hidden bg-[#101010] md:h-[48vw] md:min-h-[500px] xl:h-[31vw] xl:min-h-[430px] xl:max-h-[620px]"
              aria-label={`${project.title} projesini incele`}
            >
              <div
                data-project-card-image
                className="absolute inset-0 will-change-transform"
              >
                <Image
                  src={project.image}
                  alt={`${project.title} mimari proje kapak görseli`}
                  fill
                  priority={index < 3}
                  sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                  className={`object-cover ${project.position}`}
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

              <div
                data-project-overlay
                className="absolute inset-0 bg-black/60 opacity-0"
              />

              <div
                data-project-info
                className="absolute inset-0 flex items-center px-8 opacity-0 md:px-10 lg:px-12"
              >
                <div className="w-full max-w-[390px]">
                  <p className="text-[9px] uppercase tracking-[0.35em] text-white/55">
                    {String(index + 1).padStart(2, "0")}
                  </p>

                  <h2 className="mt-5 text-[clamp(2.2rem,3.4vw,4.4rem)] font-light leading-[0.95] tracking-[-0.045em]">
                    {project.title}
                  </h2>

                  <div
                    data-project-line
                    className="mt-6 h-px w-full bg-white/45"
                  />

                  <div className="mt-5 flex items-end justify-between gap-6">
                    <div>
                      <p className="text-sm font-light tracking-[0.02em] text-white/85">
                        {project.location}
                      </p>

                      <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                        {project.category} · {project.year}
                      </p>
                    </div>

                    <span
                      data-project-arrow
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/35 text-lg"
                    >
                      ↗
                    </span>
                  </div>
                </div>
              </div>

              <div
                data-bottom-info
                className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-5 md:p-6"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/80">
                    {project.title}
                  </p>

                  <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-white/45">
                    {project.location} · {project.category}
                  </p>
                </div>

                <p className="text-[9px] uppercase tracking-[0.2em] text-white/45">
                  {String(index + 1).padStart(2, "0")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-black px-6 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.4em] text-white/35">
              ARZ Mimarlık
            </p>

            <h2 className="mt-7 max-w-5xl text-[clamp(3rem,7vw,8rem)] font-light leading-[0.88] tracking-[-0.065em]">
              Her proje,
              <br />
              kendi bağlamından doğar.
            </h2>
          </div>

          <Link
            href="/tr/iletisim"
            className="group inline-flex w-fit items-center gap-5 border-b border-white/25 pb-3 text-[9px] uppercase tracking-[0.3em] transition-colors duration-300 hover:border-white"
          >
            Yeni Bir Proje Konuşalım

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