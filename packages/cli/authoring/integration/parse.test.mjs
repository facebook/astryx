// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for `parseIntegration` — the load-boundary validator for
 * `astryx.integration.*`. Zod is sealed inside the parser; these exercise the
 * public contract (validated value out / readable error thrown) with the same
 * accept/reject set the old `AstryxIntegrationSchema` had.
 */

import {describe, it, expect} from 'vitest';
import {parseIntegration} from './parse.mjs';
import {integrationSchema, unknownIntegrationKeys} from './schema.mjs';

/** Run parseIntegration and return the thrown message (asserting it throws). */
function reason(value, label = 'integration') {
  try {
    parseIntegration(value, label);
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
  throw new Error('expected parseIntegration to throw');
}

describe('parseIntegration (load boundary)', () => {
  it('accepts an empty manifest and a valid one', () => {
    expect(parseIntegration({})).toEqual({});
    expect(parseIntegration({components: './src'})).toEqual({
      components: './src',
    });
    expect(parseIntegration({docs: './docs'})).toEqual({docs: './docs'});
    expect(parseIntegration({themes: './themes'})).toEqual({
      themes: './themes',
    });
    expect(
      parseIntegration({
        templates: './templates',
        templateReplacements: {'acme-app-shell': 'shell-side-nav'},
      }),
    ).toEqual({
      templates: './templates',
      templateReplacements: {'acme-app-shell': 'shell-side-nav'},
    });
    expect(() =>
      parseIntegration({components: './c', issuesUrl: 'https://example.com/i'}),
    ).not.toThrow();
  });

  it('ignores a key it does not know, and keeps the rest of the manifest', () => {
    // A key from a NEWER CLI is the common case, not an authoring mistake: the
    // integration is published once and installed against many CLI versions.
    // Rejecting the manifest took the whole package's contributions down with
    // it, silently, on every older consumer (#5119).
    expect(
      parseIntegration({components: './src', futureRoot: './future'}),
    ).toEqual({
      components: './src',
    });
    expect(
      unknownIntegrationKeys({components: './src', futureRoot: './future'}),
    ).toEqual(['futureRoot']);
    expect(unknownIntegrationKeys({components: './src'})).toEqual([]);
    // Not a manifest at all — nothing to report, and the parser owns the error.
    expect(unknownIntegrationKeys(null)).toEqual([]);
    expect(unknownIntegrationKeys([1, 2])).toEqual([]);
  });

  it('reports no known key as unknown, whatever the schema grows', () => {
    // The census is read off the schema, so this holds for keys that do not
    // exist yet. A hand-maintained list would pass today and start warning
    // falsely about a supported field the day someone forgot to update it.
    const everyKnownKey = Object.fromEntries(
      Object.keys(integrationSchema.shape).map(key => [
        key,
        key === 'issuesUrl'
          ? 'https://example.com/issues'
          : key === 'agentDocs'
            ? {}
            : key === 'templateReplacements'
              ? {'acme-app-shell': 'shell-side-nav'}
              : './x',
      ]),
    );
    expect(unknownIntegrationKeys(everyKnownKey)).toEqual([]);
  });

  it('still rejects a known key of the wrong type', () => {
    // The relaxation is about keys this CLI has never heard of. A key it DOES
    // know, holding the wrong type, is a real authoring mistake.
    expect(reason({components: 42})).toContain('components');
  });

  it('rejects a non-URL issuesUrl', () => {
    expect(reason({issuesUrl: 'nope'})).toContain('issuesUrl');
  });

  it('rejects an invalid template replacement declaration', () => {
    expect(reason({templateReplacements: {'acme-app-shell': 42}})).toContain(
      'templateReplacements',
    );
    expect(reason({templateReplacements: {'': 'shell-side-nav'}})).toContain(
      'templateReplacements',
    );
    expect(reason({templateReplacements: {'acme-app-shell': ''}})).toContain(
      'templateReplacements',
    );
  });

  it('rejects an own __proto__ replacement key before parsing can drop it', () => {
    const templateReplacements = JSON.parse('{"__proto__":"shell-side-nav"}');
    expect(Object.hasOwn(templateReplacements, '__proto__')).toBe(true);
    expect(reason({templateReplacements})).toContain(
      'reserved key "__proto__"',
    );
  });

  it('accepts an optional append array as manifest data', () => {
    expect(
      parseIntegration({
        agentDocs: {
          append: ['Run acme verify before finishing.'],
        },
      }),
    ).toEqual({
      agentDocs: {
        append: ['Run acme verify before finishing.'],
      },
    });
  });

  it('strips future nested agentDocs keys without rejecting append', () => {
    expect(
      parseIntegration({
        agentDocs: {
          append: ['Run acme verify before finishing.'],
          futureField: true,
        },
      }),
    ).toEqual({
      agentDocs: {
        append: ['Run acme verify before finishing.'],
      },
    });
  });

  it('caps append at eight lines', () => {
    expect(
      reason({
        agentDocs: {
          append: Array.from({length: 9}, (_, index) => `after ${index}`),
        },
      }),
    ).toMatch(/at most 8 lines/);
  });

  it('counts Unicode code points rather than UTF-16 code units', () => {
    expect(() =>
      parseIntegration({agentDocs: {append: ['😀'.repeat(240)]}}),
    ).not.toThrow();
    expect(reason({agentDocs: {append: ['😀'.repeat(241)]}})).toMatch(
      /240 Unicode code points/,
    );
  });

  it.each([
    ['', /blank/],
    ['   ', /blank/],
    [' leading', /surrounding whitespace/],
    ['trailing ', /surrounding whitespace/],
    ['two\nlines', /single line|line separators/],
    ['two\rlines', /control characters|line separators/],
    ['unicode\u2028separator', /single line/],
    ['nul\u0000byte', /NUL/],
    ['control\u0001byte', /control characters/],
    ['control\u0085byte', /control characters/],
    ['<!-- ASTRYX:START -->', /managed marker text/],
    ['XDS:END', /managed marker text/],
  ])('rejects forbidden agentDocs line %#', (line, message) => {
    expect(reason({agentDocs: {append: [line]}})).toMatch(message);
  });

  it('rejects functions and other non-data shapes', () => {
    expect(reason({agentDocs: () => ({append: ['x']})})).toContain('agentDocs');
    expect(reason({agentDocs: {append: ['ok', 42]}})).toContain('append');
  });
});
