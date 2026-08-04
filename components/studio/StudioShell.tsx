"use client";

import {useState} from "react";
import StudioHeader from "@/components/studio/StudioHeader";
import StudioSidebar from "@/components/studio/StudioSidebar";

export default function StudioShell({children, organizationName, userName, roleLabel}: {
  children: React.ReactNode; organizationName: string; userName: string; roleLabel: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="studio-root min-h-screen overflow-x-hidden bg-[#f7f9fc] text-[#22282e]">
      <StudioSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}
        organizationName={organizationName} userName={userName} roleLabel={roleLabel} />
      <div className="min-h-screen min-w-0 lg:pl-[282px]">
        <StudioHeader onMenuOpen={() => setSidebarOpen(true)} userName={userName} />
        <main>{children}</main>
      </div>
    </div>
  );
}
