export type Theme = "light" | "dark";

const THEME_KEY = "arz-theme";
const ONE_YEAR_SECONDS = 31_536_000;

function isTheme(value: string | null | undefined): value is Theme {
  return value === "light" || value === "dark";
}

export function readThemeCookie(cookie = document.cookie): Theme | null {
  for (const part of cookie.split(";")) {
    const [name, ...valueParts] = part.trim().split("=");
    if (name === THEME_KEY) {
      try {
        const value = decodeURIComponent(valueParts.join("="));
        return isTheme(value) ? value : null;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function writeThemeCookie(theme: Theme): void {
  try {
    const hostname = window.location.hostname.toLowerCase();
    const isArzProductionDomain =
      hostname === "arzmimarlik.net" || hostname.endsWith(".arzmimarlik.net");
    const domain = isArzProductionDomain ? "; Domain=.arzmimarlik.net" : "";
    const secure = isArzProductionDomain || window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${THEME_KEY}=${theme}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${domain}${secure}`;
  } catch {
    // Theme changes must remain usable when cookies are unavailable.
  }
}

export function readThemePreference(): Theme {
  const cookieTheme = readThemeCookie();
  if (cookieTheme) {
    try {
      window.localStorage.setItem(THEME_KEY, cookieTheme);
    } catch {}
    return cookieTheme;
  }

  try {
    const storedTheme = window.localStorage.getItem(THEME_KEY);
    if (isTheme(storedTheme)) {
      writeThemeCookie(storedTheme);
      return storedTheme;
    }
  } catch {}

  return "dark";
}

export function persistThemePreference(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {}
  writeThemeCookie(theme);
}
