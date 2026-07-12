import type { ResearchChannel, ResearchTarget } from "@/lib/types";
import { researchChannels } from "./research-channels";

type SourceHintsPanelProps = {
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
};

export function SourceHintsPanel({
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
}: SourceHintsPanelProps) {
  return (
    <details className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <summary className="cursor-pointer text-sm font-semibold text-slate-950">
        Source hints {researchTargets.length > 0 ? `(${researchTargets.length})` : ""}
      </summary>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Optional. Use this to steer research toward a source, query, community, objection, or
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
