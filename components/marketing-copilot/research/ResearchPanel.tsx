"use client";

import { useState } from "react";
import type { Opportunity, ProductWorkspace, ResearchChannel, ResearchTarget } from "@/lib/types";
import { AiLoadingState, AiSpinner } from "../shared/AiLoadingState";

const researchChannels: ResearchChannel[] = [
  "Search",
  "Reddit",
  "Hacker News",
  "Stack Overflow",
  "GitHub",
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
  isGeneratingResearch: boolean;
  opportunities: Opportunity[];
  product: ProductWorkspace;
  researchError: string | null;
  researchTargets: ResearchTarget[];
  onAddTarget: (target: Omit<ResearchTarget, "id">) => void;
  onDraft: (id: number) => void;
  onGenerateTargets: () => void;
  onOpenBrief: () => void;
  onRemoveTarget: (id: number) => void;
  onRunResearch: () => void;
};

export function ResearchPanel({
  opportunities,
  product,
  researchError,
  researchTargets,
  isGeneratingResearch,
  onAddTarget,
  onDraft,
  onGenerateTargets,
  onOpenBrief,
  onRemoveTarget,
  onRunResearch,
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
    <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="grid gap-4 lg:self-start">
        <ResearchAgentPanel
          isGeneratingResearch={isGeneratingResearch}
          product={product}
          researchError={researchError}
          onOpenBrief={onOpenBrief}
          onRunResearch={onRunResearch}
        />
        <SourceHintsPanel
          channel={channel}
          notes={notes}
          query={query}
          researchTargets={researchTargets}
          signal={signal}
          onAddTarget={submitTarget}
          onChannelChange={setChannel}
          onGenerateTargets={onGenerateTargets}
          onNotesChange={setNotes}
          onQueryChange={setQuery}
          onRemoveTarget={onRemoveTarget}
          onSignalChange={setSignal}
        />
      </div>

      <OpportunityList
        isGeneratingResearch={isGeneratingResearch}
        opportunities={opportunities}
        onDraft={onDraft}
      />
    </section>
  );
}

