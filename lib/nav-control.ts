export const navControlClassName =
  "nav-control inline-flex h-10 shrink-0 items-center justify-center";

export function navControlClasses(extra = "") {
  return `${navControlClassName} ${extra}`.trim();
}
