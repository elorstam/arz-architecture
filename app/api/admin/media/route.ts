import {NextResponse} from "next/server";

import {isAdmin} from "@/lib/admin-auth";
import {deleteMedia, getMedia, saveMedia} from "@/lib/media-store";
import {supabaseUpload} from "@/lib/supabase-rest";
import type {MediaItem} from "@/types/cms";

function unauthorized() {
  return NextResponse.json({error: "Yetkisiz işlem."}, {status: 401});
}

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  try {
    return NextResponse.json(await getMedia());
  } catch (error) {
    console.error("Admin media GET failed", error);
    return NextResponse.json(
      {error: "Medya verileri yüklenemedi."},
      {status: 500},
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.type.startsWith("image/")) {
      return NextResponse.json({error: "Geçerli bir görsel gerekli."}, {status: 400});
    }
    const safeName = file.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "-");
    const storagePath = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeName}`;
    const url = await supabaseUpload("media", storagePath, file);
    const item: MediaItem = {
      id: crypto.randomUUID(),
      filename: file.name,
      storagePath,
      url,
      mimeType: file.type,
      sizeBytes: file.size,
      width: null,
      height: null,
      altTexts: {},
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json(await saveMedia(item), {status: 201});
  } catch (error) {
    console.error("Admin media upload failed", error);
    return NextResponse.json(
      {error: "Görsel yüklenemedi. Depolama ayarlarını kontrol edin."},
      {status: 500},
    );
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  try {
    return NextResponse.json(await saveMedia((await request.json()) as MediaItem));
  } catch (error) {
    console.error("Admin media update failed", error);
    return NextResponse.json({error: "Medya bilgileri kaydedilemedi."}, {status: 400});
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const {id, confirmed} = (await request.json()) as {id?: string; confirmed?: boolean};
    if (!id) return NextResponse.json({error: "Silinecek medya belirtilmedi."}, {status: 400});
    if (!confirmed) {
      return NextResponse.json(
        {error: "Görsel kullanımda olabilir. Silme işlemini onaylayın."},
        {status: 409},
      );
    }
    await deleteMedia(id);
    return NextResponse.json({success: true});
  } catch (error) {
    console.error("Admin media delete failed", error);
    return NextResponse.json({error: "Görsel silinemedi."}, {status: 500});
  }
}
