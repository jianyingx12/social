import type { Account, AccountPlatform } from "@/lib/types";

type AccountPanelProps = {
  accounts: Account[];
  onConnect: (platform: AccountPlatform) => void;
};

export function AccountPanel({ accounts, onConnect }: AccountPanelProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold text-slate-950">Connections</h2>
          <p className="text-sm text-slate-600">
            Accounts support identity, approved replies, comments, and future analytics.
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          {accounts.map((account) => (
            <article
              key={account.name}
              className={`rounded-lg border border-l-4 border-slate-200 bg-slate-50 p-4 ${account.accent}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-950">{account.name}</h3>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                      {account.status}
                    </span>
                  </div>
                  {account.handle && (
                    <p className="mt-1 text-sm text-slate-600">{account.handle}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {account.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => onConnect(account.name)}
                  className="flex min-h-10 w-full shrink-0 items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-teal-700 sm:w-40"
                >
                  {account.status === "Connected"
                    ? "Reconnect"
                    : account.name === "Instagram"
                      ? "Not wired yet"
                      : `Connect ${account.name}`}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <FlowPanel />
    </section>
  );
}

function FlowPanel() {
  const steps = [
    "Founder connects an account",
    "Platform shows OAuth permission screen",
    "Agent finds relevant conversations",
    "AI drafts a useful reply",
    "Founder reviews and approves",
    "Backend posts only after approval",
  ];

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-5 text-white shadow-sm">
      <h2 className="text-xl font-semibold">Approval flow</h2>
      <div className="mt-5 grid gap-3">
        {steps.map((step, index) => (
          <div key={step} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-300 text-sm font-bold text-slate-950">
              {index + 1}
            </span>
            <p className="pt-1 text-sm leading-6 text-slate-200">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
