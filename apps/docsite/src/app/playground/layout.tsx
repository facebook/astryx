// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Page type: playground (full-bleed tool)
 * The PlaygroundClient owns its XDSAppShell so its stateful side navigation
 * can drive Code / Properties / Theme tabs and still get AppShell mobile nav.
 * Theme context is provided by the root <Providers> (app/providers.tsx), so
 * this route layout intentionally adds no extra chrome or scroll container.
 *
 * @input children — the PlaygroundClient tree
 * @output Children unchanged; PlaygroundClient provides the full-height shell
 * @position app/playground route layout
 */

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
