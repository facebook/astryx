// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/building-blocks/themes/add-a-theme`:
 * create a theme source and its descriptor in a package.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'add-a-theme',
  placement: {parent: 'namespace:themes', slot: 'guides', order: 10},
  title: 'Add a theme',
  category: 'guide',
  description:
    'Create an editable theme source and its descriptor in your package.',
  sections: [
    {
      id: 'add-a-theme',
      title: 'Add a theme',
      content: [
        {
          type: 'prose',
          text: 'Run `integration add theme` with a lowercase kebab-case slug. It writes the theme source and its descriptor into a folder named after the slug.',
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
          text: 'The whole `themes/ocean/` folder is what ships and what an app copies, so a theme needs no `exports` entry of its own. When package.json has a `files` list, add puts `themes` and `astryx.integration.mjs` in it. It also declares the optional `@astryxdesign/cli` peer that reads themes; see {@link generic:versioning}.',
        },
      ],
    },
    {
      id: 'ship-several-themes',
      title: 'Ship several themes',
      content: [
        {
          type: 'prose',
          text: 'A package can ship more than one theme. Run `integration add theme` once per slug; each theme gets its own `themes/<slug>/` folder and descriptor, and `theme list` shows them all. An app copies only the ones it adds.',
        },
      ],
    },
  ],
};
