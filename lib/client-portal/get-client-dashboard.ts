import "server-only";
import {createStudioServerClient} from "@/lib/studio/supabase/server";

export type ClientStage={id:string;project_id:string;title:string;description:string;sort_order:number;status:string;started_at:string|null;completed_at:string|null;municipality_status:string;updated_at:string};
export type ClientRender={id:string;project_id:string;title:string;category:string|null;description:string|null;logical_file_id:string|null;presented_at:string|null;created_at:string};
export type ClientFile={id:string;project_id:string;display_name:string;extension:string;mime_type:string;file_size:number;category:string;created_at:string};
export type ClientFinance={id:string;project_id:string;entry_type:string;title:string;description:string|null;amount:number;currency:string;due_date:string|null;status:string;document_file_id:string|null;created_at:string};
export type ClientNotification={id:string;project_id:string;project_name:string;source_type:string;source_id:string|null;status:string;template_name:string;title:string;body:string;sent_at:string|null;delivered_at:string|null;read_at:string|null;created_at:string};
export type ClientProcess={id:string;project_id:string;entity_type:string;title:string;status:string;amount:number|null;due_date:string|null;responsible_party:string|null;updated_at:string};
type Panel<T>={data:T[];error:boolean};

export type ClientDashboardData={stages:Panel<ClientStage>;renders:Panel<ClientRender>;files:Panel<ClientFile>;finance:Panel<ClientFinance>;notifications:Panel<ClientNotification>;processes:Panel<ClientProcess>};

export async function getClientDashboard(projectId:string):Promise<ClientDashboardData>{
 const db=await createStudioServerClient();
 const calls=["stages","renders","files","finance","notifications","official_processes"] as const;
 const settled=await Promise.all(calls.map(name=>db.rpc(`client_portal_list_${name}`,{p_project_id:projectId})));
 const panel=<T>(index:number):Panel<T>=>({data:(settled[index].data??[]) as T[],error:Boolean(settled[index].error)});
 return{stages:panel<ClientStage>(0),renders:panel<ClientRender>(1),files:panel<ClientFile>(2),finance:panel<ClientFinance>(3),notifications:panel<ClientNotification>(4),processes:panel<ClientProcess>(5)};
}
