"use client";

import { useState } from "react";
import type { Opportunity, ProductWorkspace, ResearchChannel, ResearchTarget } from "@/lib/types";
import type { RejectionReason } from "../hooks/research-workflow";
import { OpportunityList } from "./OpportunityList";
import { ResearchAgentPanel } from "./ResearchAgentPanel";
import { SourceHintsPanel } from "./SourceHintsPanel";

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
  onReject: (id: number, reason: RejectionReason) => void;
  onReconsider: (id: number) => void;
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
  onReject,
  onReconsider,
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
    <section className="grid min-h-0 items-stretch gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="grid gap-4">
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
        onFindMore={onRunResearch}
        onDraft={onDraft}
        onReject={onReject}
        onReconsider={onReconsider}
      />
    </section>
  );
}
