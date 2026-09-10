// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file previewChannel.ts
 * @input An incoming MessageEvent plus the window we expect to hear from
 * @output Whether the message may be acted on
 * @position Playground <-> preview iframe — the postMessage trust boundary.
 *
 * The preview iframe compiles and evaluates whatever source arrives on this
 * channel, so an unchecked `message` listener lets any window that can reach
 * the frame run code in this site's origin. `window.postMessage` is delivered
 * to every listener regardless of sender, so both ends must gate on the
 * sender's identity themselves: the origin the message came from AND the
 * window object it came from.
 *
 * The preview is always served from this site (the iframe uses a relative
 * src), so "trusted" is same-origin — no host allowlist to keep in sync with
 * production, Vercel previews, and localhost.
 */

/** The origin both ends of the channel must be on. */
export function trustedPreviewOrigin(): string {
  return window.location.origin;
}

/**
 * True when `event` came from the window we expect, on our own origin.
 *
 * `expectedSource` is the counterpart window: the frame's parent (in the
 * preview) or the iframe's contentWindow (in the playground). A nullish
 * expected source means the counterpart does not exist yet, so nothing can be
 * trusted.
 */
export function isTrustedPreviewMessage(
  event: Pick<MessageEvent, 'origin' | 'source'>,
  expectedOrigin: string,
  expectedSource: MessageEventSource | null | undefined,
): boolean {
  if (event.origin !== expectedOrigin) {
    return false;
  }
  if (expectedSource == null || event.source == null) {
    return false;
  }
  return event.source === expectedSource;
}
