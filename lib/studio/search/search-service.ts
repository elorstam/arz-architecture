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
import {tagSearchProvider} from "./providers/tag-provider";
import {taggedRecordSearchProvider} from "./providers/tagged-record-provider";
import {officialProcessSearchProvider} from "./providers/official-process-provider";

const providers:readonly StudioSearchProvider[]=[tagSearchProvider,taggedRecordSearchProvider,officialProcessSearchProvider,projectSearchProvider,crmSearchProvider,fileSearchProvider,fileVersionSearchProvider,folderSearchProvider,proposalSearchProvider,timelineSearchProvider,decisionSearchProvider];
export function getStudioSearchProviders(){return providers;}
export async function searchStudio(query:string):Promise<StudioSearchResponse>{const clean=safeSearchTerm(query);if(clean.length<2)return{query:clean,groups:[],total:0};const auth=await getStudioContext();if(!auth?.user||!auth.membership)throw new Error("unauthorized");const client=await createStudioServerClient();const context={organizationId:auth.membership.organization_id,supabase:client};const[settled,favoriteResult]=await Promise.all([Promise.allSettled(providers.map(provider=>provider.search(clean,context))),client.from("studio_user_favorites").select("entity_type,entity_id").eq("organization_id",context.organizationId).eq("user_id",auth.user.id).is("archived_at",null)]);const favorites=new Set((favoriteResult.data??[]).map(row=>`${row.entity_type}:${row.entity_id}`));const grouped=new Map<string,StudioSearchResponse["groups"][number]>();const entityType=(provider:string)=>provider==="projects"?"project":provider==="crm"?"crm_lead":provider==="proposals"?"quote":provider==="files"?"file":provider==="file_versions"?"file_version":provider==="folders"?"folder":"";providers.forEach((provider,index)=>{const value=settled[index];const results=value.status==="fulfilled"?value.value:[];for(const result of results){const type=entityType(result.provider);result.isFavorite=Boolean(type&&favorites.has(`${type}:${result.id}`));const key=result.category;const current=grouped.get(key);if(current)current.results.push(result);else grouped.set(key,{category:key,label:result.categoryLabel||provider.getLabel(),results:[result]});}});const groups=[...grouped.values()];for(const group of groups)group.results.sort((a,b)=>Number(b.isFavorite)-Number(a.isFavorite));return{query:clean,groups,total:groups.reduce((sum,group)=>sum+group.results.length,0)};}
