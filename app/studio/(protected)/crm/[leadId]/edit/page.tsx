import {notFound,redirect} from "next/navigation";
import {updateStudioLeadAction} from "@/app/studio/(protected)/crm/actions";
import StudioLeadArchiveControl from "@/components/studio/crm/StudioLeadArchiveControl";
import StudioLeadForm from "@/components/studio/crm/StudioLeadForm";
import {leadToFormValues} from "@/lib/studio/crm/lead-mappers";
import {getStudioLeadAccess,getStudioLeadById,getStudioLeadMembers} from "@/lib/studio/crm/lead-repository";
export const dynamic="force-dynamic";
export default async function EditLeadPage({params}:{params:Promise<{leadId:string}>}){
 const{leadId}=await params;const access=await getStudioLeadAccess();if(!access.canManage)redirect(`/studio/crm/${leadId}`);
 const[lead,members]=await Promise.all([getStudioLeadById(leadId),getStudioLeadMembers()]);if(!lead)notFound();
 if(lead.isArchived)return <section className="mx-auto max-w-2xl px-4 py-16 text-center"><p className="text-[9px] uppercase tracking-[.16em] text-[#9a8253]">Arşivlenmiş Lead</p><h1 className="mt-3 text-[22px] font-semibold text-[#283138]">{lead.fullName}</h1><p className="mt-3 text-[10px] leading-5 text-[#777b78]">Düzenleme yapmadan önce kaydı arşivden çıkarın.</p><div className="mt-6 flex justify-center"><StudioLeadArchiveControl leadId={lead.id} archived/></div></section>;
 const action=updateStudioLeadAction.bind(null,leadId);
 return <section className="mx-auto min-w-0 max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9"><header className="mb-7 border-b border-[#ddd8ce] pb-6"><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#9a8253]">CRM / {lead.fullName}</p><h1 className="mt-2 text-[28px] font-semibold tracking-[-.04em] text-[#1e272f]">Lead’i Düzenle</h1></header><StudioLeadForm action={action} initialValues={leadToFormValues(lead)} members={members} mode="edit" leadId={lead.id}/></section>;
}
