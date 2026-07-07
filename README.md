# OrganicReach

Early MVP for an AI growth agent.

The idea is simple: describe what you are building, let the app find conversations where people are already talking about that problem, then review AI-drafted replies before anything is posted.

This is not meant to be a fully automatic posting bot or another social scheduler. The first version is intentionally discovery-first and approval-first.

## What It Does Right Now

- Shows a basic dashboard for account connections
- Has a product brief screen for describing a product, audience, and problem
- Runs a first automatic Hacker News research pass for relevant conversations
- Drafts replies from selected opportunities into a review queue
- Includes an Ideas area for content ideas with suggested attachments
- Starts a real Reddit OAuth connection flow
- Stores encrypted Reddit OAuth tokens in Neon Postgres
- Reads the connected Reddit username after OAuth from server-side storage
- Starts a TikTok Login Kit OAuth flow
- Stores encrypted TikTok OAuth tokens in Neon Postgres
- Reads the connected TikTok display name after OAuth from server-side storage
- Refreshes TikTok access tokens server-side when needed

## Why Reddit Access Is Needed

The app is a normal external web app. It does not run inside Reddit or Devvit.

For Reddit, the intended flow is:

1. A user connects their own Reddit account.
2. The app confirms which Reddit account is connected.
3. The user writes a campaign brief.
4. The app finds relevant Reddit discussions and prepares draft replies.
5. The user reviews and edits the draft.
6. Posting only happens after the user approves.

The app is not intended to mass-post, vote, scrape, spam, or work around subreddit rules.

## Not Done Yet

- Real Reddit posting
- Additional live research sources beyond Hacker News
- Instagram OAuth
- Reddit refresh token rotation

## Local Setup

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```txt
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_REDIRECT_URI=http://localhost:3000/api/auth/reddit/callback
REDDIT_USER_AGENT=OrganicReach/0.1 by your_reddit_username

TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=https://your-domain.example/api/auth/callback/tiktok
TIKTOK_VERIFICATION_FILENAME=
TIKTOK_VERIFICATION_CONTENT=

DATABASE_URL=
NEON_AUTH_BASE_URL=
NEON_AUTH_COOKIE_SECRET=
OAUTH_TOKEN_ENCRYPTION_KEY=
```

For deployed environments, set `NEON_AUTH_BASE_URL` to the Neon Auth base URL for the
project, not the app URL or `localhost`. Also add every app origin that should sign
in, such as `https://your-app.vercel.app` and any custom production domain, to Neon
Auth's trusted domains. If this is missing, deployed sign-in can fail with
`Invalid origin` even when localhost works.

Run the app:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Reddit Redirect URI

For local development, the Reddit app redirect URI should be:

```txt
http://localhost:3000/api/auth/reddit/callback
```

## TikTok Redirect URI

TikTok requires web redirect URIs to use `https`. For TikTok testing, use a deployed app URL or an HTTPS tunnel and register that exact callback in the TikTok developer portal:

```txt
https://your-domain.example/api/auth/callback/tiktok
```

## TikTok Site Verification

TikTok may ask you to verify your site by serving a downloaded `.txt` file from the root of the app. Set these env vars with the filename and exact file contents:

```txt
TIKTOK_VERIFICATION_FILENAME=tiktok-example.txt
TIKTOK_VERIFICATION_CONTENT=exact_file_contents_here
```

The file will be available at:

```txt
https://your-domain.example/tiktok-example.txt
```

## Notes

This repo is still a prototype. Reddit and TikTok OAuth tokens are stored encrypted in Neon Postgres. Keep `OAUTH_TOKEN_ENCRYPTION_KEY` private and stable; changing it makes existing stored tokens unreadable.

More product context is in [docs/overview.md](docs/overview.md). Current product state, implemented pieces, and near-term direction are in [docs/app-state.md](docs/app-state.md).
