import type {SVGProps} from "react";

export type StudioIconName =
  | "arrow" | "calendar" | "chart" | "check" | "clients" | "close" | "dashboard" | "files"
  | "folder" | "logout" | "menu" | "messages" | "money" | "notifications"
  | "payments" | "plus" | "render" | "revision" | "search" | "settings";

const paths: Record<StudioIconName, React.ReactNode> = {
  arrow: <><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
  check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
  clients: <><path d="M16 20v-1.5A4.5 4.5 0 0 0 11.5 14h-5A4.5 4.5 0 0 0 2 18.5V20"/><circle cx="9" cy="7" r="4"/><path d="M18 8a3 3 0 0 1 0 6M22 20v-1.5a4.5 4.5 0 0 0-3-4.24"/></>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  files: <><path d="M6 2.5h8l4 4V21.5H6Z"/><path d="M14 2.5v5h4M9 12h6M9 16h6"/></>,
  folder: <path d="M3 6.5h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>,
  logout: <><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10"/></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  messages: <path d="M4 5h16v12H8l-4 4Z"/>,
  money: <><path d="M12 2v20M17 6.5c-1-1.4-2.7-2-5-2-3 0-5 1.5-5 3.5s1.7 3 5 4 5 2 5 4-2 3.5-5 3.5c-2.3 0-4.2-.8-5.2-2.2"/></>,
  notifications: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8"/><path d="M10 21h4"/></>,
  payments: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  render: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></>,
  revision: <><path d="M4 4v6h6"/><path d="M5.5 15a8 8 0 1 0 .5-7l-2 2"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.09A1.7 1.7 0 0 0 9 19.36a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.09 14H3v-4h.09A1.7 1.7 0 0 0 4.64 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63 1.7 1.7 0 0 0 10 3.09V3h4v.09A1.7 1.7 0 0 0 15 4.64a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9 1.7 1.7 0 0 0 20.91 10H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z"/></>,
};

export function StudioIcon({name, className = "h-5 w-5", ...props}: {
  name: StudioIconName;
} & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" className={className}
      aria-hidden="true" {...props}>
      {paths[name]}
    </svg>
  );
}
