import type { Draft } from "@/lib/types";

type RepurposePanelProps = {
  drafts: Draft[];
};

export function RepurposePanel({ drafts }: RepurposePanelProps) {
  const approvedCount = drafts.filter((draft) => draft.status !== "Draft").length;

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-2xl font-semibold text-slate-950">Repurpose wins</h2>
        <p className="mt-1 text-sm text-slate-600">
          Turn approved replies, demos, and customer answers into broadcast-channel content.
        </p>

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
              ? "No approved source material yet. Draft and approve a reply first."
              : `${approvedCount} approved item${approvedCount === 1 ? "" : "s"} ready to turn into follow-up content.`}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Broadcast role</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          TikTok and Instagram are not the main discovery engine. They become useful after the
          agent learns which conversations, examples, and angles are working.
        </p>
      </div>
    </section>
  );
}
