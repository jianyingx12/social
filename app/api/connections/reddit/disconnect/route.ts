import { NextResponse } from "next/server";
import { getCurrentUserStorageKey } from "@/lib/auth/current-user";
import { redditConnectionCookie } from "@/lib/auth/reddit";
import { deleteConnectedAccount } from "@/lib/db/connected-accounts";

export async function POST() {
  const userId = await getCurrentUserStorageKey();

  if (userId) {
    await deleteConnectedAccount(userId, "Reddit");
  }

  const response = NextResponse.json({ connected: false });
  response.cookies.delete(redditConnectionCookie);
  return response;
}
