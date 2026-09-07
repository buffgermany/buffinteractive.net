import { AsyncLocalStorage } from "node:async_hooks";

/**
 * When a magic link is minted inside `magicLinkCapture.run({}, ...)`,
 * `sendMagicLink` writes the URL into the store and sends no email —
 * the caller embeds the URL in its own message instead.
 *
 * Outside such a scope the store is undefined and mail is sent normally.
 */
export const magicLinkCapture = new AsyncLocalStorage<{ url?: string }>();

/** Mints inside a capture scope and returns the URL that would have been mailed. */
export async function captureMagicLink(
  mint: () => Promise<unknown>
): Promise<string> {
  const store: { url?: string } = {};
  await magicLinkCapture.run(store, mint);
  if (!store.url) throw new Error("Magic-Link konnte nicht erzeugt werden.");
  return store.url;
}
