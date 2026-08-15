// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

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
      title: 'Text direction (RTL)',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: "Astryx tracks text direction (`'ltr'` or `'rtl'`) alongside the locale. By default the direction is derived from the `locale` you pass to `<InternationalizationProvider>` via [`Intl.Locale.getTextInfo()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getTextInfo), so RTL locales such as Arabic (`ar`), Hebrew (`he`), Farsi (`fa`), and Urdu (`ur`) resolve to `'rtl'` automatically.",
        },
        {
          type: 'prose',
          text: "You don't wire anything per component. Once the direction is set, astryx components mirror on their own: layout and spacing flip via CSS logical properties, directional icons (chevrons, carets) flip in place, keyboard arrow keys swap left/right, and overlays position on the correct side. Set the direction once and the whole component tree follows.",
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
          text: 'Pass the optional `dir` prop to force a direction. This overrides the locale-derived default; useful for RTL layout testing under an English catalog, or to skip derivation when you already know the direction.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Explicit direction override',
          code: `// force RTL layout while keeping English strings
<InternationalizationProvider locale="en" dir="rtl">
  <App />
</InternationalizationProvider>;`,
        },
        {
          type: 'prose',
          text: "There's one more step: tell the browser about the direction too. Add a `dir` attribute to your page; usually on the `<html>` tag. This is what makes text align to the correct side, punctuation and mixed-language text flow correctly, and layouts mirror. The provider handles astryx components; the `dir` attribute handles everything else on the page.",
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
          text: 'In a plain client app, set the same attribute on `<html>` whenever the locale changes. (`getLocaleDirection()` safely returns `\'ltr\'` for anything it doesn\'t recognize, so you can call it with any locale string.)',
        },
        {
          type: 'prose',
          text: 'To make just one part of a left-to-right page right-to-left; say an Arabic quote or a comment thread; wrap that part in its own `<InternationalizationProvider dir="rtl">` and add `dir="rtl"` to the element around it. Pop-up overlays; menus, dialogs, popovers, tooltips; opened from inside that region mirror too: they position with logical CSS anchor placement, so they land on the correct side and inherit the region\'s direction automatically.',
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
          type: 'prose',
          text: "When you author a component that needs to respond to direction, resolve it from the DOM, not from a render-time JavaScript read, and reach for the lightest tool that works. In priority order:",
        },
        {
          type: 'heading',
          level: 4,
          text: '1. CSS logical properties first',
        },
        {
          type: 'prose',
          text: "Use `insetInlineStart`, `paddingInlineEnd`, `marginInline`, and friends instead of physical `left`/`right`. Most mirroring needs nothing more; the browser flips it from the ambient `dir`. The `@astryx/no-physical-properties` ESLint rule enforces this.",
        },
        {
          type: 'heading',
          level: 4,
          text: '2. Directional icons: mirror with CSS, not a name-swap',
        },
        {
          type: 'prose',
          text: "Render one fixed glyph and wrap it in the shared `rtlStyles.mirror` (a `scaleX(-1)` that only applies under `[dir=\"rtl\"]`). It flips from the ancestor `dir` through the cascade, so it works on the server with no hydration flash. Do not pick `chevronLeft` vs `chevronRight` in JS. This is how Pagination, Calendar, and Carousel handle their chevrons.",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Mirror a directional icon with CSS',
          code: `import * as stylex from '@stylexjs/stylex';
import {rtlStyles} from '@astryxdesign/core';

function NextButton() {
  // One glyph; CSS flips it under RTL. No direction read.
  return (
    <span {...stylex.props(rtlStyles.mirror)}>
      <Icon icon="chevronRight" />
    </span>
  );
}`,
        },
        {
          type: 'heading',
          level: 4,
          text: '3. Behavioral logic: read the DOM lazily, on the event',
        },
        {
          type: 'prose',
          text: "For things CSS can't express; keyboard arrow-key mapping, drag/scroll math; read direction at interaction time with `isRtlElement(el)` (a `getComputedStyle().direction` check), never during render. The focus primitives (`useListFocus`, `useGridFocus`, `useTreeFocus`) already auto-detect direction from their container, so arrow keys flip for free; don't pass a direction flag to them. (`isRtl` on `useListFocus`/`useGridFocus` is deprecated in favor of auto-detection, and new hooks don't accept it.)",
        },
        {
          type: 'heading',
          level: 4,
          text: '4. useDirection() context: the last resort',
        },
        {
          type: 'prose',
          text: "Reach for it only when you genuinely need the direction value during render and none of the above fit. It's SSR-safe and returns `'ltr'` outside a provider (matching `useTranslator`'s silent fallback), but it's the one path that can mismatch on hydration if the provider's `direction` disagrees with `<html dir>`; so prefer the options above, which resolve purely from the DOM. As of the CSS-mirror migration, no astryx component reads direction from context at render time.",
        },
        {
          type: 'heading',
          level: 3,
          text: 'Translators',
        },
        {
          type: 'prose',
          text: 'Crowdin is the preferred way to contribute; [join a language](https://crowdin.com/project/astryx), translate strings in the web UI, and your work syncs back to the repo without opening a PR. Direct PRs against `packages/core/locales/*.json` also work if you prefer that flow.',
        },
      ],
    },
  ],
};
