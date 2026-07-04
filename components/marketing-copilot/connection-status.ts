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

export async function disconnectAccount(platform: AccountPlatform) {
  const routeByPlatform: Partial<Record<AccountPlatform, string>> = {
    Reddit: "/api/connections/reddit/disconnect",
    TikTok: "/api/connections/tiktok/disconnect",
  };
  const route = routeByPlatform[platform];

  if (!route) {
    throw new Error(`${platform} disconnect is not implemented`);
  }

  const response = await fetch(route, { method: "POST" });

  if (!response.ok) {
    throw new Error(`Could not disconnect ${platform}`);
  }
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

export function markAccountDisconnected(currentAccounts: Account[], platform: AccountPlatform) {
  return currentAccounts.map((account) => {
    if (account.name !== platform) {
      return account;
    }

    return {
      ...account,
      handle: undefined,
      status: "Not connected" as const,
    };
  });
}
