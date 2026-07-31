import {redirect} from "next/navigation";
import Link from "next/link";
import {createStudioQuoteAction} from "@/app/studio/(protected)/quotes/actions";
import StudioQuoteForm from "@/components/studio/quotes/StudioQuoteForm";
import {getStudioQuoteAccess,getStudioQuoteLeads} from "@/lib/studio/quotes/quote-repository";
export const dynamic="force-dynamic";
export default async function NewQuotePage({searchParams}:{searchParams:Promise<{leadId?:string}>}){const access=await getStudioQuoteAccess();if(!access.canManage)redirect("/studio/quotes");const leads=await getStudioQuoteLeads();const{leadId}=await searchParams;const selected=leads.some(lead=>lead.id===leadId)?leadId:"";
 const initial=selected?{leadId:selected,title:"",currency:"TRY",discountType:"None",discountValue:"0",taxRate:"20",validUntil:"",notes:"",paymentTerms:"",items:JSON.stringify([{serviceName:"",description:"",quantity:"1",unit:"Piece",unitPrice:"0"}])}:undefined;
 return <section className="mx-auto min-w-0 max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9"><header className="mb-7 border-b border-[#ddd8ce] pb-6"><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#9a8253]">Teklifler / Yeni</p><h1 className="mt-2 text-[28px] font-semibold tracking-[-.04em] text-[#1e272f]">Yeni Teklif</h1><p className="mt-2 text-[11px] text-[#747875]">CRM lead’i, hizmet kapsamını ve ticari koşulları tanımlayın.</p></header>{leads.length?<StudioQuoteForm action={createStudioQuoteAction} leads={leads} initialValues={initial} mode="create"/>:<div className="rounded-xl border border-dashed p-12 text-center"><p className="text-[11px]">Teklif oluşturmak için aktif bir CRM lead gerekir.</p><Link href="/studio/crm/new" className="mt-5 inline-block text-[10px] text-[#806b45]">Yeni Lead Oluştur →</Link></div>}</section>;
}
