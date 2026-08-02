import { notFound } from "next/navigation";
import StudioProjectStages from "@/components/studio/notifications/StudioProjectStages";
import StudioProjectStageMilestoneWorkspace from "@/components/studio/notifications/StudioProjectStageMilestoneWorkspace";
import StudioProjectTabs from "@/components/studio/projects/StudioProjectTabs";
import {
  getProjectWhatsAppReadiness,
  initializeProjectStages,
  listActiveProjectStages,
  listArchivedProjectStages,
  listProjectNotifications,
} from "@/lib/studio/notifications/notification-repository";
import {
  listAttachableStageFiles,
  listStageFiles,
} from "@/lib/studio/notifications/stage-flex-repository";
import { getStudioProjectAccess, getStudioProjectById } from "@/lib/studio/projects/project-repository";

export const dynamic = "force-dynamic";

type StageView = "active" | "archive";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const [{ projectId }, query] = await Promise.all([params, searchParams]);
  const view: StageView = query.view === "archive" ? "archive" : "active";
  const [project, access] = await Promise.all([
    getStudioProjectById(projectId),
    getStudioProjectAccess(),
  ]);
  if (!project) notFound();

  let payload: null | Awaited<ReturnType<typeof load>> = null;
  try {
    if (access.canManage) await initializeProjectStages(projectId);
    payload = await load(projectId, view);
  } catch {
    payload = null;
  }

  return (
    <main className="mx-auto max-w-[1540px] px-4 py-6 sm:px-6">
      <p className="text-sm font-semibold text-[#9a7b40]">{project.code}</p>
      <h1 className="mt-1 text-3xl font-semibold">Proje Aşamaları</h1>
      <StudioProjectTabs projectId={projectId} active="stages" />
       {payload ? (
        view === "active" ? <StudioProjectStageMilestoneWorkspace
          projectId={projectId}
          {...payload}
          canManage={access.canManage}
        /> : <StudioProjectStages
          projectId={projectId}
          {...payload}
          view={view}
          canManage={access.canManage}
        />
      ) : (
        <p role="status" className="mt-6 rounded-xl border border-dashed p-6">
          Migration 017 uygulandıktan sonra esnek aşamalar burada görünecek.
        </p>
      )}
    </main>
  );
}

async function load(projectId: string, view: StageView) {
  const [activeStages, archivedStages, notifications, attachments, files, whatsApp] =
    await Promise.all([
      listActiveProjectStages(projectId),
      listArchivedProjectStages(projectId),
      listProjectNotifications(projectId),
      listStageFiles(projectId),
      listAttachableStageFiles(projectId),
      getProjectWhatsAppReadiness(projectId),
    ]);

  return {
    stages: view === "archive" ? archivedStages : activeStages,
    notifications,
    attachments,
    files: view === "archive" ? [] : files,
    activeCount: activeStages.length,
    archiveCount: archivedStages.length,
    whatsApp,
  };
}
