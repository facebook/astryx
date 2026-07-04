// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * SSR-only hint for the initial mobile layout state.
 *
 * In the LATEST (server) build this reads the request User-Agent so the first
 * paint matches the device. In the CANARY (static export) build there is no
 * request at render time — `next/headers` is unavailable — so we return a
 * static `false`. That's safe because the shell (core AppShell) corrects the
 * real state on mount via `matchMedia`; `defaultIsMobile` is only the initial
 * SSR guess.
 *
 * Gated on DOCSITE_TARGET so the `next/headers` import is never evaluated in
 * the export build (where it would throw).
 */
export async function getDefaultIsMobile(): Promise<boolean> {
  if (process.env.DOCSITE_TARGET === 'canary') {
    // Static export: no request context. Client corrects via matchMedia.
    return false;
  }
  const {headers} = await import('next/headers');
  const headersList = await headers();
  const ua = headersList.get('user-agent') ?? '';
  return /mobile|android|iphone|ipad/i.test(ua);
}
