"use client";

import { useRef, useState } from "react";
import type {
  Account,
  ChatMessage,
  Draft,
  Opportunity,
  ProductBriefUpdates,
  ProductWorkspace,
} from "@/lib/types";
import { getCurrentIntakePhase, intakePhases, isPhaseComplete } from "./intake-phases";

type ChatPanelProps = {
  accounts: Account[];
  drafts: Draft[];
  messages: ChatMessage[];
  opportunities: Opportunity[];
  product: ProductWorkspace;
  onMessagesChange: (messages: ChatMessage[]) => void;
  onOpenBrief: () => void;
  onProductChange: (updates: ProductBriefUpdates) => void;
};

const starterMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "We'll build the product profile one phase at a time. Start with the current question, and I'll keep the brief updated as we go.",
  },
];

export function ChatPanel({
  accounts,
  drafts,
  messages,
  opportunities,
  product,
  onMessagesChange,
  onOpenBrief,
  onProductChange,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextMessageId = useRef(2);
  const displayedMessages = messages.length > 0 ? messages : starterMessages;
  const currentPhase = getCurrentIntakePhase(product);
  const completedPhaseCount = intakePhases.filter((phase) => isPhaseComplete(product, phase)).length;

  async function sendMessage(content = input) {
    const trimmedContent = content.trim();

    if (!trimmedContent || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: nextMessageId.current++,
      role: "user",
      content: trimmedContent,
    };
    const nextMessages = [...displayedMessages, userMessage];

    onMessagesChange(nextMessages);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages,
          intakePhase: currentPhase.id,
          product,
          drafts,
          opportunities,
          accounts,
        }),
      });
      const data = (await response.json()) as {
        reply?: string;
        briefUpdates?: ProductBriefUpdates;
        error?: string;
      };

      const reply = data.reply;

      if (!response.ok || !reply) {
        throw new Error(data.error ?? "Could not get a reply.");
      }

      applyBriefUpdates(data.briefUpdates);
      onMessagesChange([
        ...nextMessages,
        {
          id: nextMessageId.current++,
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not get a reply.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <div className="flex min-h-[640px] flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
                Phase {Math.min(completedPhaseCount + 1, intakePhases.length)}/
                {intakePhases.length}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                {currentPhase.title}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{currentPhase.question}</p>
            </div>
            <button
              type="button"
              onClick={onOpenBrief}
              className="flex min-h-10 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Edit brief
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="grid gap-3">
            {displayedMessages.map((message) => (
              <article
                key={message.id}
                className={`max-w-[88%] rounded-lg px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "ml-auto bg-slate-950 text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                <p className="whitespace-pre-line">{message.content}</p>
              </article>
            ))}
            {isSending && (
              <div className="w-fit rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Thinking...
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 p-4 sm:p-5">
          {error && (
            <p className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {currentPhase.examples.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInput((current) => (current ? `${current}\n${prompt}` : prompt))}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={currentPhase.question}
              className="min-h-24 flex-1 resize-none rounded-md border border-slate-300 bg-white p-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
            <button
              onClick={() => sendMessage()}
              disabled={isSending || !input.trim()}
              className="flex min-h-11 w-full items-center justify-center rounded-md bg-slate-950 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-28"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <aside className="grid gap-4 lg:self-start">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Intake phases</h2>
          <div className="mt-4 grid gap-2 text-sm">
            {intakePhases.map((phase) => {
              const isCurrent = phase.id === currentPhase.id;
              const isComplete = isPhaseComplete(product, phase);

              return (
                <div
                  key={phase.id}
                  className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 ${
                    isCurrent
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="font-medium">{phase.label}</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isCurrent ? "bg-teal-300" : isComplete ? "bg-teal-500" : "bg-slate-300"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </section>
  );

  function applyBriefUpdates(updates: ProductBriefUpdates | undefined) {
    if (!updates) {
      return;
    }

    const emptyFieldUpdates = Object.fromEntries(
      Object.entries(updates).filter(([field, value]) => {
        const currentValue = product[field as keyof ProductBriefUpdates];

        return (
          typeof value === "string" &&
          value.trim() &&
          (!String(currentValue ?? "").trim() ||
            (field === "productType" && currentValue === "Other"))
        );
      }),
    ) as ProductBriefUpdates;

    if (Object.keys(emptyFieldUpdates).length > 0) {
      onProductChange(emptyFieldUpdates);
    }
  }
}
