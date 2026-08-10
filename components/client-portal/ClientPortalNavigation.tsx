"use client";

import {
  usePathname,
  useSearchParams,
} from "next/navigation";

import StudioTabs from "@/components/studio/StudioTabs";

const items = [
  {
    href: "/client",
    label: "Genel Bakış",
    icon: "dashboard" as const,
  },
  {
    href: "/client/stages",
    label: "Proje Aşamaları",
    icon: "activity" as const,
  },
  {
    href: "/client/renders",
    label: "Renderlar",
    icon: "render" as const,
  },
  {
    href: "/client/files",
    label: "Dosyalar",
    icon: "files" as const,
  },
  {
    href: "/client/documents",
    label: "Evraklar",
    icon: "file-text" as const,
  },
  {
    href: "/client/finance",
    label: "Finans / Ödemeler",
    icon: "payments" as const,
  },
  {
    href: "/client/notifications",
    label: "Bildirimler",
    icon: "notifications" as const,
  },
  {
    href: "/client/profile",
    label: "Profil",
    icon: "user" as const,
  },
] as const;

export default function ClientPortalNavigation() {
  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const project =
    searchParams.get(
      "project",
    );

  const withProject =
    items.map((item) => ({
      ...item,

      href: project
        ? `${item.href}?project=${encodeURIComponent(
            project,
          )}`
        : item.href,
    }));

  return (
    <div className="studio-project-tabs-v2 client-project-navigation">
    <StudioTabs
      items={withProject}
      active={
        project
          ? `${pathname}?project=${encodeURIComponent(
              project,
            )}`
          : pathname
      }
      ariaLabel="Client Portal navigasyonu"
      variant="workspace-navigation"
    />
    </div>
  );
}
