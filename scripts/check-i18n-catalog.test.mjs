// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file check-i18n-catalog.test.mjs
 * Unit tests for the i18n catalog gate. The behaviour worth pinning is what
 * counts as a key reference: the AST walk has to see the keys a regex would
 * miss (a key behind a module constant) and ignore the ones a regex would
 * invent (a key in a comment or an unrelated string), and it has to declare a
 * key it cannot resolve rather than pass it. It also pins ICU syntax,
 * message-contract, locale-severity, and plural-category behavior.
 */

import {describe, it, expect} from 'vitest';
import {
  extractKeyRefs,
  extractSliceUsage,
  checkSliceCoverage,
  validateSourceCatalog,
  compareLocale,
  parseIcuMessage,
  compareMessageContracts,
  pluralRulesFor,
  classifyLocalePluralRules,
  analyzeIcuMessage,
} from './check-i18n-catalog.mjs';

const keys = source => extractKeyRefs(source, 'Test.tsx').refs.map(r => r.key);
const unresolved = source =>
  extractKeyRefs(source, 'Test.tsx').unresolved.map(u => u.expr);

describe('extractKeyRefs — call sites it must see', () => {
  it('finds a literal t() argument', () => {
    expect(keys(`const s = t('@astryx.pagination.next');`)).toEqual([
      '@astryx.pagination.next',
    ]);
  });

  it('finds translator(), translate(), and a member call', () => {
    expect(
      keys(
        `translator('@astryx.a.one');\n` +
          `translate('@astryx.a.two');\n` +
          `intl.t('@astryx.a.three');`,
      ),
    ).toEqual(['@astryx.a.one', '@astryx.a.two', '@astryx.a.three']);
  });

  it('finds an i18nKey property', () => {
    expect(keys(`const o = {key: 'is', i18nKey: '@astryx.op.is'};`)).toEqual([
      '@astryx.op.is',
    ]);
  });

  it('finds a no-substitution template literal', () => {
    expect(keys('t(`@astryx.pagination.next`);')).toEqual([
      '@astryx.pagination.next',
    ]);
  });

  it('reports the line of each reference', () => {
    const {refs} = extractKeyRefs(
      `const a = 1;\nconst b = t('@astryx.a.one');\n`,
      'Test.tsx',
    );
    expect(refs).toEqual([{line: 2, key: '@astryx.a.one'}]);
  });

  it('parses TSX and type syntax', () => {
    const source =
      `const label = t('@astryx.a.one') as string;\n` +
      `const node = <button aria-label={t('@astryx.a.two')} />;`;
    expect(keys(source)).toEqual(['@astryx.a.one', '@astryx.a.two']);
  });
});

describe('extractKeyRefs — indirection it can resolve', () => {
  it('resolves a module-level string constant', () => {
    expect(
      keys(`const K = '@astryx.dropdownMenu.label' as const;\nt(K);`),
    ).toEqual(['@astryx.dropdownMenu.label']);
  });

  it('resolves every value of a constant map, since any may be selected', () => {
    expect(
      keys(
        `const MAP = {warning: '@astryx.input.warning', error: '@astryx.input.error'};\n` +
          `t(MAP[status.type]);`,
      ),
    ).toEqual(['@astryx.input.warning', '@astryx.input.error']);
  });

  it('resolves both branches of a conditional', () => {
    expect(
      keys(
        `t(copied ? '@astryx.timestamp.copied' : '@astryx.timestamp.copy');`,
      ),
    ).toEqual(['@astryx.timestamp.copied', '@astryx.timestamp.copy']);
  });
});

describe('extractKeyRefs — what it must not invent', () => {
  it('ignores keys in comments', () => {
    expect(
      keys(
        `// t('@astryx.not.real')\n/* @astryx.also.not.real */\nconst x = 1;`,
      ),
    ).toEqual([]);
  });

  it('ignores a string that is not a translator argument', () => {
    expect(
      keys(`const doc = 'call t("@astryx.example.key") to translate';`),
    ).toEqual([]);
  });

  it('ignores non-astryx namespaces, which belong to their owners', () => {
    expect(keys(`t('@myapp.thing.label');`)).toEqual([]);
  });
});

