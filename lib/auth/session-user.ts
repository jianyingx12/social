export type AppUser = {
  id?: string;
  email?: string;
  name?: string;
};

export function getUserStorageKey(user: unknown) {
  if (!user || typeof user !== "object") {
    return null;
  }

  const record = user as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id.trim() : "";
  const email = typeof record.email === "string" ? record.email.trim().toLowerCase() : "";

  if (id) {
    return id;
  }

  if (email) {
    return `email:${email}`;
  }

  return null;
}

export function toAppUser(user: unknown): AppUser | null {
  if (!user || typeof user !== "object") {
    return null;
  }

  const record = user as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id : undefined;
  const email = typeof record.email === "string" ? record.email : undefined;
  const name = typeof record.name === "string" ? record.name : undefined;

  if (!id && !email && !name) {
    return null;
  }

  return { id, email, name };
}
