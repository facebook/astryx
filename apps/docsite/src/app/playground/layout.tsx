// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Page type: playground (full-bleed tool)
 * Renders the interactive code playground full-screen with no marketing top
 * nav / footer chrome — a left editor panel and a right live-preview panel.
 * Theme context is provided by the root <Providers> (app/providers.tsx), so
 * this layout only needs to establish a full-viewport, overflow-hidden frame.
 *
 * @input children — the PlaygroundClient tree
 * @output Full-height surface container
 * @position app/playground layout wrapper
 */

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--color-background-surface)',
      }}>
      {children}
    </div>
  );
}
