import type { Tab } from "@/lib/types";
import { tabs } from "@/lib/marketing-data";

type SidebarProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="flex flex-col gap-3 lg:sticky lg:top-4 lg:self-start">
      <div className="border border-stone-300 bg-white p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-stone-950 text-white"
                : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            {tab.label}
            <span aria-hidden="true">{activeTab === tab.id ? ">" : ""}</span>
          </button>
        ))}
      </div>

      <div className="border border-stone-300 bg-[#eef4e8] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-600">
          MVP rule
        </p>
        <p className="mt-2 text-sm leading-6 text-stone-800">
          AI can draft, rank, and recommend. Posting needs a human approval click.
        </p>
      </div>
    </aside>
  );
}
