// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'InternationalizationProvider',
  displayName: 'Internationalization Provider',
  group: 'Utilities',
  category: 'Utility',
  isHiddenFromOverview: true,
  keywords: [
    'i18n',
    'internationalization',
    'localization',
    'locale',
    'translation',
    'translations',
    'provider',
    'language',
  ],
  usage: {
    description:
      "Wraps your app to set the active locale and (optionally) merge additional translation catalogs + per-locale overrides. Astryx components inside the subtree resolve their strings against this context. If no provider is present, components fall back to the shipped English defaults.",
  },
  props: [
    {
      name: 'locale',
      type: 'string',
      required: true,
      description:
        'BCP 47 language tag for the active locale (e.g. "en", "pt", "pt-BR", "zh-Hans"). Regional tags fall back to their base language, then to the shipped "en" catalog.',
    },
    {
      name: 'messages',
      type: 'MessagesByLocale',
      required: false,
      description:
        'Optional map of BCP 47 tag to translation catalog. The shipped "en" catalog is always available and does not need to be listed here.',
    },
    {
      name: 'overrides',
      type: 'Overrides',
      required: false,
      description:
        'Sparse per-locale key overrides applied on top of shipped defaults. Overrides are locale-keyed so a runtime locale swap picks up the correct set.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description: 'Content to render with the internationalization provider.',
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Wraps app to set active locale and (optionally) merge translation catalogs + per-locale overrides. Astryx components resolve strings against this context; missing keys fall back to shipped English.',
  usage: {
    description:
      'Wraps app to set active locale and (optionally) merge translation catalogs + per-locale overrides. Astryx components resolve strings against this context; missing keys fall back to shipped English.',
  },
  propDescriptions: {
    locale:
      'BCP 47 language tag (e.g. "en", "pt-BR"); regional tags fall back to base language then "en"',
    messages:
      'map of BCP 47 tag to translation catalog; "en" is always available',
    overrides:
      'sparse per-locale key overrides applied on top of shipped defaults',
  },
};
