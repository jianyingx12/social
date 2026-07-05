import type { Account, Draft, TikTokIdea } from "@/lib/types";

type RepurposePanelProps = {
  accounts: Account[];
  drafts: Draft[];
  ideas: TikTokIdea[];
  onGenerateTikTokPlan: () => void;
  onSendTikTokIdeaToReview: (id: number) => void;
};

export function RepurposePanel({
  accounts,
  drafts,
  ideas,
  onGenerateTikTokPlan,
  onSendTikTokIdeaToReview,
}: RepurposePanelProps) {
  const approvedCount = drafts.filter((draft) => draft.status !== "Draft").length;
  const tiktokAccount = accounts.find((account) => account.name === "TikTok");
  const isTikTokConnected = tiktokAccount?.status === "Connected";

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">TikTok studio</h2>
            <p className="mt-1 text-sm text-slate-600">
              Turn approved replies, demos, and customer answers into short-form ideas.
            </p>
          </div>
          <span
            className={`w-fit rounded-md px-2 py-1 text-xs font-semibold ${
              isTikTokConnected
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {isTikTokConnected ? `Connected as ${tiktokAccount?.handle}` : "Connect TikTok first"}
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {["TikTok / Reels", "LinkedIn", "YouTube Shorts"].map((channel) => (
            <div key={channel} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-950">{channel}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Repurposing opens after an approved reply or demo is available.
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
          <p className="text-sm leading-6 text-slate-600">
            {approvedCount === 0
              ? "No approved source material yet. The agent can still sketch from the product brief."
              : `${approvedCount} approved item${approvedCount === 1 ? "" : "s"} ready to turn into follow-up content.`}
          </p>
          <button
            onClick={onGenerateTikTokPlan}
            className="mt-4 flex min-h-10 w-full items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-teal-700 sm:w-auto"
          >
            Generate TikTok ideas
          </button>
        </div>

        {ideas.length > 0 && (
          <div className="mt-5 grid gap-3">
            {ideas.map((idea) => (
              <article key={idea.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                        TikTok
                      </span>
                      <span className="rounded-md bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-800">
                        Short-form idea
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-950">{idea.hook}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-700 whitespace-pre-line">
                      {idea.script}
                    </p>
                    <p className="mt-3 text-sm font-medium text-slate-700">{idea.caption}</p>
                    <p className="mt-2 text-sm text-slate-600">{idea.callToAction}</p>
                  </div>
                  <button
                    onClick={() => onSendTikTokIdeaToReview(idea.id)}
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
          <h2 className="text-lg font-semibold text-slate-950">TikTok capability</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <CapabilityRow label="Profile" value={isTikTokConnected ? "Connected" : "Needed"} />
            <CapabilityRow label="Ideas" value="Available now" />
            <CapabilityRow label="Posting" value="Needs API approval" />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Broadcast role</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            TikTok becomes useful after the agent learns which conversations, examples, and angles
            are working.
          </p>
        </div>
      </div>
    </section>
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
