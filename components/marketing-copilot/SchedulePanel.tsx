import type { Draft } from "@/lib/types";

type SchedulePanelProps = {
  drafts: Draft[];
};

export function SchedulePanel({ drafts }: SchedulePanelProps) {
  const lanes = ["Today", "Tomorrow", "Friday"];

  return (
    <section className="border border-stone-300 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Schedule board</h2>
          <p className="mt-1 text-sm text-stone-600">
            Scheduled drafts stay visible before backend API calls publish them.
          </p>
        </div>
        <button className="h-10 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white">
          Export content calendar
        </button>
      </div>

      {drafts.length === 0 ? (
        <div className="mt-5 border border-dashed border-stone-300 bg-stone-50 p-6">
          <p className="text-sm leading-6 text-stone-600">
            No scheduled content yet. Generate drafts, approve them, then schedule the items you
            want to publish.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {lanes.map((lane) => (
            <div key={lane} className="min-h-64 border border-stone-300 bg-stone-50 p-3">
              <h3 className="font-semibold">{lane}</h3>
              <div className="mt-3 grid gap-3">
                {drafts
                  .filter((draft) => draft.time.includes(lane))
                  .map((draft) => (
                    <div key={draft.id} className="border border-stone-300 bg-white p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-700">
                          {draft.platform}
                        </span>
                        <span className="text-xs text-stone-500">{draft.status}</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold">{draft.title}</p>
                      <p className="mt-2 text-xs text-stone-500">{draft.time}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
