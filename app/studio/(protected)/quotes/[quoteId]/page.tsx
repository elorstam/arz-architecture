import {notFound} from "next/navigation";
import StudioQuoteDetail from "@/components/studio/quotes/StudioQuoteDetail";
import StudioEntityTags from "@/components/studio/tags/StudioEntityTags";
import {getStudioProjectMembers} from "@/lib/studio/projects/project-repository";
import {getStudioQuote} from "@/lib/studio/quotes/quote-repository";
export const dynamic="force-dynamic";
export default async function QuoteDetailPage({params}:{params:Promise<{quoteId:string}>}){const{quoteId}=await params;const quote=await getStudioQuote(quoteId);if(!quote)notFound();const members=quote.canManage&&quote.status==="Approved"?await getStudioProjectMembers():[];return <><StudioQuoteDetail quote={quote} members={members}/><div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8"><StudioEntityTags entityType="quote" entityId={quote.id}/></div></>;}
