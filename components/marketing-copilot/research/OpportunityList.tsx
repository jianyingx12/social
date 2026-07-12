import type { Opportunity } from "@/lib/types";
import { AiSpinner } from "../shared/AiLoadingState";

type OpportunityListProps = {
  isGeneratingResearch: boolean;
  opportunities: Opportunity[];
  onFindMore: () => void;
  onDraft: (id: number) => void;
};

export function OpportunityList({
  isGeneratingResearch,
  opportunities,
  onFindMore,
  onDraft,
}: OpportunityListProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-950">Organic openings</h3>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
          {opportunities.length}
        </span>
      </div>
      <div className="mt-4 grid max-h-[calc(100vh-12rem)] gap-3 overflow-y-auto pr-1">
        {isGeneratingResearch && opportunities.length === 0 ? (
          <OpportunityLoadingCards />
        ) : opportunities.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            No openings yet. Run live research to have the agent look for public demand signals,
            action paths, and low-risk organic marketing angles from the product brief.
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
                {opportunity.actionType && (
                  <span className="rounded-md bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-800">
                    {opportunity.actionType}
                  </span>
                )}
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
                    <span className="font-semibold text-slate-950">Organic posture:</span>{" "}
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
                Draft for review
              </button>
            </article>
          ))
        )}
        {opportunities.length > 0 && (
          <button
            type="button"
            onClick={onFindMore}
            disabled={isGeneratingResearch}
            className="flex min-h-10 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGeneratingResearch ? (
              <span className="inline-flex items-center gap-2">
                <AiSpinner />
                Finding more...
              </span>
            ) : (
              "Find more openings"
            )}
          </button>
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
