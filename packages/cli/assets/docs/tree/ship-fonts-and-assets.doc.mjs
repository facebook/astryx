// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/building-blocks/themes/ship-fonts-and-assets`:
 * make a copied theme's fonts and keyframes reach the app.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'ship-fonts-and-assets',
  placement: {parent: 'namespace:themes', slot: 'guides', order: 40},
  title: 'Ship fonts and assets',
  category: 'guide',
  description:
    "Make a copied theme's fonts and keyframes reach the app: export them, ship them, and import them once.",
  sections: [
    {
      id: 'fonts-do-not-travel',
      title: 'Fonts do not travel with the copy',
      content: [
        {
          type: 'prose',
          text: '`theme add` copies the theme folder, but a `@font-face` that points at package-owned font files does not bring those files with it. The copied theme loses them and text silently falls back to a system font — nothing errors.',
        },
        {
          type: 'prose',
          text: 'Keep the font files package-owned, put their `@font-face` rules in a `fonts.css` beside them, and have the app import that one stylesheet after it copies the theme.',
        },
      ],
    },
    {
      id: 'export-every-path-the-copy-needs',
      title: 'Export every path the copy needs',
      content: [
        {
          type: 'prose',
          text: 'A package whose `exports` is only `.` refuses every deep import: `import \'@acme/astryx-widgets/fonts.css\'` throws `ERR_PACKAGE_PATH_NOT_EXPORTED`. Add an entry for `fonts.css`, and for `keyframes.css` when the theme animates, so a copied theme can reach them.',
        },
        {
          type: 'code',
          lang: 'json',
          code: `"exports": {
  ".": "./index.js",
  "./fonts.css": "./fonts.css",
  "./keyframes.css": "./keyframes.css"
}`,
        },
        {
          type: 'prose',
          text: 'Include the font files and the stylesheets in the package `files` so they ship, and list the CSS in `sideEffects` so a bundler keeps the import.',
        },
        {
          type: 'code',
          lang: 'json',
          code: `"files": ["themes", "fonts", "fonts.css", "astryx.integration.mjs"],
"sideEffects": ["**/*.css"]`,
        },
      ],
    },
    {
      id: 'import-the-stylesheet-once',
      title: 'Import the stylesheet once',
      content: [
        {
          type: 'prose',
          text: 'After `theme add`, the app imports `fonts.css` once from the package — not the package root. Importing the root re-ships the theme CSS, so the theme renders twice.',
        },
        {
          type: 'code',
          lang: 'ts',
          code: "import '@acme/astryx-widgets/fonts.css';",
        },
        {
          type: 'prose',
          text: 'Tell the copier to add this import: document it in your theme topic ({@link generic:document-the-theme}) and leave a comment in the copied entry file. Then verify in a clean app that text renders in the package webfont, not a system fallback.',
        },
      ],
    },
  ],
};
