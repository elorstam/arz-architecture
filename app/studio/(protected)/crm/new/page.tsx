import {redirect} from "next/navigation";
import {createStudioLeadAction} from "@/app/studio/(protected)/crm/actions";
import StudioLeadForm from "@/components/studio/crm/StudioLeadForm";
import {getStudioLeadAccess,getStudioLeadMembers} from "@/lib/studio/crm/lead-repository";

export const dynamic="force-dynamic";
export default async function NewLeadPage(){
 const access=await getStudioLeadAccess();if(!access.canManage)redirect("/studio/crm");const members=await getStudioLeadMembers();
 return <section className="mx-auto min-w-0 max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9"><header className="mb-7 border-b border-[#ddd8ce] pb-6"><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#9a8253]">CRM / Yeni</p><h1 className="mt-2 text-[28px] font-semibold tracking-[-.04em] text-[#1e272f]">Yeni Lead</h1><p className="mt-2 text-[11px] text-[#747875]">İlk temas bilgisini, hizmet ihtiyacını ve takip planını kaydedin.</p></header><StudioLeadForm action={createStudioLeadAction} members={members} mode="create"/></section>;
}
