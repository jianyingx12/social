import { Buffer } from "node:buffer";
import { decodeCookieValue, encodeCookieValue } from "./cookie-codec";

export type RedditConnection = {
  username: string;
  scope: string;
  expiresAt: number;
};

type RedditTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  refresh_token?: string;
  error?: string;
};

type RedditMeResponse = {
  name?: string;
  error?: string;
  message?: string;
};

export const redditScopes = ["identity", "read", "submit", "mysubreddits"];
export const redditStateCookie = "reddit_oauth_state";
export const redditConnectionCookie = "reddit_connection";

export function getRedditConfig() {
  return {
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    redirectUri:
      process.env.REDDIT_REDIRECT_URI ?? "http://localhost:3000/api/auth/reddit/callback",
    userAgent: process.env.REDDIT_USER_AGENT ?? "OrganicReach/0.1 by local-development",
  };
}

export function getMissingRedditEnv() {
  const config = getRedditConfig();
  return [
    ["REDDIT_CLIENT_ID", config.clientId],
    ["REDDIT_CLIENT_SECRET", config.clientSecret],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);
}

export function createRedditAuthorizationUrl(state: string) {
  const config = getRedditConfig();
  const params = new URLSearchParams({
    client_id: config.clientId ?? "",
    response_type: "code",
    state,
    redirect_uri: config.redirectUri,
    duration: "permanent",
    scope: redditScopes.join(" "),
  });

  return `https://www.reddit.com/api/v1/authorize?${params.toString()}`;
}

export async function exchangeRedditCode(code: string) {
  const config = getRedditConfig();
  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
  });

  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": config.userAgent,
    },
    body,
  });

  const token = (await response.json()) as RedditTokenResponse;

  if (!response.ok || token.error || !token.access_token) {
    throw new Error(token.error ?? "Reddit token exchange failed");
  }

  return token;
}

export async function fetchRedditMe(accessToken: string) {
  const config = getRedditConfig();
  const response = await fetch("https://oauth.reddit.com/api/v1/me", {
    headers: {
      Authorization: `bearer ${accessToken}`,
      "User-Agent": config.userAgent,
    },
  });

  const account = (await response.json()) as RedditMeResponse;

  if (!response.ok || account.error || !account.name) {
    throw new Error(account.message ?? account.error ?? "Unable to load Reddit account");
  }

  return account;
}

export function encodeRedditConnection(connection: RedditConnection) {
  return encodeCookieValue(connection);
}

export function decodeRedditConnection(value: string | undefined) {
  return decodeCookieValue<RedditConnection>(value);
}
