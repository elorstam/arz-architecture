import Image from "next/image";
import {redirect} from "next/navigation";
import ClientLoginForm from "@/components/client-portal/ClientLoginForm";
import {StudioCard,StudioIconSurface} from "@/components/studio/ui";
import {resolveAuthenticatedDestination,safeClientNext} from "@/lib/client-portal/auth";

export const dynamic="force-dynamic";
export default async function ClientLoginPage({searchParams}:{searchParams:Promise<{next?:string;error?:string}>}){
 const query=await searchParams;const destination=await resolveAuthenticatedDestination().catch(()=>({kind:"unauthenticated" as const}));if(destination.kind==="client")redirect(safeClientNext(query.next));if(destination.kind==="staff")redirect("/studio");
 return <main className="flex min-h-screen items-center justify-center bg-[#F7F9FC] p-5 text-[#17232e]"><StudioCard className="w-full max-w-[460px] border border-[#e4eaf0] bg-white p-7 shadow-[0_24px_70px_rgba(31,48,65,.09)] sm:p-10"><div className="flex items-center justify-between"><Image src="/arz-logo-final.png" alt="ARZ Mimarlık" width={116} height={38} priority/><StudioIconSurface icon="clients" tone="blue" size="lg"/></div><p className="mt-10 text-[11px] font-semibold uppercase tracking-[.24em] text-[#6b8290]">ARZ Mimarlık</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.035em]">Müşteri Portalı</h1><p className="mt-3 text-sm leading-6 text-[#64748b]">Projenizin güncel aşamalarına ve paylaşılan dosyalarına güvenle erişin.</p><ClientLoginForm next={safeClientNext(query.next)} error={query.error}/><div className="mt-7 border-t border-[#e7ecf3] pt-5 text-sm text-[#64748b]"><strong className="text-[#334155]">Davet bağlantınız mı var?</strong><p className="mt-1 leading-6">Size iletilen kişisel bağlantıyı açarak hesabınızı oluşturabilir veya mevcut hesabınızla daveti kabul edebilirsiniz.</p></div></StudioCard></main>;
}
