import "server-only";

import {createHash} from "node:crypto";
import {createClient} from "@supabase/supabase-js";

import {createStudioServerClient} from "@/lib/studio/supabase/server";

export type ClientInvitationState =
  | "valid"
  | "expired"
  | "accepted"
  | "revoked"
  | "invalid"
  | "unavailable";

export type ClientInvitationPreview = {
  state: ClientInvitationState;
  projectName?: string;
  email?: string;
  expiresAt?: string;
};

type InvitationPreviewRow = {
  project_id: string;
  invited_email: string;
  status: string;
  expires_at: string;
};

export class ClientInvitationPreviewError extends Error {
  constructor(readonly stage: "configuration" | "invitation" | "project", readonly code: string) {
    super("client_invitation_preview_unavailable");
  }
}

export function createClientInvitationAdminClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("CLIENT_INVITATION_PREVIEW_FAILED", {
      stage: "configuration",
      code: "missing_server_environment",
    });
    throw new ClientInvitationPreviewError("configuration", "missing_server_environment");
  }

  return createClient(
    url,
    key,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}

export function safeClientNext(
  value: string | undefined,
) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f]/.test(value)
  ) {
    return "/client";
  }

  try {
    const parsed = new URL(
      value,
      "http://client.local",
    );

    const internalPath = parsed.pathname === "/client" || parsed.pathname.startsWith("/client/")
      ? parsed.pathname
      : `/client${parsed.pathname === "/" ? "" : parsed.pathname}`;
    const safe =
      parsed.origin ===
        "http://client.local" &&
      internalPath.startsWith(
        "/client",
      ) &&
      !internalPath.startsWith(
        "/client/login",
      ) &&
      !internalPath.startsWith(
        "/client/invite/",
      );

    return safe
      ? `${internalPath}${parsed.search}${parsed.hash}`
      : "/client";
  } catch {
    return "/client";
  }
}

export async function getInvitationPreview(
  token: string,
): Promise<ClientInvitationPreview> {
  if (
    !/^[0-9a-f]{64}$/i.test(token)
  ) {
    return {
      state: "invalid",
    };
  }

  const hash = createHash(
    "sha256",
  )
    .update(token)
    .digest("hex");

  const admin = createClientInvitationAdminClient();

  /*
   * Önce yalnız invitation kaydını okuyoruz.
   *
   * studio_projects nested relation sorgusuna
   * bağımlı değiliz.
   */
  const {
    data: invitationData,
    error: invitationError,
  } = await admin
    .from(
      "studio_client_invitations",
    )
    .select(
      "project_id,invited_email,status,expires_at",
    )
    .eq(
      "token_hash",
      hash,
    )
    .maybeSingle();

  if (invitationError) {
    console.error(
      "CLIENT_INVITATION_PREVIEW_FAILED",
      {
        stage: "invitation",
        code: invitationError.code || "database_error",
      },
    );
    throw new ClientInvitationPreviewError("invitation", invitationError.code || "database_error");
  }

  if (!invitationData) {
    return {state: "invalid"};
  }

  const invitation =
    invitationData as InvitationPreviewRow;

  const expiresAt =
    new Date(
      invitation.expires_at,
    ).getTime();

  const expired =
    !Number.isFinite(
      expiresAt,
    ) ||
    expiresAt <= Date.now();

  let state: ClientInvitationState;

  switch (
    invitation.status
  ) {
    case "accepted":
      state = "accepted";
      break;

    case "revoked":
      state = "revoked";
      break;

    case "expired":
      state = "expired";
      break;

    case "pending":
      state = expired
        ? "expired"
        : "valid";
      break;

    default:
      state = "invalid";
  }

  /*
   * Invitation bulunduysa proje adını ayrı,
   * kontrollü sorguyla alıyoruz.
   */
  const {
    data: project,
    error: projectError,
  } = await admin
    .from("studio_projects")
    .select("name")
    .eq(
      "id",
      invitation.project_id,
    )
    .maybeSingle();

  if (projectError) {
    console.error(
      "CLIENT_INVITATION_PREVIEW_FAILED",
      {
        stage: "project",
        code: projectError.code || "database_error",
      },
    );
    throw new ClientInvitationPreviewError("project", projectError.code || "database_error");
  }

  if (!project) {
    return {state: "invalid"};
  }

  return {
    state,
    projectName:
      project.name,
    email:
      invitation.invited_email,
    expiresAt:
      invitation.expires_at,
  };
}

export async function resolveAuthenticatedDestination() {
  const supabase =
    await createStudioServerClient();

  const {
    data: {user},
  } =
    await supabase.auth.getUser();

  if (!user) {
    return {
      kind: "unauthenticated" as const,
    };
  }

  const {
    data: memberships,
    error: membershipError,
  } = await supabase
    .from(
      "organization_members",
    )
    .select("role")
    .eq(
      "user_id",
      user.id,
    )
    .eq(
      "status",
      "active",
    );

  if (
    membershipError ||
    !memberships?.length
  ) {
    return {
      kind: "no-access" as const,
    };
  }

  if (
    memberships.some(
      (item) =>
        item.role !==
        "client",
    )
  ) {
    return {
      kind: "staff" as const,
      destination:
        "/studio" as const,
    };
  }

  const {
    data: projects,
    error: projectsError,
  } =
    await supabase.rpc(
      "client_portal_list_projects",
    );

  if (
    !projectsError &&
    projects?.length
  ) {
    return {
      kind: "client" as const,
      destination:
        "/client" as const,
    };
  }

  return {
    kind: "no-access" as const,
  };
}
