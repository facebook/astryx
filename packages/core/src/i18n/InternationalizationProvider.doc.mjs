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
      'Wraps your app to set the active locale and (optionally) merge additional translation catalogs + per-locale overrides. Astryx components inside the subtree resolve their strings against this context. If no provider is present, components fall back to the shipped English defaults.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use shipped Astryx locale catalogs from `@astryxdesign/core/locales/*` when one exists for your target locale.',
      },
      {
        guidance: true,
        description:
          'Use a same-shape local catalog only when Astryx has not shipped that locale yet or you are testing in-progress translations.',
      },
      {
        guidance: true,
        description:
          'Use real BCP 47 tags such as `fr`, `pt-BR`, or `ar`; regional locales fall back to their base language before English.',
      },
      {
        guidance: false,
        description:
          'Cast custom catalog maps to `any`; the i18n package exports `MessagesByLocale` and `Catalog` for local catalog typing.',
      },
    ],
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
        'Optional map of BCP 47 tag to translation catalog. Import shipped catalogs from `@astryxdesign/core/locales/*`; the shipped "en" catalog is always available and does not need to be listed here.',
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
  examples: [
    {
      label: 'Load a shipped Astryx locale catalog',
      code: `import type {ReactNode} from 'react';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import frFR from '@astryxdesign/core/locales/fr-FR.json';

export function AppI18n({children}: {children: ReactNode}) {
  return (
    <InternationalizationProvider locale="fr-FR" messages={{'fr-FR': frFR}}>
      {children}
    </InternationalizationProvider>
  );
}`,
    },
    {
      label: 'Override one Astryx string',
      code: `import type {ReactNode} from 'react';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';

export function AppI18n({children}: {children: ReactNode}) {
  return (
    <InternationalizationProvider
      locale="en"
      overrides={{
        en: {'@astryx.selector.placeholder': 'Choose...'},
      }}
    >
      {children}
    </InternationalizationProvider>
  );
}`,
    },
    {
      label: 'Provide a local fallback catalog',
      code: `import type {ReactNode} from 'react';
import {
  InternationalizationProvider,
  type MessagesByLocale,
} from '@astryxdesign/core/i18n';
import ptBR from './locales/pt-BR.json';

const messages: MessagesByLocale = {'pt-BR': ptBR};

export function AppI18n({children}: {children: ReactNode}) {
  return (
    <InternationalizationProvider locale="pt-BR" messages={messages}>
      {children}
    </InternationalizationProvider>
  );
}`,
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
