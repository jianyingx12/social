import { NextRequest } from "next/server";
import {
  decodeTikTokConnection,
  tiktokConnectionCookie,
} from "@/lib/auth/tiktok";

export async function GET(request: NextRequest) {
  const connection = decodeTikTokConnection(
    request.cookies.get(tiktokConnectionCookie)?.value,
  );

  if (!connection) {
    return Response.json({ connected: false });
  }

  return Response.json({
    connected: true,
    displayName: connection.displayName,
    openId: connection.openId,
    scope: connection.scope,
    expiresAt: connection.expiresAt,
  });
}
