import "server-only";
import {getStudioContext} from "@/lib/studio/auth/get-studio-context";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
import type {StudioSearchProvider} from "./search-provider";
import type {StudioSearchResponse} from "./search-types";
import {safeSearchTerm} from "./search-utils";
import {projectSearchProvider} from "./providers/project-provider";
import {crmSearchProvider} from "./providers/crm-provider";
import {fileSearchProvider} from "./providers/file-provider";
import {fileVersionSearchProvider} from "./providers/file-version-provider";
import {folderSearchProvider} from "./providers/folder-provider";
import {proposalSearchProvider} from "./providers/proposal-provider";
import {timelineSearchProvider} from "./providers/timeline-provider";
import {decisionSearchProvider} from "./providers/decision-provider";

const providers:readonly StudioSearchProvider[]=[projectSearchProvider,crmSearchProvider,fileSearchProvider,fileVersionSearchProvider,folderSearchProvider,proposalSearchProvider,timelineSearchProvider,decisionSearchProvider];
export function getStudioSearchProviders(){return providers;}
export async function searchStudio(query:string):Promise<StudioSearchResponse>{const clean=safeSearchTerm(query);if(clean.length<2)return{query:clean,groups:[],total:0};const auth=await getStudioContext();if(!auth?.user||!auth.membership)throw new Error("unauthorized");const context={organizationId:auth.membership.organization_id,supabase:await createStudioServerClient()};const settled=await Promise.allSettled(providers.map(provider=>provider.search(clean,context)));const grouped=new Map<string,StudioSearchResponse["groups"][number]>();providers.forEach((provider,index)=>{const value=settled[index];const results=value.status==="fulfilled"?value.value:[];if(!results.length)return;const key=provider.getCategory();const current=grouped.get(key);if(current)current.results.push(...results);else grouped.set(key,{category:key,label:provider.getLabel(),results:[...results]});});const groups=[...grouped.values()];return{query:clean,groups,total:groups.reduce((sum,group)=>sum+group.results.length,0)};}
