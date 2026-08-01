import type { ReactNode } from "react";
import StudioProjectTabs from "@/components/studio/projects/StudioProjectTabs";

export default async function ProjectFilesLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <>
      <div className="mx-auto max-w-[1540px] px-4 pt-5 sm:px-6 lg:px-8">
        <StudioProjectTabs projectId={projectId} active="files" />
      </div>
      {children}
    </>
  );
}
