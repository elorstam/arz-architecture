import{redirect}from"next/navigation";import type{Metadata}from"next";import StudioLoginForm from"@/components/studio/StudioLoginForm";import{getStudioContext}from"@/lib/studio/auth/get-studio-context";
export const dynamic="force-dynamic";
export const metadata:Metadata={robots:{index:false,follow:false}};
export default async function StudioLoginPage(){const context=await getStudioContext().catch(()=>null);if(context?.membership)redirect("/studio");return <main className="theme-dark-surface flex min-h-screen items-center justify-center bg-[#0b0b0b] p-6 text-white"><StudioLoginForm/></main>}
