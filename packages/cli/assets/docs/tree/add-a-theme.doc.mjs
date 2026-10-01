// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/building-blocks/themes/add-a-theme`:
 * scaffold a theme in a package — blank, or forked from an existing theme.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'add-a-theme',
  placement: {parent: 'namespace:themes', slot: 'guides', order: 10},
  title: 'Add a theme',
  category: 'guide',
  description:
    'Scaffold a theme in your package — blank, or forked from an existing theme.',
  sections: [
    {
      id: 'add-a-theme',
      title: 'Add a theme',
      content: [
        {
          type: 'prose',
          text: 'Run `integration add theme` with a lowercase kebab-case slug. It writes a blank theme — a `defineTheme` skeleton and its descriptor — into a folder named after the slug.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx integration add theme ocean',
        },
        {
          type: 'code',
          lang: 'text',
          code: `theme contribution added

[ok] ocean

Declare theme root ./themes in astryx.integration.mjs.

- themes/ocean/oceanTheme.ts
- themes/ocean/oceanTheme.doc.mjs
- package.json
- astryx.integration.mjs`,
        },
        {
          type: 'prose',
          text: "`oceanTheme.ts` exports `oceanTheme`, a `defineTheme` source. `oceanTheme.doc.mjs` describes it with `type: 'theme'`, `name`, `displayName`, `description`, and `maintained`; `theme list` shows its `name`, `description`, and `maintained`. Every field is in {@link generic:authoring}.",
        },
        {
          type: 'prose',
          text: 'The source ships in your package. An app installs the package and applies the theme — it is not copied; see {@link generic:use-a-theme-in-an-app}.',
        },
      ],
    },
    {
      id: 'start-from-an-existing-theme',
      title: 'Start from an existing theme',
      content: [
        {
          type: 'prose',
          text: 'To begin from an existing theme instead of a blank one, pass `--from`. It copies that theme as your starting point to diverge from — a fork, with no link back.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx integration add theme ocean --from neutral',
        },
        {
          type: 'prose',
          text: 'Use `--from` when you want to change a lot. For a small change that should stay linked to a base theme, use `extends` instead ({@link generic:define-the-theme}).',
        },
      ],
    },
    {
      id: 'ship-several-themes',
      title: 'Ship several themes',
      content: [
        {
          type: 'prose',
          text: 'A package can ship more than one theme. Run `integration add theme` once per slug; each theme gets its own folder and descriptor, and `theme list` shows them all.',
        },
      ],
    },
  ],
};
