import type {StudioIconName} from "@/components/studio/StudioIcons";
import {PROJECT_STAGES,PROJECT_STATUSES} from "@/lib/studio/projects/project-constants";

export type ProjectStage=(typeof PROJECT_STAGES)[number];
export type ProjectStatus=(typeof PROJECT_STATUSES)[number];
export type ProjectArchiveFilter="active"|"archived"|"all";
export type ProjectTeamMember={id?:string;name:string;initials:string;role:string};
export type ProjectMilestone={title:string;date:string;state:"completed"|"current"|"upcoming";description:string};
export type ProjectActivity={title:string;detail:string;type:string;actorInitials:string;relativeTime:string};
export type ProjectSummaryMetric={label:string;value:string;detail:string;icon:StudioIconName};
export type StudioProject={
 id:string;code:string;name:string;
 client:{name:string;contact:string;email:string;phone:string};
 category:string;location:string;year:string;stage:ProjectStage;status:ProjectStatus;
 progress:number;lastUpdate:string;responsible:ProjectTeamMember|null;
 nextMilestone:string;nextMilestoneDate:string;thumbnail:string;summary:string;
 currentPhase:string;startDate:string;targetDate:string;team:ProjectTeamMember[];
 startDateValue:string;targetDateValue:string;nextMilestoneDateValue:string;responsibleUserId:string;
 milestones:ProjectMilestone[];activities:ProjectActivity[];metrics:ProjectSummaryMetric[];
 notes:string[];isArchived:boolean;canManage:boolean;
};
export type StudioProjectMember={id:string;name:string;initials:string;role:string};
export type StudioProjectInput={
 code:string;name:string;clientName:string;clientContactName:string;clientEmail:string;
 clientPhone:string;category:string;location:string;projectYear:string;stage:ProjectStage;
 status:ProjectStatus;progress:number;summary:string;currentPhase:string;startDate:string;
 targetDate:string;nextMilestone:string;nextMilestoneDate:string;responsibleUserId:string;
};
export type ProjectFormValues=Record<keyof Omit<StudioProjectInput,"progress">,string>&{progress:string};
export type ProjectFormState={
 success:boolean;message?:string;fieldErrors?:Partial<Record<keyof ProjectFormValues,string[]>>;
 values?:ProjectFormValues;
};
export type StudioProjectQuery={query?:string;status?:ProjectStatus;stage?:ProjectStage;archive?:ProjectArchiveFilter};
