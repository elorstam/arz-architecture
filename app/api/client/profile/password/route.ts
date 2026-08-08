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

export async function POST(
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
          "Hesap bulunamadı.",
      },
      404,
    );
  }

  let body: {
    currentPassword?: unknown;
    newPassword?: unknown;
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

  const currentPassword =
    typeof body.currentPassword ===
    "string"
      ? body.currentPassword
      : "";

  const newPassword =
    typeof body.newPassword ===
    "string"
      ? body.newPassword
      : "";

  if (
    !currentPassword
  ) {
    return json(
      {
        error:
          "Mevcut şifrenizi girin.",
      },
      400,
    );
  }

  if (
    newPassword.length < 10
  ) {
    return json(
      {
        error:
          "Yeni şifre en az 10 karakter olmalıdır.",
      },
      400,
    );
  }

  if (
    currentPassword ===
    newPassword
  ) {
    return json(
      {
        error:
          "Yeni şifre mevcut şifreden farklı olmalıdır.",
      },
      400,
    );
  }

  const email =
    context.user.email?.trim();

  if (!email) {
    return json(
      {
        error:
          "Hesap e-posta bilgisi bulunamadı.",
      },
      400,
    );
  }

  const db =
    await createStudioServerClient();

  /*
   * Aktif session tek başına yeterli kabul edilmiyor.
   * Kullanıcı mevcut şifresini tekrar doğruluyor.
   */
  const {
    error: verifyError,
  } =
    await db.auth.signInWithPassword({
      email,
      password:
        currentPassword,
    });

  if (verifyError) {
    return json(
      {
        error:
          "Mevcut şifre doğrulanamadı.",
      },
      400,
    );
  }

  /*
   * Supabase Auth şifreyi auth.users tarafında
   * güvenli şekilde güncelliyor.
   * profiles tablosunda şifre tutulmuyor.
   */
  const {
    error: updateError,
  } =
    await db.auth.updateUser({
      password:
        newPassword,
    });

  if (updateError) {
    return json(
      {
        error:
          "Şifre değiştirilemedi.",
      },
      400,
    );
  }

  return json({
    ok: true,
  });
}