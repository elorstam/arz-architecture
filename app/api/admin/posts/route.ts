import {NextResponse} from "next/server";

import {isAdmin} from "@/lib/admin-auth";
import {deletePost, getPosts, savePost} from "@/lib/post-store";
import type {ManagedPost} from "@/types/cms";

function unauthorized() {
  return NextResponse.json({error: "Yetkisiz işlem."}, {status: 401});
}

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  try {
    return NextResponse.json(await getPosts(true));
  } catch (error) {
    console.error("Admin posts GET failed", error);
    return NextResponse.json(
      {error: "Blog yazıları şu anda yüklenemiyor."},
      {status: 500},
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const post = (await request.json()) as ManagedPost;
    return NextResponse.json(await savePost(post));
  } catch (error) {
    console.error("Admin post save failed", error);
    return NextResponse.json(
      {error: "Blog yazısı kaydedilemedi."},
      {status: 400},
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const {id} = (await request.json()) as {id?: string};
    if (!id) {
      return NextResponse.json({error: "Silinecek yazı belirtilmedi."}, {status: 400});
    }
    await deletePost(id);
    return NextResponse.json({success: true});
  } catch (error) {
    console.error("Admin post delete failed", error);
    return NextResponse.json(
      {error: "Blog yazısı silinemedi."},
      {status: 400},
    );
  }
}
