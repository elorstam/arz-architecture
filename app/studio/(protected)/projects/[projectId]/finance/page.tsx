import StudioFinancePage from "@/components/studio/finance/StudioFinancePage";

export default async function Page({params}:{params:Promise<{projectId:string}>}){
 const {projectId}=await params;
 return <StudioFinancePage section="profitability" projectId={projectId}/>;
}
