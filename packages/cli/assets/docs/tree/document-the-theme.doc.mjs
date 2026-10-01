// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/building-blocks/themes/document-the-theme`:
 * document a theme by extending the core theme topic, not in agent guidance.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'document-the-theme',
  placement: {parent: 'namespace:themes', slot: 'guides', order: 60},
  title: 'Document the theme',
  category: 'guide',
  description:
    'Document a theme by extending the core theme topic, so an app reads it in `astryx docs theme`.',
  sections: [
    {
      id: 'extend-the-theme-topic',
      title: 'Extend the core theme topic',
      content: [
        {
          type: 'prose',
          text: 'Give your theme a doc topic that extends the core `theme` topic, so an app that lists your package sees your theme at the end of `astryx docs theme`. Add it with `extends: \'theme\'` ({@link generic:extend-or-replace}).',
        },
        {
          type: 'code',
          lang: 'javascript',
          code: `// docs/ocean-theme.doc.mjs
/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export default {
  type: 'generic',
  name: 'ocean-theme',
  extends: 'theme',
  title: 'Ocean theme',
  description: 'Use the Ocean theme from @acme/astryx-widgets.',
  sections: [
    {
      id: 'use-the-ocean-theme',
      title: 'Use the Ocean theme',
      content: [
        {
          type: 'prose',
          text: "Add \`@acme/astryx-widgets\` to the app's dependencies, copy the theme with \`astryx theme add ocean\`, and import its fonts once with \`import '@acme/astryx-widgets/fonts.css'\`.",
        },
      ],
    },
  ],
};`,
        },
        {
          type: 'prose',
          text: 'Keep the section short: how to add the package, how to apply the theme, and the one `fonts.css` import a copied theme needs ({@link generic:ship-fonts-and-assets}). Extend `theme` rather than a topic another package replaces, or an app that lists that package first drops your section.',
        },
      ],
    },
    {
      id: 'not-agent-guidance',
      title: 'Not agent guidance',
      content: [
        {
          type: 'prose',
          text: 'Do not put theme usage in `agentDocs`. Agent lines land in every app\'s agent file and are for guidance needed every session; a theme\'s install-and-use steps belong in a doc topic that people and agents read on demand. See {@link generic:agent-guidance}.',
        },
      ],
    },
  ],
};
