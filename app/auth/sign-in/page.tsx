import { getSafeInternalRedirectPath } from "@/lib/auth/redirect-path";

import { SignInForm } from "./SignInForm";

type SignInPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const nextParam = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = getSafeInternalRedirectPath(nextParam);

  return <SignInForm nextPath={nextPath} />;
}
