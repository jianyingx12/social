"use client";

import { useEffect, useState } from "react";
import { AccountPanel } from "./AccountPanel";
import { ApprovalsPanel } from "./ApprovalsPanel";
import { ChatPanel } from "./ChatPanel";
import { Metric } from "./Metric";
import { SchedulePanel } from "./SchedulePanel";
import { Sidebar } from "./Sidebar";
import {
  createDraftsFromCommand,
  initialAccounts,
  initialDrafts,
  selectedPlan,
} from "@/lib/marketing-data";
import type { Platform, Tab } from "@/lib/types";

export function MarketingCopilotApp() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [accounts, setAccounts] = useState(initialAccounts);
  const [drafts, setDrafts] = useState(initialDrafts);
  const [command, setCommand] = useState("");
  const [activity, setActivity] = useState([
    "Workspace ready",
    "Connect accounts before publishing",
    "Type a campaign command to draft content",
  ]);

  const connectedCount = accounts.filter((account) => account.status === "Connected").length;
  const pendingCount = drafts.filter((draft) => draft.status === "Draft").length;

  useEffect(() => {
    async function loadRedditStatus() {
      const response = await fetch("/api/connections/reddit/status");
      const status = (await response.json()) as {
        connected: boolean;
        username?: string;
      };

      if (!status.connected || !status.username) {
        return;
      }

      setAccounts((current) =>
        current.map((account) =>
          account.name === "Reddit"
            ? {
                ...account,
                handle: `u/${status.username}`,
                status: "Connected",
              }
            : account,
        ),
      );
      setActivity((current) => [`Reddit connected as u/${status.username}`, ...current]);
    }

    loadRedditStatus().catch(() => {
      setActivity((current) => ["Could not load Reddit connection status", ...current]);
    });
  }, []);

  function connectAccount(platform: Platform) {
    if (platform === "Reddit") {
      window.location.href = "/api/auth/reddit/start";
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
    setDrafts((current) =>
      current.map((draft) => (draft.id === id ? { ...draft, status: "Approved" } : draft)),
    );
  }

  function scheduleDraft(id: number) {
    setDrafts((current) =>
      current.map((draft) => (draft.id === id ? { ...draft, status: "Scheduled" } : draft)),
    );
  }

  function generatePlan() {
    const nextDrafts = createDraftsFromCommand(command);
    if (nextDrafts.length === 0) {
      setActivity((current) => ["Add a campaign command before generating drafts", ...current]);
      return;
    }

    setDrafts(nextDrafts);
    setActivity((current) => [
      `AI command received: "${command.trim()}"`,
      "New draft pack created for founder review",
      ...current.slice(0, 4),
    ]);
    setActiveTab("approvals");
  }

  return (
    <main className="min-h-screen bg-[#f6f7f2] text-stone-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-stone-300 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Review-first social agent
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-stone-950 sm:text-5xl">
              Product Marketing Copilot
            </h1>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <Metric label="Connected" value={`${connectedCount}/3`} />
            <Metric label="Pending" value={String(pendingCount)} />
            <Metric label="Mode" value="Approve" />
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[230px_1fr]">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="min-w-0">
            {activeTab === "connect" && (
              <AccountPanel accounts={accounts} onConnect={connectAccount} />
            )}
            {activeTab === "chat" && (
              <ChatPanel
                activity={activity}
                command={command}
                onCommandChange={setCommand}
                onGenerate={generatePlan}
                selectedPlan={selectedPlan}
              />
            )}
            {activeTab === "approvals" && (
              <ApprovalsPanel drafts={drafts} onApprove={approveDraft} onSchedule={scheduleDraft} />
            )}
            {activeTab === "schedule" && <SchedulePanel drafts={drafts} />}
          </div>
        </section>
      </div>
    </main>
  );
}
