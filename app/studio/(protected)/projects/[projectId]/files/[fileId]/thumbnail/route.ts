import { downloadCachedStudioThumbnail, getStudioThumbnail, regenerateStudioThumbnail } from "@/lib/studio/files/thumbnails/thumbnail-repository";

export const dynamic = "force-dynamic";

function placeholder(status: string) {
  const labels: Record<string, string> = { pending: "Thumbnail hazırlanıyor", generating: "Thumbnail oluşturuluyor", failed: "Thumbnail kullanılamıyor", unsupported: "Önizleme desteklenmiyor" };
  const message = labels[status] ?? "Thumbnail bulunamadı";
  return new Response(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><rect width="640" height="480" fill="#eef2f7"/><path d="M245 160h150v160H245z" fill="none" stroke="#60738a" stroke-width="8"/><text x="320" y="360" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#475569">${message}</text></svg>`, { status: 200, headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "private, no-store", "Content-Security-Policy": "default-src 'none'; sandbox", "X-Content-Type-Options": "nosniff" } });
}

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string; fileId: string }> }) {
  try {
    const { projectId, fileId } = await params;
    const requestedVersion = new URL(request.url).searchParams.get("version") ?? undefined;
    let thumbnail = await getStudioThumbnail(projectId, fileId, requestedVersion);
    if (thumbnail && (thumbnail.status === "pending" || thumbnail.status === "failed")) {
      await regenerateStudioThumbnail(projectId, fileId, thumbnail.fileVersionId).catch(() => undefined);
      thumbnail = await getStudioThumbnail(projectId, fileId, thumbnail.fileVersionId);
    }
    if (!thumbnail || thumbnail.status !== "ready" || !thumbnail.storageKey) return placeholder(thumbnail?.status ?? "missing");
    const blob = await downloadCachedStudioThumbnail(thumbnail.storageKey);
    return new Response(blob.stream(), { headers: { "Content-Type": thumbnail.mimeType, "Content-Length": String(blob.size), "Cache-Control": "private, max-age=300", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" } });
  } catch {
    return placeholder("failed");
  }
}
