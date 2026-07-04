import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  createTikTokAuthorizationUrl,
  getMissingTikTokEnv,
  tiktokStateCookie,
} from "@/lib/auth/tiktok";

export async function GET() {
  const missingEnv = getMissingTikTokEnv();

  if (missingEnv.length > 0) {
    return NextResponse.json(
      {
        error: "TikTok OAuth is not configured",
        missingEnv,
      },
      { status: 500 },
    );
  }

  const state = randomUUID();
  const response = NextResponse.redirect(createTikTokAuthorizationUrl(state));

  response.cookies.set(tiktokStateCookie, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
    path: "/",
  });

  return response;
}
