import type { Account, Platform } from "@/lib/types";

type AccountPanelProps = {
  accounts: Account[];
  onConnect: (platform: Platform) => void;
};

export function AccountPanel({ accounts, onConnect }: AccountPanelProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="border border-stone-300 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold">Connect accounts</h2>
          <p className="text-sm text-stone-600">
            OAuth cards showing the permissions the MVP would request.
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          {accounts.map((account) => (
            <article
              key={account.name}
              className={`border border-l-4 border-stone-300 bg-stone-50 p-4 ${account.accent}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{account.name}</h3>
                    <span className="rounded-sm bg-white px-2 py-1 text-xs font-medium text-stone-700">
                      {account.status}
                    </span>
                  </div>
                  {account.handle && (
                    <p className="mt-1 text-sm text-stone-600">{account.handle}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {account.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="rounded-sm border border-stone-300 bg-white px-2 py-1 text-xs text-stone-700"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => onConnect(account.name)}
                  className="h-10 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800"
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
    "User connects account",
    "Platform shows OAuth permission screen",
    "Backend stores access token securely",
    "AI drafts campaign assets",
    "User reviews and approves",
    "Backend posts or schedules via API",
  ];

  return (
    <div className="border border-stone-300 bg-[#10251f] p-5 text-white">
      <h2 className="text-xl font-semibold">Posting flow</h2>
      <div className="mt-5 grid gap-3">
        {steps.map((step, index) => (
          <div key={step} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-sm font-bold text-stone-950">
              {index + 1}
            </span>
            <p className="pt-1 text-sm leading-6 text-emerald-50">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
