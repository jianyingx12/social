import type { ProductWorkspace } from "@/lib/types";

type AppHeaderProps = {
  activeProduct: ProductWorkspace | null;
};

export function AppHeader({ activeProduct }: AppHeaderProps) {
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
        {activeProduct && (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <span className="text-slate-500">Active product</span>
            <p className="font-semibold text-slate-950">{activeProduct.name}</p>
          </div>
        )}
      </div>
    </header>
  );
}
