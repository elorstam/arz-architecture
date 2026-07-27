"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PremiumFooter from "@/components/PremiumFooter";
import type { Project } from "@/data/projects";

type ProjectDetailProps = {
  project: Project;
};

export default function ProjectDetail({
  project,
}: ProjectDetailProps) {
  const pageRef = useRef<HTMLElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const metaRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLParagraphElement | null>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const page = pageRef.current;

    if (!page) {
      return;
    }

    const context = gsap.context(() => {
      gsap.set(imageRef.current, {
        clipPath: "inset(0 0 100% 0)",
        scale: 1.08,
      });

      gsap.set(titleRef.current, {
        opacity: 0,
        y: 80,
      });

      gsap.set(metaRef.current, {
        opacity: 0,
        y: 30,
      });

      gsap.set(scrollRef.current, {
        opacity: 0,
        y: 20,
      });

      const introTimeline = gsap.timeline({
        delay: 0.1,
        defaults: {
          ease: "power4.out",
        },
      });

      introTimeline
        .to(imageRef.current, {
          clipPath: "inset(0 0 0% 0)",
          scale: 1,
          duration: 1.45,
        })
        .to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
          },
          "-=0.8",
        )
        .to(
          metaRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
          },
          "-=0.65",
        )
        .to(
          scrollRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
          },
          "-=0.45",
        );

      const revealElements =
        page.querySelectorAll<HTMLElement>("[data-reveal]");

      revealElements.forEach((element) => {
        gsap.fromTo(
          element,
          {
            opacity: 0,
            y: 75,
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

      const galleryImages =
        page.querySelectorAll<HTMLElement>("[data-gallery-image]");

      galleryImages.forEach((element) => {
        const image = element.querySelector("img");

        gsap.fromTo(
          element,
          {
            opacity: 0,
            y: 90,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          },
        );

        if (image) {
          gsap.fromTo(
            image,
            {
              scale: 1.08,
            },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: element,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            },
          );
        }
      });

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, page);

    return () => {
      context.revert();
    };
  }, [project.slug]);

  return (
    <main
      ref={pageRef}
      className="min-h-screen overflow-hidden bg-[#090909] text-white"
    >

      <section className="relative min-h-screen">
        <div
          ref={imageRef}
          className="absolute inset-0 overflow-hidden bg-[#111]"
        >
          <Image
            src={project.cover}
            alt={project.coverAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/20" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col justify-end px-6 pb-12 pt-32 md:px-10 md:pb-16 lg:px-16 lg:pb-20">
          <div className="mx-auto w-full max-w-[1800px]">
            <div
              ref={metaRef}
              className="mb-7 flex flex-wrap items-center gap-x-7 gap-y-2 text-[10px] uppercase tracking-[0.22em] text-white/65"
            >
              <span>{project.category}</span>
              <span>{project.location}</span>
              <span>{project.year}</span>
            </div>

            <h1
              ref={titleRef}
              className="text-[clamp(3.3rem,9vw,10rem)] font-light leading-[0.84] tracking-[-0.075em]"
            >
              {project.titleLines.map((line, index) => (
                <span key={line} className="block">
                  {line}
                  {index < project.titleLines.length - 1 && <br />}
                </span>
              ))}
            </h1>

            <p
              ref={scrollRef}
              className="mt-10 text-[9px] uppercase tracking-[0.35em] text-white/55"
            >
              Projeyi Keşfet ↓
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/15 px-6 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40">
        <div className="mx-auto grid max-w-[1800px] gap-16 lg:grid-cols-[0.75fr_1.25fr] lg:gap-28">
          <div data-reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
              Proje Bilgileri
            </p>

            <dl className="mt-10 border-t border-white/15">
              <div className="flex items-center justify-between gap-8 border-b border-white/15 py-5">
                <dt className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Proje
                </dt>

                <dd className="text-right text-sm text-white/75">
                  {project.title}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-8 border-b border-white/15 py-5">
                <dt className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Kategori
                </dt>

                <dd className="text-right text-sm text-white/75">
                  {project.category}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-8 border-b border-white/15 py-5">
                <dt className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Konum
                </dt>

                <dd className="text-right text-sm text-white/75">
                  {project.location}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-8 border-b border-white/15 py-5">
                <dt className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Yıl
                </dt>

                <dd className="text-right text-sm text-white/75">
                  {project.year}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-8 border-b border-white/15 py-5">
                <dt className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Hizmet
                </dt>

                <dd className="text-right text-sm leading-6 text-white/75">
                  {project.services.map((service) => (
                    <span key={service} className="block">
                      {service}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>

          <div data-reveal>
            <p className="max-w-4xl text-2xl font-light leading-[1.4] tracking-[-0.035em] text-white/90 md:text-4xl md:leading-[1.32]">
              {project.description}
            </p>

            <div className="mt-12 grid gap-8 border-t border-white/15 pt-10 md:grid-cols-2 md:gap-12">
              {project.detailParagraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-sm leading-7 text-white/50 md:text-base md:leading-8"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 md:px-10 md:pb-32 lg:px-16 lg:pb-40">
        <div className="mx-auto max-w-[1800px]">
          <div data-reveal className="mb-12 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
                Galeri
              </p>

              <h2 className="mt-5 text-[clamp(3rem,6vw,7rem)] font-light leading-none tracking-[-0.06em]">
                Görseller
              </h2>
            </div>

            <p className="hidden text-[10px] uppercase tracking-[0.25em] text-white/30 md:block">
              {String(project.images.length).padStart(2, "0")} Görsel
            </p>
          </div>

          <div className="space-y-8 md:space-y-12 lg:space-y-16">
            {project.images.map((image, index) => (
              <figure
                key={image.src}
                data-gallery-image
                className="relative overflow-hidden bg-[#111]"
              >
                <div
                  className={
                    image.contain
                      ? "relative aspect-[16/10]"
                      : "relative aspect-[16/9]"
                  }
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="100vw"
                    className={
                      image.contain ? "object-contain" : "object-cover"
                    }
                  />
                </div>

                <figcaption className="flex items-center justify-between border-t border-white/10 px-1 py-4 text-[9px] uppercase tracking-[0.25em] text-white/30">
                  <span>
                    {String(index + 1).padStart(2, "0")} /{" "}
                    {String(project.images.length).padStart(2, "0")}
                  </span>

                  <span>{project.title}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/15 px-6 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40">
        <div
          data-reveal
          className="mx-auto flex max-w-[1800px] flex-col gap-12 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
              Projeler
            </p>

            <h2 className="mt-7 text-[clamp(3.5rem,7vw,8rem)] font-light leading-[0.88] tracking-[-0.065em]">
              Diğer projeleri
              <br />
              keşfedin.
            </h2>
          </div>

          <Link
            href="/projects"
            className="group inline-flex w-fit items-center gap-5 border-b border-white/30 pb-3 text-[10px] uppercase tracking-[0.3em] transition-colors duration-300 hover:border-white"
          >
            Tüm Projelere Dön

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