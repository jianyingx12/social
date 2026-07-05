import type { ConnectionNotice } from "./connection-notices";

type ConnectionNoticeBannerProps = {
  notice: ConnectionNotice;
};

export function ConnectionNoticeBanner({ notice }: ConnectionNoticeBannerProps) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-950",
    warning: "border-amber-200 bg-amber-50 text-amber-950",
    error: "border-rose-200 bg-rose-50 text-rose-950",
  };

  return (
    <div className={`mb-4 rounded-lg border px-4 py-3 text-sm font-medium ${styles[notice.tone]}`}>
      {notice.message}
    </div>
  );
}
