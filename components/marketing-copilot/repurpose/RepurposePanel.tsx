import type { Account, ContentIdea, Draft } from "@/lib/types";

type RepurposePanelProps = {
  accounts: Account[];
  drafts: Draft[];
  error: string | null;
  ideas: ContentIdea[];
  isGenerating: boolean;
  onGenerateIdeas: () => void;
  onSendIdeaToReview: (id: number) => void;
};

export function RepurposePanel({
  accounts,
  drafts,
  error,
  ideas,
  isGenerating,
  onGenerateIdeas,
  onSendIdeaToReview,
}: RepurposePanelProps) {
  const draftCount = drafts.length;
  const connectedAccounts = accounts.filter((account) => account.status === "Connected");

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Content studio</h2>
            <p className="mt-1 text-sm text-slate-600">
              Generate draft post options and suggested attachments. You choose the actual image,
              video, link, or media before publishing.
            </p>
          </div>
          <span className="w-fit rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
            Text-first
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            ["Draft copy", "OpenAI writes ready-to-edit post options from the product brief."],
            ["Attachment direction", "Each idea says what kind of media would fit."],
            ["User choice", "You pick the actual image, video, link, or attachment."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
          <p className="text-sm leading-6 text-slate-600">
            Generate social content ideas from the current product brief. The AI can suggest what
            kind of attachment belongs with each draft, but it should not evaluate or pick your
            actual resources.
          </p>
          {error && (
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {error}
            </p>
          )}
          <button
            onClick={onGenerateIdeas}
            disabled={isGenerating}
            className="mt-4 flex min-h-10 w-full items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
          >
            {isGenerating ? "Generating..." : "Generate content ideas"}
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
                        {idea.platform}
                      </span>
                      <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                        {idea.format}
                      </span>
                      <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                        Content idea
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-950">{idea.title}</h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {idea.body}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      <span className="font-semibold text-slate-950">Attach:</span>{" "}
                      {idea.attachmentSuggestion}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">Angle: {idea.angle}</p>
                  </div>
                  <button
                    onClick={() => onSendIdeaToReview(idea.id)}
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
          <h2 className="text-lg font-semibold text-slate-950">Content capability</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <CapabilityRow label="Ideas" value="Available now" />
            <CapabilityRow label="Drafts" value={String(draftCount)} />
            <CapabilityRow label="Connected accounts" value={String(connectedAccounts.length)} />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Repurpose role</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The AI can draft the post and suggest the kind of media to attach. The user stays in
            control of the actual images, videos, links, and final edit.
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
