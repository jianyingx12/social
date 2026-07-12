export function getSafeInternalRedirectPath(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string") {
    return "/";
  }

  const path = value.trim();

  if (!path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }

  return path;
}
