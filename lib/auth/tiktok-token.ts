import "server-only";

import {
  loadConnectedAccountTokens,
  updateConnectedAccountTokens,
} from "@/lib/db/connected-accounts";

import { refreshTikTokAccessToken } from "./tiktok";

const tokenRefreshBufferMs = 5 * 60 * 1000;

export async function getTikTokAccessToken(userId: string) {
  const connection = await loadConnectedAccountTokens(userId, "TikTok");

  if (!connection) {
    return null;
  }

  if (connection.expiresAt && connection.expiresAt > Date.now() + tokenRefreshBufferMs) {
    return connection.accessToken;
  }

  if (!connection.refreshToken) {
    throw new Error("TikTok connection is expired and has no refresh token.");
  }

  const refreshedToken = await refreshTikTokAccessToken(connection.refreshToken);
  const expiresAt = Date.now() + (refreshedToken.expires_in ?? 86400) * 1000;
  const refreshExpiresAt = refreshedToken.refresh_expires_in
    ? Date.now() + refreshedToken.refresh_expires_in * 1000
    : null;

  await updateConnectedAccountTokens({
    userId,
    platform: "TikTok",
    accessToken: refreshedToken.access_token!,
    refreshToken: refreshedToken.refresh_token ?? null,
    tokenType: refreshedToken.token_type ?? null,
    scopes: splitScopes(refreshedToken.scope),
    expiresAt,
    refreshExpiresAt,
  });

  return refreshedToken.access_token!;
}

function splitScopes(scope: string | undefined) {
  return scope?.split(/[\s,]+/).filter(Boolean) ?? undefined;
}
