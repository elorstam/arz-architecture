import {notFound,redirect} from "next/navigation";
import {updateStudioQuoteAction} from "@/app/studio/(protected)/quotes/actions";
import StudioQuoteForm from "@/components/studio/quotes/StudioQuoteForm";
import {quoteToFormValues} from "@/lib/studio/quotes/quote-mappers";
import {getStudioQuote,getStudioQuoteAccess,getStudioQuoteLeads} from "@/lib/studio/quotes/quote-repository";
export const dynamic="force-dynamic";
export default async function EditQuotePage({params}:{params:Promise<{quoteId:string}>}){const{quoteId}=await params;const access=await getStudioQuoteAccess();if(!access.canManage)redirect(`/studio/quotes/${quoteId}`);const[quote,leads]=await Promise.all([getStudioQuote(quoteId),getStudioQuoteLeads()]);if(!quote)notFound();if(quote.status!=="Draft"||quote.isArchived)redirect(`/studio/quotes/${quote.id}`);
 const action=updateStudioQuoteAction.bind(null,quote.id);return <section className="mx-auto min-w-0 max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9"><header className="mb-7 border-b border-[#ddd8ce] pb-6"><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#9a8253]">{quote.quoteNumber}</p><h1 className="mt-2 text-[28px] font-semibold tracking-[-.04em] text-[#1e272f]">Teklifi Düzenle</h1></header><StudioQuoteForm action={action} leads={leads} initialValues={quoteToFormValues(quote)} mode="edit" quoteId={quote.id}/></section>;}
