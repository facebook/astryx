// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Theme',
  displayName: 'Theme',
  group: 'Utilities',
  category: 'Utility',
  isHiddenFromOverview: true,
  keywords: ['theme', 'theming', 'provider', 'color-scheme'],
  playground: {
    defaults: {
      theme: '@xds/theme-matcha',
      mode: 'light',
      children: {
        __element: 'XDSCard',
        props: {padding: 4, style: {maxWidth: 360}},
        children: {
          __element: 'XDSVStack',
          props: {gap: 3},
          children: [
            {
              __element: 'XDSHeading',
              props: {level: 4},
              children: 'Theme preview',
            },
            {
              __element: 'XDSText',
              props: {type: 'body', color: 'secondary'},
              children:
                'Cards, text, and buttons inherit tokens from the selected theme.',
            },
            {__element: 'XDSButton', props: {label: 'Primary action'}},
          ],
        },
      },
    },
  },
  usage: {
    description:
      'Wraps a subtree with a specific XDS theme. For static production themes, use `npx xds theme build` and import the generated CSS plus built theme object for first-paint and SSR performance. Use runtime `defineTheme()` when themes are dynamic or for prototyping.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Build app themes that are known ahead of time with `npx xds theme build`, then import the generated CSS and built theme object.',
      },
      {
        guidance: true,
        description:
          'Use runtime themes when the theme is created or edited in the browser, such as theme editors, user branding, or prototypes.',
      },
      {
        guidance: false,
        description:
          'Default to runtime themes in SSR production apps. Component overrides inject after hydration instead of shipping as static CSS.',
      },
    ],
  },
  props: [
    {
      name: 'theme',
      type: 'XDSDefinedTheme',
      required: true,
      description:
        'Theme object to apply. Prefer built theme objects for static production themes; use runtime `defineTheme()` for dynamic themes.',
    },
    {
      name: 'mode',
      type: "'light' | 'dark' | 'system'",
      default: "'system'",
      description: 'Color mode. System follows OS preference.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description: 'Content to render with the theme.',
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  usage: {
    description:
      'Wraps subtree w/ specific XDS theme. For static production themes, use `npx xds theme build` + generated CSS + built theme object for first-paint/SSR performance. Use runtime `defineTheme()` for dynamic themes or prototyping.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Build app themes known ahead of time w/ `npx xds theme build`; import generated CSS + built theme object.',
      },
      {
        guidance: true,
        description:
          'Use runtime themes when theme is created/edited in browser, e.g. theme editor, user branding, prototype.',
      },
      {
        guidance: false,
        description:
          'Default to runtime themes in SSR production apps. Component overrides inject after hydration instead of static CSS.',
      },
    ],
  },
  propDescriptions: {
    theme:
      'theme object to apply. Prefer built theme objects for static production themes; use runtime `defineTheme()` for dynamic themes.',
    mode: 'color mode. System follows OS preference. defaults to "system"',
  },
};
