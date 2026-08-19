// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file check-i18n-catalog.test.mjs
 * Unit tests for the i18n catalog gate. The behaviour worth pinning is what
 * counts as a key reference: the AST walk has to see the keys a regex would
 * miss (a key behind a module constant) and ignore the ones a regex would
 * invent (a key in a comment or an unrelated string), and it has to declare a
 * key it cannot resolve rather than pass it.
 */

import {describe, it, expect} from 'vitest';
import {
  extractKeyRefs,
  validateSourceCatalog,
  compareLocale,
  auditPluralCategories,
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

describe('auditPluralCategories', () => {
  const catalog = message => ({
    '@astryx.a.count': {defaultMessage: message, description: 'ctx'},
  });
  const audit = (message, tag) => auditPluralCategories(catalog(message), tag);

  it('accepts a plural whose branches the locale selects', () => {
    const {parseErrors, deadBranches} = audit(
      '{c, plural, one {item} other {items}}',
      'en',
    );
    expect({parseErrors, deadBranches}).toEqual({
      parseErrors: [],
      deadBranches: [],
    });
  });

  it("accepts a category en lacks but the locale has — he's `two`", () => {
    expect(
      audit('{c, plural, one {א} two {ב} other {ג}}', 'he-IL').deadBranches,
    ).toEqual([]);
  });

  it('reports a category the locale never selects', () => {
    // Hebrew dropped `many` from CLDR, so this branch can never render.
    const {deadBranches} = audit(
      '{c, plural, one {א} two {ב} many {ד} other {ג}}',
      'he-IL',
    );
    expect(deadBranches).toHaveLength(1);
    expect(deadBranches[0]).toContain('"many" is not a cardinal category');
  });

  it('scores selectordinal against the ordinal categories, not the cardinal ones', () => {
    // `two` is a cardinal category of en and an ordinal one; `many` is neither.
    expect(
      audit('{c, selectordinal, two {2nd} other {th}}', 'en').deadBranches,
    ).toEqual([]);
    expect(
      audit('{c, selectordinal, many {th} other {th}}', 'en').deadBranches,
    ).toHaveLength(1);
  });

  it('does not mistake a select option for a plural category', () => {
    expect(
      audit('{who, select, many {a crowd} other {someone}}', 'he-IL')
        .deadBranches,
    ).toEqual([]);
  });

  it('exempts an exact `=N` match, which is not a category', () => {
    expect(
      audit('{c, plural, =0 {none} one {one} other {some}}', 'en').deadBranches,
    ).toEqual([]);
  });

  it('descends into a nested plural', () => {
    const {deadBranches} = audit(
      '{a, plural, one {{b, plural, many {x} other {y}}} other {z}}',
      'en',
    );
    expect(deadBranches).toHaveLength(1);
    expect(deadBranches[0]).toContain('"many"');
  });

  it('reports a message that is not valid ICU', () => {
    const {parseErrors} = audit('{c, plural, one {a} other {b}', 'en');
    expect(parseErrors).toHaveLength(1);
    expect(parseErrors[0]).toContain('@astryx.a.count');
  });

  it('reports a plural with no `other` — the parser rejects it', () => {
    expect(audit('{c, plural, one {a} two {b}}', 'he-IL').parseErrors).toEqual([
      '@astryx.a.count: MISSING_OTHER_CLAUSE',
    ]);
  });

  it('skips a locale this Node has no plural data for, rather than scoring it against en', () => {
    const result = audit('{c, plural, one {a} other {b}}', 'xx-YY');
    expect(result.unsupportedLocale).toBe(true);
    expect(result.deadBranches).toEqual([]);
  });

  it('leaves entry-shape problems to validateSourceCatalog', () => {
    expect(
      auditPluralCategories({'@astryx.a.count': {description: 'ctx'}}, 'en'),
    ).toEqual({parseErrors: [], deadBranches: [], unsupportedLocale: false});
  });
});
