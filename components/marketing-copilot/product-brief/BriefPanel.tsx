"use client";

import { useState } from "react";
import type { ProductBriefUpdates, ProductWorkspace } from "@/lib/types";
import { BriefStepFields } from "./BriefStepFields";
import { BriefStepNav } from "./BriefStepNav";
import { interviewSteps } from "./config";
import { getCompletionCount, isStepComplete } from "./progress";

type BriefPanelProps = {
  product: ProductWorkspace;
  onProductChange: (updates: ProductBriefUpdates) => void;
  onGenerate: () => void;
};

export function BriefPanel({
  product,
  onProductChange,
  onGenerate,
}: BriefPanelProps) {
  const [activeStep, setActiveStep] = useState(interviewSteps[0].id);
  const completionCount = getCompletionCount(product);
  const stepIndex = Math.max(
    interviewSteps.findIndex((step) => step.id === activeStep),
    0,
  );
  const step = interviewSteps[stepIndex];
  const completedStepCount = interviewSteps.filter((item) =>
    isStepComplete(product, item.fields),
  ).length;

  function goToNextStep() {
    const nextStep = interviewSteps[stepIndex + 1];

    if (nextStep) {
      setActiveStep(nextStep.id);
    }
  }

  function goToPreviousStep() {
    const previousStep = interviewSteps[stepIndex - 1];

    if (previousStep) {
      setActiveStep(previousStep.id);
    }
  }

  return (
    <section>
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Product brief</h2>
              <p className="mt-1 text-sm text-slate-600">
                OrganicReach will guide the profile one decision at a time.
              </p>
            </div>
            <span className="w-fit rounded-md bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-800">
              {completedStepCount}/{interviewSteps.length} steps
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-teal-500 transition-all"
              style={{ width: `${(completedStepCount / interviewSteps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[220px_1fr]">
          <BriefStepNav
            activeStep={activeStep}
            product={product}
            steps={interviewSteps}
            onStepChange={setActiveStep}
          />

          <div className="min-w-0">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
                Assistant prompt
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.prompt}</p>
            </div>

            <div className="mt-4 grid gap-3">
              <BriefStepFields product={product} step={step.id} onProductChange={onProductChange} />
            </div>

            <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-600">
                {completionCount}/12 profile fields captured
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  disabled={stepIndex === 0}
                  className="flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Back
                </button>
                {stepIndex === interviewSteps.length - 1 ? (
                  <button
                    type="button"
                    onClick={onGenerate}
                    className="flex min-h-10 items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
                  >
                    Find opportunities
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="flex min-h-10 items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
