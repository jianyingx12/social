import type { Draft } from "@/lib/types";

type ApprovalsPanelProps = {
  drafts: Draft[];
  onApprove: (id: number) => void;
  onDraftChange: (id: number, updates: Pick<Draft, "title" | "body">) => void;
  onSchedule: (id: number) => void;
};

export function ApprovalsPanel({
  drafts,
  onApprove,
  onDraftChange,
  onSchedule,
}: ApprovalsPanelProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-2xl font-semibold text-slate-950">Review queue</h2>
        {drafts.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
            <p className="text-sm leading-6 text-slate-600">
              No drafts yet. Find an opportunity, then draft a reply for review.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {drafts.map((draft) => (
              <article key={draft.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                        {draft.platform}
                      </span>
                      <span className="rounded-md bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-800">
                        {draft.status}
                      </span>
                      <span className="text-xs text-slate-500">{draft.format}</span>
                    </div>
                    <label className="mt-3 grid gap-2 text-sm font-semibold text-slate-700">
                      Draft title
                      <input
                        value={draft.title}
                        onChange={(event) =>
                          onDraftChange(draft.id, {
                            title: event.target.value,
                            body: draft.body,
                          })
                        }
                        className="min-h-10 rounded-md border border-slate-300 bg-white px-3 text-base font-normal text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      />
                    </label>
                    <label className="mt-3 grid gap-2 text-sm font-semibold text-slate-700">
                      Draft body
                      <textarea
                        value={draft.body}
                        onChange={(event) =>
                          onDraftChange(draft.id, {
                            title: draft.title,
                            body: event.target.value,
                          })
                        }
                        rows={8}
                        className="resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-base font-normal leading-6 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      />
                    </label>
                    <p className="mt-3 text-sm font-medium text-slate-600">{draft.time}</p>
                  </div>
                  <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex sm:min-w-36">
                    <button
                      onClick={() => onApprove(draft.id)}
                      className="flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold leading-tight text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onSchedule(draft.id)}
                      className="flex min-h-10 items-center justify-center rounded-md bg-slate-950 px-3 py-2 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-teal-700"
                    >
                      Mark ready
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {drafts.length > 0 && <DraftSupportPanel />}
    </section>
  );
}

function DraftSupportPanel() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Next up</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Edit the copy here first. Images, videos, links, and other media can be added manually
        after the draft is ready.
      </p>
    </div>
  );
}
