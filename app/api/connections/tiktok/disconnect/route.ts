import { NextResponse } from "next/server";
import { getCurrentUserStorageKey } from "@/lib/auth/current-user";
import { tiktokConnectionCookie } from "@/lib/auth/tiktok";
import { deleteConnectedAccount } from "@/lib/db/connected-accounts";

export async function POST() {
  const userId = await getCurrentUserStorageKey();

  if (userId) {
    await deleteConnectedAccount(userId, "TikTok");
  }

  const response = NextResponse.json({ connected: false });
  response.cookies.delete(tiktokConnectionCookie);
  return response;
}