describe('extractKeyRefs — what it must declare unverifiable', () => {
  it('reports a key read off an object field', () => {
    expect(unresolved(`t(operator.i18nKey);`)).toEqual(['operator.i18nKey']);
  });

  it('reports a built key rather than guessing at it', () => {
    expect(unresolved('t(`@astryx.status.${kind}`);')).toEqual([
      '`@astryx.status.${kind}`',
    ]);
  });

  it('reports an unknown identifier, and does not count it as a reference', () => {
    const {refs, unresolved: u} = extractKeyRefs(
      `t(keyFromProps);`,
      'Test.tsx',
    );
    expect(refs).toEqual([]);
    expect(u).toHaveLength(1);
  });

  it('reports a conditional whose branches are not all resolvable', () => {
    expect(unresolved(`t(x ? '@astryx.a.one' : dynamicKey);`)).toHaveLength(1);
  });
});

describe('validateSourceCatalog', () => {
  const entry = (over = {}) => ({
    defaultMessage: 'Next',
    description: 'Aria label for the next-page button.',
    ...over,
  });

  it('accepts a well-formed catalog', () => {
    expect(validateSourceCatalog({'@astryx.a.one': entry()})).toEqual([]);
  });

  it('rejects a missing description', () => {
    const problems = validateSourceCatalog({
      '@astryx.a.one': {defaultMessage: 'Next'},
    });
    expect(problems).toEqual(['@astryx.a.one: missing or empty "description"']);
  });

  it('rejects an empty or whitespace-only description', () => {
    for (const description of ['', '   ', '\n']) {
      expect(
        validateSourceCatalog({'@astryx.a.one': entry({description})}),
      ).toEqual(['@astryx.a.one: missing or empty "description"']);
    }
  });

  it('rejects a missing defaultMessage', () => {
    expect(
      validateSourceCatalog({'@astryx.a.one': {description: 'ctx'}}),
    ).toEqual(['@astryx.a.one: missing or empty "defaultMessage"']);
  });

  it('rejects a bare string entry', () => {
    expect(validateSourceCatalog({'@astryx.a.one': 'Next'})).toEqual([
      '@astryx.a.one: entry is not an object',
    ]);
  });
});

describe('compareLocale', () => {
  const en = new Set(['@astryx.a.one', '@astryx.a.two']);

  it('reports nothing for an exact match', () => {
    expect(compareLocale(en, ['@astryx.a.one', '@astryx.a.two'])).toEqual({
      missing: [],
      extra: [],
    });
  });

  it('separates missing from extra', () => {
    expect(compareLocale(en, ['@astryx.a.one', '@astryx.a.stale'])).toEqual({
      missing: ['@astryx.a.two'],
      extra: ['@astryx.a.stale'],
    });
  });
});

const contractProblems = (source, translation) =>
  compareMessageContracts(
    parseIcuMessage(source),
    parseIcuMessage(translation),
  );

