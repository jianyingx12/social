import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  createRedditAuthorizationUrl,
  getMissingRedditEnv,
  redditStateCookie,
} from "@/lib/reddit-oauth";

export async function GET() {
  const missingEnv = getMissingRedditEnv();

  if (missingEnv.length > 0) {
    return NextResponse.json(
      {
        error: "Reddit OAuth is not configured",
        missingEnv,
      },
      { status: 500 },
    );
  }

  const state = randomUUID();
  const response = NextResponse.redirect(createRedditAuthorizationUrl(state));

  response.cookies.set(redditStateCookie, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
    path: "/",
  });

  return response;
}
