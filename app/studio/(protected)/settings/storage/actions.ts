"use server";

import {randomBytes} from "node:crypto";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";

import {getStudioContext} from "@/lib/studio/auth/get-studio-context";
import {
  exchangeGoogleCode,
  getGoogleDriveAccount,
  googleDriveAuthorizationUrl,
} from "@/lib/studio/files/storage/google-drive-auth";
import {initializeStudioGoogleDriveRoot} from "@/lib/studio/files/storage/google-drive-mapping";
import {encryptToken} from "@/lib/studio/files/storage/token-encryption";
import {createStudioServerClient} from "@/lib/studio/supabase/server";

export type GoogleDriveCallbackErrorCode =
  | "invalid_oauth_state"
  | "authorization_code_missing"
  | "owner_context_unavailable"
  | "authorization_code_exchange_failed"
  | "refresh_token_missing"
  | "account_email_unavailable"
  | "encryption_key_invalid"
  | "token_encryption_failed"
  | "storage_connection_rls_denied"
  | "storage_connection_upsert_failed"
  | "unexpected_callback_error";

type SaveGoogleConnectionResult =
  | {ok: true}
  | {ok: false; error: GoogleDriveCallbackErrorCode};

export async function initializeGoogleDriveRoot() {
  await initializeStudioGoogleDriveRoot();
}

export async function connectGoogleDrive() {
  const ctx = await getStudioContext();
  if (!ctx?.membership || ctx.membership.role !== "owner") throw new Error("Yalnızca Studio sahibi bağlayabilir.");
  const state = randomBytes(24).toString("base64url");
  (await cookies()).set("studio_google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  redirect(googleDriveAuthorizationUrl(state));
}

export async function disconnectGoogleDrive() {
  const ctx = await getStudioContext();
  if (!ctx?.membership || ctx.membership.role !== "owner") throw new Error("Yetkiniz yok.");
  const supabase = await createStudioServerClient();
  await supabase
    .from("studio_storage_connections")
    .update({status: "disconnected", encrypted_access_token: null, encrypted_refresh_token: null, updated_by: ctx.user.id})
    .eq("organization_id", ctx.membership.organization_id)
    .eq("provider", "google_drive");
}

export async function saveGoogleConnection(code: string): Promise<SaveGoogleConnectionResult> {
  let ctx: Awaited<ReturnType<typeof getStudioContext>>;
  try {
    ctx = await getStudioContext();
  } catch {
    return {ok: false, error: "owner_context_unavailable"};
  }
  if (!ctx?.membership || ctx.membership.role !== "owner") {
    return {ok: false, error: "owner_context_unavailable"};
  }

  let token: Awaited<ReturnType<typeof exchangeGoogleCode>>;
  try {
    token = await exchangeGoogleCode(code);
  } catch {
    return {ok: false, error: "authorization_code_exchange_failed"};
  }
  if (!token.refresh_token) return {ok: false, error: "refresh_token_missing"};

  let account: Awaited<ReturnType<typeof getGoogleDriveAccount>>;
  try {
    account = await getGoogleDriveAccount(token.access_token);
  } catch {
    return {ok: false, error: "account_email_unavailable"};
  }
  if (!account.emailAddress) return {ok: false, error: "account_email_unavailable"};

  let encryptedAccessToken: string;
  let encryptedRefreshToken: string;
  try {
    encryptedAccessToken = encryptToken(token.access_token);
    encryptedRefreshToken = encryptToken(token.refresh_token);
  } catch (error) {
    const code = error instanceof Error && error.message.startsWith("STUDIO_STORAGE_ENCRYPTION_KEY")
      ? "encryption_key_invalid"
      : "token_encryption_failed";
    return {ok: false, error: code};
  }

  let upsertError: {code?: string} | null;
  try {
    const supabase = await createStudioServerClient();
    const {error} = await supabase.from("studio_storage_connections").upsert({
      organization_id: ctx.membership.organization_id,
      provider: "google_drive",
      account_email: account.emailAddress,
      provider_account_id: account.permissionId ?? null,
      encrypted_access_token: encryptedAccessToken,
      encrypted_refresh_token: encryptedRefreshToken,
      access_token_expires_at: new Date(Date.now() + token.expires_in * 1000).toISOString(),
      status: "connected",
      last_connected_at: new Date().toISOString(),
      last_verified_at: new Date().toISOString(),
      last_error_code: null,
      created_by: ctx.user.id,
      updated_by: ctx.user.id,
    }, {onConflict: "organization_id,provider"});
    upsertError = error;
  } catch {
    return {ok: false, error: "storage_connection_upsert_failed"};
  }

  if (upsertError) {
    return {
      ok: false,
      error: upsertError.code === "42501" ? "storage_connection_rls_denied" : "storage_connection_upsert_failed",
    };
  }

  return {ok: true};
}
