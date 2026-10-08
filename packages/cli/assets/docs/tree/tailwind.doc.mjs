// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs styling-libraries/tailwind`: the Tailwind v4 bridge,
 * cascade layer order, and utility-class usage backed by system tokens.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'tailwind',
  title: 'Tailwind',
  placement: {parent: 'namespace:styling-libraries', slot: 'guides', order: 20},
  category: 'guide',
  description:
    'The Tailwind v4 bridge, cascade layer order, and utility-class usage backed by system tokens.',
  keywords: [
    'Tailwind',
    'tailwind-theme.css',
    'utility classes',
    'cascade layers',
    'preflight',
  ],

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
          label: 'globals.css',
          code: `@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
@import "@astryxdesign/theme-neutral/theme.css";
@import "@astryxdesign/core/tailwind-theme.css";
@import "tailwindcss/utilities.css" layer(utilities);`,
        },
        {
          type: 'prose',
          text: 'Pre-declare every layer before any imports. This keeps reset lowest, Tailwind preflight above reset, component/theme styles in the middle, and Tailwind utilities last so utility classes on `className` can intentionally override component defaults.',
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
          text: 'The Tailwind bridge is the concrete example of the general interop pattern: expose another library\'s semantic API, but point the values at system token variables.',
        },
      ],
    },
  ],
};
