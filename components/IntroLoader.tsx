"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function IntroLoader() {
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const [finished, setFinished] = useState(false);

  useLayoutEffect(() => {
    if (!loaderRef.current || !logoRef.current) {
      return;
    }

    const context = gsap.context(() => {
      gsap.set(document.body, {
        overflow: "hidden",
      });

      const timeline = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          setFinished(true);
        },
      });

      timeline
        .fromTo(
          logoRef.current,
          {
            autoAlpha: 0,
            scale: 0.88,
          },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 1.1,
            ease: "power3.out",
          },
        )
        .to(logoRef.current, {
          scale: 1.035,
          duration: 0.7,
          ease: "sine.inOut",
        })
        .to(logoRef.current, {
          scale: 1,
          duration: 0.6,
          ease: "sine.inOut",
        })
        .to(
          logoRef.current,
          {
            autoAlpha: 0,
            scale: 0.9,
            duration: 0.65,
            ease: "power3.inOut",
          },
          "+=0.2",
        )
        .to(
          loaderRef.current,
          {
            autoAlpha: 0,
            duration: 0.8,
            ease: "power2.inOut",
          },
          "-=0.2",
        );
    }, loaderRef);

    return () => {
      document.body.style.overflow = "";
      context.revert();
    };
  }, []);

  if (finished) {
    return null;
  }

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#090909]"
    >
      <div
        ref={logoRef}
        className="relative h-44 w-56 opacity-0 md:h-64 md:w-80"
      >
        <Image
          src="/arz-logo-final.png"
          alt="ARZ Mimarlık"
          fill
          priority
          sizes="320px"
          className="object-contain"
        />
      </div>
    </div>
  );
}