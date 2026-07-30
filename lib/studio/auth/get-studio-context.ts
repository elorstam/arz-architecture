import "server-only";

import {createStudioServerClient} from "@/lib/studio/supabase/server";

export type StudioRole = "owner" | "admin" | "team_member" | "client";

export async function getStudioContext() {
  const supabase = await createStudioServerClient();
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) return null;

  const {data: memberships, error} = await supabase
    .from("organization_members")
    .select("id,organization_id,role,status,organizations(id,name,slug,is_active),profiles!organization_members_user_id_fkey(id,full_name,email)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1);
  if (error) throw new Error("Studio membership could not be loaded.");
  const membership = memberships?.[0];
  if (!membership) return {user, membership: null};
  return {user, membership};
}
