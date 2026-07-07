import { getCurrentUserStorageKey } from "@/lib/auth/current-user";
import { getTikTokAccessToken } from "@/lib/auth/tiktok-token";
import { loadConnectedAccountStatus } from "@/lib/db/connected-accounts";

export async function GET() {
  const userId = await getCurrentUserStorageKey();

  if (!userId) {
    return Response.json({ connected: false });
  }

  try {
    await getTikTokAccessToken(userId);
  } catch {
    return Response.json({
      connected: false,
      needsReconnect: true,
    });
  }

  const connection = await loadConnectedAccountStatus(userId, "TikTok");

  if (!connection) {
    return Response.json({ connected: false });
  }

  return Response.json({
    connected: true,
    displayName: connection.displayName,
    openId: connection.providerAccountId,
    scope: connection.scopes.join(" "),
    expiresAt: connection.expiresAt,
  });
}
