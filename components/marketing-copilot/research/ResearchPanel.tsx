"use client";

import { useState } from "react";
import type { Opportunity, ProductWorkspace, ResearchChannel, ResearchTarget } from "@/lib/types";

const researchChannels: ResearchChannel[] = [
  "Search",
  "Reddit",
  "Hacker News",
  "Indie Hackers",
  "YouTube",
  "TikTok",
  "Instagram",
  "LinkedIn",
  "X / Twitter",
  "Niche forum",
  "Review site",
  "Customer data",
  "Other",
];

type ResearchPanelProps = {
  opportunities: Opportunity[];
  product: ProductWorkspace;
  researchTargets: ResearchTarget[];
  onAddTarget: (target: Omit<ResearchTarget, "id">) => void;
  onDraft: (id: number) => void;
  onGenerateTargets: () => void;
  onOpenBrief: () => void;
  onRemoveTarget: (id: number) => void;
};

export function ResearchPanel({
  opportunities,
  product,
  researchTargets,
  onAddTarget,
  onDraft,
  onGenerateTargets,
  onOpenBrief,
  onRemoveTarget,
}: ResearchPanelProps) {
  const [channel, setChannel] = useState<ResearchChannel>("Search");
  const [query, setQuery] = useState("");
  const [signal, setSignal] = useState("");
  const [notes, setNotes] = useState("");

  function submitTarget() {
    if (!query.trim() || !signal.trim()) {
      return;
    }

    onAddTarget({
      channel,
      query: query.trim(),
      signal: signal.trim(),
      notes: notes.trim(),
    });
    setQuery("");
    setSignal("");
    setNotes("");
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="grid gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Research</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Build a channel-agnostic research plan before drafting organic replies.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onGenerateTargets}
                className="flex min-h-10 items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-teal-700"
              >
                Seed research
              </button>
              <button
                type="button"
                onClick={onOpenBrief}
                className="flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold leading-tight text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Edit brief
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[180px_1fr]">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Source
              <select
                value={channel}
                onChange={(event) => setChannel(event.target.value as ResearchChannel)}
                className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              >
                {researchChannels.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Query, community, or dataset
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="e.g. product analytics frustration, r/SaaS, competitor reviews"
                className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-base font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
              Demand signal to look for
              <input
                value={signal}
                onChange={(event) => setSignal(event.target.value)}
                placeholder="Complaints, comparison threads, workaround questions, buyer objections..."
                className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-base font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
              Notes
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="What would make a conversation safe, helpful, or high-risk to join?"
                className="min-h-24 resize-none rounded-md border border-slate-300 bg-white p-3 text-base font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <button
              type="button"
              onClick={submitTarget}
              disabled={!query.trim() || !signal.trim()}
              className="flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 md:col-span-2"
            >
              Add research target
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-950">Research targets</h3>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
              {researchTargets.length}
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            {researchTargets.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Add targets manually or seed a starting plan from the product profile. Live source
                fetching can plug into this list later.
              </p>
            ) : (
              researchTargets.map((target) => (
                <article
                  key={target.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                        {target.channel}
                      </span>
                      <h4 className="mt-3 text-base font-semibold text-slate-950">
                        {target.query}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveTarget(target.id)}
                      className="shrink-0 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    <span className="font-semibold text-slate-950">Signal:</span> {target.signal}
                  </p>
                  {target.notes && (
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      <span className="font-semibold text-slate-950">Notes:</span> {target.notes}
                    </p>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      </div>

      <aside className="grid gap-4 lg:self-start">
        <ResearchRules product={product} />
        <OpportunityList opportunities={opportunities} onDraft={onDraft} />
      </aside>
    </section>
  );
}

function ResearchRules({ product }: { product: ProductWorkspace }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-5 text-white shadow-sm">
      <h3 className="text-xl font-semibold">Research goal</h3>
      <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-200">
        <p>
          Find places where people already describe the pain behind{" "}
          <span className="font-semibold text-white">{product.name}</span>.
        </p>
        {[
          "Look for complaints, comparison posts, help requests, and workaround discussions.",
          "Capture exact customer language before drafting.",
          "Mention the product only when the conversation makes it genuinely relevant.",
          "Treat customer data and selected source material as valid research inputs when relevant.",
        ].map((rule) => (
          <div key={rule} className="rounded-md border border-slate-800 bg-slate-900 p-3">
            {rule}
          </div>
        ))}
      </div>
    </div>
  );
}

function OpportunityList({
  opportunities,
  onDraft,
}: {
  opportunities: Opportunity[];
  onDraft: (id: number) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-950">Found opportunities</h3>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
          {opportunities.length}
        </span>
      </div>
      <div className="mt-4 grid gap-3">
        {opportunities.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            No live opportunities yet. Research targets define where the agent should look once
            fetching is connected.
          </p>
        ) : (
          opportunities.map((opportunity) => (
            <article key={opportunity.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                  {opportunity.platform}
                </span>
                <span className="rounded-md bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-800">
                  {opportunity.score}% fit
                </span>
              </div>
              <h4 className="mt-3 text-sm font-semibold text-slate-950">{opportunity.title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-700">{opportunity.intent}</p>
              <button
                type="button"
                onClick={() => onDraft(opportunity.id)}
                className="mt-3 flex min-h-9 w-full items-center justify-center rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                Draft reply
              </button>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
