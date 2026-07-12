import type { ProductWorkspace } from "@/lib/types";
import { AiLoadingState, AiSpinner } from "../shared/AiLoadingState";

type ResearchAgentPanelProps = {
  isGeneratingResearch: boolean;
  product: ProductWorkspace;
  researchError: string | null;
  onOpenBrief: () => void;
  onRunResearch: () => void;
};

export function ResearchAgentPanel({
  isGeneratingResearch,
  product,
  researchError,
  onOpenBrief,
  onRunResearch,
}: ResearchAgentPanelProps) {
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
            OrganicReach searches public sources from your product brief, then turns demand
            signals into organic actions you can review.
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
          <h3 className="text-sm font-semibold text-slate-950">Enabled live sources</h3>
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
            Source hints can steer the search language today. More source-specific fetchers can
            plug into this pipeline later.
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
      description="Searching Hacker News, Stack Overflow, and GitHub issues, then turning the strongest signals into organic marketing actions."
    />
  );
}
