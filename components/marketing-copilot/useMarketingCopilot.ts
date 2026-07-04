"use client";

import { useEffect, useState } from "react";
import {
  initialAccounts,
  initialDrafts,
  initialOpportunities,
} from "@/lib/marketing-data";
import type { AccountPlatform, Draft, Opportunity, Tab } from "@/lib/types";
import {
  getInitialTikTokResult,
  getTikTokConnectionNotice,
  type ConnectionNotice,
} from "./connection-notices";
import { loadConnectionStatuses, mergeConnectedAccounts } from "./connection-status";
import { createDraftFromTikTokIdea, generateTikTokIdeas } from "./tiktok-content";
import type { TikTokIdea } from "@/lib/types";

const initialActivity = [
  "Workspace ready",
  "Add a product brief to start discovery",
  "OrganicReach keeps every reply in review before posting",
];

export function useMarketingCopilot() {
  const [initialTikTokResult] = useState(getInitialTikTokResult);
  const initialConnectionNotice = initialTikTokResult
    ? getTikTokConnectionNotice(initialTikTokResult)
    : null;
  const [activeTab, setActiveTab] = useState<Tab>(
    initialConnectionNotice ? "connect" : "opportunities",
  );
  const [accounts, setAccounts] = useState(initialAccounts);
  const [drafts, setDrafts] = useState(initialDrafts);
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [tiktokIdeas, setTikTokIdeas] = useState<TikTokIdea[]>([]);
  const [command, setCommand] = useState("");
  const [activity, setActivity] = useState(initialActivity);
  const [connectionNotice, setConnectionNotice] =
    useState<ConnectionNotice | null>(initialConnectionNotice);

  const connectedCount = accounts.filter((account) => account.status === "Connected").length;
  const pendingCount = drafts.filter((draft) => draft.status === "Draft").length;
  const opportunityCount = opportunities.length;

  useEffect(() => {
    if (initialTikTokResult) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    loadConnectionStatuses()
      .then(({ accounts: nextAccounts, activity: nextActivity }) => {
        setAccounts((current) => mergeConnectedAccounts(current, nextAccounts));

        if (nextAccounts.TikTok?.status === "Connected") {
          setConnectionNotice(getTikTokConnectionNotice({ status: "connected", reason: null }));
        }

        if (nextActivity.length > 0) {
          setActivity((current) => [...nextActivity, ...current]);
        }
      })
      .catch(() => {
        setActivity((current) => ["Could not load connection status", ...current]);
      });
  }, [initialTikTokResult]);

  function connectAccount(platform: AccountPlatform) {
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

  function generateTikTokPlan() {
    const approvedDrafts = drafts.filter((draft) => draft.status !== "Draft");
    const nextIdeas = generateTikTokIdeas({
      approvedDrafts,
      brief: command,
    });

    setTikTokIdeas(nextIdeas);
    setActivity((current) => [
      `Generated ${nextIdeas.length} TikTok short-form idea${nextIdeas.length === 1 ? "" : "s"}`,
      ...current.slice(0, 4),
    ]);
  }

  function sendTikTokIdeaToReview(id: number) {
    const idea = tiktokIdeas.find((item) => item.id === id);

    if (!idea) {
      return;
    }

    setDrafts((current) => [createDraftFromTikTokIdea(idea), ...current]);
    setActivity((current) => [`Moved TikTok idea to the review queue`, ...current.slice(0, 4)]);
    setActiveTab("review");
  }

  function generatePlan() {
    if (!command.trim()) {
      setActivity((current) => ["Add a product brief before searching for opportunities", ...current]);
      return;
    }

    const nextOpportunities = createOpportunityPreview(command.trim());
    setOpportunities(nextOpportunities);
    setActivity((current) => [
      `Brief received: "${command.trim()}"`,
      `Found ${nextOpportunities.length} likely conversation opportunities`,
      ...current.slice(0, 4),
    ]);
    setActiveTab("opportunities");
  }

  function draftOpportunity(opportunityId: number) {
    const opportunity = opportunities.find((item) => item.id === opportunityId);

    if (!opportunity) {
      return;
    }

    const draft: Draft = {
      id: Date.now(),
      platform: opportunity.platform,
      format: "Reply",
      status: "Draft",
      title: `Reply to: ${opportunity.title}`,
      body: opportunity.suggestedReply,
      time: "Ready for review",
    };

    setDrafts((current) => [draft, ...current]);
    setActivity((current) => [
      `Drafted a ${opportunity.platform} reply for review`,
      ...current.slice(0, 4),
    ]);
    setActiveTab("review");
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
    connectionNotice,
    connectedCount,
    drafts,
    opportunities,
    opportunityCount,
    pendingCount,
    tiktokIdeas,
    approveDraft,
    connectAccount,
    draftOpportunity,
    generatePlan,
    generateTikTokPlan,
    scheduleDraft,
    sendTikTokIdeaToReview,
    setActiveTab,
    setCommand,
  };
}

function createOpportunityPreview(brief: string): Opportunity[] {
  const product = brief.split(/[.!?\n]/)[0]?.trim() || "this product";

  return [
    {
      id: 1,
      platform: "Reddit",
      source: "r/startups",
      title: "How do you find early users without sounding spammy?",
      intent: "Founder is asking for practical growth channels",
      score: 91,
      risk: "Low",
      angle: `Share how ${product} looks for active problem discussions before writing any promotional post.`,
      suggestedReply:
        `A useful approach is to start with conversations, not posts. For ${product}, I would search for people already describing the problem, write a genuinely helpful reply, and only mention the product if it directly helps. The key is to make the reply valuable even if nobody clicks.`,
    },
    {
      id: 2,
      platform: "Hacker News",
      source: "Ask HN",
      title: "What tools are people using to do founder-led marketing?",
      intent: "Comparison and tool discovery",
      score: 84,
      risk: "Medium",
      angle: `Position ${product} as a way to find demand signals instead of scheduling generic posts.`,
      suggestedReply:
        `Most tools help after you already know what to say. The part I find more painful is finding where the right conversation is happening. ${product} is exploring that angle: monitor relevant communities, rank good moments to respond, then keep the founder in control before anything is posted.`,
    },
    {
      id: 3,
      platform: "YouTube",
      source: "Creator comment",
      title: "Does anyone know software for turning a product demo into shorts?",
      intent: "User is asking for repurposing help",
      score: 76,
      risk: "Low",
      angle: `Offer a practical repurposing workflow and mention ${product} only as context.`,
      suggestedReply:
        `One workflow that works: start with a real demo, pull out the strongest before/after moment, write one hook for the specific audience, and turn that into a short clip. ${product} is being shaped around that broader growth-agent workflow, especially when a useful community answer can become more content later.`,
    },
  ];
}
