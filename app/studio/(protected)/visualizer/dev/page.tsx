import {redirect} from "next/navigation";
import {getStudioContext} from "@/lib/studio/auth/get-studio-context";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
import {createSmokeJob,cancelSmokeJob} from "./actions";

export default async function VisualizerDevPage(){
 if(process.env.VISUALIZER_DEV_CONSOLE_ENABLED!=="true")return <main style={{padding:32}}><h1>Visualizer Dev Console</h1><p>Dev console disabled. Set VISUALIZER_DEV_CONSOLE_ENABLED=true for internal testing.</p></main>;
 const context=await getStudioContext(); if(!context?.user||!context.membership||!(["owner","admin"] as string[]).includes(String(context.membership.role)))redirect("/studio");
 const db=await createStudioServerClient(); const {data:projects}=await db.from("studio_projects").select("id,name").eq("organization_id",context.membership.organization_id).eq("is_archived",false).order("name");
 const {data:jobs}=await db.from("visualizer_render_jobs").select("id,project_id,status,progress_percent,error_code,created_at").eq("organization_id",context.membership.organization_id).order("created_at",{ascending:false}).limit(20);
 return <main style={{padding:32,maxWidth:900}}><h1>Visualizer Dev Console</h1><p>Internal smoke test only. Local output is not uploaded or published.</p><form action={createSmokeJob}><label>Project <select name="projectId" required><option value="">Select</option>{(projects??[]).map((p:any)=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><br/><label>Prompt <textarea name="prompt" required defaultValue="A clean architectural exterior, daylight, smoke test" /></label><br/><label>Negative prompt <input name="negativePrompt" /></label><br/><label>Seed <input name="seed" type="number" defaultValue="1" /></label><br/><button type="submit">RENDER LOCAL</button></form><h2>Jobs</h2><ul>{(jobs??[]).map((j:any)=><li key={j.id}>{j.status} — {j.progress_percent}% — {j.error_code??""} {!["completed","failed","cancelled"].includes(j.status)&&<form action={cancelSmokeJob} style={{display:"inline"}}><input type="hidden" name="jobId" value={j.id}/><button type="submit">Cancel</button></form>}</li>)}</ul></main>;
}
