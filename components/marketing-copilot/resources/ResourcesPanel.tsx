"use client";

import { useState } from "react";
import type { ProductResource, ProductResourceType } from "@/lib/types";
import { resourceTypes } from "./config";

type ResourcesPanelProps = {
  resources: ProductResource[];
  onAddResource: (resource: Omit<ProductResource, "id">) => void;
  onRemoveResource: (id: number) => void;
};

export function ResourcesPanel({
  resources,
  onAddResource,
  onRemoveResource,
}: ResourcesPanelProps) {
  const [resourceType, setResourceType] = useState<ProductResourceType>("Customer quote");
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
    <section className="grid gap-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Source material</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Add raw material the AI can turn into draft posts, hooks, replies, and proof points.
        </p>

        <div className="mt-4 grid gap-3">
          <select
            value={resourceType}
            onChange={(event) => setResourceType(event.target.value as ProductResourceType)}
            className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          >
            {resourceTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
          <input
            value={resourceTitle}
            onChange={(event) => setResourceTitle(event.target.value)}
            placeholder="Source title"
            className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
          <textarea
            value={resourceBody}
            onChange={(event) => setResourceBody(event.target.value)}
            placeholder="Paste a quote, screenshot description, launch note, existing post, testimonial, or demo notes."
            className="min-h-28 w-full resize-none rounded-md border border-slate-300 bg-white p-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
          <button
            onClick={submitResource}
            className="flex min-h-10 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold leading-tight text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Add source material
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">Draft sources</h2>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
            {resources.length}
          </span>
        </div>
        <div className="mt-4 grid max-h-[520px] gap-3 overflow-y-auto pr-1">
          {resources.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              No source material yet. Add quotes, examples, demos, or proof the AI can turn into drafts.
            </p>
          ) : (
            resources.map((resource) => (
              <article
                key={resource.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      {resource.type}
                    </span>
                    <h3 className="mt-3 text-sm font-semibold text-slate-950">
                      {resource.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => onRemoveResource(resource.id)}
                    className="shrink-0 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                  >
                    Remove
                  </button>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{resource.body}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
