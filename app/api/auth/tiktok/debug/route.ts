import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  createTikTokAuthorizationUrl,
  getMissingTikTokEnv,
  getTikTokConfig,
  tiktokScopes,
} from "@/lib/auth/tiktok";

export async function GET() {
  const config = getTikTokConfig();
  const authUrl = new URL(createTikTokAuthorizationUrl("debug-state"));
  const redirectUri = config.redirectUri ? new URL(config.redirectUri) : null;
  const clientKey = config.clientKey ?? "";

  return NextResponse.json({
    missingEnv: getMissingTikTokEnv(),
    clientKey: {
      present: clientKey.length > 0,
      length: clientKey.length,
      sha256Prefix: clientKey
        ? createHash("sha256").update(clientKey).digest("hex").slice(0, 12)
        : null,
    },
    clientSecret: {
      present: Boolean(config.clientSecret),
      length: config.clientSecret?.length ?? 0,
    },
    redirectUri: redirectUri
      ? {
          scheme: redirectUri.protocol.replace(":", ""),
          host: redirectUri.host,
          path: redirectUri.pathname,
          hasSearch: redirectUri.search.length > 0,
          hasHash: redirectUri.hash.length > 0,
        }
      : null,
    authorizationRequest: {
      host: authUrl.host,
      path: authUrl.pathname,
      responseType: authUrl.searchParams.get("response_type"),
      scope: authUrl.searchParams.get("scope"),
      redirectUriMatchesEnv: authUrl.searchParams.get("redirect_uri") === config.redirectUri,
      clientKeyLength: authUrl.searchParams.get("client_key")?.length ?? 0,
      statePresent: Boolean(authUrl.searchParams.get("state")),
    },
    expectedTikTokPortalSettings: {
      product: "Login Kit for Web",
      scopes: tiktokScopes,
      redirectUri: config.redirectUri,
    },
  });
}