describe('ICU message contracts', () => {
  it('allows arguments to be reordered without comparing literal text', () => {
    expect(
      contractProblems(
        'Hello {first} {last}, balance {balance, number}',
        'Solde {balance, number} — {last}, {first}',
      ),
    ).toEqual([]);
  });

  it('allows locale-specific cardinal and ordinal categories', () => {
    expect(
      contractProblems(
        '{count, plural, one {{owner} has one item} other {{owner} has # items}} ' +
          '{rank, selectordinal, one {#st} other {#th}}',
        '{rank, selectordinal, few {#e} many {#e} other {#e}} — ' +
          '{count, plural, one {{owner} a un élément} few {{owner} a # éléments} many {{owner} a # éléments} other {{owner} a # éléments}}',
      ),
    ).toEqual([]);
  });

  it.each([
    ['source', 'Hello {name'],
    ['translation', '{count, plural, one {Un}}'],
  ])('reports malformed %s ICU deterministically', (catalog, message) => {
    const {syntaxError} = analyzeIcuMessage(message);
    expect(`${catalog}: ${syntaxError}`).toMatch(
      new RegExp(
        `^${catalog}: malformed ICU message at line 1, column \\d+: [A-Z_]+$`,
      ),
    );
  });

  it('reports missing and extra arguments', () => {
    expect(contractProblems('Hello {name}', 'Hello {account}')).toEqual([
      'missing argument(s): name',
      'extra argument(s): account',
    ]);
  });

  it('reports an incompatible argument kind', () => {
    expect(
      contractProblems('Total: {value, number}', 'Date: {value, date}'),
    ).toEqual([
      'argument "value" has incompatible kind: expected number; found date',
    ]);
  });

  it('preserves nested select, plural, and rich-text structure', () => {
    const source =
      '{count, plural, one {<strong>{owner}</strong> has one item} ' +
      'other {<strong>{owner}</strong> has # items for {audience, select, public {everyone} other {{viewer}}}}}';
    const reorderedTranslation =
      '{count, plural, few {{audience, select, public {tous} other {{viewer}}}: <strong>{owner}</strong> a # éléments} ' +
      'other {{audience, select, public {tous} other {{viewer}}}: <strong>{owner}</strong> a # éléments}}';
    expect(contractProblems(source, reorderedTranslation)).toEqual([]);

    const movedOutOfTag =
      '{count, plural, one {{owner} <strong>a un élément</strong>} ' +
      'other {{owner} <strong>a # éléments</strong> pour {audience, select, public {tous} other {{viewer}}}}}';
    expect(contractProblems(source, movedOutOfTag)).toContain(
      'argument "owner" has incompatible structure: expected argument inside plural "count" > tag <strong> | argument inside plural "count" option "other" > tag <strong>; found argument inside plural "count" | argument inside plural "count" option "other"',
    );
  });

  it.each([
    ['argument', '{owner}', 'fallback'],
    ['rich-text tag', '<strong>value</strong>', 'fallback'],
    ['pound placeholder', '# items', 'items'],
  ])(
    'requires the plural other branch to retain its %s contract',
    (_kind, sourceValue, translationValue) => {
      const problems = contractProblems(
        `{count, plural, one {${sourceValue}} other {${sourceValue}}}`,
        `{count, plural, one {${sourceValue}} other {${translationValue}}}`,
      );
      expect(problems).toHaveLength(1);
      expect(problems[0]).toContain('option "other"');
    },
  );

  it('requires nested plural other branches to retain their contracts', () => {
    const source =
      '{choice, select, nested {{count, plural, one {{owner}} other {{owner}}}} other {fallback}}';
    const translation =
      '{choice, select, nested {{count, plural, one {{owner}} other {fallback}}} other {fallback}}';
    const problems = contractProblems(source, translation);

    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain(
      'select "choice" option "nested" > plural "count" option "other"',
    );
  });

  it('keeps pound placeholders in the nested contract', () => {
    expect(
      contractProblems(
        '{count, plural, one {One} other {# items}}',
        '{count, plural, one {Un} other {éléments}}',
      ),
    ).toEqual(['missing pound placeholder(s): #']);
  });

  it('distinguishes cardinal plurals from selectordinal', () => {
    expect(
      contractProblems(
        '{count, plural, one {One} other {Items}}',
        '{count, selectordinal, one {First} other {Later}}',
      ),
    ).toEqual([
      'argument "count" has incompatible kind: expected plural; found selectordinal',
    ]);
  });

  it('keeps exact plural selectors in the contract', () => {
    expect(
      contractProblems(
        '{count, plural, =0 {None} other {# items}}',
        '{count, plural, =1 {Un} other {# éléments}}',
      ),
    ).toEqual([
      'argument "count" has incompatible structure: expected plural (offset=0; exact=[=0]) at message root; found plural (offset=0; exact=[=1]) at message root',
    ]);
  });

  it('keeps select option names in the contract', () => {
    expect(
      contractProblems(
        '{tone, select, formal {Welcome} other {Hi}}',
        '{tone, select, casual {Salut} other {Bonjour}}',
      ),
    ).toEqual([
      'argument "tone" has incompatible structure: expected select (options=[formal, other]) at message root; found select (options=[casual, other]) at message root',
    ]);
  });
});

