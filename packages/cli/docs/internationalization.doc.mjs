// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'internationalization',
  title: 'Internationalization',
  category: 'guide',
  description:
    'Set the active locale for astryx components, load locale catalogs, coexist with your own i18n library, swap languages at runtime, and test translations with the pseudo locale.',

  sections: [
    {
      title: 'Quick Start',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Internationalization ships with `@astryxdesign/core`. There is nothing to install. Wrap your app in `<InternationalizationProvider>` and set the active `locale`; astryx components pick up localized strings from that provider.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Wrap your app',
          code: `import {InternationalizationProvider} from '@astryxdesign/core/i18n';

function App() {
  return (
    <InternationalizationProvider locale="en">
      <YourApp />
    </InternationalizationProvider>
  );
}`,
        },
        {
          type: 'prose',
          text: 'The provider always has the built-in English catalog. Pass additional catalogs through `messages` when you enable another locale.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Load an astryx locale catalog',
          code: `import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import fr from '@astryxdesign/core/locales/fr.json';

<InternationalizationProvider locale="fr" messages={{fr}}>
  <App />
</InternationalizationProvider>;`,
        },
        {
          type: 'prose',
          text: 'Astryx ships English today, with first-party translations for other locales on the roadmap. Until a locale is available from `@astryxdesign/core/locales/*`, apps can pass a local catalog with the same shape. See `@astryxdesign/core/locales/en.json` for the current key inventory. Missing keys fall back through the locale chain to English (for example, `pt-BR` walks to `pt`, then to shipped `en`).',
        },
        {
          type: 'prose',
          text: 'Locale catalogs only affect astryx strings. Your app can continue using its own i18n system for product copy.',
        },
      ],
    },
    {
      title: 'Runtime language swap',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Re-render `<InternationalizationProvider>` with a new `locale` prop and every astryx string updates live. No reload, no separate API call.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Toggle between locales',
          code: `const [locale, setLocale] = useState<'en' | 'fr'>('en');

<InternationalizationProvider locale={locale} messages={{fr}}>
  <Button
    label={locale === 'en' ? 'Français' : 'English'}
    onClick={() => setLocale(l => (l === 'en' ? 'fr' : 'en'))}
  />
  <App />
</InternationalizationProvider>;`,
        },
        {
          type: 'prose',
          text: "Persisting the user's choice (localStorage, cookie, URL segment, account setting) is up to the consumer. Astryx reads whatever `locale` you pass in.",
        },
      ],
    },
    {
      title: "Overriding astryx's default text",
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Use `overrides` to change individual strings without shipping a full catalog. Overrides are keyed by locale and merged on top of the built-in and user-supplied catalogs.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Change one string in English',
          code: `<InternationalizationProvider
  locale="en"
  overrides={{en: {'@astryx.pagination.next': 'Next →'}}}
>
  <App />
</InternationalizationProvider>`,
        },
        {
          type: 'prose',
          text: 'Overrides win over both bundled English and any `messages` catalog for the same key. Use them for brand voice tweaks or one-off wording changes.',
        },
      ],
    },
    {
      title: 'Using astryx with your own i18n library',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: "Astryx components render astryx strings through astryx's provider. Consumer components render consumer strings through whatever i18n library you already use: react-intl, i18next, next-intl, LinguiJS, and so on. The two systems coexist and read from the same source of truth for the active locale.",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Astryx + react-intl side by side',
          code: `import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {Selector} from '@astryxdesign/core/Selector';
import {Button} from '@astryxdesign/core/Button';
import {FormattedMessage, IntlProvider, useIntl} from 'react-intl';
import astryxFr from './locales/astryx/fr.json'; // astryx's UI, in French
import appFr from './locales/app/fr.json';       // your app strings, in French

function Pricing() {
  // Consumer strings — resolved by react-intl.
  const intl = useIntl();

  return (
    <section>
      <h1><FormattedMessage id="pricing.heading" /></h1>

      {/* Astryx Selector — trigger placeholder, search-box placeholder,
          clear-button aria-label all resolved by
          <InternationalizationProvider>. Options come from react-intl. */}
      <Selector
        label={intl.formatMessage({id: 'pricing.region.label'})}
        options={[
          {value: 'na', label: intl.formatMessage({id: 'pricing.region.na'})},
          {value: 'eu', label: intl.formatMessage({id: 'pricing.region.eu'})},
        ]}
        hasSearch
        hasClear
      />

      <Button label={intl.formatMessage({id: 'pricing.cta.subscribe'})} />
    </section>
  );
}

export default function App() {
  return (
    // Same locale, two providers reading their own catalogs.
    <IntlProvider locale="fr" messages={appFr}>
      <InternationalizationProvider locale="fr" messages={{fr: astryxFr}}>
        <Pricing />
      </InternationalizationProvider>
    </IntlProvider>
  );
}`,
        },
        {
          type: 'prose',
          text: 'Keep the two providers in sync on locale, and each library owns its own catalog. Astryx never sees your app strings, and your i18n library never sees astryx internals. Runtime locale swap works the same way: re-render both providers with a new `locale` prop and the whole tree updates live.',
        },
        {
          type: 'prose',
          text: "Single-catalog usage (where an external i18n runtime like react-intl or i18next resolves both your app strings AND astryx's strings through one provider) is on the roadmap via a `Translator` adapter. Track [facebook/astryx#4029](https://github.com/facebook/astryx/issues/4029). For now, run the two providers side by side as shown above.",
        },
      ],
    },
    {
      title: 'Using astryx as your i18n library',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: "For production apps with substantial localization needs, we recommend a dedicated i18n library such as react-intl, i18next, next-intl, or LinguiJS. If your app is small or you do not want another runtime, you can resolve your own strings through astryx too. Keep app keys in a separate namespace from `@astryx.*`, and include your own `en` catalog because astryx's built-in English fallback only contains astryx component strings.",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Translate app strings with astryx',
          code: `import {Button} from '@astryxdesign/core/Button';
import {
  InternationalizationProvider,
  useTranslator,
  type Catalog,
  type MessagesByLocale,
} from '@astryxdesign/core/i18n';

const en: Catalog = {
  '@myapp.actions.save': {defaultMessage: 'Save'},
};

const fr: Catalog = {
  '@myapp.actions.save': {defaultMessage: 'Enregistrer'},
};

const messages: MessagesByLocale = {en, fr};

function SaveButton() {
  const t = useTranslator();
  return <Button label={t('@myapp.actions.save')} />;
}

export default function App() {
  return (
    <InternationalizationProvider locale="fr" messages={messages}>
      <SaveButton />
    </InternationalizationProvider>
  );
}`,
        },
        {
          type: 'prose',
          text: '`Catalog` types a single locale file; `MessagesByLocale` types the map passed to `messages`. A catalog entry uses the same `{defaultMessage, description?}` shape as `@astryxdesign/core/locales/en.json`.',
        },
      ],
    },
    {
      title: 'Testing your translations',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Astryx generates a `pseudo` locale that wraps every string in `⟦…⟧` and replaces letters with accented look-alikes. Switch to it in development to catch hardcoded astryx strings and layout issues caused by longer text.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Turn on pseudo-localization',
          code: `import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import pseudo from '@astryxdesign/core/locales/pseudo.json';

<InternationalizationProvider locale="pseudo" messages={{pseudo}}>
  <App />
</InternationalizationProvider>;`,
        },
      ],
    },
    {
      title: 'For contributors',
      category: 'guide',
      content: [
        {
          type: 'heading',
          level: 3,
          text: 'Developers',
        },
        {
          type: 'prose',
          text: 'Astryx component authors read strings with `useTranslator()` rather than hardcoding user-facing text.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Read an astryx string',
          code: `import {useTranslator} from '@astryxdesign/core/i18n';

function SaveButton() {
  const t = useTranslator();
  return <button>{t('@astryx.actions.save')}</button>;
}`,
        },
        {
          type: 'prose',
          text: "Astryx's own strings live in `packages/core/locales/en.json`. New user-facing strings must go through `useTranslator`; this is enforced by the `@astryx/no-hardcoded-i18n-string` ESLint rule. See the AI contribution guide for the alias-and-resolve pattern used when adding new keys.",
        },
        {
          type: 'heading',
          level: 3,
          text: 'Translators',
        },
        {
          type: 'prose',
          text: 'Crowdin is the preferred way to contribute — [join a language](https://crowdin.com/project/astryx), translate strings in the web UI, and your work syncs back to the repo without opening a PR. Direct PRs against `packages/core/locales/*.json` also work if you prefer that flow.',
        },
      ],
    },
  ],
};
