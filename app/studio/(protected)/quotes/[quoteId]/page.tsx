import {notFound} from "next/navigation";
import StudioQuoteDetail from "@/components/studio/quotes/StudioQuoteDetail";
import {getStudioProjectMembers} from "@/lib/studio/projects/project-repository";
import {getStudioQuote} from "@/lib/studio/quotes/quote-repository";
export const dynamic="force-dynamic";
export default async function QuoteDetailPage({params}:{params:Promise<{quoteId:string}>}){const{quoteId}=await params;const quote=await getStudioQuote(quoteId);if(!quote)notFound();const members=quote.canManage&&quote.status==="Approved"?await getStudioProjectMembers():[];return <StudioQuoteDetail quote={quote} members={members}/>;}
