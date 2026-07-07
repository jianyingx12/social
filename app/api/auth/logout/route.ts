import { auth } from "@/lib/auth/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await auth.signOut();

  return NextResponse.redirect(new URL("/auth/sign-in", request.url), 303);
}
