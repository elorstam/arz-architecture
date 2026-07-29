export type NavbarSurfaceState = {
  isScrolled: boolean;
  isHero: boolean;
  surfaceVariant: "hero" | "surface" | "mobile";
};

export function getNavbarSurfaceState(
  isScrolled: boolean,
  isHero: boolean,
  mobile = false,
): NavbarSurfaceState {
  return {
    isScrolled,
    isHero,
    surfaceVariant: mobile ? "mobile" : isHero && !isScrolled ? "hero" : "surface",
  };
}

export function navbarSurfaceData(state: NavbarSurfaceState) {
  return {
    "data-scrolled": state.isScrolled ? "true" : "false",
    "data-hero": state.isHero ? "true" : "false",
    "data-surface": state.surfaceVariant,
  } as const;
}
