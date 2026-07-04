import type { Account, AccountPlatform } from "@/lib/types";

type RedditStatus = {
  connected: boolean;
  username?: string;
};

type TikTokStatus = {
  connected: boolean;
  displayName?: string;
};

export type ConnectedAccountUpdates = Partial<
  Record<AccountPlatform, Pick<Account, "handle" | "status">>
>;

export async function loadConnectionStatuses() {
  const [redditResponse, tiktokResponse] = await Promise.all([
    fetch("/api/connections/reddit/status"),
    fetch("/api/connections/tiktok/status"),
  ]);
  const redditStatus = (await redditResponse.json()) as RedditStatus;
  const tiktokStatus = (await tiktokResponse.json()) as TikTokStatus;
  const accounts: ConnectedAccountUpdates = {};
  const activity: string[] = [];

  if (redditStatus.connected && redditStatus.username) {
    accounts.Reddit = {
      handle: `u/${redditStatus.username}`,
      status: "Connected",
    };
    activity.push(`Reddit connected as u/${redditStatus.username}`);
  }

  if (tiktokStatus.connected && tiktokStatus.displayName) {
    accounts.TikTok = {
      handle: tiktokStatus.displayName,
      status: "Connected",
    };
    activity.push(`TikTok connected as ${tiktokStatus.displayName}`);
  }

  return { accounts, activity };
}

export function mergeConnectedAccounts(
  currentAccounts: Account[],
  connectedAccounts: ConnectedAccountUpdates,
) {
  return currentAccounts.map((account) => {
    const connectedAccount = connectedAccounts[account.name];

    if (!connectedAccount) {
      return account;
    }

    return {
      ...account,
      ...connectedAccount,
    };
  });
}
