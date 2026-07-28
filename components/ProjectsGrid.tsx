"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type {Project} from "@/data/projects";
import { useLocale } from "next-intl";

gsap.registerPlugin(ScrollTrigger);


type TransitionState = {
  project: Project;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
} | null;

export default function ProjectsGrid({projects}: {projects: Project[]}) {
  const router = useRouter();
  const locale = useLocale();
  const localizedProjects = projects;

  const gridRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const overlayImageRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const overlayTextRef = useRef<HTMLDivElement | null>(null);

  const [transition, setTransition] = useState<TransitionState>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    localizedProjects.forEach((project) => {
      router.prefetch(`/${locale}/${locale === "tr" ? "projeler" : "projects"}/${project.slug}`);
    });
  }, [locale, router]);

  /*
   * Proje kartlarının sayfa açılış animasyonu
   */
  useLayoutEffect(() => {
    const grid = gridRef.current;

    if (!grid) {
      return;
    }

    const context = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(
        "[data-project-card]",
      );

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(cards, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
        });

        return;
      }

      gsap.set(cards, {
        opacity: 0,
        y: 80,
        scale: 0.965,
        filter: "blur(10px)",
        transformOrigin: "center center",
      });

      const introTimeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      introTimeline.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.05,
        stagger: 0.14,
        clearProps: "transform,filter",
      });

      ScrollTrigger.refresh();
    }, grid);

    return () => {
      context.revert();
    };
  }, []);

  /*
   * Kart tıklanınca tam ekran proje geçişi
   */
  useLayoutEffect(() => {
    if (!transition) {
      return;
    }

    const overlay = overlayRef.current;
    const overlayImage = overlayImageRef.current;
    const backdrop = backdropRef.current;
    const overlayText = overlayTextRef.current;

    if (!overlay || !overlayImage || !backdrop || !overlayText) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      router.push(`/${locale}/${locale === "tr" ? "projeler" : "projects"}/${transition.project.slug}`);

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }

    gsap.set(backdrop, {
      opacity: 0,
    });

    gsap.set(overlay, {
      position: "fixed",
      top: transition.rect.top,
      left: transition.rect.left,
      width: transition.rect.width,
      height: transition.rect.height,
      zIndex: 1001,
      overflow: "hidden",
      borderRadius: 0,
    });

    gsap.set(overlayImage, {
      scale: 1,
    });

    gsap.set(overlayText, {
      opacity: 0,
      y: 35,
    });

    const timeline = gsap.timeline({
      defaults: {
        overwrite: true,
      },
      onComplete: () => {
        router.push(`/${locale}/${locale === "tr" ? "projeler" : "projects"}/${transition.project.slug}`);
      },
    });

    timeline
      .to(
        backdrop,
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        },
        0,
      )
      .to(
        overlay,
        {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
          duration: 0.9,
          ease: "expo.inOut",
        },
        0,
      )
      .to(
        overlayImage,
        {
          scale: 1.06,
          duration: 1.1,
          ease: "expo.inOut",
        },
        0,
      )
      .to(
        overlayText,
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
        },
        0.44,
      )
      .to(
        overlayText,
        {
          opacity: 0,
          y: -18,
          duration: 0.25,
          ease: "power2.in",
        },
        0.9,
      );

    return () => {
      timeline.kill();
      document.body.style.overflow = previousOverflow;
    };
  }, [locale, router, transition]);

  function handleProjectClick(
    event: MouseEvent<HTMLAnchorElement>,
    project: Project,
  ) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();

    if (isTransitioning) {
      return;
    }

    const imageContainer =
      event.currentTarget.querySelector<HTMLElement>(
        "[data-project-image]",
      );

    if (!imageContainer) {
      router.push(`/${locale}/${locale === "tr" ? "projeler" : "projects"}/${project.slug}`);
      return;
    }

    const rect = imageContainer.getBoundingClientRect();

    setIsTransitioning(true);

    setTransition({
      project,
      rect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
    });
  }

  return (
    <>
      <div
        ref={gridRef}
        className="grid gap-x-8 gap-y-16 md:grid-cols-2 md:gap-y-24 lg:gap-x-12"
      >
        {localizedProjects.map((project, index) => (
          <article
            key={project.slug}
            data-project-card
            className="group opacity-0"
          >
            <Link
              href={`/${locale}/${locale === "tr" ? "projeler" : "projects"}/${project.slug}`}
              className="block"
              aria-label={locale !== "tr" ? `Explore ${project.title}` : `${project.title} projesini incele`}
              onClick={(event) =>
                handleProjectClick(event, project)
              }
            >
              <div
                data-project-image
                className="relative aspect-[4/3] overflow-hidden bg-[#111]"
              >
                <Image
                  src={project.cover}
                  alt={project.coverAlt}
                  fill
                  priority={index < 2}
                  sizes="(max-width: 767px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
                />

                <div className="absolute inset-0 bg-black/0 transition-colors duration-700 group-hover:bg-black/20" />

                <div className="absolute inset-x-0 bottom-0 flex translate-y-5 items-center justify-between px-5 pb-5 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 md:px-7 md:pb-7">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-white">
                    {locale !== "tr" ? "View Project" : "Projeyi İncele"}
                  </span>

                  <span className="text-2xl font-light text-white transition-transform duration-500 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>

              <div className="pt-6 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1">
                <div className="flex items-center justify-between gap-6">
                  <p className="text-[9px] uppercase tracking-[0.32em] text-white/35 transition-colors duration-500 group-hover:text-white/55">
                    {project.category}
                  </p>

                  <span className="text-lg font-light text-white/40 transition-all duration-500 group-hover:translate-x-2 group-hover:text-white">
                    →
                  </span>
                </div>

                <h2 className="mt-4 text-[clamp(1.8rem,3vw,3.2rem)] font-light leading-[0.95] tracking-[-0.055em] text-white">
                  {project.title}
                </h2>

                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[8px] uppercase tracking-[0.28em] text-white/30 transition-colors duration-500 group-hover:text-white/45">
                  <span>{project.location}</span>

                  <span className="h-[3px] w-[3px] rounded-full bg-white/25" />

                  <span>{project.year}</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {transition && (
        <div
          className="pointer-events-none fixed inset-0 z-[1000]"
          aria-hidden="true"
        >
          <div
            ref={backdropRef}
            className="absolute inset-0 bg-[#090909]"
          />

          <div ref={overlayRef}>
            <div
              ref={overlayImageRef}
              className="absolute inset-0 will-change-transform"
            >
              <Image
                src={transition.project.cover}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-black/30" />

              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
            </div>

            <div
              ref={overlayTextRef}
              className="absolute inset-0 flex items-end px-6 pb-10 sm:px-10 sm:pb-14 md:px-16 md:pb-16"
            >
              <div>
                <p className="text-[9px] uppercase tracking-[0.38em] text-white/60">
                  {transition.project.category}
                </p>

                <h2 className="mt-4 max-w-5xl text-[clamp(2.8rem,8vw,8rem)] font-light leading-[0.85] tracking-[-0.065em] text-white">
                  {transition.project.title}
                </h2>

                <div className="mt-6 flex items-center gap-4 text-[8px] uppercase tracking-[0.3em] text-white/55">
                  <span>{transition.project.location}</span>

                  <span className="h-[3px] w-[3px] rounded-full bg-white/50" />

                  <span>{transition.project.year}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}