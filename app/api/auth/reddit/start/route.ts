import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  createRedditAuthorizationUrl,
  getMissingRedditEnv,
  redditStateCookie,
} from "@/lib/auth/reddit";
import { getCurrentUserStorageKey } from "@/lib/auth/current-user";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserStorageKey();

  if (!userId) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

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
