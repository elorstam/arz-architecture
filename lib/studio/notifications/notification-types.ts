export const PROJECT_STAGE_STATUSES = ["waiting", "in_progress", "completed", "cancelled"] as const;
export type ProjectStageStatus = (typeof PROJECT_STAGE_STATUSES)[number];
export const PROJECT_STAGE_STATUS_LABELS: Record<ProjectStageStatus, string> = {
  waiting: "Bekliyor",
  in_progress: "Devam ediyor",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

export type StudioProjectStage = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  sortOrder: number;
  status: ProjectStageStatus;
  startedAt: string | null;
  completedAt: string | null;
  responsibleUserId: string | null;
  isClientVisible: boolean;
  clientNotifiedAt: string | null;
  relatedFileIds: string[];
  note: string;
  isActive: boolean;
  isArchived: boolean;
  archivedAt: string | null;
  archivedBy: string | null;
  archivedByName: string | null;
  isSystem: boolean;
  municipalityStatus: "waiting"|"reviewing"|"approved"|"revision_requested"|"rejected";
  municipalityApprovedAt: string|null;
  municipalityApprovedBy: string|null;
  updatedAt: string;
};

export type StudioNotification = {
  id: string;
  sourceType: string;
  sourceId: string | null;
  channel: "whatsapp" | "email" | "client_portal";
  status: string;
  templateName: string;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  safeErrorCode: string | null;
  createdAt: string;
};

export type NotificationActionState = { success: boolean; message: string };
