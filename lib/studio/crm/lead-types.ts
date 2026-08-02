import {LEAD_CURRENCIES,LEAD_SERVICE_TYPES,LEAD_SOURCES,LEAD_STAGES,LEAD_STATUSES} from "./lead-constants.ts";

export type LeadStage=(typeof LEAD_STAGES)[number];
export type LeadStatus=(typeof LEAD_STATUSES)[number];
export type LeadServiceType=(typeof LEAD_SERVICE_TYPES)[number];
export type LeadSource=(typeof LEAD_SOURCES)[number];
export type LeadCurrency=(typeof LEAD_CURRENCIES)[number];
export type LeadArchiveFilter="active"|"archived"|"all";
export type StudioLeadMember={id:string;name:string;initials:string;role:string};
export type StudioLead={
 id:string;firstName:string;lastName:string;fullName:string;companyName:string;phone:string;email:string;
 city:string;district:string;serviceType:LeadServiceType;budgetAmount:string;budgetCurrency:LeadCurrency;
 source:LeadSource;stage:LeadStage;status:LeadStatus;notes:string;assignedUser:StudioLeadMember|null;
 assignedUserId:string;lastContactAt:string;nextFollowUpAt:string;lastContactLabel:string;nextFollowUpLabel:string;
 isArchived:boolean;createdAt:string;updatedAt:string;createdAtLabel:string;updatedAtLabel:string;canManage:boolean;
};
export type StudioLeadListItem=StudioLead;
export type StudioLeadInput={
 firstName:string;lastName:string;companyName:string;phone:string;email:string;city:string;district:string;
 serviceType:LeadServiceType;budgetAmount:string;budgetCurrency:LeadCurrency;source:LeadSource;
 stage:LeadStage;status:LeadStatus;notes:string;assignedUserId:string;lastContactAt:string;nextFollowUpAt:string;
};
export type LeadFormValues=Record<keyof StudioLeadInput,string>;
export type LeadFormState={success:boolean;message?:string;fieldErrors?:Partial<Record<keyof LeadFormValues,string[]>>;values?:LeadFormValues};
export type LeadQueryFilters={query?:string;stage?:LeadStage;status?:LeadStatus;serviceType?:LeadServiceType;assignedUserId?:string;archive?:LeadArchiveFilter;favoritesOnly?:boolean};
export type StudioLeadSummary={total:number;newLeads:number;awaitingQuote:number;won:number;lost:number};
