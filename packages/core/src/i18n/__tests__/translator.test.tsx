// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file translator.test.tsx
 * @input packages/core/src/i18n/resolve.ts,
 *   packages/core/src/i18n/InternationalizationProvider.tsx
 * @output Tests for the optional consumer-supplied `Translator` adapter
 * @position Unit + integration tests for the adapter seam (#4029). resolve.ts
 *   keeps astryx's own lookup chain (overrides → catalog → parent locale →
 *   shipped en) and delegates ONLY the formatting step, so these tests assert
 *   what the translator RECEIVES as much as what it returns — and that every
 *   resolved message reaches it, not just the ones carrying values.
 */

import {describe, test, expect, beforeEach, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {__resetForTests, resolve} from '../resolve';
import {InternationalizationProvider} from '../InternationalizationProvider';
import {useTranslator, type TranslatorFn} from '../useTranslator';
import {Pagination} from '../../Pagination';
import type {Translator} from '../translator';
import type {MessagesByLocale, Overrides} from '../types';

beforeEach(() => {
  __resetForTests();
});

/**
 * A stub standing in for react-intl / i18next / Lingui. It records every call
 * so tests can assert astryx handed over an already-RESOLVED ICU message
 * rather than a raw `@astryx.*` key.
 */
function makeTranslator(
  impl: (
    message: string,
    values?: Record<string, unknown>,
    locale?: string,
  ) => string = message => `[${message}]`,
) {
  const format = vi.fn(impl);
  const translator: Translator = {format};
  return {translator, format};
}

/** The lie an untyped consumer adapter tells: `format` promises a string. */
const badTranslator = (value: unknown): Translator => ({
  format: () => value as string,
});

describe('resolve — translator receives a resolved message, not a key', () => {
  test('hands the shipped en message to the translator when the locale has no catalog', () => {
    // fr has no catalog and no override, so astryx's own chain falls back to
    // the shipped en entry. The translator must see THAT string — if it saw
    // '@astryx.pagination.goToPage' the lookup would have leaked out of
    // astryx and every consumer would have to re-implement the fallback.
    const {translator, format} = makeTranslator();

    resolve(
      '@astryx.pagination.goToPage',
      {page: 5},
      'fr',
      {},
      undefined,
      translator,
    );

    expect(format).toHaveBeenCalledTimes(1);
    expect(format).toHaveBeenCalledWith(
      'Go to page {page, number}',
      {page: 5},
      'fr',
    );
  });

  test('hands the provider catalog message to the translator when one exists', () => {
    const {translator, format} = makeTranslator();
    const messages: MessagesByLocale = {
      fr: {
        '@astryx.pagination.goToPage': {
          defaultMessage: 'Aller à la page {page, number}',
        },
      },
    };

    resolve(
      '@astryx.pagination.goToPage',
      {page: 5},
      'fr',
      messages,
      undefined,
      translator,
    );

    expect(format).toHaveBeenCalledWith(
      'Aller à la page {page, number}',
      {page: 5},
      'fr',
    );
  });

  test('overrides still win before the translator is reached', () => {
    const {translator, format} = makeTranslator();
    const messages: MessagesByLocale = {
      fr: {
        '@astryx.pagination.goToPage': {
          defaultMessage: 'Aller à la page {page, number}',
        },
      },
    };
    const overrides: Overrides = {
      fr: {'@astryx.pagination.goToPage': 'Page {page, number}'},
    };

    resolve(
      '@astryx.pagination.goToPage',
      {page: 5},
      'fr',
      messages,
      overrides,
      translator,
    );

    expect(format).toHaveBeenCalledWith('Page {page, number}', {page: 5}, 'fr');
  });

  test('regional locale walks pt-BR → pt inside astryx before delegating', () => {
    const {translator, format} = makeTranslator();
    const messages: MessagesByLocale = {
      pt: {
        '@astryx.pagination.goToPage': {
          defaultMessage: 'Ir para a página {page, number}',
        },
      },
    };

    resolve(
      '@astryx.pagination.goToPage',
      {page: 2},
      'pt-BR',
      messages,
      undefined,
      translator,
    );

    expect(format).toHaveBeenCalledWith(
      'Ir para a página {page, number}',
      {page: 2},
      'pt-BR',
    );
  });
});

describe('resolve — the translator formats messages that have values', () => {
  test('returns the translator output instead of the built-in ICU result', () => {
    const {translator} = makeTranslator(
      (message, values) => `translated:${message}:${JSON.stringify(values)}`,
    );

    const out = resolve(
      '@astryx.pagination.goToPage',
      {page: 7},
      'en',
      {},
      undefined,
      translator,
    );

    expect(out).toBe('translated:Go to page {page, number}:{"page":7}');
  });

  test('the built-in intl-messageformat runtime is bypassed entirely', () => {
    // A translator that ignores ICU syntax proves the built-in formatter never
    // ran — the raw braces would otherwise have been interpolated away.
    const {translator} = makeTranslator(message => message);

    const out = resolve(
      '@astryx.pagination.count',
      {from: 1, to: 10, total: 1000},
      'en-US',
      {},
      undefined,
      translator,
    );

    expect(out).toBe('{from, number}–{to, number} of {total, number}');
    expect(out).not.toContain('1,000');
  });
});

describe('resolve — every resolved message reaches the translator', () => {
  test('a value-less message is handed over too, with values undefined', () => {
    // 171 of astryx's 228 `t()` callsites pass no values. If those skipped the
    // translator, a consumer's runtime would own a quarter of the UI's strings
    // and silently miss the rest — including "Close", "Cancel", "Search".
    const {translator, format} = makeTranslator();

    const out = resolve(
      '@astryx.pagination.next',
      undefined,
      'en',
      {},
      undefined,
      translator,
    );

    expect(format).toHaveBeenCalledWith('Go to next page', undefined, 'en');
    expect(out).toBe('[Go to next page]');
  });

  test('the bundled formatter is skipped for value-less messages too', () => {
    // No translator, no values → the ICU parser must still never run.
    const out = resolve(
      '@astryx.pagination.next',
      undefined,
      'en',
      {},
      undefined,
    );

    expect(out).toBe('Go to next page');
  });

  test('a missing key returns the key and never reaches the translator', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const {translator, format} = makeTranslator();

    const out = resolve(
      '@astryx.does.not.exist',
      {a: 1},
      'en',
      {},
      undefined,
      translator,
    );

    expect(out).toBe('@astryx.does.not.exist');
    expect(format).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('resolve — a misbehaving translator cannot poison the output', () => {
  // `Translator.format` is TYPED to return a string, but a translator is
  // consumer code and nothing enforces the type at runtime. react-intl hands
  // back a ReactNode[] for rich-text messages; i18next can return null/undefined
  // for a miss. astryx's output lands in aria-label and title, where a
  // non-string stringifies to "[object Object]" or drops the attribute — a
  // silent accessibility regression. Degrade to the resolved message instead.
  const badReturns: {name: string; value: unknown}[] = [
    {name: 'undefined (i18next missing-key handler)', value: undefined},
    {name: 'null (i18next returnNull)', value: null},
    {
      name: 'a ReactNode[] (react-intl rich text)',
      value: ['Go to ', {}, ' page'],
    },
    {name: 'a number', value: 42},
  ];

  for (const {name, value} of badReturns) {
    test(`falls back to the resolved message when format returns ${name}`, () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const translator = badTranslator(value);

      const out = resolve(
        '@astryx.pagination.goToPage',
        {page: 5},
        'en',
        {},
        undefined,
        translator,
      );

      expect(out).toBe('Go to page {page, number}');
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0]?.[0]).toContain('astryx-i18n');
      warn.mockRestore();
    });
  }

  test('an empty string is a legitimate translation, not a failure', () => {
    // A truthiness check would swallow this; the guard is a typeof check.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const {translator} = makeTranslator(() => '');

    const out = resolve(
      '@astryx.pagination.next',
      undefined,
      'en',
      {},
      undefined,
      translator,
    );

    expect(out).toBe('');
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  test('warns once per key, not once per render', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const translator = badTranslator(undefined);

    for (let i = 0; i < 5; i++) {
      resolve(
        '@astryx.pagination.next',
        undefined,
        'en',
        {},
        undefined,
        translator,
      );
    }

    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  test('a null translator means "no translator", not a crash', () => {
    // The prop is typed optional, so TS callers cannot pass null — but a JS
    // consumer writing `translator={enabled ? myTranslator : null}` can, and
    // reading `.format` off null would take down every astryx string in the
    // tree. Treated the same as omitting the prop.
    const out = resolve(
      '@astryx.pagination.goToPage',
      {page: 5},
      'en',
      {},
      undefined,
      null as unknown as Translator,
    );

    expect(out).toBe('Go to page 5');
  });

  test('a translator that throws is not swallowed', () => {
    // Astryx does not wrap consumer code in a try/catch: a broken adapter is a
    // build-time bug the app owner must see, not a string astryx should guess
    // at. Pinned so nobody "helpfully" adds a catch that hides it.
    const boom = new Error('adapter blew up');
    const translator: Translator = {
      format: () => {
        throw boom;
      },
    };

    expect(() =>
      resolve(
        '@astryx.pagination.next',
        undefined,
        'en',
        {},
        undefined,
        translator,
      ),
    ).toThrow(boom);
  });
});

describe('resolve — no translator means byte-identical behavior', () => {
  const cases: {
    name: string;
    key: string;
    values: Record<string, unknown> | undefined;
    locale: string;
    messages: MessagesByLocale;
    overrides: Overrides | undefined;
  }[] = [
    {
      name: 'shipped en, no values',
      key: '@astryx.pagination.next',
      values: undefined,
      locale: 'en',
      messages: {},
      overrides: undefined,
    },
    {
      name: 'ICU number formatting under en-US',
      key: '@astryx.pagination.count',
      values: {from: 1, to: 10, total: 1000},
      locale: 'en-US',
      messages: {},
      overrides: undefined,
    },
    {
      name: 'ICU number formatting under de-DE',
      key: '@astryx.pagination.count',
      values: {from: 1, to: 10, total: 1000},
      locale: 'de-DE',
      messages: {},
      overrides: undefined,
    },
    {
      name: 'provider catalog + locale chain',
      key: '@astryx.pagination.goToPage',
      values: {page: 3},
      locale: 'pt-BR',
      messages: {
        pt: {
          '@astryx.pagination.goToPage': {
            defaultMessage: 'Página {page, number}',
          },
        },
      },
      overrides: undefined,
    },
    {
      name: 'override wins',
      key: '@astryx.pagination.next',
      values: undefined,
      locale: 'fr',
      messages: {},
      overrides: {fr: {'@astryx.pagination.next': 'Suivant'}},
    },
  ];

  const expected: Record<string, string> = {
    'shipped en, no values': 'Go to next page',
    'ICU number formatting under en-US': '1–10 of 1,000',
    'ICU number formatting under de-DE': '1–10 of 1.000',
    'provider catalog + locale chain': 'Página 3',
    'override wins': 'Suivant',
  };

  for (const c of cases) {
    test(`omitting translator keeps today's output — ${c.name}`, () => {
      const withoutArg = resolve(
        c.key,
        c.values,
        c.locale,
        c.messages,
        c.overrides,
      );
      __resetForTests();
      const withUndefined = resolve(
        c.key,
        c.values,
        c.locale,
        c.messages,
        c.overrides,
        undefined,
      );

      expect(withoutArg).toBe(expected[c.name]);
      expect(withUndefined).toBe(expected[c.name]);
    });
  }

  test('the formatter cache is still used when no translator is supplied', () => {
    // Two identical calls must produce identical output; the second is served
    // from formatterCache. A regression here would show up as a throw or a
    // changed string, not a silent slowdown.
    const first = resolve(
      '@astryx.pagination.goToPage',
      {page: 1},
      'en',
      {},
      undefined,
    );
    const second = resolve(
      '@astryx.pagination.goToPage',
      {page: 2},
      'en',
      {},
      undefined,
    );
    expect(first).toBe('Go to page 1');
    expect(second).toBe('Go to page 2');
  });
});

describe('InternationalizationProvider — translator prop', () => {
  test('threads the translator down to astryx components', () => {
    const {translator, format} = makeTranslator(message => `«${message}»`);

    render(
      <InternationalizationProvider locale="en" translator={translator}>
        <Pagination
          page={2}
          totalItems={100}
          pageSize={10}
          onChange={() => {}}
          variant="count"
        />
      </InternationalizationProvider>,
    );

    // `count` carries values, so it goes through the translator verbatim.
    expect(
      screen.getByText('«{from, number}–{to, number} of {total, number}»'),
    ).toBeInTheDocument();

    // Every message handed over is a resolved ICU string, never a key.
    for (const call of format.mock.calls) {
      expect(call[0]).not.toMatch(/^@astryx\./);
    }
  });

  test('value-less strings go through the translator too', () => {
    const {translator} = makeTranslator(message => `«${message}»`);

    render(
      <InternationalizationProvider locale="en" translator={translator}>
        <Pagination
          page={2}
          totalItems={100}
          pageSize={10}
          onChange={() => {}}
        />
      </InternationalizationProvider>,
    );

    // Button labels and the nav label carry no values — they still reach the
    // consumer's runtime, so a single catalog can own every astryx string.
    expect(
      screen.getByRole('button', {name: '«Go to next page»'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', {name: '«Pagination»'}),
    ).toBeInTheDocument();
  });

  test('swapping the translator prop re-renders with the new one', () => {
    // The provider memo and useTranslator's useCallback both list `translator`
    // in their deps. Trim either and a live swap silently stops propagating.
    const {translator: first} = makeTranslator(message => `«${message}»`);
    const {translator: second} = makeTranslator(message => `‹${message}›`);
    const tree = (t: Translator) => (
      <InternationalizationProvider locale="en" translator={t}>
        <Pagination
          page={2}
          totalItems={100}
          pageSize={10}
          onChange={() => {}}
        />
      </InternationalizationProvider>
    );

    const {rerender} = render(tree(first));
    expect(
      screen.getByRole('button', {name: '«Go to next page»'}),
    ).toBeInTheDocument();

    rerender(tree(second));
    expect(
      screen.getByRole('button', {name: '‹Go to next page›'}),
    ).toBeInTheDocument();
  });

  test('a runtime locale swap reaches the translator', () => {
    const {translator, format} = makeTranslator(message => message);
    const messages: MessagesByLocale = {
      de: {'@astryx.pagination.next': {defaultMessage: 'Nächste Seite'}},
    };
    const tree = (locale: string) => (
      <InternationalizationProvider
        locale={locale}
        messages={messages}
        translator={translator}>
        <Pagination
          page={2}
          totalItems={100}
          pageSize={10}
          onChange={() => {}}
        />
      </InternationalizationProvider>
    );

    const {rerender} = render(tree('en'));
    expect(format).toHaveBeenCalledWith('Go to next page', undefined, 'en');

    rerender(tree('de'));
    // The new locale AND the message its catalog resolved to, together.
    expect(format).toHaveBeenCalledWith('Nächste Seite', undefined, 'de');
    expect(
      screen.getByRole('button', {name: 'Nächste Seite'}),
    ).toBeInTheDocument();
  });

  test('a nested provider replaces the parent context, translator included', () => {
    // Matches how `messages` and `overrides` already behave — a nested provider
    // REPLACES rather than merges. Pinned so changing it is a deliberate act,
    // because the failure is silent: the subtree quietly reverts to the
    // bundled runtime.
    const {translator, format} = makeTranslator(message => `«${message}»`);

    render(
      <InternationalizationProvider locale="en" translator={translator}>
        <InternationalizationProvider locale="en">
          <Pagination
            page={2}
            totalItems={100}
            pageSize={10}
            onChange={() => {}}
          />
        </InternationalizationProvider>
      </InternationalizationProvider>,
    );

    expect(
      screen.getByRole('button', {name: 'Go to next page'}),
    ).toBeInTheDocument();
    expect(format).not.toHaveBeenCalled();
  });

  test('no translator prop leaves rendered output unchanged', () => {
    render(
      <InternationalizationProvider locale="en-US">
        <Pagination
          page={2}
          totalItems={10000}
          pageSize={10}
          onChange={() => {}}
          variant="count"
        />
      </InternationalizationProvider>,
    );

    expect(screen.getByText(/10,000/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Go to next page'}),
    ).toBeInTheDocument();
  });
});

describe('resolve — odd locales pass through to the translator unchanged', () => {
  const NEXT = '@astryx.pagination.next';
  const oddLocales: {name: string; locale: string}[] = [
    {name: 'a deep chain (zh-Hans-CN)', locale: 'zh-Hans-CN'},
    {name: 'mixed case (PT-br)', locale: 'PT-br'},
    {name: 'an empty string', locale: ''},
    {name: 'a malformed tag', locale: 'not a locale!!'},
  ];

  for (const {name, locale} of oddLocales) {
    test(`hands over the resolved message and ${name} verbatim`, () => {
      // astryx canonicalizes internally for LOOKUP (resolveLocaleChain), but
      // the translator is handed the tag the app actually passed — same as the
      // bundled formatter gets. A consumer normalizing on their side needs to
      // know they own that.
      const {translator, format} = makeTranslator();

      const out = resolve(NEXT, undefined, locale, {}, undefined, translator);

      expect(format).toHaveBeenCalledWith('Go to next page', undefined, locale);
      expect(out).toBe('[Go to next page]');
    });
  }

  test('a mixed-case tag still resolves through its canonical catalog', () => {
    // Lookup canonicalizes: PT-br → pt-BR → pt. The catalog is keyed `pt`.
    const {translator, format} = makeTranslator();
    const messages: MessagesByLocale = {
      pt: {[NEXT]: {defaultMessage: 'Próxima página'}},
    };

    resolve(NEXT, undefined, 'PT-br', messages, undefined, translator);

    expect(format).toHaveBeenCalledWith('Próxima página', undefined, 'PT-br');
  });
});

describe('resolve — lookup edges the translator inherits', () => {
  const NEXT = '@astryx.pagination.next';

  test('an empty catalog string is a real translation, not a missing key', () => {
    // `entry !== undefined` is the miss test, not truthiness — a deliberately
    // blank string (e.g. a label a locale wants hidden) must survive.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const {translator, format} = makeTranslator(message => `[${message}]`);
    const messages: MessagesByLocale = {fr: {[NEXT]: {defaultMessage: ''}}};

    const out = resolve(NEXT, undefined, 'fr', messages, undefined, translator);

    expect(format).toHaveBeenCalledWith('', undefined, 'fr');
    expect(out).toBe('[]');
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  test('an override on the PARENT locale beats a catalog on the exact locale', () => {
    // Overrides walk the whole chain before catalogs are consulted at all, so
    // `overrides.pt` outranks `messages['pt-BR']`. The translator sees the winner.
    const {translator, format} = makeTranslator();
    const messages: MessagesByLocale = {
      'pt-BR': {[NEXT]: {defaultMessage: 'Próxima (BR)'}},
    };
    const overrides: Overrides = {pt: {[NEXT]: 'Próxima (override pt)'}};

    resolve(NEXT, undefined, 'pt-BR', messages, overrides, translator);

    expect(format).toHaveBeenCalledWith(
      'Próxima (override pt)',
      undefined,
      'pt-BR',
    );
  });

  test('a partial catalog falls through to English while keeping the asked-for locale', () => {
    // The everyday case, and the one the `locale` docblock warns about: the app
    // is on fr, this key is not translated, so the translator gets ENGLISH text
    // labelled 'fr'. Executable proof of the documented caveat.
    const {translator, format} = makeTranslator();
    const messages: MessagesByLocale = {
      fr: {'@astryx.pagination.previous': {defaultMessage: 'Page précédente'}},
    };

    resolve(NEXT, undefined, 'fr', messages, undefined, translator);

    expect(format).toHaveBeenCalledWith('Go to next page', undefined, 'fr');
  });

  test('an override that introduces placeholders is handed over unformatted', () => {
    // The callsite passes no values, so nothing can fill `{n}` — astryx does
    // not invent them. With a translator it is the adapter's call what to do;
    // without one the braces render literally, exactly as before this seam.
    const overrides: Overrides = {en: {[NEXT]: 'Next {n}'}};
    const {translator, format} = makeTranslator(message => message);

    const translated = resolve(
      NEXT,
      undefined,
      'en',
      {},
      overrides,
      translator,
    );
    const bundled = resolve(NEXT, undefined, 'en', {}, overrides);

    expect(format).toHaveBeenCalledWith('Next {n}', undefined, 'en');
    expect(translated).toBe('Next {n}');
    expect(bundled).toBe('Next {n}');
  });

  test('warnOnce dedups per key, so a second bad key still warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const translator = badTranslator(undefined);

    resolve(NEXT, undefined, 'en', {}, undefined, translator);
    resolve(NEXT, undefined, 'en', {}, undefined, translator);
    resolve(
      '@astryx.pagination.previous',
      undefined,
      'en',
      {},
      undefined,
      translator,
    );

    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  test('a boxed String is not a string', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // A boxed String is `typeof 'object'` — truthy, and it stringifies fine,
    // so a truthiness guard would wave it through into an aria-label.
    const translator = badTranslator(new String('boxed'));

    expect(resolve(NEXT, undefined, 'en', {}, undefined, translator)).toBe(
      'Go to next page',
    );
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});

describe('InternationalizationProvider — translator lifecycle edges', () => {
  const renderPagination = () => (
    <Pagination page={2} totalItems={100} pageSize={10} onChange={() => {}} />
  );

  test('removing the translator mid-flight reverts to the bundled runtime', () => {
    const {translator} = makeTranslator(message => `«${message}»`);
    const tree = (t?: Translator) => (
      <InternationalizationProvider locale="en" translator={t}>
        {renderPagination()}
      </InternationalizationProvider>
    );

    const {rerender} = render(tree(translator));
    expect(
      screen.getByRole('button', {name: '«Go to next page»'}),
    ).toBeInTheDocument();

    rerender(tree(undefined));
    expect(
      screen.getByRole('button', {name: 'Go to next page'}),
    ).toBeInTheDocument();
  });

  test('an inner provider with its own translator wins over the outer one', () => {
    const {translator: outer, format: outerFormat} = makeTranslator(
      message => `«${message}»`,
    );
    const {translator: inner} = makeTranslator(message => `‹${message}›`);

    render(
      <InternationalizationProvider locale="en" translator={outer}>
        <InternationalizationProvider locale="en" translator={inner}>
          {renderPagination()}
        </InternationalizationProvider>
      </InternationalizationProvider>,
    );

    expect(
      screen.getByRole('button', {name: '‹Go to next page›'}),
    ).toBeInTheDocument();
    expect(outerFormat).not.toHaveBeenCalled();
  });

  test('a translator captured from useTranslator tracks the current provider', () => {
    // useTranslator's useCallback lists ctx.translator. Drop it and a captured
    // fn keeps calling the old adapter after a swap.
    //
    // `messages` MUST be a stable reference here. Omit the prop and the
    // provider's `messages ?? {}` allocates a fresh object every time the memo
    // recomputes, so ctx.messages alone invalidates the callback and the test
    // passes even with ctx.translator missing from the deps. Verified by
    // mutation: with a shared object, dropping the dep turns this red.
    const stableMessages: MessagesByLocale = {};
    let latest: TranslatorFn | undefined;
    function Capture() {
      latest = useTranslator();
      return null;
    }
    const {translator: first} = makeTranslator(message => `«${message}»`);
    const {translator: second} = makeTranslator(message => `‹${message}›`);
    const tree = (t: Translator) => (
      <InternationalizationProvider
        locale="en"
        messages={stableMessages}
        translator={t}>
        <Capture />
      </InternationalizationProvider>
    );

    const {rerender} = render(tree(first));
    expect(latest?.('@astryx.pagination.next')).toBe('«Go to next page»');

    rerender(tree(second));
    expect(latest?.('@astryx.pagination.next')).toBe('‹Go to next page›');
  });
});
