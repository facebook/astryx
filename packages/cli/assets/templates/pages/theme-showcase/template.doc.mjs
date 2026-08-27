// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'page',
  name: 'Theme Showcase',
  displayName: 'Theme Showcase',
  description: 'Theme preview surface rendering several product contexts at once, storefront, checkout, chat, and inventory, so palette and typography changes stay visible together. Design token playground.',
  isReady: true,
  // Surfaced via the Themes page "Open in Playground" action, not the
  // Templates gallery, so keep it out of the overview + playground menu.
  // No `category` — it's hidden from the overview gallery (the only consumer
  // of `category`), and 'Showcase' isn't part of the TemplateCategory taxonomy.
  isHiddenFromOverview: true,
};
