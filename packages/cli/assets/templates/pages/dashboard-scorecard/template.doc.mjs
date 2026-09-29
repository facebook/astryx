// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'page',
  name: 'Executive Summary Dashboard',
  displayName: 'Executive Summary Dashboard',
  description:
    'Report-shaped analytics with a prose rail beside the charts: a scorecard of headline numbers with period deltas and status coloring, goal-attainment bars, a trend grid, and a written commentary column that folds beneath the content when narrow. Executive summary, business review, readout, or reporting.',
  isReady: true,
  category: 'Dashboard - Scorecard',
  // Every runtime package page.tsx imports. Verified by the
  // check-template-deps repo gate: each entry must be a React platform
  // peer, a stable @astryxdesign/* package, or on the gate's allowlist.
  dependencies: [
    'react',
    '@stylexjs/stylex',
    '@astryxdesign/core',
    '@heroicons/react',
  ],
};
