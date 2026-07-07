import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const algorithm = "aes-256-gcm";
const encoding = "base64url";
const version = "v1";

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    version,
    iv.toString(encoding),
    authTag.toString(encoding),
    ciphertext.toString(encoding),
  ].join(".");
}

export function decryptSecret(value: string) {
  const [storedVersion, iv, authTag, ciphertext] = value.split(".");

  if (storedVersion !== version || !iv || !authTag || !ciphertext) {
    throw new Error("Unsupported encrypted secret format.");
  }

  const decipher = createDecipheriv(
    algorithm,
    getEncryptionKey(),
    Buffer.from(iv, encoding),
  );

  decipher.setAuthTag(Buffer.from(authTag, encoding));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, encoding)),
    decipher.final(),
  ]).toString("utf8");
}

function getEncryptionKey() {
  const secret =
    process.env.OAUTH_TOKEN_ENCRYPTION_KEY ??
    (process.env.NODE_ENV !== "production" ? process.env.NEON_AUTH_COOKIE_SECRET : undefined);

  if (!secret) {
    throw new Error("OAUTH_TOKEN_ENCRYPTION_KEY is required to encrypt OAuth tokens.");
  }

  return createHash("sha256").update(secret).digest();
}
