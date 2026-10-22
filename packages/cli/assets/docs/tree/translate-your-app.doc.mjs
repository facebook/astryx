// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs translate-your-app`: locale setup, i18n libraries, RTL, and tests.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'translate-your-app',
  title: 'Translate your app',
  summary: 'Locale, catalogs, your i18n library, RTL, tests.',
  keywords: [
    'i18n',
    'internationalization',
    'translate',
    'translation',
    'locale',
    'RTL',
    'right-to-left',
    'language',
    'catalog',
  ],
  slots: {
    guides: {
      title: 'Guides',
      accepts: {
        kinds: ['generic', 'namespace'],
      },
    },
  },
  blocks: [
    {
      type: 'prose',
      text: 'Wrap the app in a provider and load a locale catalog ({@link generic:i18n-quick-start}), keep your own i18n library beside it ({@link generic:i18n-library-integration}), then check right-to-left layout and test translations ({@link generic:i18n-rtl-and-testing}).',
    },
  ],
};
