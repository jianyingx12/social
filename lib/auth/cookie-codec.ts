import { Buffer } from "node:buffer";

export function encodeCookieValue<T>(value: T) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

export function decodeCookieValue<T>(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}
