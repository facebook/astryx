// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/building-blocks/themes/fonts-and-assets`:
 * ship a theme's fonts and keyframes so they load when an app applies it.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'fonts-and-assets',
  placement: {parent: 'namespace:themes', slot: 'guides', order: 35},
  title: 'Ship fonts and assets',
  category: 'guide',
  description:
    "Ship a theme's fonts and keyframes so they load when an app installs the package and applies the theme.",
  sections: [
    {
      id: 'ship-the-fonts',
      title: 'Ship the fonts',
      content: [
        {
          type: 'prose',
          text: 'If your theme uses a custom typeface, ship the font files in your package and declare their `@font-face` with the theme. An app then gets them by installing the package and applying the theme — nothing extra to set up in the app.',
        },
        {
          type: 'code',
          lang: 'css',
          code: `@font-face {
  font-family: 'Acme Sans';
  src: url('./fonts/acme-sans.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153;
}`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Declare every weight and style the theme uses. Do not rely on the browser to synthesize bold or italic from a missing file — ship the italic face with the same `unicode-range`s as the roman.',
            'Set a `unicode-range` on each face so the browser downloads only the subsets it needs.',
            'Use `font-display: swap` unless a measured performance need justifies another value.',
            'Confirm the font license permits redistribution in your package.',
            'Ship WOFF2; add another format only when a supported browser needs it.',
            'Include the font files in the package `files` so they actually ship.',
          ],
        },
      ],
    },
    {
      id: 'keyframes-and-side-effects',
      title: 'Keyframes and side-effect CSS',
      content: [
        {
          type: 'prose',
          text: 'A theme that animates ships its `@keyframes` with the theme the same way. Any stylesheet the theme relies on is a side effect, so list the CSS in `sideEffects` or a bundler may drop it from the production build.',
        },
        {
          type: 'code',
          lang: 'json',
          code: `"sideEffects": ["**/*.css"]`,
        },
      ],
    },
    {
      id: 'verify-in-an-app',
      title: 'Verify in an app',
      content: [
        {
          type: 'prose',
          text: 'Before publishing, install the package in a clean app, apply the theme, and check it in the browser. The source and the applied result are not the same thing until you look.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Text renders in the theme typeface at every weight and style the UI uses — `<em>` resolves to the italic face, not a synthesized slant.',
            'Every font request succeeds; nothing falls back to a system font.',
            'Animations run, and the theme holds up in light and dark mode.',
            'Color pairs still meet contrast in every mode you support.',
          ],
        },
      ],
    },
  ],
};
