// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useLocale',
  displayName: 'useLocale',
  category: 'utilities',
  keywords: [
    'i18n',
    'internationalization',
    'localization',
    'locale',
    'language',
    'provider',
    'hook',
  ],
  params: [],
  returns: [
    {
      name: 'locale',
      type: 'Locale',
      description:
        "The active InternationalizationProvider BCP 47 locale. Falls back to 'en' when no provider is present.",
    },
  ],
  usage: {
    description:
      'Reads the authoritative Astryx locale. Use it to thread the provider locale into pure formatting helpers and sibling-package APIs; do not derive a second locale from navigator.language or a hardcoded literal.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass the returned locale to pure Astryx helpers or package APIs that require an explicit locale.',
      },
      {
        guidance: false,
        description:
          'Use navigator.language or a hardcoded display locale as a fallback; InternationalizationProvider is the locale source.',
      },
    ],
  },
  relatedComponents: ['InternationalizationProvider'],
  relatedHooks: ['useCollator', 'useTranslator', 'useDirection'],
  importPath: '@astryxdesign/core',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    "Returns the active InternationalizationProvider locale, falling back to 'en' without a provider.",
  usage: {
    description:
      'Use as the sole locale source for pure formatting helpers and sibling-package APIs.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Thread this locale into pure helpers requiring an explicit locale.',
      },
      {
        guidance: false,
        description:
          'Fall back to navigator.language or a hardcoded display locale.',
      },
    ],
  },
  returnDescriptions: {
    locale: "active provider BCP 47 locale; 'en' without a provider.",
  },
};
