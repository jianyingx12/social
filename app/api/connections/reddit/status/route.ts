import { NextRequest } from "next/server";
import {
  decodeRedditConnection,
  redditConnectionCookie,
} from "@/lib/reddit-oauth";

export async function GET(request: NextRequest) {
  const connection = decodeRedditConnection(
    request.cookies.get(redditConnectionCookie)?.value,
  );

  if (!connection) {
    return Response.json({ connected: false });
  }

  return Response.json({
    connected: true,
    username: connection.username,
    scope: connection.scope,
    expiresAt: connection.expiresAt,
  });
}
