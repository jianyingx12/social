import { NextResponse } from "next/server";
import { redditConnectionCookie } from "@/lib/reddit-oauth";

export async function POST() {
  const response = NextResponse.json({ connected: false });
  response.cookies.delete(redditConnectionCookie);
  return response;
}
