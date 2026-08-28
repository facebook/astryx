// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for the `search` leaf (api/search/search.mjs), run
 * against the real @astryxdesign/core registry. `search` had no api-level tests;
 * this locks the envelope, ranking invariants, the `--type`/limit handling, and
 * the error paths.
 *
 * The API validates its own inputs (not just the CLI): a non-positive/non-integer
 * `limit`, an empty query, and a bad `--type` all throw AstryxError with the
 * ERR_INVALID_ARGUMENT code, so a direct `@astryxdesign/cli/api` caller gets the
 * same contract as `astryx search` on the command line.
 *
 * The last describe block covers integration-contributed components, using the
 * same temp-consumer harness as template-integration.test.mjs. Before this,
 * `search`/`build` only ever scanned @astryxdesign/core — an integration's own
 * components were invisible to both, even though `component --list` and
 * `component <Name>` already resolved them. The two discovery paths silently
 * disagreed.
 */

import {describe, it, expect} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  search,
  scoreCandidate,
  scoreQuery,
  tokenizeQuery,
  SEARCH_DOMAINS,
} from './search.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const cwd = REPO;
const SLOW = 30_000;

describe('search leaf — envelope + ranking', () => {
  it('returns a `search` envelope with query + results', async () => {
    const r = await search('button', {cwd});
    expect(r.type).toBe('search');
    expect(r.data.query).toBe('button');
    expect(Array.isArray(r.data.results)).toBe(true);
    expect(r.data.results.length).toBeGreaterThan(0);
  }, SLOW);

  it('returns an empty result set (not an error) for a no-match query', async () => {
    const r = await search('zzznomatch99', {cwd});
    expect(r.type).toBe('search');
    expect(r.data.results).toEqual([]);
  }, SLOW);

  it('defaults to at most 20 results', async () => {
    const r = await search('button', {cwd});
    expect(r.data.results.length).toBeLessThanOrEqual(20);
  }, SLOW);

  it('caps results to a positive limit', async () => {
    const r = await search('button', {cwd, limit: 2});
    expect(r.data.results.length).toBeLessThanOrEqual(2);
  }, SLOW);
});

describe('search leaf — --type filter', () => {
  it('restricts results to the requested domain', async () => {
    const r = await search('button', {cwd, type: 'component'});
    expect(r.data.results.every(x => x.domain === 'component')).toBe(true);
  }, SLOW);

  it('exposes the valid domain list', () => {
    expect(SEARCH_DOMAINS).toEqual(expect.arrayContaining(['component', 'hook', 'doc', 'template']));
  });
});

describe('search leaf — error paths (pinned)', () => {
  it('throws ERR_INVALID_ARGUMENT when the query is empty/whitespace', async () => {
    await expect(search('   ', {cwd})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
      message: expect.stringMatching(/query is required/i),
    });
  }, SLOW);

  it('throws ERR_INVALID_ARGUMENT for an unknown --type', async () => {
    await expect(
      search('button', {cwd, type: /** @type {any} */ ('bogus')}),
    ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});
  }, SLOW);
});

describe('search leaf — limit validation (API matches the CLI contract)', () => {
  it('throws ERR_INVALID_ARGUMENT for a limit of 0 (no longer returns everything)', async () => {
    await expect(search('button', {cwd, limit: 0})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
    });
  }, SLOW);

  it('throws ERR_INVALID_ARGUMENT for a negative limit', async () => {
    await expect(search('button', {cwd, limit: -5})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
    });
  }, SLOW);

  it('throws ERR_INVALID_ARGUMENT for a non-integer limit', async () => {
    await expect(search('button', {cwd, limit: 2.5})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
    });
  }, SLOW);
});

