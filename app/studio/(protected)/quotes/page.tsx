import StudioQuotesPage from "@/components/studio/quotes/StudioQuotesPage";
import {QUOTE_CURRENCIES,QUOTE_STATUSES} from "@/lib/studio/quotes/quote-constants";
import {getStudioQuoteAccess,getStudioQuoteLeads,getStudioQuotes} from "@/lib/studio/quotes/quote-repository";
import type {QuoteArchiveFilter} from "@/lib/studio/quotes/quote-types";
export const dynamic="force-dynamic";
type SearchParams=Promise<{q?:string;status?:string;currency?:string;leadId?:string;archive?:string;createdFrom?:string;createdTo?:string;validFrom?:string;validTo?:string}>;
function date(value?:string){return value&&/^\d{4}-\d{2}-\d{2}$/.test(value)?value:undefined;}
export default async function QuotesPage({searchParams}:{searchParams:SearchParams}){const params=await searchParams;const leads=await getStudioQuoteLeads(true);
 const filters={query:params.q?.trim().slice(0,120)||"",status:QUOTE_STATUSES.find(value=>value===params.status),currency:QUOTE_CURRENCIES.find(value=>value===params.currency),
  leadId:leads.some(lead=>lead.id===params.leadId)?params.leadId:undefined,archive:(["active","archived","all"].includes(params.archive??"")?params.archive:"active") as QuoteArchiveFilter,
  createdFrom:date(params.createdFrom),createdTo:date(params.createdTo),validFrom:date(params.validFrom),validTo:date(params.validTo)};
 const[quotes,all,access]=await Promise.all([getStudioQuotes(filters),getStudioQuotes({archive:"all"}),getStudioQuoteAccess()]);
 return <StudioQuotesPage quotes={quotes} total={all.length} canManage={access.canManage} filters={filters} leads={leads}/>;
}
