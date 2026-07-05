import type { ProductWorkspace } from "@/lib/types";
import type { InterviewStep, InterviewStepConfig } from "./config";
import { isStepComplete } from "./progress";

type BriefStepNavProps = {
  activeStep: InterviewStep;
  product: ProductWorkspace;
  steps: InterviewStepConfig[];
  onStepChange: (step: InterviewStep) => void;
};

export function BriefStepNav({
  activeStep,
  product,
  steps,
  onStepChange,
}: BriefStepNavProps) {
  return (
    <nav className="grid gap-2 lg:self-start">
      {steps.map((item, index) => {
        const isActive = item.id === activeStep;
        const isComplete = isStepComplete(product, item.fields);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onStepChange(item.id)}
            className={`flex min-h-12 items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${
              isActive
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-300 hover:bg-white"
            }`}
          >
            <span>
              <span className={isActive ? "text-slate-300" : "text-slate-400"}>
                {index + 1}.{" "}
              </span>
              {item.label}
            </span>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isComplete ? "bg-teal-400" : isActive ? "bg-white" : "bg-slate-300"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
