import { NextRequest, NextResponse } from "next/server";
import {
  exchangeRedditCode,
  fetchRedditMe,
  redditConnectionCookie,
  redditStateCookie,
} from "./reddit";
import { getCurrentUserStorageKey } from "./current-user";
import { saveConnectedAccount } from "@/lib/db/connected-accounts";

export async function handleRedditCallback(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const redirectUrl = new URL("/", requestUrl.origin);
  const error = requestUrl.searchParams.get("error");
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const storedState = request.cookies.get(redditStateCookie)?.value;

  if (error) {
    redirectUrl.searchParams.set("reddit", "denied");
    return NextResponse.redirect(redirectUrl);
  }

  if (!code || !state || !storedState || state !== storedState) {
    redirectUrl.searchParams.set("reddit", "invalid-state");
    return NextResponse.redirect(redirectUrl);
  }

  const userId = await getCurrentUserStorageKey();

  if (!userId) {
    redirectUrl.searchParams.set("reddit", "error");
    redirectUrl.searchParams.set("reason", "auth-required");
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete(redditStateCookie);
    return response;
  }

  try {
    const token = await exchangeRedditCode(code);
    const account = await fetchRedditMe(token.access_token!);
    const expiresAt = Date.now() + (token.expires_in ?? 3600) * 1000;

    await saveConnectedAccount({
      userId,
      platform: "Reddit",
      providerAccountId: account.name!,
      displayName: account.name!,
      username: account.name!,
      scopes: splitScopes(token.scope),
      accessToken: token.access_token!,
      refreshToken: token.refresh_token ?? null,
      tokenType: token.token_type ?? null,
      expiresAt,
    });

    const response = NextResponse.redirect(redirectUrl);

    response.cookies.delete(redditStateCookie);
    response.cookies.delete(redditConnectionCookie);

    return response;
  } catch {
    redirectUrl.searchParams.set("reddit", "error");
    return NextResponse.redirect(redirectUrl);
  }
}

function splitScopes(scope: string | undefined) {
  return scope?.split(/\s+/).filter(Boolean) ?? [];
}
