"use client";

import Link from "next/link";
import {
  useRef,
  type FocusEvent,
  type KeyboardEvent,
} from "react";

import NavbarPrimaryItem from "@/components/NavbarPrimaryItem";

type Props = {
  label: string;
  quoteLabel: string;
  paymentLabel: string;
  contactHref: string;
  paymentHref: string;
  active: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ContactNavDropdown({
  label,
  quoteLabel,
  paymentLabel,
  contactHref,
  paymentHref,
  active,
  open,
  onOpenChange,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);
  const closeAndFocus = () => {
    onOpenChange(false);
    triggerRef.current?.focus();
  };

  const onTriggerKeyDown = (
    event: KeyboardEvent<HTMLElement>,
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      onOpenChange(true);

      requestAnimationFrame(() => {
        firstItemRef.current?.focus();
      });
    }

    if (event.key === " ") {
      event.preventDefault();
      onOpenChange(!open);
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      closeAndFocus();
    }
  };

  const onRootKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      closeAndFocus();
    }
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (
      !event.currentTarget.contains(
        event.relatedTarget as Node | null,
      )
    ) {
      onOpenChange(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className="contact-nav-dropdown relative"
      onMouseEnter={() => {
        onOpenChange(true);
      }}
      onMouseLeave={() => onOpenChange(false)}
      onFocusCapture={() => {
        onOpenChange(true);
      }}
      onBlur={onBlur}
      onKeyDown={onRootKeyDown}
    >
      <NavbarPrimaryItem
        ref={triggerRef}
        href={contactHref}
        active={active}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="contact-navigation-menu"
        onClick={(event) => {
          event.preventDefault();
          onOpenChange(!open);
        }}
        onKeyDown={onTriggerKeyDown}
        endAdornment={
          <span
            aria-hidden="true"
            className={`ml-1 text-[12px] leading-none opacity-70 transition-[color,transform] duration-300 ${
              open ? "rotate-180" : ""
            }`}
          >
            ⌄
          </span>
        }
      >
        {label}
      </NavbarPrimaryItem>

      <div
        className={`absolute left-1/2 top-full z-[90] w-[210px] -translate-x-1/2 pt-2 transition-[opacity,transform,visibility] duration-200 ${
          open
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-1 opacity-0"
        }`}
      >
        <div
          id="contact-navigation-menu"
          role="menu"
          aria-label={label}
          className="navbar-dropdown__panel overflow-hidden rounded-[2px] border"
        >
          <Link
            ref={firstItemRef}
            role="menuitem"
            href={contactHref}
            onClick={() => onOpenChange(false)}
            className="navbar-dropdown__item flex min-h-11 items-center px-4 text-[11px] uppercase tracking-[.12em]"
          >
            {quoteLabel}
          </Link>

          <Link
  role="menuitem"
  href={paymentHref}
  onClick={() => onOpenChange(false)}
  className="navbar-dropdown__item flex min-h-11 items-center px-4 text-[11px] uppercase tracking-[.12em]"
>
            {paymentLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
