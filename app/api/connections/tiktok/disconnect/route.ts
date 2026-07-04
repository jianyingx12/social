import { NextResponse } from "next/server";
import { tiktokConnectionCookie } from "@/lib/auth/tiktok";

export async function POST() {
  const response = NextResponse.json({ connected: false });
  response.cookies.delete(tiktokConnectionCookie);
  return response;
}
