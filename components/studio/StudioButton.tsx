import type {ReactNode} from "react";

export type StudioButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "destructive" | "icon";
export type StudioButtonSize = "sm" | "md";

export function studioButtonClass(variant: StudioButtonVariant = "primary", size: StudioButtonSize = "md", className = "") {
  return ["studio-button", `studio-button--${variant}`, `studio-button--${size}`, className].filter(Boolean).join(" ");
}

export function StudioButtonSpinner() {
  return <span aria-hidden="true" className="studio-button__spinner" />;
}

export function StudioPendingLabel({pending, pendingLabel, children}: {
  pending: boolean;
  pendingLabel: string;
  children: ReactNode;
}) {
  return pending ? <><StudioButtonSpinner /><span>{pendingLabel}</span></> : <>{children}</>;
}