describe('ICU plural categories', () => {
  const rulesFor = locale => {
    const rules = pluralRulesFor(locale);
    expect(rules.status).toBe('supported');
    return rules;
  };

  const messageWith = (syntax, selector) =>
    `{count, ${syntax}, ${selector} {named} other {fallback}}`;

  it.each([
    ['en', 'plural', 'few', false],
    ['en', 'selectordinal', 'two', true],
    ['ar', 'plural', 'zero', true],
    ['ar', 'selectordinal', 'zero', false],
  ])(
    '%s %s category %s has the expected reachability',
    (locale, syntax, selector, reachable) => {
      const result = analyzeIcuMessage(messageWith(syntax, selector), {
        pluralRules: rulesFor(locale),
        isSource: true,
      });
      expect(result.pluralErrors).toHaveLength(reachable ? 0 : 1);
    },
  );

  it('accepts every cardinal category reported by Intl.PluralRules', () => {
    const rules = rulesFor('en');
    const options = [...rules.cardinal]
      .map(category => `${category} {${category}}`)
      .join(' ');
    const result = analyzeIcuMessage(`{count, plural, ${options}}`, {
      pluralRules: rules,
      isSource: true,
    });
    expect(result.pluralErrors).toEqual([]);
  });

  it('distinguishes cardinal categories from ordinal categories', () => {
    const rules = rulesFor('en');
    const ordinalOnly = [...rules.ordinal].find(
      category => !rules.cardinal.has(category),
    );
    expect(ordinalOnly).toBeDefined();

    const cardinal = analyzeIcuMessage(messageWith('plural', ordinalOnly), {
      pluralRules: rules,
      isSource: true,
    });
    const ordinal = analyzeIcuMessage(
      messageWith('selectordinal', ordinalOnly),
      {pluralRules: rules, isSource: true},
    );
    expect(cardinal.pluralErrors).toHaveLength(1);
    expect(cardinal.pluralErrors[0]).toContain(
      `unreachable cardinal category "${ordinalOnly}"`,
    );
    expect(ordinal.pluralErrors).toEqual([]);
  });

  it('descends into plurals nested under other ICU nodes', () => {
    const rules = rulesFor('en');
    const message =
      '{choice, select, nested {' +
      messageWith('plural', 'unreachable') +
      '} other {fallback}}';
    const result = analyzeIcuMessage(message, {
      pluralRules: rules,
      isSource: true,
    });
    expect(result.pluralErrors).toHaveLength(1);
    expect(result.pluralErrors[0]).toContain('"unreachable"');
  });

  it('exempts exact selectors', () => {
    const result = analyzeIcuMessage(
      '{count, plural, =99 {exact} other {fallback}}',
      {pluralRules: rulesFor('en'), isSource: true},
    );
    expect(result.pluralErrors).toEqual([]);
  });

  it('does not treat a select option named many as a plural category', () => {
    const result = analyzeIcuMessage(
      '{choice, select, many {several} other {fallback}}',
      {pluralRules: rulesFor('en'), isSource: true},
    );
    expect(result.pluralErrors).toEqual([]);
  });

  it('makes source findings fatal and translation findings notes', () => {
    const message = messageWith('plural', 'unreachable');
    const pluralRules = rulesFor('en');
    const source = analyzeIcuMessage(message, {
      pluralRules,
      isSource: true,
    });
    const translation = analyzeIcuMessage(message, {pluralRules});

    expect(source.pluralErrors).toHaveLength(1);
    expect(source.pluralNotes).toEqual([]);
    expect(translation.pluralErrors).toEqual([]);
    expect(translation.pluralNotes).toHaveLength(1);
  });

  it('keeps unsupported locale data nonfatal but rejects malformed filenames', () => {
    const unsupported = classifyLocalePluralRules('xx-YY.json');
    expect(unsupported).toMatchObject({
      pluralRules: {status: 'unsupported'},
      note: expect.stringContaining('plural categories unchecked'),
    });
    expect(unsupported.error).toBeUndefined();

    const invalid = classifyLocalePluralRules('x-private.json');
    expect(invalid).toMatchObject({
      pluralRules: {status: 'invalid'},
      error: {
        title: 'x-private.json: invalid locale filename',
        lines: ['locale identifier "x-private" is not accepted by Intl.Locale'],
      },
    });
    expect(invalid.note).toBeUndefined();
  });

  it('does not let an unsupported locale mask syntax or contract errors', () => {
    const pluralRules = pluralRulesFor('xx-YY');
    expect(pluralRules.status).toBe('unsupported');

    const syntax = analyzeIcuMessage('Hello {name', {pluralRules});
    expect(syntax.syntaxError).toMatch(/^malformed ICU message/);

    const contract = analyzeIcuMessage('{value, date}', {
      sourceAst: parseIcuMessage('{value, number}'),
      pluralRules,
    });
    expect(contract.contractProblems).toEqual([
      'argument "value" has incompatible kind: expected number; found date',
    ]);
  });
});

