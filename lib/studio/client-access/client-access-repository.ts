import "server-only";

import {createStudioServerClient} from "@/lib/studio/supabase/server";

export type ClientInvitation = {
  id: string;
  invitedEmail: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: string;
  acceptedAt: string | null;
  invitedUserId: string | null;
  invitedUserName: string | null;
  createdAt: string;
};

export type ClientProjectAccess = {
  accessId: string;
  userId: string;
  fullName: string | null;
  email: string | null;
  grantedAt: string;
  revokedAt: string | null;
  invitationStatus: string | null;
};

export type ClientAccessEvent = {
  id: string;
  action: string;
  summary: string;
  actorName: string | null;
  createdAt: string;
};

type InvitationRow = {
  id: string;
  invited_email: string;
  status: ClientInvitation["status"];
  expires_at: string;
  accepted_at: string | null;
  invited_user_id: string | null;
  invited_user_name: string | null;
  created_at: string;
};

type AccessRow = {
  access_id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  granted_at: string;
  revoked_at: string | null;
  invitation_status: string | null;
};

type EventRow = {
  id: string;
  action: string;
  summary: string;
  actor_name: string | null;
  created_at: string;
};

export async function getStudioClientAccessManagement(
  projectId: string,
) {
  const supabase = await createStudioServerClient();

  const [
    invitationsResult,
    accessResult,
    eventsResult,
  ] = await Promise.all([
    supabase.rpc(
      "studio_list_client_invitations",
      {
        p_project_id: projectId,
      },
    ),
    supabase.rpc(
      "studio_list_client_project_access",
      {
        p_project_id: projectId,
      },
    ),
    supabase.rpc(
      "studio_list_client_access_events",
      {
        p_project_id: projectId,
      },
    ),
  ]);

  if (
    invitationsResult.error ||
    accessResult.error ||
    eventsResult.error
  ) {
    console.error(
      "CLIENT_ACCESS_RPC_FAILED",
      {
        invitations:
          invitationsResult.error?.code,
        access:
          accessResult.error?.code,
        events:
          eventsResult.error?.code,
      },
    );

    throw new Error(
      "Müşteri erişim yönetimi verileri alınamadı.",
    );
  }

  return {
    invitations: (
      (invitationsResult.data ??
        []) as InvitationRow[]
    ).map((row) => ({
      id: row.id,
      invitedEmail: row.invited_email,
      status: row.status,
      expiresAt: row.expires_at,
      acceptedAt: row.accepted_at,
      invitedUserId:
        row.invited_user_id,
      invitedUserName:
        row.invited_user_name,
      createdAt: row.created_at,
    })),

    accesses: (
      (accessResult.data ??
        []) as AccessRow[]
    ).map((row) => ({
      accessId: row.access_id,
      userId: row.user_id,
      fullName: row.full_name,
      email: row.email,
      grantedAt: row.granted_at,
      revokedAt: row.revoked_at,
      invitationStatus:
        row.invitation_status,
    })),

    events: (
      (eventsResult.data ??
        []) as EventRow[]
    ).map((row) => ({
      id: row.id,
      action: row.action,
      summary: row.summary,
      actorName: row.actor_name,
      createdAt: row.created_at,
    })),
  };
}
