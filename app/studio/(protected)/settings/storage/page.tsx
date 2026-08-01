import type React from "react";

import {studioButtonClass} from "@/components/studio/StudioButton";
import {getStudioContext} from "@/lib/studio/auth/get-studio-context";
import {createStudioServerClient} from "@/lib/studio/supabase/server";

import {connectGoogleDrive, disconnectGoogleDrive, initializeGoogleDriveRoot, type GoogleDriveCallbackErrorCode} from "./actions";

const callbackErrorMessages: Partial<Record<GoogleDriveCallbackErrorCode, string>> = {
  invalid_oauth_state: "Google Drive bağlantı isteğinin süresi dolmuş veya doğrulaması başarısız olmuş. Lütfen yeniden deneyin.",
  authorization_code_missing: "Google yetkilendirme kodu alınamadı. Lütfen yeniden deneyin.",
  owner_context_unavailable: "Bağlantı için Studio sahibi oturumu doğrulanamadı.",
  authorization_code_exchange_failed: "Google yetkilendirmesi tamamlanamadı. Lütfen yeniden deneyin.",
  refresh_token_missing: "Google yenileme anahtarı alınamadı. Lütfen hesabı yeniden yetkilendirin.",
  account_email_unavailable: "Bağlanan Google Drive hesabının e-posta adresi alınamadı.",
  encryption_key_invalid: "Depolama şifreleme ayarı geçersiz. Lütfen sistem yöneticisine başvurun.",
  token_encryption_failed: "Google Drive bağlantı bilgileri güvenli biçimde kaydedilemedi.",
  storage_connection_rls_denied: "Bağlantıyı kaydetme yetkisi doğrulanamadı.",
  storage_connection_upsert_failed: "Google Drive bağlantısı veritabanına kaydedilemedi.",
  unexpected_callback_error: "Google Drive bağlantısı sırasında beklenmeyen bir hata oluştu.",
};

function StorageActionButton({children, variant = "primary"}: {children: React.ReactNode; variant?: "primary" | "outline"}) {
  return <button type="submit" className={studioButtonClass(variant, "sm")}>{children}</button>;
}

export default async function StorageSettingsPage({searchParams}: {searchParams: Promise<{connected?: string; error?: string}>}) {
  const params = await searchParams;
  const ctx = await getStudioContext();
  if (!ctx?.membership) return null;
  const supabase = await createStudioServerClient();
  const {data} = await supabase
    .from("studio_storage_connections")
    .select("account_email,root_folder_name,projects_folder_id,status,last_verified_at,last_error_code")
    .eq("organization_id", ctx.membership.organization_id)
    .eq("provider", "google_drive")
    .maybeSingle();
  const owner = ctx.membership.role === "owner";
  const callbackError = typeof params.error === "string"
    ? callbackErrorMessages[params.error as GoogleDriveCallbackErrorCode]
    : undefined;

  return <main className="space-y-6">
    <div><p className="text-xs uppercase tracking-[.2em] text-[#a77936]">Studio Ayarları</p><h1 className="mt-2 text-3xl font-semibold text-[#25211d]">Depolama</h1></div>
    {params.connected === "1" && <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">Google Drive bağlantısı başarıyla kaydedildi.</p>}
    {callbackError && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{callbackError}</p>}
    <section className="rounded-2xl border border-[#e8e1d8] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-semibold text-[#25211d]">Google Drive</h2><p className="mt-1 text-sm text-[#716a62]">Proje dosyaları ofis Drive hesabındaki özel klasörlerde saklanır.</p></div><span className="rounded-full bg-[#f2eee8] px-3 py-1 text-xs">{data?.status === "connected" ? "Bağlı" : data?.status === "reauthorization_required" ? "Yeniden yetkilendirme gerekli" : "Bağlı değil"}</span></div>
      {data?.account_email && <p className="mt-5 text-sm text-[#514a43]">Hesap: {data.account_email}</p>}
      {data?.root_folder_name && <p className="mt-1 text-sm text-[#514a43]">Kök klasör: {data.root_folder_name}</p>}
      {data?.projects_folder_id && <p className="mt-1 text-sm text-[#514a43]">Projects klasörü hazır.</p>}
      {data?.last_error_code && <p className="mt-3 text-sm text-[#8b5141]">Bağlantı doğrulaması başarısız oldu. Lütfen yeniden deneyin.</p>}
      {owner && <div className="mt-6 flex flex-wrap gap-3">{data?.status === "connected" ? <><form action={initializeGoogleDriveRoot}><StorageActionButton>Root klasörlerini hazırla</StorageActionButton></form><form action={disconnectGoogleDrive}><StorageActionButton variant="outline">Bağlantıyı kes</StorageActionButton></form><form action={connectGoogleDrive}><StorageActionButton>Yeniden bağla</StorageActionButton></form></> : <form action={connectGoogleDrive}><StorageActionButton>{data?.status === "reauthorization_required" ? "Yeniden Bağlan" : "Google Drive’ı Bağla"}</StorageActionButton></form>}</div>}
    </section>
  </main>;
}
