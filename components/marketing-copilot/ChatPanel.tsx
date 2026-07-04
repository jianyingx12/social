type ChatPanelProps = {
  activity: string[];
  command: string;
  onCommandChange: (value: string) => void;
  onGenerate: () => void;
  selectedPlan: string[];
};

export function ChatPanel({
  activity,
  command,
  onCommandChange,
  onGenerate,
  selectedPlan,
}: ChatPanelProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="border border-stone-300 bg-white p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Tell the AI what to market</h2>
            <p className="mt-1 text-sm text-stone-600">
              One command creates drafts, schedule options, community targets, and reply ideas.
            </p>
          </div>
          <span className="rounded-sm bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
            Human approval on
          </span>
        </div>

        <div className="mt-6 rounded-md border border-stone-300 bg-stone-50 p-3">
          <label htmlFor="command" className="text-sm font-semibold text-stone-700">
            Command
          </label>
          <textarea
            id="command"
            value={command}
            onChange={(event) => onCommandChange(event.target.value)}
            className="mt-2 min-h-28 w-full resize-none rounded-md border border-stone-300 bg-white p-3 text-base outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={onGenerate}
              className="h-11 rounded-md bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Generate approval queue
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {selectedPlan.map((item) => (
            <div key={item} className="border border-stone-300 bg-white p-4">
              <p className="text-sm leading-6 text-stone-700">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-stone-300 bg-white p-4">
        <h2 className="text-lg font-semibold">Agent activity</h2>
        <div className="mt-4 grid gap-3">
          {activity.map((item, index) => (
            <div key={`${item}-${index}`} className="border-l-2 border-emerald-600 pl-3">
              <p className="text-sm leading-6 text-stone-700">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
