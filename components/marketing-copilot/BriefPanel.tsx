type BriefPanelProps = {
  activity: string[];
  command: string;
  onCommandChange: (value: string) => void;
  onGenerate: () => void;
};

export function BriefPanel({
  activity,
  command,
  onCommandChange,
  onGenerate,
}: BriefPanelProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Product brief</h2>
            <p className="mt-1 text-sm text-slate-600">
              Describe the product, audience, problem, competitors, and communities to watch.
            </p>
          </div>
          <span className="rounded-md bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-800">
            Discovery first
          </span>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <label htmlFor="brief" className="text-sm font-semibold text-slate-700">
            Brief
          </label>
          <textarea
            id="brief"
            value={command}
            onChange={(event) => onCommandChange(event.target.value)}
            placeholder="ChalkReel helps basketball coaches draw plays, explain film, and share clips with players."
            className="mt-2 min-h-40 w-full resize-none rounded-md border border-slate-300 bg-white p-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={onGenerate}
              className="flex min-h-11 w-full items-center justify-center rounded-md bg-slate-950 px-5 py-2 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-teal-700 sm:w-auto"
            >
              Find opportunities
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="text-sm leading-6 text-slate-600">
            The next backend step is connecting search across Reddit and other conversation
            platforms. This screen defines what the agent should look for.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Agent activity</h2>
        <div className="mt-4 grid gap-3">
          {activity.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="rounded-md border border-slate-200 bg-slate-50 p-3"
            >
              <p className="text-sm leading-6 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
