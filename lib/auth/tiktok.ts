import { decodeCookieValue, encodeCookieValue } from "./cookie-codec";

export type TikTokConnection = {
  displayName: string;
  openId: string;
  scope: string;
  expiresAt: number;
};

type TikTokTokenResponse = {
  access_token?: string;
  expires_in?: number;
  open_id?: string;
  refresh_token?: string;
  refresh_expires_in?: number;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type TikTokUserInfoResponse = {
  data?: {
    user?: {
      open_id?: string;
      display_name?: string;
      avatar_url?: string;
    };
  };
  error?: {
    code?: string;
    message?: string;
    log_id?: string;
  };
};

export const tiktokScopes = ["user.info.basic"];
export const tiktokStateCookie = "tiktok_oauth_state";
export const tiktokConnectionCookie = "tiktok_connection";

export function getTikTokConfig() {
  return {
    clientKey: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    redirectUri:
      process.env.TIKTOK_REDIRECT_URI ?? "https://example.com/api/auth/callback/tiktok",
  };
}

export function getMissingTikTokEnv() {
  const config = getTikTokConfig();
  return [
    ["TIKTOK_CLIENT_KEY", config.clientKey],
    ["TIKTOK_CLIENT_SECRET", config.clientSecret],
    ["TIKTOK_REDIRECT_URI", config.redirectUri],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);
}

export function createTikTokAuthorizationUrl(state: string) {
  const config = getTikTokConfig();
  const params = new URLSearchParams({
    client_key: config.clientKey ?? "",
    response_type: "code",
    scope: tiktokScopes.join(","),
    redirect_uri: config.redirectUri,
    state,
  });

  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}

export async function exchangeTikTokCode(code: string) {
  const config = getTikTokConfig();
  const body = new URLSearchParams({
    client_key: config.clientKey ?? "",
    client_secret: config.clientSecret ?? "",
    code,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri,
  });

  const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body,
  });

  const token = (await response.json()) as TikTokTokenResponse;

  if (!response.ok || token.error || !token.access_token || !token.open_id) {
    throw new Error(token.error_description ?? token.error ?? "TikTok token exchange failed");
  }

  return token;
}

export async function fetchTikTokMe(accessToken: string) {
  const fields = ["open_id", "display_name", "avatar_url"].join(",");
  const response = await fetch(
    `https://open.tiktokapis.com/v2/user/info/?fields=${encodeURIComponent(fields)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const account = (await response.json()) as TikTokUserInfoResponse;
  const user = account.data?.user;

  if (!response.ok || account.error?.code || !user?.open_id) {
    throw new Error(account.error?.message ?? "Unable to load TikTok account");
  }

  return user;
}

export function encodeTikTokConnection(connection: TikTokConnection) {
  return encodeCookieValue(connection);
}

export function decodeTikTokConnection(value: string | undefined) {
  return decodeCookieValue<TikTokConnection>(value);
}
