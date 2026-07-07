type AiLoadingStateProps = {
  title: string;
  description: string;
};

export function AiLoadingState({ title, description }: AiLoadingStateProps) {
  return (
    <div
      aria-live="polite"
      className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-950"
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 flex h-2.5 w-2.5 shrink-0 rounded-full bg-teal-600">
          <span className="h-2.5 w-2.5 animate-ping rounded-full bg-teal-500" />
        </span>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 leading-6 text-teal-800">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function AiSpinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current ${className}`}
    />
  );
}