function ResearchAgentPanel({
  isGeneratingResearch,
  product,
  researchError,
  onOpenBrief,
  onRunResearch,
}: {
  isGeneratingResearch: boolean;
  product: ProductWorkspace;
  researchError: string | null;
  onOpenBrief: () => void;
  onRunResearch: () => void;
}) {
  const focusItems = [
    product.problem ? `Pain: ${product.problem}` : "",
    product.audience ? `Audience: ${product.audience}` : "",
    product.outcome ? `Outcome: ${product.outcome}` : "",
    product.keywords ? `Customer language: ${product.keywords}` : "",
  ].filter(Boolean);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
            Automatic research
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Find demand signals</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            OrganicReach searches public discussions and issue threads from your product brief,
            then turns the best matches into opportunities you can review.
          </p>
        </div>

        <button
          type="button"
          onClick={onRunResearch}
          disabled={isGeneratingResearch}
          className="flex min-h-11 w-full items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGeneratingResearch ? (
            <span className="inline-flex items-center gap-2">
              <AiSpinner />
              Researching live sources...
            </span>
          ) : (
            "Run research"
          )}
        </button>

        {isGeneratingResearch && <ResearchLoadingState />}

        {researchError && (
          <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm font-medium leading-6 text-rose-700">
            {researchError}
          </p>
        )}

        <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-950">Research focus</h3>
            <button
              type="button"
              onClick={onOpenBrief}
              className="text-sm font-semibold text-teal-700 transition hover:text-teal-800"
            >
              Edit brief
            </button>
          </div>
          {focusItems.length > 0 ? (
            <div className="grid gap-2">
              {focusItems.map((item) => (
                <p
                  key={item}
                  className="rounded-md border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700"
                >
                  {item}
                </p>
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-dashed border-slate-300 bg-white p-3 text-sm leading-6 text-slate-600">
              Add a one-line description, audience, problem, or keywords so the agent knows what
              to look for.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-950">Enabled sources</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Hacker News", "Stack Overflow", "GitHub"].map((source) => (
              <span
                key={source}
                className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white"
              >
                {source}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            More sources can plug into this same research pipeline later.
          </p>
        </div>
      </div>
    </div>
  );
}

function ResearchLoadingState() {
  return (
    <AiLoadingState
      title="AI is researching public discussions"
      description="Searching Hacker News, Stack Overflow, and GitHub issues, then turning the strongest demand signals into opportunity cards."
    />
  );
}

function SourceHintsPanel({
  channel,
  notes,
  query,
  researchTargets,
  signal,
  onAddTarget,
  onChannelChange,
  onGenerateTargets,
  onNotesChange,
  onQueryChange,
  onRemoveTarget,
  onSignalChange,
}: {
  channel: ResearchChannel;
  notes: string;
  query: string;
  researchTargets: ResearchTarget[];
  signal: string;
  onAddTarget: () => void;
  onChannelChange: (channel: ResearchChannel) => void;
  onGenerateTargets: () => void;
  onNotesChange: (notes: string) => void;
  onQueryChange: (query: string) => void;
  onRemoveTarget: (id: number) => void;
  onSignalChange: (signal: string) => void;
}) {
  return (
    <details className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <summary className="cursor-pointer text-sm font-semibold text-slate-950">
        Source hints {researchTargets.length > 0 ? `(${researchTargets.length})` : ""}
      </summary>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Optional. Use this when you want to steer future research toward a source, query, or
        demand signal.
      </p>

      <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[180px_1fr]">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Source
          <select
            value={channel}
            onChange={(event) => onChannelChange(event.target.value as ResearchChannel)}
            className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          >
            {researchChannels.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Query or community
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="product analytics frustration, competitor reviews"
            className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-base font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
          Demand signal
          <input
            value={signal}
            onChange={(event) => onSignalChange(event.target.value)}
            placeholder="Complaints, comparison threads, workaround questions..."
            className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-base font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
          Notes
          <textarea
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            placeholder="What would make a conversation safe, helpful, or high-risk to join?"
            className="min-h-24 resize-none rounded-md border border-slate-300 bg-white p-3 text-base font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
        </label>
        <div className="grid gap-2 md:col-span-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onAddTarget}
            disabled={!query.trim() || !signal.trim()}
            className="flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add source hint
          </button>
          <button
            type="button"
            onClick={onGenerateTargets}
            className="flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Seed hints from brief
          </button>
        </div>
      </div>

      {researchTargets.length > 0 && (
        <div className="mt-4 grid gap-3">
          {researchTargets.map((target) => (
            <article key={target.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
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
          ))}
        </div>
      )}
    </details>
  );
}

function OpportunityList({
  isGeneratingResearch,
  opportunities,
  onDraft,
}: {
  isGeneratingResearch: boolean;
  opportunities: Opportunity[];
  onDraft: (id: number) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-950">Found opportunities</h3>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
          {opportunities.length}
        </span>
      </div>
      <div className="mt-4 grid gap-3">
        {isGeneratingResearch && opportunities.length === 0 ? (
          <OpportunityLoadingCards />
        ) : opportunities.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            No opportunities yet. Run live research to have the agent look for public
            demand signals, action paths, and low-risk reply angles from the product brief.
          </p>
        ) : (
          opportunities.map((opportunity) => (
            <article key={opportunity.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                  {opportunity.platform}
                </span>
                <span className="rounded-md bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-800">
                  {opportunity.score}% fit
                </span>
                <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                  {opportunity.risk} risk
                </span>
              </div>
              <h4 className="mt-3 text-sm font-semibold text-slate-950">{opportunity.title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-700">{opportunity.intent}</p>
              {opportunity.signal && (
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  <span className="font-semibold text-slate-950">Signal:</span>{" "}
                  {opportunity.signal}
                </p>
              )}
              <p className="mt-2 text-sm leading-6 text-slate-700">
                <span className="font-semibold text-slate-950">Angle:</span> {opportunity.angle}
              </p>
              <div className="mt-3 grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3">
                <h5 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Action plan
                </h5>
                {opportunity.recommendedAction && (
                  <p className="text-sm leading-6 text-slate-700">
                    <span className="font-semibold text-slate-950">Next step:</span>{" "}
                    {opportunity.recommendedAction}
                  </p>
                )}
                {opportunity.replyStrategy && (
                  <p className="text-sm leading-6 text-slate-700">
                    <span className="font-semibold text-slate-950">Reply posture:</span>{" "}
                    {opportunity.replyStrategy}
                  </p>
                )}
                {opportunity.whyItFits && (
                  <p className="text-sm leading-6 text-slate-700">
                    <span className="font-semibold text-slate-950">Why it fits:</span>{" "}
                    {opportunity.whyItFits}
                  </p>
                )}
                {opportunity.followUp && (
                  <p className="text-sm leading-6 text-slate-700">
                    <span className="font-semibold text-slate-950">Follow-up:</span>{" "}
                    {opportunity.followUp}
                  </p>
                )}
              </div>
              <a
                href={opportunity.source}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-sm font-semibold text-teal-700 transition hover:text-teal-800"
              >
                Open source
              </a>
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

function OpportunityLoadingCards() {
  return (
    <>
      {[0, 1, 2].map((item) => (
        <article
          key={item}
          className="rounded-lg border border-slate-200 bg-slate-50 p-4"
          aria-hidden="true"
        >
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-24 animate-pulse rounded-md bg-slate-200" />
            <div className="h-6 w-16 animate-pulse rounded-md bg-teal-100" />
            <div className="h-6 w-20 animate-pulse rounded-md bg-amber-100" />
          </div>
          <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-9 w-full animate-pulse rounded-md bg-slate-200" />
        </article>
      ))}
    </>
  );
}
