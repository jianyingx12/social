"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signInWithEmail } from "../actions";

type SignInFormProps = {
  nextPath: string;
};

export function SignInForm({ nextPath }: SignInFormProps) {
  const isConnectingAccount = nextPath.startsWith("/api/auth/");
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f9] px-4 py-10 text-slate-950">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
          OrganicReach
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950">
          Sign in
        </h1>
        {isConnectingAccount && (
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Sign in first, then OrganicReach will continue the account connection.
          </p>
        )}

        <input name="next" type="hidden" value={nextPath} />

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700" htmlFor="email">
            Email
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700" htmlFor="password">
            Password
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>
        </div>

        {state?.error && (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 w-full rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>

        <p className="mt-5 text-center text-sm text-slate-600">
          Need an account?{" "}
          <Link className="font-semibold text-teal-700 hover:text-teal-800" href="/auth/sign-up">
            Create one
          </Link>
        </p>
      </form>
    </main>
  );
}
