// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/building-blocks/themes/use-a-theme-in-an-app`:
 * an app installs the integration and applies or extends the theme, like any theme.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'use-a-theme-in-an-app',
  placement: {parent: 'namespace:themes', slot: 'guides', order: 40},
  title: 'Use and extend the theme',
  category: 'guide',
  description:
    'An app installs the integration and applies or extends your theme, the same as any theme.',
  sections: [
    {
      id: 'apply-the-theme',
      title: 'Apply the theme',
      content: [
        {
          type: 'prose',
          text: 'An app installs the integration as a dependency and applies your theme like any Astryx theme: wrap the app in `<Theme>`. The theme and its fonts come from the installed package ({@link generic:fonts-and-assets}) — there is no copy step.',
        },
        {
          type: 'code',
          lang: 'tsx',
          code: `import {Theme} from '@astryxdesign/core/theme';
import {oceanTheme} from '@acme/astryx-widgets/themes/ocean';

<Theme theme={oceanTheme}>{/* app */}</Theme>`,
        },
        {
          type: 'prose',
          text: 'The import specifier is whatever your integration exports for the theme. Applying a theme — `mode`, SSR, and the production build — works the same for every theme; see {@link generic:theme}.',
        },
      ],
    },
    {
      id: 'extend-the-theme',
      title: 'Extend to customize',
      content: [
        {
          type: 'prose',
          text: 'To change a theme, an app does not copy it — it derives a new one with `extends`: import your theme and override only the tokens it changes. See {@link generic:define-the-theme}.',
        },
      ],
    },
  ],
};
