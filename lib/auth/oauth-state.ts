import { decodeCookieValue, encodeCookieValue } from "./cookie-codec";

type OAuthStateCookie = {
  state: string;
  userId: string;
};

export function encodeOAuthStateCookie(value: OAuthStateCookie) {
  return encodeCookieValue(value);
}

export function decodeOAuthStateCookie(value: string | undefined) {
  const decoded = decodeCookieValue<Partial<OAuthStateCookie>>(value);

  if (!decoded || typeof decoded.state !== "string" || typeof decoded.userId !== "string") {
    return null;
  }

  return {
    state: decoded.state,
    userId: decoded.userId,
  };
}
