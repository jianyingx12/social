import { NextRequest, NextResponse } from "next/server";
import {
  exchangeTikTokCode,
  fetchTikTokMe,
  TikTokOAuthError,
  tiktokConnectionCookie,
  tiktokStateCookie,
} from "./tiktok";
import { getCurrentUserStorageKey } from "./current-user";
import { saveConnectedAccount } from "@/lib/db/connected-accounts";

export async function handleTikTokCallback(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const redirectUrl = new URL("/", requestUrl.origin);
  const error = requestUrl.searchParams.get("error");
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const storedState = request.cookies.get(tiktokStateCookie)?.value;

  if (error) {
    redirectUrl.searchParams.set("tiktok", "denied");
    return NextResponse.redirect(redirectUrl);
  }

  if (!code || !state || !storedState || state !== storedState) {
    redirectUrl.searchParams.set("tiktok", "invalid-state");
    return NextResponse.redirect(redirectUrl);
  }

  const userId = await getCurrentUserStorageKey();

  if (!userId) {
    redirectUrl.searchParams.set("tiktok", "error");
    redirectUrl.searchParams.set("reason", "auth-required");
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete(tiktokStateCookie);
    return response;
  }

  try {
    const token = await exchangeTikTokCode(code);
    const account = await fetchTikTokMe(token.access_token!);
    const expiresAt = Date.now() + (token.expires_in ?? 86400) * 1000;
    const refreshExpiresAt = token.refresh_expires_in
      ? Date.now() + token.refresh_expires_in * 1000
      : null;

    await saveConnectedAccount({
      userId,
      platform: "TikTok",
      providerAccountId: account.open_id!,
      displayName: account.display_name ?? "TikTok account",
      scopes: splitScopes(token.scope),
      accessToken: token.access_token!,
      refreshToken: token.refresh_token ?? null,
      tokenType: token.token_type ?? null,
      expiresAt,
      refreshExpiresAt,
      metadata: {
        avatarUrl: account.avatar_url ?? null,
      },
    });

    redirectUrl.searchParams.set("tiktok", "connected");
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.delete(tiktokStateCookie);
    response.cookies.delete(tiktokConnectionCookie);

    return response;
  } catch (error) {
    const errorReason = getTikTokErrorReason(error);

    console.error("TikTok OAuth callback failed", {
      reason: errorReason,
      message: error instanceof Error ? error.message : "Unknown TikTok OAuth error",
      code: error instanceof TikTokOAuthError ? error.code : undefined,
    });

    redirectUrl.searchParams.set("tiktok", "error");
    redirectUrl.searchParams.set("reason", errorReason);
    return NextResponse.redirect(redirectUrl);
  }
}

function getTikTokErrorReason(error: unknown) {
  if (error instanceof TikTokOAuthError) {
    return error.phase;
  }

  return "unknown";
}

function splitScopes(scope: string | undefined) {
  return scope?.split(/[\s,]+/).filter(Boolean) ?? [];
}
