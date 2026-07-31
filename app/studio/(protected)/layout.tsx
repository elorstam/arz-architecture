import {redirect} from "next/navigation";

import StudioShell from "@/components/studio/StudioShell";
import {getStudioContext, type StudioRole} from "@/lib/studio/auth/get-studio-context";
import {createStudioServerClient} from "@/lib/studio/supabase/server";

export const dynamic = "force-dynamic";

const roleLabels: Record<StudioRole, string> = {
  owner: "Studio Sahibi",
  admin: "Yönetici",
  team_member: "Ekip Üyesi",
  client: "Müşteri",
};

export default async function StudioProtectedLayout({children}: {children: React.ReactNode}) {
  const context = await getStudioContext().catch((error) => {
    console.error("Studio context could not be loaded.", error);
    return null;
  });

  if (!context?.user) redirect("/studio/login");

  if (!context.membership) {
    const supabase = await createStudioServerClient();
    await supabase.rpc("studio_record_activity", {
      target_organization_id: null,
      event_entity_type: "auth",
      event_entity_id: null,
      event_action: "auth.access_denied",
      event_summary: "Protected Studio route denied: no active membership.",
      event_metadata: {},
    });
    await supabase.auth.signOut();
    redirect("/studio/login?reason=access-denied");
  }

  const organization = Array.isArray(context.membership.organizations)
    ? context.membership.organizations[0]
    : context.membership.organizations;
  const profile = Array.isArray(context.membership.profiles)
    ? context.membership.profiles[0]
    : context.membership.profiles;
  const userName = profile?.full_name || context.user.email || "ARZ Studio Kullanıcısı";

  return (
    <StudioShell
      organizationName={organization?.name || "ARZ Mimarlık"}
      userName={userName}
      roleLabel={roleLabels[context.membership.role as StudioRole]}
    >
      {children}
    </StudioShell>
  );
}
