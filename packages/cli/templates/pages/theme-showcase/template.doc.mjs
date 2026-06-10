// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../../../core/src/docs-types').TemplateDoc} */
export const doc = {
  type: 'page',
  name: 'Theme Showcase',
  displayName: 'Theme Showcase',
  description:
    'Real-world product surfaces (store, checkout, chat, inventory) used to preview a theme in the playground',
  isReady: true,
  // Surfaced via the Themes page "Open in Playground" action, not the
  // Templates gallery, so keep it out of the overview + playground menu.
  isHiddenFromOverview: true,
  category: 'Showcase - Theme Showcase',
};
