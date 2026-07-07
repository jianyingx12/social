import "server-only";

import { auth } from "./server";
import { getUserStorageKey } from "./session-user";

export async function getCurrentUserStorageKey() {
  const { data: session } = await auth.getSession();

  return getUserStorageKey(session?.user ?? null);
}
