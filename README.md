# Product Marketing Copilot

Early MVP for a social marketing copilot.

The idea is simple: connect your accounts, tell the app what you are building, let it draft posts and replies, then review everything before anything is posted.

This is not meant to be a fully automatic posting bot. The first version is intentionally approval-first.

## What It Does Right Now

- Shows a basic dashboard for account connections
- Has a command box for describing a product or campaign
- Creates draft post ideas from that command
- Keeps drafts in an approval queue
- Shows a simple schedule view
- Starts a real Reddit OAuth connection flow
- Reads the connected Reddit username after OAuth

## Why Reddit Access Is Needed

The app is a normal external web app. It does not run inside Reddit or Devvit.

For Reddit, the intended flow is:

1. A user connects their own Reddit account.
2. The app confirms which Reddit account is connected.
3. The user writes a campaign brief.
4. The app prepares draft Reddit post ideas.
5. The user reviews and edits the draft.
6. Posting only happens after the user approves.

The app is not intended to mass-post, vote, scrape, spam, or work around subreddit rules.

## Not Done Yet

- Real database
- Encrypted token storage
- Real Reddit posting
- Real AI API calls
- TikTok OAuth
- Instagram OAuth

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
REDDIT_USER_AGENT=ProductMarketingCopilot/0.1 by your_reddit_username
```

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

## Notes

This repo is still a prototype. The current Reddit connection stores only enough local state to show that the account connected. Production token storage needs to move into encrypted server-side storage.

More product context is in [docs/overview.md](docs/overview.md).
