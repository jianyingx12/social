export const neonAuthConfig = {
  baseUrl: process.env.NEON_AUTH_BASE_URL ?? "",
  jwksUrl: process.env.NEON_AUTH_JWKS_URL ?? "",
  databaseName: process.env.NEON_AUTH_DATABASE_NAME ?? "neondb",
};