describe('search leaf — integration components', () => {
  /**
   * A minimal consumer project: a stub `@astryxdesign/core` (so `findCoreDir`
   * resolves without needing the real package) plus an installed
   * `@acme/widgets` integration that contributes one component.
   */
  function makeConsumerWithIntegrationComponent() {
    const dir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-search-it-'));
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({name: 'consumer'}));
    fs.writeFileSync(
      path.join(dir, 'astryx.config.mjs'),
      `export default { integrations: ['@acme/widgets'] };\n`,
    );

    // Stub core: just needs to exist with an (empty) src/ so discoverComponents
    // doesn't throw. Its own component list is irrelevant to this test.
    const coreDir = path.join(dir, 'node_modules', '@astryxdesign', 'core');
    fs.mkdirSync(path.join(coreDir, 'src'), {recursive: true});

    const widgetsDir = path.join(dir, 'node_modules', '@acme', 'widgets');
    fs.mkdirSync(path.join(widgetsDir, 'components'), {recursive: true});
    fs.writeFileSync(
      path.join(widgetsDir, 'package.json'),
      JSON.stringify({name: '@acme/widgets', version: '1.0.0'}),
    );
    fs.writeFileSync(
      path.join(widgetsDir, 'astryx.integration.mjs'),
      `export default { components: './components' };\n`,
    );
    fs.writeFileSync(
      path.join(widgetsDir, 'components', 'FancyGizmo.doc.mjs'),
      `export const docs = {
        name: 'FancyGizmo',
        keywords: ['gizmo', 'widget'],
        usage: {description: 'A fancy gizmo widget.'},
      };\n`,
    );

    return dir;
  }

  it('includes a component contributed by a configured integration', async () => {
    const dir = makeConsumerWithIntegrationComponent();
    try {
      const r = await search('gizmo', {cwd: dir, type: 'component'});
      expect(r.data.results.some(x => x.name === 'FancyGizmo')).toBe(true);
    } finally {
      fs.rmSync(dir, {recursive: true, force: true});
    }
  }, SLOW);

  it('reports the contributing package as the import hint', async () => {
    const dir = makeConsumerWithIntegrationComponent();
    try {
      const r = await search('FancyGizmo', {cwd: dir, type: 'component'});
      const hit = r.data.results.find(x => x.name === 'FancyGizmo');
      expect(hit?.import).toBe('@acme/widgets');
    } finally {
      fs.rmSync(dir, {recursive: true, force: true});
    }
  }, SLOW);
});

describe('search scoring — multi-token aggregation is monotonic', () => {
  /**
   * @param {string} q
   * @param {object} candidate
   * @returns {number}
   */
  const score = (q, candidate) => scoreQuery(q, tokenizeQuery(q), candidate)?.score ?? 0;

  it('ranks matching both terms above matching only the stronger one', () => {
    // The shipped regression: scoring averaged over MATCHED tokens, so the
    // weaker second hit pulled the mean down further than the coverage bonus
    // pushed it up. `build "file browser"` put two form wizards that matched
    // only "file" (98) above the actual file browser that matched both (97),
    // and 98 clears the confident-match gate.
    const partial = {name: 'form-wizard-vertical', keywords: ['file']};
    const complete = {
      name: 'file-explorer',
      keywords: ['file'],
      description: 'Column browser for nested folders',
    };
    expect(score('file browser', complete)).toBeGreaterThan(score('file browser', partial));
  });

  it('never scores a superset of matched terms below a subset', () => {
    const subset = {name: 'zzz-none', keywords: ['alpha']};
    const supersets = [
      {name: 'zzz-none', keywords: ['alpha'], description: 'beta things'},
      {name: 'zzz-none', keywords: ['alpha', 'beta']},
      {name: 'zzz-none', keywords: ['alpha'], weakKeywords: ['beta']},
    ];
    for (const superset of supersets) {
      expect(score('alpha beta', superset)).toBeGreaterThanOrEqual(score('alpha beta', subset));
    }
  });

  it('still scores a verbose prompt on the concepts it did hit', () => {
    // Guards the reason the mean was used: a long prompt matching one concept
    // strongly must not be crushed by dividing across every query token.
    const candidate = {name: 'kanban', keywords: ['kanban']};
    expect(score('i need a kanban somewhere in this rambling request', candidate))
      .toBeGreaterThanOrEqual(90);
  });
});

describe('search scoring — derived keywords rank below authored ones', () => {
  it('scores an authored keyword above a derived one', () => {
    const authored = scoreCandidate('dialog', {name: 'x', keywords: ['Dialog']});
    const derived = scoreCandidate('dialog', {name: 'x', weakKeywords: ['Dialog']});
    expect(authored?.score).toBe(90);
    expect(derived?.score).toBe(60);
  });

  it('keeps one incidental derived match below the confident-match gate', () => {
    // PAGE_DIRECT in api/build/kit is 95: at full keyword strength a page that
    // renders one of everything got a 90-point shot per component and was
    // returned as a confident match for queries it had nothing to do with.
    const derived = scoreCandidate('dialog', {name: 'x', weakKeywords: ['Dialog']});
    expect(derived?.score).toBeLessThan(95);
  });

  it('still surfaces a derived match above the page floor', () => {
    // PAGE_FLOOR is 50 — weakening the signal must not make it invisible.
    const derived = scoreCandidate('dialog', {name: 'x', weakKeywords: ['Dialog']});
    expect(derived?.score).toBeGreaterThanOrEqual(50);
  });

  it('explains a derived hit as something the template renders', () => {
    const derived = scoreCandidate('dialog', {name: 'x', weakKeywords: ['Dialog']});
    expect(derived?.reason).toMatch(/renders Dialog/);
  });
});
