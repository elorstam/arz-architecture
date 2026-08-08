import "server-only";

import {createStudioServerClient} from "@/lib/studio/supabase/server";
import type {ClientNotification} from "./get-client-dashboard";

export async function getClientNotifications(projectId:string):Promise<ClientNotification[]>{const db=await createStudioServerClient();const{data,error}=await db.rpc("client_portal_list_notifications",{p_project_id:projectId});if(error){console.error("CLIENT_NOTIFICATIONS_PROJECTION_FAILED",{code:error.code});throw new Error("client_notifications_unavailable");}return(data??[]) as ClientNotification[];}
export async function getClientUnreadNotificationCount(){const db=await createStudioServerClient();const{data,error}=await db.rpc("client_portal_unread_notification_count");if(error){console.error("CLIENT_NOTIFICATION_COUNT_FAILED",{code:error.code});return 0;}return Math.max(0,Number(data)||0);}
