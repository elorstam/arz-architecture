import {cookies} from "next/headers";
import {NextResponse} from "next/server";

import {saveGoogleConnection, type GoogleDriveCallbackErrorCode} from "../actions";
import {appDestination} from "@/lib/routing/app-domains";

const storageSettingsPath = "/studio/settings/storage";

function redirectWithResult(request: Request, key: "connected" | "error", value: string) {
  const host=request.headers.get("x-forwarded-host")||request.headers.get("host");
  const destination = new URL(appDestination("studio",storageSettingsPath,host), request.url);
  destination.searchParams.set(key, value);
  return NextResponse.redirect(destination);
}

function reportError(code: GoogleDriveCallbackErrorCode) {
  if (process.env.NODE_ENV === "development") {
    console.error(`GOOGLE_DRIVE_CALLBACK_ERROR: ${code}`);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const jar = await cookies();
  const expectedState = jar.get("studio_google_oauth_state")?.value;
  jar.delete("studio_google_oauth_state");

  if (!state || !expectedState || state !== expectedState) {
    const error = "invalid_oauth_state";
    reportError(error);
    return redirectWithResult(request, "error", error);
  }

  if (!code) {
    const error = "authorization_code_missing";
    reportError(error);
    return redirectWithResult(request, "error", error);
  }

  try {
    const result = await saveGoogleConnection(code);
    if (!result.ok) {
      reportError(result.error);
      return redirectWithResult(request, "error", result.error);
    }
    return redirectWithResult(request, "connected", "1");
  } catch {
    const error = "unexpected_callback_error";
    reportError(error);
    return redirectWithResult(request, "error", error);
  }
}
