// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'page',
  name: 'Theme Showcase',
  displayName: 'Theme Showcase',
  description:
    'Real-world product surfaces (store, checkout, chat, inventory) used to preview a theme in the playground',
  isReady: true,
  // Surfaced via the Themes page "Open in Playground" action, not the
  // Templates gallery, so keep it out of the overview + playground menu.
  // No `category` — it's hidden from the overview gallery, and 'Showcase'
  // isn't part of the TemplateCategory taxonomy. Note the gallery is no longer
  // the only reader: `search()` indexes a page's category words as intent
  // keywords, so this page ranks on its name + description alone. That is the
  // intent — this is a theme preview harness, not an answer to a page query.
  isHiddenFromOverview: true,
};
