import{handleIyzicoCallback}from"@/app/api/client/payments/iyzico/callback/route";
export const runtime="nodejs";
export async function POST(request:Request,{params}:{params:Promise<{token:string}>}){return handleIyzicoCallback(request,(await params).token);}
