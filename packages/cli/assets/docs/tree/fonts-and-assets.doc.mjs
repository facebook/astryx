// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/building-blocks/themes/fonts-and-assets`:
 * name a theme's fonts, and have the app load them (Astryx never loads a font).
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'fonts-and-assets',
  placement: {parent: 'namespace:themes', slot: 'guides', order: 35},
  title: 'Fonts',
  category: 'guide',
  description:
    "Name your theme's fonts in its tokens, then have the app load them — Astryx never loads a font file.",
  sections: [
    {
      id: 'name-the-font',
      title: 'Name the font',
      content: [
        {
          type: 'prose',
          text: 'A theme names its typefaces in `typography`: `body`, `heading`, and `code`, each with a `family` and `fallbacks`. These set the `--font-family-*` tokens every component reads. Always give real `fallbacks` so text stays readable before the font loads, or if it never does. `heading` inherits `family` and `fallbacks` from `body` when you omit them.',
        },
        {
          type: 'code',
          lang: 'ts',
          code: `// themes/ocean/oceanTheme.ts
export const oceanTheme = defineTheme({
  name: 'ocean',
  typography: {
    body: {family: 'Acme Sans', fallbacks: 'system-ui, sans-serif'},
    code: {family: 'Acme Mono', fallbacks: 'ui-monospace, monospace'},
  },
  // ...your tokens
});`,
        },
        {
          type: 'prose',
          text: 'The full type scale and font roles are in {@link generic:theme}.',
        },
      ],
    },
    {
      id: 'load-the-font-in-the-app',
      title: 'Load the font in the app',
      content: [
        {
          type: 'prose',
          text: "Naming a family does not load it — Astryx never downloads a font file. The app that uses your theme loads the font itself, so your job is to tell your users which families and weights to load, in your theme's docs ({@link generic:document-the-theme}). An app loads a font one of two ways:",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            "Link a hosted stylesheet in the app's `<head>` — for example a Google Fonts `<link>` covering every weight the UI uses.",
            "Self-host: serve the font files and add an `@font-face` for each weight and style to the app's global CSS.",
          ],
        },
        {
          type: 'code',
          lang: 'css',
          code: `/* In the app's global CSS, when self-hosting */
@font-face {
  font-family: 'Acme Sans';
  src: url('/fonts/acme-sans.woff2') format('woff2');
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
            'Load every weight and style the theme uses. Do not let the browser synthesize bold or italic — include the italic face, with the same `unicode-range`s as the roman.',
            'Set a `unicode-range` per face so the browser downloads only the subsets it needs.',
            'Use `font-display: swap` unless a measured need justifies another value.',
            'Serve WOFF2; add another format only when a target browser needs it.',
          ],
        },
      ],
    },
    {
      id: 'verify-in-an-app',
      title: 'Verify in an app',
      content: [
        {
          type: 'prose',
          text: 'Before publishing, install the package in a clean app, apply the theme, load the fonts, and open it in a browser. The source and the applied result are not the same thing until you look.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Text renders in the named families at every weight and style — the italic face resolves, not a synthesized slant.',
            'Every font request succeeds; nothing silently falls back to a system font.',
            'Color pairs still meet contrast in both light and dark mode.',
          ],
        },
      ],
    },
  ],
};
