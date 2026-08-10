import{headers}from"next/headers";
import{notFound}from"next/navigation";
import localFont from "next/font/local";
import{isAllowedPublicPaymentRequest}from"@/lib/routing/app-domains";
const paymentFont=localFont({src:[{path:"../../../public/fonts/CenturyGothic.woff2",weight:"400",style:"normal"},{path:"../../../public/fonts/CenturyGothic.woff",weight:"600",style:"normal"}],display:"swap",fallback:["Arial","Helvetica","sans-serif"],variable:"--font-studio"});
export default async function PublicPaymentLayout({children}:{children:React.ReactNode}){const requestHeaders=await headers(),host=requestHeaders.get("x-forwarded-host")||requestHeaders.get("host"),protocol=requestHeaders.get("x-forwarded-proto")||(host?.startsWith("localhost")?"http":"https");if(!isAllowedPublicPaymentRequest(host,protocol))notFound();return <div className={`${paymentFont.variable} ${paymentFont.className}`}>{children}</div>;}
