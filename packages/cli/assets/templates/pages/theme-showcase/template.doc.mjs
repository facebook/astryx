// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'page',
  name: 'Theme Showcase',
  displayName: 'Theme Showcase',
  description: 'Several unrelated product surfaces rendered together on one canvas so a token change can be judged across contexts at once. A comparison harness rather than a layout to ship. Theme, tokens, palette, typography, styling, or design system preview.',
  isReady: true,
  // Surfaced via the Themes page "Open in Playground" action, not the
  // Templates gallery, so keep it out of the overview + playground menu.
  // No `category` — it's hidden from the overview gallery, and 'Showcase'
  // isn't part of the TemplateCategory taxonomy. Note the gallery is no longer
  // the only reader: `search()` indexes a page's category words as authored
  // intent keywords, so this page claims none — just its name, description,
  // and the deliberately weak signal of the components it renders. That is
  // the intent — this is a theme preview harness, not an answer to a page query.
  isHiddenFromOverview: true,
};
