"use client";

import { useRef, useState } from "react";
import type { Account, ChatMessage, Draft, Opportunity, ProductWorkspace } from "@/lib/types";

type ChatPanelProps = {
  accounts: Account[];
  drafts: Draft[];
  messages: ChatMessage[];
  opportunities: Opportunity[];
  product: ProductWorkspace;
  onMessagesChange: (messages: ChatMessage[]) => void;
  onOpenBrief: () => void;
};

const starterMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Tell me what you want to work on: positioning, finding users, drafting replies, or turning an idea into TikTok content.",
  },
];

const prompts = [
  "What should I improve in this product brief?",
  "Give me 5 places to look for early users.",
  "Turn this product context into a TikTok content plan.",
];

export function ChatPanel({
  accounts,
  drafts,
  messages,
  opportunities,
  product,
  onMessagesChange,
  onOpenBrief,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextMessageId = useRef(2);
  const displayedMessages = messages.length > 0 ? messages : starterMessages;
  const hasContext =
    Boolean(product.brief.trim()) || Boolean(product.audience.trim()) || product.resources.length > 0;

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
          product,
          drafts,
          opportunities,
          accounts,
        }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };

      const reply = data.reply;

      if (!response.ok || !reply) {
        throw new Error(data.error ?? "Could not get a reply.");
      }

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
          <h2 className="text-2xl font-semibold text-slate-950">Chat</h2>
          <p className="mt-1 text-sm text-slate-600">
            Ask the copilot about this product, the review queue, and your connected channels.
          </p>
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
            {prompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
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
              placeholder="Ask about positioning, channels, replies, or TikTok ideas..."
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
          <h2 className="text-lg font-semibold text-slate-950">Context</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <ContextRow label="Product" value={product.name} />
            <ContextRow label="Resources" value={String(product.resources.length)} />
            <ContextRow label="Drafts" value={String(drafts.length)} />
            <ContextRow label="Opportunities" value={String(opportunities.length)} />
          </div>
          {!hasContext && (
            <button
              onClick={onOpenBrief}
              className="mt-4 flex min-h-10 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Add product context
            </button>
          )}
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-white shadow-sm">
          <h2 className="text-lg font-semibold">What it can do now</h2>
          <div className="mt-4 grid gap-2 text-sm leading-6 text-slate-200">
            <p>Use the active product context.</p>
            <p>Draft founder-led marketing ideas.</p>
            <p>Reference current opportunities and review items.</p>
            <p>Keep posting actions behind approval.</p>
          </div>
        </div>
      </aside>
    </section>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <span className="text-slate-600">{label}</span>
      <span className="min-w-0 truncate font-semibold text-slate-950">{value}</span>
    </div>
  );
}
