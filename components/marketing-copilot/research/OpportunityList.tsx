import { useState } from "react";
import type { Opportunity } from "@/lib/types";
import { rejectionReasons, type RejectionReason } from "../hooks/research-workflow";
import { AiSpinner } from "../shared/AiLoadingState";

type OpportunityListProps = {
  isGeneratingResearch: boolean;
  opportunities: Opportunity[];
  onFindMore: () => void;
  onDraft: (id: number) => void;
  onReject: (id: number, reason: RejectionReason) => void;
  onReconsider: (id: number) => void;
};

export function OpportunityList({
  isGeneratingResearch,
  opportunities,
  onFindMore,
  onDraft,
  onReject,
  onReconsider,
}: OpportunityListProps) {
  const [showRejected, setShowRejected] = useState(false);
  const visibleOpportunities = opportunities.filter(
    (opportunity) => showRejected || opportunity.status !== "Rejected",
  );
  const rejectedCount = opportunities.filter(
    (opportunity) => opportunity.status === "Rejected",
  ).length;

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-950">Organic openings</h3>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
            {visibleOpportunities.length}
          </span>
        </div>
        {rejectedCount > 0 && (
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={showRejected}
              onChange={(event) => setShowRejected(event.target.checked)}
              className="size-4 accent-teal-700"
            />
            Show rejected ({rejectedCount})
          </label>
        )}
      </div>
      <div className="mt-4 grid min-h-0 flex-1 content-start gap-3 overflow-y-auto pr-1">
        {isGeneratingResearch && opportunities.length === 0 ? (
          <OpportunityLoadingCards />
        ) : visibleOpportunities.length === 0 ? (
          <div className="flex min-h-full items-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
            <p className="text-sm leading-6 text-slate-600">
              {opportunities.length === 0
                ? "No openings yet. Run live research to have the agent look for public demand signals, action paths, and low-risk organic marketing angles from the product brief."
                : "All current openings are rejected. Show rejected openings to review or reconsider them."}
            </p>
          </div>
        ) : (
          visibleOpportunities.map((opportunity) => (
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
                {opportunity.status === "Drafted" && (
                  <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                    Drafted
                  </span>
                )}
                {opportunity.status === "Rejected" && (
                  <span className="rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-800">
                    Rejected
                    {opportunity.rejectionReason ? `: ${opportunity.rejectionReason}` : ""}
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
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_180px]">
                {opportunity.status === "Rejected" ? (
                  <button
                    type="button"
                    onClick={() => onReconsider(opportunity.id)}
                    className="flex min-h-9 items-center justify-center rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 sm:col-span-2"
                  >
                    Reconsider opening
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onDraft(opportunity.id)}
                      className="flex min-h-9 items-center justify-center rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                    >
                      Draft for review
                    </button>
                    <RejectReasonSelect
                      opportunityId={opportunity.id}
                      onReject={onReject}
                    />
                  </>
                )}
              </div>
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

function RejectReasonSelect({
  opportunityId,
  onReject,
}: {
  opportunityId: number;
  onReject: (id: number, reason: RejectionReason) => void;
}) {
  return (
    <select
      defaultValue=""
      onChange={(event) => {
        const reason = event.target.value as RejectionReason | "";

        if (!reason) {
          return;
        }

        onReject(opportunityId, reason);
        event.currentTarget.value = "";
      }}
      className="min-h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition hover:border-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
      aria-label="Reject opening"
    >
      <option value="">Reject...</option>
      {rejectionReasons.map((reason) => (
        <option key={reason} value={reason}>
          {reason}
        </option>
      ))}
    </select>
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
