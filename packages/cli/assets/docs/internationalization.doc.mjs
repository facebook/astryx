// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'internationalization',
  title: 'Internationalization',
  category: 'guide',
  description:
    'Set the active locale for astryx components, load locale catalogs, coexist with your own i18n library, swap languages at runtime, and test translations with the pseudo locale.',
  keywords: ['translate', 'translation', 'language', 'locale'],

  sections: [
    {
      id: 'quick-start',
      title: 'Set the locale',
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
import frFR from '@astryxdesign/core/locales/fr-FR.json';

<InternationalizationProvider locale="fr-FR" messages={{'fr-FR': frFR}}>
  <App />
</InternationalizationProvider>;`,
        },
        {
          type: 'prose',
          text: 'Astryx ships catalogs for 30 locales in `@astryxdesign/core/locales/*.json`: English (`en`) and region-tagged translations such as `fr-FR`, `ja-JP`, and `ar-SA`, plus `pseudo`. For any other locale, pass a catalog shaped like `en.json`. Missing keys fall back through the locale chain to English: `pt-BR` walks to `pt`, then to the built-in `en`. The chain only drops a region, so `fr` never finds `fr-FR`; pass the region-tagged name.',
        },
        {
          type: 'prose',
          text: 'Locale catalogs only affect astryx strings. Your app can continue using its own i18n system for product copy.',
        },
      ],
    },
    {
      id: 'runtime-language-swap',
      title: 'Change the language at runtime',
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
          code: `const [locale, setLocale] = useState<'en' | 'fr-FR'>('en');

<InternationalizationProvider locale={locale} messages={{'fr-FR': frFR}}>
  <Button
    label={locale === 'en' ? 'Français' : 'English'}
    onClick={() => setLocale(l => (l === 'en' ? 'fr-FR' : 'en'))}
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
      title: 'Text direction (RTL)',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: "Astryx tracks text direction (`'ltr'` or `'rtl'`) alongside the locale. By default the direction is derived from the `locale` you pass to `<InternationalizationProvider>` via [`Intl.Locale.getTextInfo()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getTextInfo), so RTL locales such as Arabic (`ar`), Hebrew (`he`), Farsi (`fa`), and Urdu (`ur`) resolve to `'rtl'` automatically.",
        },
        {
          type: 'prose',
          text: "You don't wire anything per component. Once the page's `dir` attribute is set (see below), astryx components mirror on their own: layout and spacing flip via CSS logical properties, directional icons (chevrons, carets) flip in place, keyboard arrow keys swap left/right, and overlays position on the correct side. Set the direction once and the whole component tree follows.",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Direction derived from locale',
          code: `import {InternationalizationProvider} from '@astryxdesign/core/i18n';

// direction resolves to 'rtl' automatically from the Arabic locale
<InternationalizationProvider locale="ar">
  <App />
</InternationalizationProvider>;`,
        },
        {
          type: 'prose',
          text: 'Pass the optional `dir` prop to force the direction the provider reports (for example, through `useDirection()`). It overrides the locale-derived default: use it to test RTL under an English catalog, together with `dir="rtl"` on the page, or to skip derivation when you already know the direction.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Explicit direction override',
          code: `// direction for useDirection(); set dir="rtl" on <html> to mirror layout
<InternationalizationProvider locale="en" dir="rtl">
  <App />
</InternationalizationProvider>;`,
        },
        {
          type: 'prose',
          text: "There's one more step: tell the browser about the direction too. Add a `dir` attribute to your page; usually on the `<html>` tag. This is what makes text align to the correct side, punctuation and mixed-language text flow correctly, and layouts mirror. Astryx components mirror from this attribute too; the provider's `dir` does not set it.",
        },
        {
          type: 'prose',
          text: "Astryx doesn't set `dir` for you; you set it, alongside the same direction you pass to the provider. If your app is server-rendered (like Next.js), the `getLocaleDirection()` helper computes the direction from a locale so you can set it while the page renders:",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Set <html dir> in a Next.js root layout',
          code: `import {getLocaleDirection} from '@astryxdesign/core/i18n';

export default function RootLayout({children, params}) {
  const {locale} = params;
  return (
    <html lang={locale} dir={getLocaleDirection(locale)}>
      <body>{children}</body>
    </html>
  );
}`,
        },
        {
          type: 'prose',
          text: "In a plain client app, set the same attribute on `<html>` whenever the locale changes. (`getLocaleDirection()` safely returns `'ltr'` for anything it doesn't recognize, so you can call it with any locale string.)",
        },
        {
          type: 'prose',
          text: 'To make just one part of a left-to-right page right-to-left; say an Arabic quote or a comment thread; wrap that part in its own `<InternationalizationProvider dir="rtl">` and add `dir="rtl"` to the element around it. Pop-up overlays; menus, dialogs, popovers, tooltips; opened from inside that region mirror too: they position with logical CSS anchor placement, so they land on the correct side and inherit the region\'s direction automatically.',
        },
      ],
    },
    {
      id: 'override-text',
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
      id: 'own-i18n-library',
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
import astryxFr from '@astryxdesign/core/locales/fr-FR.json'; // astryx's UI, in French
import appFr from './locales/app/fr.json'; // your app strings, in French

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
    <IntlProvider locale="fr-FR" messages={appFr}>
      <InternationalizationProvider locale="fr-FR" messages={{'fr-FR': astryxFr}}>
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
          text: 'Astryx does not route its strings through another i18n runtime; run the two providers side by side as shown above.',
        },
      ],
    },
    {
      id: 'astryx-as-i18n',
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
          text: 'Astryx generates a `pseudo` locale that wraps every string in `⟦…⟧` and replaces letters with accented look-alikes. Turn it on in development to catch hardcoded astryx strings and layout issues caused by longer text.',
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
  ],
};
