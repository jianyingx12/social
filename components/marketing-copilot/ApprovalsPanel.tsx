import { communities, replies } from "@/lib/marketing-data";
import type { Community, Draft } from "@/lib/types";

type ApprovalsPanelProps = {
  drafts: Draft[];
  onApprove: (id: number) => void;
  onSchedule: (id: number) => void;
};

export function ApprovalsPanel({ drafts, onApprove, onSchedule }: ApprovalsPanelProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="border border-stone-300 bg-white p-4 sm:p-5">
        <h2 className="text-2xl font-semibold">Approval queue</h2>
        {drafts.length === 0 ? (
          <div className="mt-5 border border-dashed border-stone-300 bg-stone-50 p-6">
            <p className="text-sm leading-6 text-stone-600">
              No drafts yet. Write a campaign command in the AI command tab to create an approval
              queue.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {drafts.map((draft) => (
              <article key={draft.id} className="border border-stone-300 bg-stone-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-sm bg-white px-2 py-1 text-xs font-semibold text-stone-700">
                        {draft.platform}
                      </span>
                      <span className="rounded-sm bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                        {draft.status}
                      </span>
                      <span className="text-xs text-stone-500">{draft.format}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold">{draft.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-700">{draft.body}</p>
                    <p className="mt-3 text-sm font-medium text-stone-600">{draft.time}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => onApprove(draft.id)}
                      className="h-10 rounded-md border border-stone-300 px-3 text-sm font-semibold transition hover:bg-white"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onSchedule(draft.id)}
                      className="h-10 rounded-md bg-stone-950 px-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {drafts.length > 0 && (
        <div className="grid gap-4">
          <CommunityList title="Communities to try" items={communities} />
          <ReplyPanel />
        </div>
      )}
    </section>
  );
}

function CommunityList({ title, items }: { title: string; items: Community[] }) {
  return (
    <div className="border border-stone-300 bg-white p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item.name} className="border border-stone-200 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{item.name}</p>
              <span className="text-xs font-semibold text-emerald-700">{item.fit}</span>
            </div>
            <p className="mt-1 text-sm leading-6 text-stone-600">{item.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReplyPanel() {
  return (
    <div className="border border-stone-300 bg-white p-4">
      <h2 className="text-lg font-semibold">Reply drafts</h2>
      <div className="mt-4 grid gap-3">
        {replies.map((reply) => (
          <div key={reply.text} className="border border-stone-200 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
              {reply.from}
            </p>
            <p className="mt-2 text-sm font-medium text-stone-800">&ldquo;{reply.text}&rdquo;</p>
            <p className="mt-2 text-sm leading-6 text-stone-600">{reply.reply}</p>
            <button className="mt-3 h-9 rounded-md border border-stone-300 px-3 text-sm font-semibold hover:bg-stone-50">
              Approve reply
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
