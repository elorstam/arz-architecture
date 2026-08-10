import {notFound,redirect} from "next/navigation";
import ClientFinancePage from "@/components/client-portal/ClientFinancePage";
import ClientPaymentResultNotice from "@/components/client-portal/ClientPaymentResultNotice";
import {getClientFiles} from "@/lib/client-portal/get-client-files";
import {getClientFinance} from "@/lib/client-portal/get-client-finance";
import {getClientPaymentRequests} from "@/lib/client-portal/get-client-payment-requests";
import {getClientPortalContext} from "@/lib/client-portal/get-client-portal-context";
import "./client-finance.css";

export default async function ClientFinanceRoute({searchParams}:{searchParams:Promise<{project?:string|string[];payment?:string|string[]}>}){
 const query=await searchParams,selected=typeof query.project==="string"?query.project:undefined,payment=typeof query.payment==="string"&&["success","failed"].includes(query.payment)?query.payment as "success"|"failed":undefined;
 const context=await getClientPortalContext(selected).catch(()=>null);
 if(!context?.user)redirect("/client/login?next=%2Fclient%2Ffinance");
 if(!context.membership||!context.project)notFound();
 const[entries,files,paymentRequests]=await Promise.all([getClientFinance(context.project.id),getClientFiles(context.project.id).catch(()=>[]),getClientPaymentRequests(context.project.id)]);
 return <><ClientPaymentResultNotice result={payment}/><ClientFinancePage project={context.project} entries={entries} paymentRequests={paymentRequests} downloadableFileIds={files.map(file=>file.id)} today={new Date().toISOString().slice(0,10)}/></>;
}
