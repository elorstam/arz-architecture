import {NextResponse} from "next/server";
import {z} from "zod";

import {sendClientInvitationEmail} from "@/lib/studio/client-access/client-invitation-email";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
import {createClientInvitationUrl} from "@/lib/routing/app-domains";

const schema = z.object({
  email: z.string().email().max(320),
  expiresAt: z.string().datetime(),
});

const privateHeaders = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      projectId: string;
    }>;
  },
) {
  const {projectId} = await params;

  if (!z.string().uuid().safeParse(projectId).success) {
    return NextResponse.json(
      {
        error: "Davet oluşturulamadı.",
      },
      {
        status: 404,
        headers: privateHeaders,
      },
    );
  }

  const input = schema.safeParse(
    await request.json().catch(() => null),
  );

  if (!input.success) {
    return NextResponse.json(
      {
        error:
          "Geçerli e-posta ve son kullanım tarihi gerekli.",
      },
      {
        status: 400,
        headers: privateHeaders,
      },
    );
  }

  const supabase =
    await createStudioServerClient();

  const {data, error} =
    await supabase.rpc(
      "studio_create_client_invitation",
      {
        p_project_id: projectId,
        p_invited_email:
          input.data.email,
        p_expires_at:
          input.data.expiresAt,
      },
    );

  const invitation =
    data?.[0];

  if (
    error ||
    !invitation?.invitation_token
  ) {
    console.error(
      "CLIENT_INVITATION_CREATE_FAILED",
      {
        code: error?.code,
        hasData: Boolean(data),
      },
    );

    const duplicate =
      error?.message.includes(
        "pending_invitation_exists",
      );

    const active =
      error?.message.includes(
        "client_access_already_active",
      );

    const validation =
      error?.code === "22023";

    const authorization =
      error?.code === "42501";

    return NextResponse.json(
      {
        error: duplicate
          ? "Bu e-posta için bekleyen bir davet zaten var. Listeden yenileyebilir veya iptal edebilirsiniz."
          : active
            ? "Bu müşteri projeye zaten erişebiliyor."
            : "Davet oluşturulamadı.",
      },
      {
        status:
          duplicate || active
            ? 409
            : validation
              ? 400
              : authorization
                ? 403
                : 500,
        headers: privateHeaders,
      },
    );
  }

  const invitationUrl = createClientInvitationUrl(request.url, invitation.invitation_token);

  const {data: project} =
    await supabase
      .from("studio_projects")
      .select("name")
      .eq("id", projectId)
      .maybeSingle();

  const emailDelivery =
    await sendClientInvitationEmail({
      email: input.data.email,
      projectName:
        project?.name ||
        "ARZ Studio projesi",
      invitationUrl,
      expiresAt:
        invitation.expires_at,
    });

  return NextResponse.json(
    {
      invitationUrl,
      expiresAt:
        invitation.expires_at,
      emailDelivery,
    },
    {
      headers: privateHeaders,
    },
  );
}
