import {NextResponse} from "next/server";
import {claimNextRenderJob} from "@/lib/visualizer/server";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
export async function POST(request:Request){const match=/^Bearer\s+(.+)$/i.exec(request.headers.get("authorization")??"");if(!match)return NextResponse.json({error:"Unauthorized"},{status:401,headers});try{return NextResponse.json(await claimNextRenderJob(match[1]),{headers});}catch(error){const code=error instanceof Error?error.message:"claim_failed";return NextResponse.json({error:code==="invalid_agent_credential"?"Unauthorized":"Claim unavailable"},{status:code==="invalid_agent_credential"?401:503,headers});}}
