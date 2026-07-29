import { NextResponse } from "next/server";
import { setAdminSession, validPassword } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = String(body.password || "");

    if (!password) {
      return NextResponse.json(
        { error: "Şifre gerekli" },
        { status: 400 }
      );
    }

    if (!validPassword(password)) {
      return NextResponse.json(
        { error: "Hatalı şifre" },
        { status: 401 }
      );
    }

    await setAdminSession();

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { error: "Giriş işlemi sırasında sunucu hatası oluştu" },
      { status: 500 }
    );
  }
}