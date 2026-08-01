import {NextResponse} from "next/server";
import {searchStudio} from "@/lib/studio/search/search-service";
export const dynamic="force-dynamic";
export async function GET(request:Request){try{const query=new URL(request.url).searchParams.get("q")??"";const result=await searchStudio(query);return NextResponse.json(result,{headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});}catch{return NextResponse.json({error:"Arama şu anda tamamlanamıyor."},{status:401,headers:{"Cache-Control":"private, no-store"}});}}
