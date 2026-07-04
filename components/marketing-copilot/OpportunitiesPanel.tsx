import type { Opportunity } from "@/lib/types";

type OpportunitiesPanelProps = {
  opportunities: Opportunity[];
  onDraft: (id: number) => void;
  onOpenBrief: () => void;
};

export function OpportunitiesPanel({
  opportunities,
  onDraft,
  onOpenBrief,
}: OpportunitiesPanelProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Opportunities</h2>
            <p className="mt-1 text-sm text-slate-600">
              Conversations worth joining, ranked by relevance and response quality.
            </p>
          </div>
          <button
            onClick={onOpenBrief}
            className="flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold leading-tight text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Edit brief
          </button>
        </div>

        {opportunities.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
            <p className="text-sm leading-6 text-slate-600">
              No opportunities yet. Add a product brief, then run discovery to create the first
              ranked list.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {opportunities.map((opportunity) => (
              <article
                key={opportunity.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-teal-300 hover:bg-white hover:shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                        {opportunity.platform}
                      </span>
                      <span className="rounded-md bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-800">
                        {opportunity.score}% fit
                      </span>
                      <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                        {opportunity.risk} risk
                      </span>
                      <span className="text-xs text-slate-500">{opportunity.source}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-950">
                      {opportunity.title}
                    </h3>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-teal-500"
                        style={{ width: `${opportunity.score}%` }}
                      />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      <span className="font-semibold text-slate-950">Intent:</span>{" "}
                      {opportunity.intent}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      <span className="font-semibold text-slate-950">Angle:</span>{" "}
                      {opportunity.angle}
                    </p>
                  </div>
                  <button
                    onClick={() => onDraft(opportunity.id)}
                    className="flex min-h-10 w-full shrink-0 items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-teal-700 sm:w-auto"
                  >
                    Draft reply
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <OpportunityRules />
    </section>
  );
}

function OpportunityRules() {
  return (
    <aside className="rounded-lg border border-slate-800 bg-slate-950 p-5 text-white shadow-sm">
      <h2 className="text-xl font-semibold">Good growth agent rules</h2>
      <div className="mt-5 grid gap-3 text-sm leading-6 text-slate-200">
        {[
          "Find existing demand before suggesting content.",
          "Rank by problem fit, intent, community norms, and reply risk.",
          "Draft replies that are useful without needing a click.",
          "Keep every public response behind founder approval.",
        ].map((rule) => (
          <div key={rule} className="rounded-md border border-slate-800 bg-slate-900 p-3">
            {rule}
          </div>
        ))}
      </div>
    </aside>
  );
}
