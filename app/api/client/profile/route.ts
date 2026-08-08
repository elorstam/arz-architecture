import {
  NextResponse,
} from "next/server";

import {
  getStudioContext,
} from "@/lib/studio/auth/get-studio-context";
import {
  createStudioServerClient,
} from "@/lib/studio/supabase/server";

function json(
  body: unknown,
  status = 200,
) {
  return NextResponse.json(
    body,
    {
      status,
      headers: {
        "cache-control":
          "private, no-store, max-age=0",
        "x-content-type-options":
          "nosniff",
      },
    },
  );
}

export async function PATCH(
  request: Request,
) {
  const context =
    await getStudioContext();

  if (!context?.user) {
    return json(
      {
        error:
          "Oturum bulunamadı.",
      },
      401,
    );
  }

  if (
    !context.membership ||
    context.membership.role !==
      "client"
  ) {
    return json(
      {
        error:
          "Profil bulunamadı.",
      },
      404,
    );
  }

  let body: {
    fullName?: unknown;
  };

  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        error:
          "Geçersiz istek.",
      },
      400,
    );
  }

  const fullName =
    typeof body.fullName ===
    "string"
      ? body.fullName.trim()
      : "";

  if (
    fullName.length < 2 ||
    fullName.length > 120
  ) {
    return json(
      {
        error:
          "Ad soyad 2 ile 120 karakter arasında olmalıdır.",
      },
      400,
    );
  }

  const db =
    await createStudioServerClient();

  /*
   * profiles RLS:
   * id = auth.uid()
   *
   * Ayrıca controlled-field trigger:
   * email ve is_active alanlarının
   * client tarafından değiştirilmesini engelliyor.
   *
   * Burada sadece full_name yazıyoruz.
   */
  const {
    data,
    error,
  } = await db
    .from("profiles")
    .update({
      full_name: fullName,
    })
    .eq(
      "id",
      context.user.id,
    )
    .select(
      "id,full_name,email",
    )
    .maybeSingle();

  if (
    error ||
    !data
  ) {
    return json(
      {
        error:
          "Profil güncellenemedi.",
      },
      400,
    );
  }

  return json({
    ok: true,
    profile: {
      id: data.id,
      fullName:
        data.full_name,
      email:
        data.email ||
        context.user.email ||
        "",
    },
  });
}