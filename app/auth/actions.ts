"use server";

import { redirect } from "next/navigation";

import { getSafeInternalRedirectPath } from "@/lib/auth/redirect-path";
import { auth } from "@/lib/auth/server";

type AuthActionState = {
  error: string;
} | null;

function readRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export async function signInWithEmail(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readRequiredString(formData, "email");
  const password = readRequiredString(formData, "password");
  const nextPath = getSafeInternalRedirectPath(formData.get("next"));

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await auth.signIn.email({ email, password });

  if (error) {
    return { error: error.message || "Could not sign in. Try again." };
  }

  redirect(nextPath);
}

export async function signUpWithEmail(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = readRequiredString(formData, "name");
  const email = readRequiredString(formData, "email");
  const password = readRequiredString(formData, "password");

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }

  const { error } = await auth.signUp.email({ name, email, password });

  if (error) {
    return { error: error.message || "Could not create your account." };
  }

  redirect("/");
}

export async function signOut() {
  await auth.signOut();
  redirect("/auth/sign-in");
}
