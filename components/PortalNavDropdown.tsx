"use client";

import { useRef, type FocusEvent, type KeyboardEvent } from "react";

import NavbarPrimaryItem from "@/components/NavbarPrimaryItem";

type Props = {
  label: string;
  clientLabel: string;
  studioLabel: string;
  clientHref: string;
  studioHref: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function PortalNavDropdown({
  label,
  clientLabel,
  studioLabel,
  clientHref,
  studioHref,
  open,
  onOpenChange,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onOpenChange(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onOpenChange(false);
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      onOpenChange(true);
      requestAnimationFrame(() => firstItemRef.current?.focus());
    }
  };

  return (
    <div
      ref={rootRef}
      className="portal-nav-dropdown relative"
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => onOpenChange(false)}
      onFocusCapture={() => onOpenChange(true)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      <NavbarPrimaryItem
        href={clientHref}
        active={open}
        onClick={(event) => {
          event.preventDefault();
          onOpenChange(!open);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="portal-navigation-menu"
        endAdornment={
          <span
            aria-hidden="true"
            className={`ml-1 text-[12px] leading-none opacity-70 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          >
            ⌄
          </span>
        }
      >
        {label}
      </NavbarPrimaryItem>

      <div className={`navbar-dropdown__position absolute left-1/2 top-full z-[90] w-[210px] -translate-x-1/2 pt-2 transition-[opacity,transform,visibility] duration-200 ${open ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-1 opacity-0"}`}>
        <div id="portal-navigation-menu" role="menu" aria-label={label} className="navbar-dropdown__panel overflow-hidden rounded-[2px] border">
          <a ref={firstItemRef} role="menuitem" href={clientHref} target="_blank" rel="noopener noreferrer" onClick={() => onOpenChange(false)} className="navbar-dropdown__item flex min-h-11 items-center px-4 text-[11px] uppercase tracking-[.12em]">
            {clientLabel}
          </a>
          <a role="menuitem" href={studioHref} target="_blank" rel="noopener noreferrer" onClick={() => onOpenChange(false)} className="navbar-dropdown__item flex min-h-11 items-center px-4 text-[11px] uppercase tracking-[.12em]">
            {studioLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
