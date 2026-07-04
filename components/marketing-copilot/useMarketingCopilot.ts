"use client";

import { useEffect, useState } from "react";
import {
  initialAccounts,
  initialDrafts,
} from "@/lib/marketing-data";
import type { Account, Draft, Platform, Tab } from "@/lib/types";

type RedditStatus = {
  connected: boolean;
  username?: string;
};

type TikTokStatus = {
  connected: boolean;
  displayName?: string;
};

const initialActivity = [
  "Workspace ready",
  "Connect accounts before publishing",
  "Type a campaign command to draft content",
];

export function useMarketingCopilot() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [accounts, setAccounts] = useState(initialAccounts);
  const [drafts, setDrafts] = useState(initialDrafts);
  const [command, setCommand] = useState("");
  const [activity, setActivity] = useState(initialActivity);

  const connectedCount = accounts.filter((account) => account.status === "Connected").length;
  const pendingCount = drafts.filter((draft) => draft.status === "Draft").length;

  useEffect(() => {
    loadConnectionStatuses()
      .then(({ accounts: nextAccounts, activity: nextActivity }) => {
        setAccounts((current) => mergeConnectedAccounts(current, nextAccounts));

        if (nextActivity.length > 0) {
          setActivity((current) => [...nextActivity, ...current]);
        }
      })
      .catch(() => {
        setActivity((current) => ["Could not load connection status", ...current]);
      });
  }, []);

  function connectAccount(platform: Platform) {
    if (platform === "Reddit") {
      window.location.href = "/api/auth/reddit/start";
      return;
    }

    if (platform === "TikTok") {
      window.location.href = "/api/auth/tiktok/start";
      return;
    }

    setAccounts((current) =>
      current.map((account) =>
        account.name === platform ? { ...account, status: "Review scopes" } : account,
      ),
    );
    setActivity((current) => [`${platform} connection is not implemented yet`, ...current]);
  }

  function approveDraft(id: number) {
    updateDraftStatus(id, "Approved");
  }

  function scheduleDraft(id: number) {
    updateDraftStatus(id, "Scheduled");
  }

  function generatePlan() {
    if (!command.trim()) {
      setActivity((current) => ["Add a campaign command before generating drafts", ...current]);
      return;
    }

    setActivity((current) => [
      `AI command received: "${command.trim()}"`,
      "Draft generation is ready for an AI provider integration",
      ...current.slice(0, 4),
    ]);
    setActiveTab("approvals");
  }

  function updateDraftStatus(id: number, status: Draft["status"]) {
    setDrafts((current) =>
      current.map((draft) => (draft.id === id ? { ...draft, status } : draft)),
    );
  }

  return {
    accounts,
    activeTab,
    activity,
    command,
    connectedCount,
    drafts,
    pendingCount,
    approveDraft,
    connectAccount,
    generatePlan,
    scheduleDraft,
    setActiveTab,
    setCommand,
  };
}

async function loadConnectionStatuses() {
  const [redditResponse, tiktokResponse] = await Promise.all([
    fetch("/api/connections/reddit/status"),
    fetch("/api/connections/tiktok/status"),
  ]);
  const redditStatus = (await redditResponse.json()) as RedditStatus;
  const tiktokStatus = (await tiktokResponse.json()) as TikTokStatus;
  const accounts: Partial<Record<Platform, Pick<Account, "handle" | "status">>> = {};
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

function mergeConnectedAccounts(
  currentAccounts: Account[],
  connectedAccounts: Partial<Record<Platform, Pick<Account, "handle" | "status">>>,
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
