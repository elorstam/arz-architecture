export type StudioSearchCategory="projects"|"crm"|"files"|"folders"|"proposals"|"timeline"|"decisions"|"tags"|"official_processes";
export type StudioSearchResult={id:string;provider:string;category:StudioSearchCategory;categoryLabel:string;icon:string;title:string;subtitle:string;breadcrumb:string;badge:string;url:string;searchText:string};
export type StudioSearchResponse={query:string;groups:Array<{category:StudioSearchCategory;label:string;results:StudioSearchResult[]}>;total:number};
export type StudioSearchContext={organizationId:string;supabase:unknown};
