"use client";

import { AccountPanel } from "./AccountPanel";
import { ApprovalsPanel } from "./ApprovalsPanel";
import { ChatPanel } from "./ChatPanel";
import { Metric } from "./Metric";
import { SchedulePanel } from "./SchedulePanel";
import { Sidebar } from "./Sidebar";
import { useMarketingCopilot } from "./useMarketingCopilot";

export function MarketingCopilotApp() {
  const {
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
  } = useMarketingCopilot();

  return (
    <main className="min-h-screen bg-[#f6f7f2] text-stone-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-stone-300 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Review-first social agent
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-stone-950 sm:text-5xl">
              OrganicReach
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
