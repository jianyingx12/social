import type { ProductBriefUpdates, ProductType, ProductWorkspace } from "@/lib/types";
import type { InterviewStep } from "./config";
import { productTypes } from "./config";
import { TextArea, TextField } from "./TextInputs";

type BriefStepFieldsProps = {
  product: ProductWorkspace;
  step: InterviewStep;
  onProductChange: (updates: ProductBriefUpdates) => void;
};

export function BriefStepFields({ product, step, onProductChange }: BriefStepFieldsProps) {
  switch (step) {
    case "basics":
      return (
        <>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Product type
            <select
              value={product.productType}
              onChange={(event) =>
                onProductChange({ productType: event.target.value as ProductType })
              }
              className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-base font-normal text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            >
              {productTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <TextField
            label="Website or product link"
            value={product.productUrl}
            placeholder="https://..."
            onChange={(productUrl) => onProductChange({ productUrl })}
          />
          <TextArea
            label="One-line description"
            value={product.oneLine}
            placeholder="A tool that helps coaches explain plays and share clips with players."
            onChange={(oneLine) => onProductChange({ oneLine })}
            compact
          />
        </>
      );
    case "audience":
      return (
        <>
          <TextArea
            label="Target audience"
            value={product.audience}
            placeholder="Youth basketball coaches, trainers, and team operators."
            onChange={(audience) => onProductChange({ audience })}
          />
          <TextArea
            label="Problem or desire"
            value={product.problem}
            placeholder="They need a faster way to explain what went wrong and what to do next."
            onChange={(problem) => onProductChange({ problem })}
          />
          <TextArea
            label="Main outcome promised"
            value={product.outcome}
            placeholder="Players understand feedback faster, and coaches spend less time repeating the same explanation."
            onChange={(outcome) => onProductChange({ outcome })}
          />
        </>
      );
    case "positioning":
      return (
        <>
          <TextArea
            label="What makes it different"
            value={product.differentiator}
            placeholder="Unlike generic content tools, it is built around coaching language, plays, and player feedback."
            onChange={(differentiator) => onProductChange({ differentiator })}
          />
          <TextArea
            label="Proof"
            value={product.proof}
            placeholder="Testimonials, before/after examples, reviews, usage numbers, customer quotes."
            onChange={(proof) => onProductChange({ proof })}
          />
          <TextArea
            label="Brand voice"
            value={product.voice}
            placeholder="Helpful, direct, practical, founder-led, not salesy."
            onChange={(voice) => onProductChange({ voice })}
            compact
          />
        </>
      );
    case "promotion":
      return (
        <>
          <TextArea
            label="Channels to consider"
            value={product.channels}
            placeholder="Reddit, TikTok, YouTube comments, LinkedIn, niche forums."
            onChange={(channels) => onProductChange({ channels })}
          />
          <TextArea
            label="Keywords and customer language"
            value={product.keywords}
            placeholder="film review, draw plays, explain mistakes, practice clips, coaching app."
            onChange={(keywords) => onProductChange({ keywords })}
          />
        </>
      );
    case "rules":
      return (
        <TextArea
          label="Avoid or approval rules"
          value={product.avoid}
          placeholder="Avoid hard selling, medical claims, discount language, competitor attacks, or posting without approval."
          onChange={(avoid) => onProductChange({ avoid })}
        />
      );
    case "notes":
      return (
        <TextArea
          label="Extra notes"
          value={product.brief}
          placeholder="Anything else the AI should know about the product, market, launch, or offer."
          onChange={(brief) => onProductChange({ brief })}
        />
      );
  }
}
