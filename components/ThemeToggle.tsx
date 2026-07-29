"use client";

import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {navControlClasses} from "@/lib/nav-control";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem("arz-theme");
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
}

export default function ThemeToggle({className = ""}: {className?: string}) {
  const t=useTranslations("CMS");
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialTheme = getInitialTheme();
    // Hydration is the first point at which persisted browser theme state is available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
    document.documentElement.style.colorScheme = initialTheme;
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    window.localStorage.setItem("arz-theme", nextTheme);
  };

  const isDark = mounted ? theme === "dark" : true;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t('theme.light') : t('theme.dark')}
      title={isDark ? t('theme.light') : t('theme.dark')}
      className={navControlClasses(`theme-toggle w-10 ${className}`)}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
          <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.45" />
          <path d="M12 2.5V5M12 19V21.5M2.5 12H5M19 12H21.5M5.3 5.3L7.1 7.1M16.9 16.9L18.7 18.7M18.7 5.3L16.9 7.1M7.1 16.9L5.3 18.7" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
          <path d="M20.3 15.1A8.2 8.2 0 0 1 8.9 3.7 8.3 8.3 0 1 0 20.3 15.1Z" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
