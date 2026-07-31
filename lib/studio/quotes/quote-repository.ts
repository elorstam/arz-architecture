import "server-only";
import {getStudioContext,type StudioRole} from "@/lib/studio/auth/get-studio-context";
import {normalizeQuoteError,StudioQuoteError} from "./quote-errors";
import {mapStudioQuote,quoteInputToRpcPayload,summarizeQuotes,type StudioQuoteRow} from "./quote-mappers";
import type {QuoteArchiveFilter,QuoteConversionInput,QuoteQueryFilters,StudioQuoteInput,StudioQuoteLead} from "./quote-types";
import {isStudioQuoteId} from "./quote-validation";
import {createStudioServerClient} from "@/lib/studio/supabase/server";

const quoteSelect="id,organization_id,lead_id,quote_number,title,status,currency,subtotal,discount_type,discount_value,discount_total,tax_rate,tax_total,grand_total,valid_until,notes,payment_terms,client_name_snapshot,client_company_snapshot,client_email_snapshot,client_phone_snapshot,client_city_snapshot,client_district_snapshot,is_archived,approved_at,sent_at,converted_project_id,created_at,updated_at,items:studio_quote_items(id,sort_order,service_name,description,quantity,unit,unit_price,line_total),converted_project:studio_projects!studio_quotes_converted_project_id_fkey(id,name,code)";
type QuoteContext={organizationId:string;role:StudioRole;canManage:boolean};
async function requireQuoteContext(requireOwner=false):Promise<QuoteContext>{const context=await getStudioContext();if(!context?.user||!context.membership)throw new StudioQuoteError("unauthorized","Oturum gerekli.");
 const role=context.membership.role as StudioRole;if(requireOwner&&role!=="owner")throw new StudioQuoteError("forbidden","Bu işlem yalnızca Studio sahibi tarafından yapılabilir.");
 return{organizationId:context.membership.organization_id,role,canManage:role==="owner"};}
