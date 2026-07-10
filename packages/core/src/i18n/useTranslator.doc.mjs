// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useTranslator',
  displayName: 'useTranslator',
  group: 'Utilities',
  keywords: [
    'i18n',
    'internationalization',
    'localization',
    'translation',
    'translate',
    'locale',
    'hook',
  ],
  params: [],
  returns: [
    {
      name: 'value',
      type: '(key: string, values?: Record<string, string | number | Date>) => string',
      description:
        'A stable translator function bound to the current InternationalizationProvider context. Call it with a message key and optional ICU MessageFormat values to get the formatted string in the active locale. Safe to use in render, event handlers, effects, or any code that runs during the parent component\'s lifecycle.',
    },
  ],
  usage: {
    description:
      'Returns a translator function that resolves keys against the current locale, provider overrides, and the shipped English fallback catalog. Call inside a component; the returned function can be used anywhere within that component\'s scope.',
  },
  relatedComponents: ['InternationalizationProvider'],
  importPath: '@astryxdesign/core',
};

/** @type {import('../docs-types').HookTranslationDoc} */
export const docsDense = {
  description:
    'Hook returning a translator function bound to the current InternationalizationProvider context. Call with an ICU MessageFormat key and values to get the formatted string for the active locale.',
  usage: {
    description:
      'Returns a translator function that resolves keys against the current locale, provider overrides, and the shipped English fallback catalog.',
  },
};
