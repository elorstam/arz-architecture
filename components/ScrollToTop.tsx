"use client";

import {useLayoutEffect} from "react";
import {usePathname, useSearchParams} from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const resetScroll = () => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
    };

    resetScroll();

    // Next.js render ve tarayıcı scroll restorasyonu tamamlandıktan sonra
    // konumu tekrar sıfırla. Böylece yeni sayfa footerdan başlamaz.
    const firstFrame = window.requestAnimationFrame(() => {
      resetScroll();
      window.requestAnimationFrame(resetScroll);
    });
    const timeout = window.setTimeout(resetScroll, 80);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.clearTimeout(timeout);
    };
  }, [pathname, query]);

  return null;
}
