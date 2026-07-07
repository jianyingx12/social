import "server-only";

import { decryptSecret, encryptSecret } from "@/lib/security/encryption";

import { getSql } from "./client";

export type ConnectedAccountPlatform = "Reddit" | "TikTok";

export type ConnectedAccountStatus = {
  platform: ConnectedAccountPlatform;
  providerAccountId: string;
  displayName: string | null;
  username: string | null;
  scopes: string[];
  expiresAt: number | null;
};

type ConnectedAccountInput = {
  userId: string;
  platform: ConnectedAccountPlatform;
  providerAccountId: string;
  displayName?: string | null;
  username?: string | null;
  scopes: string[];
  accessToken: string;
  refreshToken?: string | null;
  tokenType?: string | null;
  expiresAt?: number | null;
  refreshExpiresAt?: number | null;
  metadata?: Record<string, unknown>;
};

type ConnectedAccountTokenUpdate = {
  userId: string;
  platform: ConnectedAccountPlatform;
  accessToken: string;
  refreshToken?: string | null;
  tokenType?: string | null;
  scopes?: string[];
  expiresAt?: number | null;
  refreshExpiresAt?: number | null;
};

type ConnectedAccountRow = {
  platform: ConnectedAccountPlatform;
  provider_account_id: string;
  display_name: string | null;
  username: string | null;
  scopes: unknown;
  expires_at: Date | string | null;
};

type TokenRow = ConnectedAccountRow & {
  access_token_encrypted: string;
  refresh_token_encrypted: string | null;
  token_type: string | null;
  refresh_expires_at: Date | string | null;
  metadata: unknown;
};

let setupPromise: Promise<void> | null = null;

export async function saveConnectedAccount(input: ConnectedAccountInput) {
  await ensureConnectedAccountsTable();

  const sql = getSql();
  const expiresAt = input.expiresAt ? new Date(input.expiresAt).toISOString() : null;
  const refreshExpiresAt = input.refreshExpiresAt
    ? new Date(input.refreshExpiresAt).toISOString()
    : null;

  await sql`
    insert into connected_accounts (
      user_id,
      platform,
      provider_account_id,
      display_name,
      username,
      scopes,
      access_token_encrypted,
      refresh_token_encrypted,
      token_type,
      expires_at,
      refresh_expires_at,
      metadata,
      updated_at
    )
    values (
      ${input.userId},
      ${input.platform},
      ${input.providerAccountId},
      ${input.displayName ?? null},
      ${input.username ?? null},
      ${JSON.stringify(input.scopes)}::jsonb,
      ${encryptSecret(input.accessToken)},
      ${input.refreshToken ? encryptSecret(input.refreshToken) : null},
      ${input.tokenType ?? null},
      ${expiresAt},
      ${refreshExpiresAt},
      ${JSON.stringify(input.metadata ?? {})}::jsonb,
      now()
    )
    on conflict (user_id, platform)
    do update set
      provider_account_id = excluded.provider_account_id,
      display_name = excluded.display_name,
      username = excluded.username,
      scopes = excluded.scopes,
      access_token_encrypted = excluded.access_token_encrypted,
      refresh_token_encrypted = excluded.refresh_token_encrypted,
      token_type = excluded.token_type,
      expires_at = excluded.expires_at,
      refresh_expires_at = excluded.refresh_expires_at,
      metadata = excluded.metadata,
      updated_at = now()
  `;
}

export async function loadConnectedAccountStatus(
  userId: string,
  platform: ConnectedAccountPlatform,
) {
  await ensureConnectedAccountsTable();

  const sql = getSql();
  const rows = (await sql`
    select platform, provider_account_id, display_name, username, scopes, expires_at
    from connected_accounts
    where user_id = ${userId} and platform = ${platform}
    limit 1
  `) as ConnectedAccountRow[];
  const row = rows[0];

  if (!row) {
    return null;
  }

  return normalizeStatus(row);
}

export async function loadConnectedAccountTokens(
  userId: string,
  platform: ConnectedAccountPlatform,
) {
  await ensureConnectedAccountsTable();

  const sql = getSql();
  const rows = (await sql`
    select
      platform,
      provider_account_id,
      display_name,
      username,
      scopes,
      access_token_encrypted,
      refresh_token_encrypted,
      token_type,
      expires_at,
      refresh_expires_at,
      metadata
    from connected_accounts
    where user_id = ${userId} and platform = ${platform}
    limit 1
  `) as TokenRow[];
  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    ...normalizeStatus(row),
    accessToken: decryptSecret(row.access_token_encrypted),
    refreshToken: row.refresh_token_encrypted
      ? decryptSecret(row.refresh_token_encrypted)
      : null,
    tokenType: row.token_type,
    refreshExpiresAt: dateToMillis(row.refresh_expires_at),
    metadata: row.metadata,
  };
}

export async function updateConnectedAccountTokens(input: ConnectedAccountTokenUpdate) {
  await ensureConnectedAccountsTable();

  const sql = getSql();
  const expiresAt = input.expiresAt ? new Date(input.expiresAt).toISOString() : null;
  const refreshExpiresAt = input.refreshExpiresAt
    ? new Date(input.refreshExpiresAt).toISOString()
    : null;

  await sql`
    update connected_accounts
    set
      access_token_encrypted = ${encryptSecret(input.accessToken)},
      refresh_token_encrypted = case
        when ${input.refreshToken ?? null}::text is null then refresh_token_encrypted
        else ${input.refreshToken ? encryptSecret(input.refreshToken) : null}
      end,
      token_type = coalesce(${input.tokenType ?? null}, token_type),
      scopes = case
        when ${input.scopes ? JSON.stringify(input.scopes) : null}::jsonb is null then scopes
        else ${input.scopes ? JSON.stringify(input.scopes) : null}::jsonb
      end,
      expires_at = ${expiresAt},
      refresh_expires_at = coalesce(${refreshExpiresAt}, refresh_expires_at),
      updated_at = now()
    where user_id = ${input.userId} and platform = ${input.platform}
  `;
}

export async function deleteConnectedAccount(
  userId: string,
  platform: ConnectedAccountPlatform,
) {
  await ensureConnectedAccountsTable();

  const sql = getSql();

  await sql`
    delete from connected_accounts
    where user_id = ${userId} and platform = ${platform}
  `;
}

function ensureConnectedAccountsTable() {
  setupPromise ??= createConnectedAccountsTable();

  return setupPromise;
}

async function createConnectedAccountsTable() {
  const sql = getSql();

  await sql`
    create table if not exists connected_accounts (
      user_id text not null,
      platform text not null,
      provider_account_id text not null,
      display_name text,
      username text,
      scopes jsonb not null default '[]'::jsonb,
      access_token_encrypted text not null,
      refresh_token_encrypted text,
      token_type text,
      expires_at timestamptz,
      refresh_expires_at timestamptz,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      primary key (user_id, platform)
    )
  `;

  await sql`
    create index if not exists connected_accounts_user_id_updated_at_idx
    on connected_accounts (user_id, updated_at desc)
  `;
}

function normalizeStatus(row: ConnectedAccountRow): ConnectedAccountStatus {
  return {
    platform: row.platform,
    providerAccountId: row.provider_account_id,
    displayName: row.display_name,
    username: row.username,
    scopes: Array.isArray(row.scopes)
      ? row.scopes.filter((scope): scope is string => typeof scope === "string")
      : [],
    expiresAt: dateToMillis(row.expires_at),
  };
}

function dateToMillis(value: Date | string | null) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}
