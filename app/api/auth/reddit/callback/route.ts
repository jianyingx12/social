import { NextRequest, NextResponse } from "next/server";
import {
  encodeRedditConnection,
  exchangeRedditCode,
  fetchRedditMe,
  redditConnectionCookie,
  redditStateCookie,
} from "@/lib/reddit-oauth";

export async function GET(request: NextRequest) {
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

  try {
    const token = await exchangeRedditCode(code);
    const account = await fetchRedditMe(token.access_token!);
    const expiresAt = Date.now() + (token.expires_in ?? 3600) * 1000;
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.delete(redditStateCookie);
    response.cookies.set(
      redditConnectionCookie,
      encodeRedditConnection({
        username: account.name!,
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
    redirectUrl.searchParams.set("reddit", "error");
    return NextResponse.redirect(redirectUrl);
  }
}
