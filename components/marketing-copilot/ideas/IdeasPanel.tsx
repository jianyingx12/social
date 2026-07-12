import type { Account, ContentIdea, Draft, Opportunity } from "@/lib/types";
import { AiLoadingState, AiSpinner } from "../shared/AiLoadingState";

type ContentIdeaReadiness = {
  isReady: boolean;
  missingFields: string[];
};

type IdeasPanelProps = {
  accounts: Account[];
  drafts: Draft[];
  error: string | null;
  ideas: ContentIdea[];
  isGenerating: boolean;
  opportunities: Opportunity[];
  readiness: ContentIdeaReadiness;
  onGenerateIdeas: (source?: "brief" | "research") => void;
  onOpenBrief: () => void;
  onOpenChat: () => void;
  onSendIdeaToReview: (id: number) => void;
};

export function IdeasPanel({
  accounts,
  drafts,
  error,
  ideas,
  isGenerating,
  opportunities,
  readiness,
  onGenerateIdeas,
  onOpenBrief,
  onOpenChat,
  onSendIdeaToReview,
}: IdeasPanelProps) {
  const draftCount = drafts.length;
  const ideaCount = ideas.length;
  const connectedAccounts = accounts.filter((account) => account.status === "Connected");
  const hasResearch = opportunities.length > 0;

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Ideas</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {error && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {error}
            </p>
          )}
          {!readiness.isReady && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <p className="font-semibold">Complete the product brief before generating ideas.</p>
              <p className="mt-1">
                Missing:{" "}
                {readiness.missingFields.length > 0
                  ? readiness.missingFields.join(", ")
                  : "Product context"}
              </p>
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              onClick={() => onGenerateIdeas("brief")}
              disabled={isGenerating || !readiness.isReady}
              className="flex min-h-10 w-full items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isGenerating ? (
                <span className="inline-flex items-center gap-2">
                  <AiSpinner />
                  Generating...
                </span>
              ) : (
                "Generate from brief"
              )}
            </button>
            <button
              onClick={() => onGenerateIdeas("research")}
              disabled={isGenerating || !readiness.isReady || !hasResearch}
              className="flex min-h-10 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold leading-tight text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Generate from research
            </button>
          </div>
          {readiness.isReady && !hasResearch && (
            <p className="text-sm leading-6 text-slate-600">
              Run research first to generate ideas from demand signals.
            </p>
          )}
          {!readiness.isReady && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={onOpenChat}
                className="flex min-h-10 w-full items-center justify-center rounded-md border border-slate-950 bg-white px-4 py-2 text-center text-sm font-semibold leading-tight text-slate-950 transition hover:bg-slate-100 sm:w-auto"
              >
                Open chat
              </button>
              <button
                onClick={onOpenBrief}
                className="flex min-h-10 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold leading-tight text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 sm:w-auto"
              >
                Open product brief
              </button>
            </div>
          )}
        </div>

        {isGenerating && (
          <div className="mt-5">
            <AiLoadingState
              title="AI is drafting content ideas"
              description="Using the product context and available research signals to create post options, draft copy, and suggested attachment direction."
            />
          </div>
        )}

        {isGenerating && ideas.length === 0 && <IdeaLoadingCards />}

        {readiness.isReady && !isGenerating && ideas.length === 0 && (
          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm leading-6 text-slate-600">
              No ideas generated yet. Generate a set of content ideas, then send the best one to
              review for editing.
            </p>
          </div>
        )}

        {ideas.length > 0 && (
          <div className="mt-5 grid gap-3">
            {ideas.map((idea) => (
              <article key={idea.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                        {idea.platform}
                      </span>
                      <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                        {idea.format}
                      </span>
                      <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                        Content idea
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-950">{idea.title}</h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {idea.body}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      <span className="font-semibold text-slate-950">Attach:</span>{" "}
                      {idea.attachmentSuggestion}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">Angle: {idea.angle}</p>
                    {(idea.sourceOpportunityTitle || idea.sourceSignal) && (
                      <div className="mt-3 rounded-md border border-slate-200 bg-white p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Research source
                        </p>
                        {idea.sourceOpportunityTitle && (
                          <p className="mt-2 text-sm font-semibold text-slate-950">
                            {idea.sourceOpportunityTitle}
                          </p>
                        )}
                        {idea.sourceSignal && (
                          <p className="mt-1 text-sm leading-6 text-slate-700">
                            {idea.sourceSignal}
                          </p>
                        )}
                        {idea.sourceOpportunityUrl && (
                          <a
                            href={idea.sourceOpportunityUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex text-sm font-semibold text-teal-700 transition hover:text-teal-800"
                          >
                            Open source
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onSendIdeaToReview(idea.id)}
                    className="flex min-h-10 w-full shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold leading-tight text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 sm:w-36"
                  >
                    Send to review
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Content capability</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <CapabilityRow label="Ideas" value="Available now" />
            <CapabilityRow label="Generated" value={String(ideaCount)} />
            <CapabilityRow label="Research signals" value={String(opportunities.length)} />
            <CapabilityRow label="Drafts" value={String(draftCount)} />
            <CapabilityRow label="Connected accounts" value={String(connectedAccounts.length)} />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Ideas role</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The AI can draft the post and suggest the kind of media to attach. The user stays in
            control of the actual images, videos, links, and final edit.
          </p>
        </div>
      </div>
    </section>
  );
}

function IdeaLoadingCards() {
  return (
    <div className="mt-5 grid gap-3">
      {[0, 1, 2].map((item) => (
        <article
          key={item}
          className="rounded-lg border border-slate-200 bg-slate-50 p-4"
          aria-hidden="true"
        >
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-20 animate-pulse rounded-md bg-slate-200" />
            <div className="h-6 w-24 animate-pulse rounded-md bg-slate-200" />
            <div className="h-6 w-24 animate-pulse rounded-md bg-emerald-100" />
          </div>
          <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-3 w-1/2 animate-pulse rounded bg-slate-200" />
        </article>
      ))}
    </div>
  );
}

function CapabilityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}
