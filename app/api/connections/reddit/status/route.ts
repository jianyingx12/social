import { getCurrentUserStorageKey } from "@/lib/auth/current-user";
import { loadConnectedAccountStatus } from "@/lib/db/connected-accounts";

export async function GET() {
  const userId = await getCurrentUserStorageKey();

  if (!userId) {
    return Response.json({ connected: false });
  }

  const connection = await loadConnectedAccountStatus(userId, "Reddit");

  if (!connection) {
    return Response.json({ connected: false });
  }

  return Response.json({
    connected: true,
    username: connection.username ?? connection.displayName,
    scope: connection.scopes.join(" "),
    expiresAt: connection.expiresAt,
  });
}
