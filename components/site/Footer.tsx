import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#f5f7f9] text-slate-600">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="font-medium text-slate-900">OrganicReach</p>
        <nav aria-label="Legal links" className="flex gap-4">
          <Link href="/terms" className="hover:text-slate-950">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-slate-950">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
