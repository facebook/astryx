// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useCollator',
  displayName: 'useCollator',
  category: 'utilities',
  keywords: [
    'i18n',
    'internationalization',
    'locale',
    'collation',
    'compare',
    'sort',
    'table',
    'hook',
  ],
  params: [
    {
      name: 'options',
      type: 'Intl.CollatorOptions',
      description:
        'Optional collation behavior such as numeric ordering, sensitivity, punctuation handling, and case order.',
      required: false,
    },
  ],
  returns: [
    {
      name: 'collator',
      type: 'Intl.Collator',
      description:
        'A memoized collator bound to the active InternationalizationProvider locale.',
    },
  ],
  usage: {
    description:
      'Returns the sanctioned locale-aware comparator for custom sorting. The collator is recreated when the provider locale or an option changes.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Reuse collator.compare in custom Table comparators and other user-visible string ordering.',
      },
      {
        guidance: false,
        description:
          'Construct Intl.Collator directly or call localeCompare; those bypass the provider-backed locale contract.',
      },
    ],
  },
  relatedComponents: ['InternationalizationProvider', 'Table'],
  relatedHooks: ['useLocale'],
  importPath: '@astryxdesign/core',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    'Returns a memoized Intl.Collator bound to the active InternationalizationProvider locale.',
  paramDescriptions: {
    options:
      'optional Intl.CollatorOptions: numeric ordering, sensitivity, punctuation, case order, etc.',
  },
  returnDescriptions: {
    collator:
      'memoized provider-bound collator for locale-aware comparison and sorting.',
  },
  usage: {
    description:
      'Use collator.compare for custom user-visible string ordering instead of raw Intl.Collator or localeCompare.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Reuse collator.compare in custom Table comparators and string sorting.',
      },
      {
        guidance: false,
        description:
          'Construct raw Intl.Collator or call localeCompare directly.',
      },
    ],
  },
};
