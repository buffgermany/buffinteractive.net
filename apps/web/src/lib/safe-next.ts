/**
 * Only same-origin relative paths are honoured, so a `next` / `from` parameter
 * taken from the URL cannot become an open redirect.
 *
 * Backslashes are rejected because browsers normalise them to forward slashes,
 * which would turn `/\evil.com` into the protocol-relative `//evil.com`.
 */
export function safeNext(raw: string | undefined | null, fallback = "/dashboard"): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return fallback;
  }
  return raw;
}
