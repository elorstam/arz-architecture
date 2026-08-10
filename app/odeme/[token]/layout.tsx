import{headers}from"next/headers";
import{notFound}from"next/navigation";
import{isAllowedPublicPaymentRequest}from"@/lib/routing/app-domains";
export default async function PublicPaymentLayout({children}:{children:React.ReactNode}){const requestHeaders=await headers(),host=requestHeaders.get("x-forwarded-host")||requestHeaders.get("host"),protocol=requestHeaders.get("x-forwarded-proto")||(host?.startsWith("localhost")?"http":"https");if(!isAllowedPublicPaymentRequest(host,protocol))notFound();return children;}
