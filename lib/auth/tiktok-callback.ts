import { NextRequest, NextResponse } from "next/server";
import {
  encodeTikTokConnection,
  exchangeTikTokCode,
  fetchTikTokMe,
  tiktokConnectionCookie,
  tiktokStateCookie,
} from "./tiktok";

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

  try {
    const token = await exchangeTikTokCode(code);
    const account = await fetchTikTokMe(token.access_token!);
    const expiresAt = Date.now() + (token.expires_in ?? 86400) * 1000;
    redirectUrl.searchParams.set("tiktok", "connected");
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.delete(tiktokStateCookie);
    response.cookies.set(
      tiktokConnectionCookie,
      encodeTikTokConnection({
        displayName: account.display_name ?? "TikTok account",
        openId: account.open_id!,
        scope: token.scope ?? "",
        expiresAt,
      }),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      },
    );

    return response;
  } catch {
    redirectUrl.searchParams.set("tiktok", "error");
    return NextResponse.redirect(redirectUrl);
  }
}
