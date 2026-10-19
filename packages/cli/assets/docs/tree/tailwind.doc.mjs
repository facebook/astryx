// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs styling-libraries/tailwind`: the Tailwind v4 bridge,
 * cascade layer order, and utility-class usage backed by system tokens.
 */

import {foundationLayers, foundationTailwindCSS} from './foundation-css.mjs';

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'tailwind',
  title: 'Tailwind',
  placement: {parent: 'namespace:styling-libraries', slot: 'guides', order: 20},
  category: 'guide',
  description:
    'The Tailwind v4 bridge, cascade layer order, and utility-class usage backed by system tokens.',
  keywords: ['tailwind-theme.css', 'utility classes', 'preflight'],

  sections: [
    {
      title: 'Tailwind',
      content: [
        {
          type: 'prose',
          text: 'The Tailwind v4 bridge at `@astryxdesign/core/tailwind-theme.css` maps Tailwind theme variables to system CSS variables with `@theme reference inline`, so utility classes like `text-primary`, `bg-surface`, `border-border`, `rounded-lg`, and `shadow-md` stay in sync with the active theme without emitting competing runtime declarations.',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'layers.css (import first)',
          code: foundationLayers,
        },
        {
          type: 'code',
          lang: 'css',
          label: 'globals.css',
          code: foundationTailwindCSS,
        },
        {
          type: 'prose',
          text: 'Pre-declare every layer before any imports. This keeps reset lowest, Tailwind preflight above reset, component/theme styles in the middle, and Tailwind utilities last so utility classes on `className` can intentionally override component defaults.',
        },
        {
          type: 'prose',
          text: 'Import layers.css first, before globals.css or any module that imports Astryx or theme CSS. Keep the order in its own file because bundlers can hoist CSS imports above an inline @layer statement. The generated astryx-themes module also imports theme CSS, so it must follow both foundation imports. When using another theme, replace the Neutral CSS/font imports and theme module together.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Root layout or app entry',
          code: `import './layers.css'; // first: fixes the cascade order before CSS imports
import './globals.css';

import {AppRoot} from './AppRoot';`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Tailwind classes backed by system tokens',
          code: `<section className="rounded-lg border border-border bg-surface p-4 text-primary shadow-md">
  <Button label="Save" variant="primary" />
</section>`,
        },
        {
          type: 'prose',
          text: "The Tailwind bridge is the concrete example of the general interop pattern: expose another library's semantic API, but point the values at system token variables.",
        },
      ],
    },
  ],
};
