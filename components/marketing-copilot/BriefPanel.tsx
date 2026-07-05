"use client";

import { useState } from "react";
import type { ProductResource, ProductResourceType, ProductWorkspace } from "@/lib/types";

type BriefPanelProps = {
  product: ProductWorkspace;
  onAddResource: (resource: Omit<ProductResource, "id">) => void;
  onProductChange: (updates: Partial<Pick<ProductWorkspace, "audience" | "brief">>) => void;
  onGenerate: () => void;
  onRemoveResource: (id: number) => void;
};

export function BriefPanel({
  product,
  onAddResource,
  onProductChange,
  onGenerate,
  onRemoveResource,
}: BriefPanelProps) {
  const [resourceType, setResourceType] = useState<ProductResourceType>("Document");
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceBody, setResourceBody] = useState("");

  function submitResource() {
    if (!resourceTitle.trim() || !resourceBody.trim()) {
      return;
    }

    onAddResource({
      type: resourceType,
      title: resourceTitle.trim(),
      body: resourceBody.trim(),
    });
    setResourceTitle("");
    setResourceBody("");
  }

  return (
    <section>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Product context</h2>
            <p className="mt-1 text-sm text-slate-600">
              Group the brief, audience, notes, links, competitors, and community context.
            </p>
          </div>
          <span className="rounded-md bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-800">
            {product.resources.length} resource{product.resources.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div>
            <label htmlFor="audience" className="text-sm font-semibold text-slate-700">
              Audience
            </label>
            <input
              id="audience"
              value={product.audience}
              onChange={(event) => onProductChange({ audience: event.target.value })}
              placeholder="solo founders, creators, agencies, coaches"
              className="mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <label htmlFor="brief" className="text-sm font-semibold text-slate-700">
            Brief
          </label>
          <textarea
            id="brief"
            value={product.brief}
            onChange={(event) => onProductChange({ brief: event.target.value })}
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

        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
            <select
              value={resourceType}
              onChange={(event) => setResourceType(event.target.value as ProductResourceType)}
              className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            >
              {["Document", "Website", "Customer note", "Competitor", "Community"].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <input
              value={resourceTitle}
              onChange={(event) => setResourceTitle(event.target.value)}
              placeholder="Resource title"
              className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <textarea
            value={resourceBody}
            onChange={(event) => setResourceBody(event.target.value)}
            placeholder="Paste the key context, customer quote, competitor note, URL, or community detail."
            className="mt-3 min-h-28 w-full resize-none rounded-md border border-slate-300 bg-white p-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
          <button
            onClick={submitResource}
            className="mt-3 flex min-h-10 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold leading-tight text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 sm:w-auto"
          >
            Add resource
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          {product.resources.map((resource) => (
            <article key={resource.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {resource.type}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-slate-950">{resource.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{resource.body}</p>
                </div>
                <button
                  onClick={() => onRemoveResource(resource.id)}
                  className="flex min-h-10 w-full shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold leading-tight text-slate-800 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 sm:w-28"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
