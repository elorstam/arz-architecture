import{handleIyzicoCallback}from"@/app/api/client/payments/iyzico/callback/route";
import{isAllowedPublicPaymentRequest}from"@/lib/routing/app-domains";
export const runtime="nodejs";
export async function POST(request:Request,{params}:{params:Promise<{token:string}>}){const host=request.headers.get("x-forwarded-host")||request.headers.get("host"),protocol=request.headers.get("x-forwarded-proto")||new URL(request.url).protocol.replace(":","");if(!isAllowedPublicPaymentRequest(host,protocol))return new Response("Not found",{status:404,headers:{"Cache-Control":"private, no-store"}});return handleIyzicoCallback(request,(await params).token);}
