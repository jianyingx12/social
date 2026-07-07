# OrganicReach Storage

This document describes where OrganicReach stores app state, connection state, and sensitive OAuth data.

OrganicReach uses Neon for two related but separate jobs:

- Neon Auth manages app users and sessions.
- Neon Postgres stores app-owned data for signed-in users.

The app should keep these concerns separate. A signed-in app user is not the same thing as a connected Reddit, TikTok, or Instagram account.

## Current Storage Model

```txt
Neon Auth session
-> signed-in OrganicReach user
-> product workspaces in Neon Postgres
-> connected platform accounts in Neon Postgres
```

The frontend should never receive OAuth access tokens, refresh tokens, database credentials, or encryption keys. It can receive safe connection metadata such as `connected`, `username`, `displayName`, scopes, and expiry timestamps.

## Product Workspaces

Product workspaces are stored in the `product_workspaces` table.

Code:

```txt
lib/db/product-workspaces.ts
app/api/workspaces/route.ts
components/marketing-copilot/hooks/useMarketingCopilot.ts
```

Table shape:

```sql
product_workspaces (
  id text,
  user_id text,
  workspace jsonb,
  sort_order integer,
  created_at timestamptz,
  updated_at timestamptz
)
```

The MVP stores each workspace as JSON. That JSON includes the product brief, source material, chat messages, research targets, opportunities, drafts, and content ideas.

This is intentional for now. The product workflow is still changing, and JSON storage lets the app evolve without creating a migration for every UI shape change.

Later, stable high-value objects can move into normalized tables. Likely candidates:

- research targets
- discovered opportunities
- review drafts
- scheduled posts
- external platform activity

## Connected Accounts

Connected platform accounts are stored in the `connected_accounts` table.

Code:

```txt
lib/db/connected-accounts.ts
lib/security/encryption.ts
lib/auth/reddit-callback.ts
lib/auth/tiktok-callback.ts
lib/auth/tiktok-token.ts
app/api/connections/reddit/status/route.ts
app/api/connections/tiktok/status/route.ts
app/api/connections/reddit/disconnect/route.ts
app/api/connections/tiktok/disconnect/route.ts
```

Table shape:

```sql
connected_accounts (
  user_id text,
  platform text,
  provider_account_id text,
  display_name text,
  username text,
  scopes jsonb,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_type text,
  expires_at timestamptz,
  refresh_expires_at timestamptz,
  metadata jsonb,
  created_at timestamptz,
  updated_at timestamptz
)
```

Each signed-in user can have one connected account per platform. Current platforms:

- Reddit
- TikTok

Instagram is still a placeholder.

## OAuth Token Flow

The connection flow works like this:

```txt
User clicks Connect
-> app verifies the user is signed in
-> app redirects to the platform OAuth screen
-> platform redirects back with a code
-> server verifies state
-> server exchanges code for tokens
-> server fetches safe account metadata
-> server encrypts tokens
-> server stores encrypted tokens in Neon Postgres
-> browser sees only connection status
```

OAuth tokens are only handled in server code. They should not be stored in client state, returned from API routes, or written to browser-accessible storage.

TikTok access tokens are refreshed server-side through `lib/auth/tiktok-token.ts` when they are expired or close to expiring. Refreshed tokens are encrypted and saved back into `connected_accounts`.

## Encryption

OAuth tokens are encrypted with AES-256-GCM before being saved.

Code:

```txt
lib/security/encryption.ts
```

Required production env var:

```txt
OAUTH_TOKEN_ENCRYPTION_KEY=
```

The encryption key must be private and stable. If it changes, previously stored OAuth tokens cannot be decrypted.

In non-production, the code can fall back to `NEON_AUTH_COOKIE_SECRET` to reduce local setup friction. Production should always use a dedicated `OAUTH_TOKEN_ENCRYPTION_KEY`.

## Environment Variables

Storage and auth need:

```txt
DATABASE_URL=
NEON_AUTH_BASE_URL=
NEON_AUTH_COOKIE_SECRET=
OAUTH_TOKEN_ENCRYPTION_KEY=
```

Platform OAuth needs:

```txt
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_REDIRECT_URI=
REDDIT_USER_AGENT=

TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=
TIKTOK_VERIFICATION_FILENAME=
TIKTOK_VERIFICATION_CONTENT=
```

Do not commit real values for these variables.

## Security Boundaries

Safe to return to the browser:

- connection status
- platform username or display name
- scopes
- expiry timestamp
- product workspace data owned by the signed-in user

Never return to the browser:

- access tokens
- refresh tokens
- encryption keys
- database connection strings
- provider client secrets

Never trust client-provided user identifiers. API routes should derive the current user from the Neon Auth session.

## Current Gaps

The storage foundation exists, but these pieces are still not done:

- Reddit refresh token rotation
- automatic retry for all provider API calls after expired access tokens
- live research result storage
- normalized tables for stable workflow objects
- platform posting/scheduling records
- audit log for sensitive connection actions
- automated tests for route-level auth and storage behavior

## Product Principle

Storage should support trust. OrganicReach can remember product context, hold connected account credentials securely, and prepare public actions, but the user stays in control before anything is posted.
