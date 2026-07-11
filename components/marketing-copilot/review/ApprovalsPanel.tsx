import type { Draft, DraftOutcome } from "@/lib/types";
import {
  draftOutcomeOptions,
  formatDateTime,
  getApproveButtonLabel,
  getStatusClassName,
} from "./draft-execution";

type ApprovalsPanelProps = {
  drafts: Draft[];
  onApprove: (id: number) => void;
  onDraftChange: (
    id: number,
    updates: Partial<Pick<Draft, "title" | "body" | "scheduledFor">>,
  ) => void;
  onDraftOutcomeChange: (
    id: number,
    updates: Partial<Pick<Draft, "postedUrl" | "outcomeNotes">> & {
      outcome?: DraftOutcome | "";
    },
  ) => void;
  onMarkPosted: (id: number) => void;
  onSchedule: (id: number, scheduledFor: string) => void;
};

export function ApprovalsPanel({
  drafts,
  onApprove,
  onDraftChange,
  onDraftOutcomeChange,
  onMarkPosted,
  onSchedule,
}: ApprovalsPanelProps) {
  const draftCount = drafts.filter((draft) => draft.status === "Draft").length;
  const approvedCount = drafts.filter((draft) => draft.status === "Approved").length;
  const scheduledCount = drafts.filter((draft) => draft.status === "Scheduled").length;
  const postedCount = drafts.filter((draft) => draft.status === "Posted").length;
  const resultCount = drafts.filter(
    (draft) => draft.outcome && draft.outcome !== "No response yet",
  ).length;

  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Review queue</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Edit, approve, schedule, and track what happened after posting. Scheduling stores
              the plan for manual posting; it does not publish to external platforms yet.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold text-slate-700 sm:grid-cols-5">
            <QueueStat label="Draft" value={draftCount} />
            <QueueStat label="Approved" value={approvedCount} />
            <QueueStat label="Scheduled" value={scheduledCount} />
            <QueueStat label="Posted" value={postedCount} />
            <QueueStat label="Results" value={resultCount} />
          </div>
        </div>

        {drafts.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
            <p className="text-sm leading-6 text-slate-600">
              No drafts yet. Find an opportunity, then draft a reply for review.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {drafts.map((draft) => (
              <article
                key={draft.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                        {draft.platform}
                      </span>
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${getStatusClassName(
                          draft.status,
                        )}`}
                      >
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
                            body: event.target.value,
                          })
                        }
                        rows={8}
                        className="resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-base font-normal leading-6 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      />
                    </label>

                    <p className="mt-3 text-sm font-medium text-slate-600">{draft.time}</p>
                    {draft.approvedAt && (
                      <p className="mt-1 text-xs text-slate-500">
                        Approved {formatDateTime(draft.approvedAt)}
                      </p>
                    )}
                    {draft.scheduledFor && (
                      <p className="mt-1 text-xs text-slate-500">
                        Planned for {formatDateTime(draft.scheduledFor)}
                      </p>
                    )}
                    {draft.postedAt && (
                      <p className="mt-1 text-xs text-slate-500">
                        Posted {formatDateTime(draft.postedAt)}
                      </p>
                    )}
                    {draft.status === "Posted" && (
                      <DraftOutcomeFields
                        draft={draft}
                        onDraftOutcomeChange={onDraftOutcomeChange}
                      />
                    )}
                  </div>

                  <div className="grid shrink-0 gap-3 sm:w-56">
                    <button
                      onClick={() => onApprove(draft.id)}
                      disabled={draft.status !== "Draft"}
                      className="flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold leading-tight text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {getApproveButtonLabel(draft.status)}
                    </button>

                    <label className="grid gap-2 text-xs font-semibold text-slate-700">
                      Schedule time
                      <input
                        type="datetime-local"
                        value={draft.scheduledFor ?? ""}
                        onChange={(event) =>
                          onDraftChange(draft.id, {
                            scheduledFor: event.target.value,
                          })
                        }
                        disabled={draft.status === "Draft" || draft.status === "Posted"}
                        className="min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </label>

                    <button
                      onClick={() => onSchedule(draft.id, draft.scheduledFor ?? "")}
                      disabled={
                        draft.status === "Draft" || draft.status === "Posted" || !draft.scheduledFor
                      }
                      className="flex min-h-10 items-center justify-center rounded-md bg-slate-950 px-3 py-2 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {draft.status === "Scheduled" ? "Update schedule" : "Schedule"}
                    </button>

                    <button
                      type="button"
                      onClick={() => copyDraftToClipboard(draft)}
                      className="flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold leading-tight text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Copy draft
                    </button>
                    <button
                      type="button"
                      onClick={() => onMarkPosted(draft.id)}
                      disabled={draft.status === "Draft" || draft.status === "Posted"}
                      className="flex min-h-10 items-center justify-center rounded-md border border-teal-700 bg-teal-50 px-3 py-2 text-center text-sm font-semibold leading-tight text-teal-800 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      Mark posted
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

function DraftOutcomeFields({
  draft,
  onDraftOutcomeChange,
}: {
  draft: Draft;
  onDraftOutcomeChange: ApprovalsPanelProps["onDraftOutcomeChange"];
}) {
  return (
    <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2">
      <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
        Posted link
        <input
          value={draft.postedUrl ?? ""}
          onChange={(event) =>
            onDraftOutcomeChange(draft.id, {
              postedUrl: event.target.value,
            })
          }
          placeholder="https://..."
          className="min-h-10 rounded-md border border-slate-300 bg-white px-3 text-base font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Result
        <select
          value={draft.outcome ?? ""}
          onChange={(event) =>
            onDraftOutcomeChange(draft.id, {
              outcome: event.target.value as DraftOutcome | "",
            })
          }
          className="min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        >
          <option value="">Choose result</option>
          {draftOutcomeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Notes
        <textarea
          value={draft.outcomeNotes ?? ""}
          onChange={(event) =>
            onDraftOutcomeChange(draft.id, {
              outcomeNotes: event.target.value,
            })
          }
          placeholder="Replies, leads, objections, or what to try next."
          className="min-h-24 resize-none rounded-md border border-slate-300 bg-white p-3 text-base font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        />
      </label>
    </div>
  );
}

function DraftSupportPanel() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Approval flow</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Flow: edit the draft, approve it, choose a schedule time, copy it into the right
        platform, then mark it posted and record what happened.
      </p>
      <div className="mt-4 grid gap-2 text-sm">
        {[
          "Draft: copy can still change.",
          "Approved: copy is ready, scheduling is unlocked.",
          "Scheduled: plan is saved for manual posting.",
          "Posted: the action happened and results can be tracked.",
        ].map((item) => (
          <div key={item} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function QueueStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-lg text-slate-950">{value}</p>
      <p className="text-slate-500">{label}</p>
    </div>
  );
}

function copyDraftToClipboard(draft: Draft) {
  if (!navigator.clipboard) {
    return;
  }

  navigator.clipboard.writeText(`${draft.title}\n\n${draft.body}`).catch(() => undefined);
}