function archiveFilter<T extends{eq:(column:string,value:unknown)=>T}>(query:T,archive:QuoteArchiveFilter="active"){if(archive==="active")return query.eq("is_archived",false);if(archive==="archived")return query.eq("is_archived",true);return query;}
function safeSearch(value:string){return value.replace(/[,%()"'*:]/g," ").replace(/\s+/g," ").trim().slice(0,120);}
export async function getStudioQuoteAccess(){const context=await requireQuoteContext();return{canManage:context.canManage,role:context.role};}
export async function getStudioQuotes(filters:QuoteQueryFilters={}){
 const context=await requireQuoteContext();const supabase=await createStudioServerClient();let query=supabase.from("studio_quotes").select(quoteSelect).eq("organization_id",context.organizationId).order("created_at",{ascending:false});
 query=archiveFilter(query,filters.archive);if(filters.status)query=query.eq("status",filters.status);if(filters.currency)query=query.eq("currency",filters.currency);if(filters.leadId)query=query.eq("lead_id",filters.leadId);
 if(filters.createdFrom)query=query.gte("created_at",`${filters.createdFrom}T00:00:00Z`);if(filters.createdTo)query=query.lte("created_at",`${filters.createdTo}T23:59:59Z`);
 if(filters.validFrom)query=query.gte("valid_until",filters.validFrom);if(filters.validTo)query=query.lte("valid_until",filters.validTo);
 if(filters.query){const value=safeSearch(filters.query);if(value)query=query.or(`quote_number.ilike.%${value}%,title.ilike.%${value}%,status.ilike.%${value}%,client_name_snapshot.ilike.%${value}%,client_company_snapshot.ilike.%${value}%,client_email_snapshot.ilike.%${value}%,client_phone_snapshot.ilike.%${value}%`);}
 const{data,error}=await query;if(error){console.error("Studio quotes could not be loaded.",{code:error.code});throw normalizeQuoteError(error);}
 return(data as unknown as StudioQuoteRow[]).map(row=>mapStudioQuote(row,context.canManage));
}
export async function getStudioQuote(quoteId:string){if(!isStudioQuoteId(quoteId))return null;const context=await requireQuoteContext();const supabase=await createStudioServerClient();
 const{data,error}=await supabase.from("studio_quotes").select(quoteSelect).eq("organization_id",context.organizationId).eq("id",quoteId).maybeSingle();
 if(error){console.error("Studio quote could not be loaded.",{code:error.code});throw normalizeQuoteError(error);}return data?mapStudioQuote(data as unknown as StudioQuoteRow,context.canManage):null;}
export async function getStudioQuoteItems(quoteId:string){const quote=await getStudioQuote(quoteId);return quote?.items??[];}
export async function getStudioQuoteLeads(includeArchived=false):Promise<StudioQuoteLead[]>{
 const context=await requireQuoteContext();const supabase=await createStudioServerClient();let query=supabase.from("studio_leads").select("id,first_name,last_name,company_name,email,phone,city,district,is_archived,assigned_user_id").eq("organization_id",context.organizationId).order("first_name");
 if(!includeArchived)query=query.eq("is_archived",false);const{data,error}=await query;if(error)throw normalizeQuoteError(error);
 return(data??[]).map(row=>({id:row.id,name:[row.first_name,row.last_name].filter(Boolean).join(" "),company:row.company_name,email:row.email??"",phone:row.phone,city:row.city,district:row.district,isArchived:row.is_archived,assignedUserId:row.assigned_user_id??""}));
}
export async function createStudioQuote(input:StudioQuoteInput){await requireQuoteContext(true);const supabase=await createStudioServerClient();const{data,error}=await supabase.rpc("studio_create_quote",{payload:quoteInputToRpcPayload(input)});if(error)throw normalizeQuoteError(error);return data as string;}
export async function updateStudioQuote(quoteId:string,input:StudioQuoteInput){if(!isStudioQuoteId(quoteId))throw new StudioQuoteError("not_found","Teklif bulunamadı.");await requireQuoteContext(true);const supabase=await createStudioServerClient();const{error}=await supabase.rpc("studio_update_quote",{target_quote_id:quoteId,payload:quoteInputToRpcPayload(input)});if(error)throw normalizeQuoteError(error);}
export async function archiveStudioQuote(quoteId:string,archived:boolean){if(!isStudioQuoteId(quoteId))throw new StudioQuoteError("not_found","Teklif bulunamadı.");await requireQuoteContext(true);const supabase=await createStudioServerClient();const{error}=await supabase.rpc("studio_set_quote_archived",{target_quote_id:quoteId,archived});if(error)throw normalizeQuoteError(error);}
async function transition(quoteId:string,status:string){if(!isStudioQuoteId(quoteId))throw new StudioQuoteError("not_found","Teklif bulunamadı.");await requireQuoteContext(true);const supabase=await createStudioServerClient();const{error}=await supabase.rpc("studio_transition_quote",{target_quote_id:quoteId,target_status:status});if(error)throw normalizeQuoteError(error);}
export function markStudioQuoteSent(quoteId:string){return transition(quoteId,"Sent");}
export function approveStudioQuote(quoteId:string){return transition(quoteId,"Approved");}
export function rejectStudioQuote(quoteId:string){return transition(quoteId,"Rejected");}
export function expireStudioQuote(quoteId:string){return transition(quoteId,"Expired");}
export function cancelStudioQuote(quoteId:string){return transition(quoteId,"Cancelled");}
export async function convertQuoteToProject(quoteId:string,input:QuoteConversionInput){if(!isStudioQuoteId(quoteId))throw new StudioQuoteError("not_found","Teklif bulunamadı.");await requireQuoteContext(true);const supabase=await createStudioServerClient();const{data,error}=await supabase.rpc("studio_convert_quote_to_project",{target_quote_id:quoteId,project_payload:input});if(error)throw normalizeQuoteError(error);return data as string;}
export async function getStudioQuoteSummary(){const context=await requireQuoteContext();const supabase=await createStudioServerClient();const{data,error}=await supabase.from("studio_quotes").select("status,currency,grand_total,valid_until,approved_at").eq("organization_id",context.organizationId).eq("is_archived",false);if(error)throw normalizeQuoteError(error);return summarizeQuotes(data??[]);}
