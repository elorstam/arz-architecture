import {NextResponse} from "next/server";
import {heartbeatAgent} from "@/lib/visualizer/server";

const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
export async function POST(request:Request){
 const authorization=request.headers.get("authorization")??"";
 const match=/^Bearer\s+(.+)$/i.exec(authorization);
 if(!match)return NextResponse.json({error:"Unauthorized"},{status:401,headers});
 try{
  const body=await request.json();
  return NextResponse.json(await heartbeatAgent(match[1],body),{headers});
 }catch(error){
  const code=error instanceof Error?error.message:"heartbeat_failed";
  const status=code==="invalid_agent_credential"?401:code==="invalid_heartbeat_input"?400:503;
  return NextResponse.json({error:status===401?"Unauthorized":"Heartbeat unavailable"},{status,headers});
 }
}