describe('extractSliceUsage — the slices a component renders with', () => {
  const usage = source => extractSliceUsage(source, 'Test.tsx');

  it('resolves a slice import passed to the component hook', () => {
    const {hookCalls, consumerHookImports} = usage(`
      import {useComponentTranslator} from '../i18n/useComponentTranslator';
      import buttonMessages from '../i18n/generated-locales/en/button.generated';
      function Button() { const t = useComponentTranslator(buttonMessages); return t('@astryx.button.loading'); }
    `);
    expect(hookCalls).toEqual([{line: 4, namespaces: ['button']}]);
    expect(consumerHookImports).toEqual([]);
  });

  it('resolves a module-level spread of several slices', () => {
    const {hookCalls} = usage(`
      import {useComponentTranslator} from '../i18n/useComponentTranslator';
      import dateInputMessages from '../i18n/generated-locales/en/dateInput.generated';
      import timeInputMessages from '../i18n/generated-locales/en/timeInput.generated';
      const messages = {...dateInputMessages, ...timeInputMessages};
      function Field() { const t = useComponentTranslator(messages); return t('@astryx.dateInput.open'); }
    `);
    expect(hookCalls).toEqual([
      {line: 6, namespaces: ['dateInput', 'timeInput']},
    ]);
  });

  it('declares an argument it cannot trace to slice imports unresolvable', () => {
    const {hookCalls} = usage(`
      import {useComponentTranslator} from '../i18n/useComponentTranslator';
      const messages = {'@astryx.button.loading': 'Loading'};
      function Button() { const t = useComponentTranslator(messages); return t('@astryx.button.loading'); }
    `);
    expect(hookCalls).toEqual([{line: 4, namespaces: null}]);
  });

  it('reports a value import of the consumer hook or the public context, and not a type import', () => {
    expect(
      usage(`import {useLocale, useTranslator} from '../i18n';`)
        .consumerHookImports,
    ).toEqual([{line: 1, name: 'useTranslator'}]);
    expect(
      usage(`import {useTranslator} from '../../../i18n/useTranslator';`)
        .consumerHookImports,
    ).toEqual([{line: 1, name: 'useTranslator'}]);
    expect(
      usage(`import {InternationalizationContext} from '../i18n';`)
        .consumerHookImports,
    ).toEqual([{line: 1, name: 'InternationalizationContext'}]);
    expect(
      usage(
        `import {useLocale, type TranslatorFn, type InternationalizationContextValue} from '../i18n';`,
      ).consumerHookImports,
    ).toEqual([]);
  });
});

describe('checkSliceCoverage — every key a file reads is in a slice it renders with', () => {
  const file = (refs, hookCalls, consumerHookImports = []) => ({
    refs: refs.map((key, i) => ({line: i + 1, key})),
    hookCalls,
    consumerHookImports,
  });

  it('passes a file whose keys are all in its slices', () => {
    expect(
      checkSliceCoverage(
        new Map([
          [
            'DateInput/DateInput.tsx',
            file(
              ['@astryx.dateInput.open', '@astryx.calendar.today'],
              [{line: 9, namespaces: ['dateInput', 'calendar']}],
            ),
          ],
        ]),
      ),
    ).toEqual([]);
  });

  it('names the key, the line and the slices when a key is outside them', () => {
    expect(
      checkSliceCoverage(
        new Map([
          [
            'Button/Button.tsx',
            file(
              ['@astryx.button.loading'],
              [{line: 9, namespaces: ['pagination']}],
            ),
          ],
        ]),
      ),
    ).toEqual([
      'Button/Button.tsx:1  @astryx.button.loading is outside its slice (pagination)',
    ]);
  });

  it('covers a file handed `t` by the hook callers of its component directory', () => {
    const files = new Map([
      [
        'PowerSearch/PowerSearchToken.tsx',
        file([], [{line: 3, namespaces: ['powersearch']}]),
      ],
      [
        'PowerSearch/formatFilterValue.ts',
        file(['@astryx.powersearch.between'], []),
      ],
      ['Table/helper.ts', file(['@astryx.powersearch.between'], [])],
    ]);
    expect(checkSliceCoverage(files)).toEqual([
      "Table/helper.ts:1  @astryx.powersearch.between is outside its directory's slices (none)",
    ]);
  });

  it('reports an unresolvable slice and an import of the consumer hook', () => {
    expect(
      checkSliceCoverage(
        new Map([
          [
            'Spinner/Spinner.tsx',
            file(
              ['@astryx.spinner.loading'],
              [{line: 9, namespaces: null}],
              [{line: 4, name: 'useTranslator'}],
            ),
          ],
        ]),
      ),
    ).toEqual([
      'Spinner/Spinner.tsx:4  imports useTranslator, which carries the whole English catalog; a component renders with useComponentTranslator(<its slice>)',
      'Spinner/Spinner.tsx:9  useComponentTranslator: the slice is not a default import of generated-locales/en/<namespace>.generated, or a module-level spread of such imports',
      'Spinner/Spinner.tsx:1  @astryx.spinner.loading is outside its slice (none)',
    ]);
  });
});
