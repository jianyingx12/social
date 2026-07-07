import type { ProductWorkspace } from "@/lib/types";
import type { AppUser } from "@/lib/auth/session-user";
import type { WorkspaceSaveStatus } from "@/components/marketing-copilot/hooks/useMarketingCopilot";

type AppHeaderProps = {
  activeProduct: ProductWorkspace | null;
  currentUser: AppUser | null;
  workspaceSaveStatus: WorkspaceSaveStatus;
};

const saveStatusLabels: Record<WorkspaceSaveStatus, string> = {
  disabled: "Sign in to save",
  idle: "Ready",
  saving: "Saving...",
  saved: "Saved",
  error: "Save failed",
};

const saveStatusStyles: Record<WorkspaceSaveStatus, string> = {
  disabled: "border-slate-200 bg-slate-50 text-slate-500",
  idle: "border-slate-200 bg-slate-50 text-slate-500",
  saving: "border-amber-200 bg-amber-50 text-amber-700",
  saved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-rose-200 bg-rose-50 text-rose-700",
};

export function AppHeader({
  activeProduct,
  currentUser,
  workspaceSaveStatus,
}: AppHeaderProps) {
  return (
    <header className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm lg:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            AI growth agent
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
            OrganicReach
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Find real demand, shape useful replies, and keep every public action in review.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <div
            className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${saveStatusStyles[workspaceSaveStatus]}`}
          >
            {saveStatusLabels[workspaceSaveStatus]}
          </div>
          {currentUser && (
            <div className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm sm:items-end">
              <span className="text-slate-500">Signed in as</span>
              <p className="font-semibold text-slate-950">
                {currentUser.name || currentUser.email || "Account"}
              </p>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="text-sm font-semibold text-teal-700 transition hover:text-teal-800"
                >
                  Log out
                </button>
              </form>
            </div>
          )}
          {activeProduct && (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm sm:text-right">
              <span className="text-slate-500">Active product</span>
              <p className="font-semibold text-slate-950">{activeProduct.name}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
