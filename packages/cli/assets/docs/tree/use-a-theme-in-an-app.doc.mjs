// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/building-blocks/themes/use-a-theme-in-an-app`:
 * list, copy, and build a theme in an app.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'use-a-theme-in-an-app',
  placement: {parent: 'namespace:themes', slot: 'guides', order: 50},
  title: 'Use the theme in an app',
  category: 'guide',
  description:
    'List a theme, copy its folder into an app, and build it; the copy belongs to the app.',
  sections: [
    {
      id: 'use-a-theme-in-an-app',
      title: 'Use the theme in an app',
      content: [
        {
          type: 'prose',
          text: 'An app lists your theme, copies its folder into its own source, and builds it. The copy belongs to the app, which can edit it.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: `npx astryx theme list
npx astryx theme add ocean --package @acme/astryx-widgets
npx astryx theme build src/themes/ocean/oceanTheme.ts`,
        },
        {
          type: 'code',
          lang: 'text',
          code: `[ok] Added Ocean theme from @acme/astryx-widgets to src/themes/ocean/

- src/themes/ocean/oceanTheme.ts
- src/themes/ocean/oceanTheme.doc.mjs
- src/themes/ocean/palette.config.json
- src/themes/ocean/tokens/ocean.palette.receipt.json
- src/themes/ocean/tokens/ocean.palette.ts`,
        },
        {
          type: 'prose',
          text: '`theme list` shows `ocean (maintained, @acme/astryx-widgets)`. When two packages ship the slug `ocean`, `theme add ocean` fails until the app passes `--package`. `theme build` writes `ocean.css`, `ocean.js`, and `ocean.d.ts` beside the source.',
        },
        {
          type: 'prose',
          text: 'A copied theme that uses a package-owned font or keyframes stylesheet also needs that one import; see {@link generic:ship-fonts-and-assets}.',
        },
      ],
    },
  ],
};
