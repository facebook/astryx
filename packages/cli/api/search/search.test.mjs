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

  it('keeps tokenizer coverage out of the public result shape', async () => {
    const r = await search('table of contents', {cwd});
    expect(r.data.results.length).toBeGreaterThan(0);
    for (const result of r.data.results) {
      expect(result).not.toHaveProperty('matchedTerms');
      expect(result).not.toHaveProperty('queryTerms');
    }
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

describe('search leaf — matchCount is the total, not the cap', () => {
  it('reports every match while `results` stays bounded by the limit', async () => {
    // The regression: `matchCount` used to be `results.length`, so a query
    // matching 57 things reported 20 — the cap read back as the answer. Any
    // consumer counting matches (the recorded run, a caller paginating) then
    // could not tell a capped answer from an exactly-cap-sized one.
    const capped = await search('button', {cwd, limit: 2});
    expect(capped.data.results.length).toBe(2);
    expect(capped.data.matchCount).toBeGreaterThan(2);

    // Same query, no meaningful cap: the count is stable across limits, which
    // is what makes it a count of MATCHES rather than of what was returned.
    const full = await search('button', {cwd, limit: 500});
    expect(full.data.matchCount).toBe(capped.data.matchCount);
    expect(full.data.results.length).toBe(full.data.matchCount);
  }, SLOW);

  it('reports 0 for a no-match query', async () => {
    const r = await search('zzznomatch99', {cwd});
    expect(r.data.matchCount).toBe(0);
  }, SLOW);

  it('counts only the requested domain under --type', async () => {
    const all = await search('button', {cwd, limit: 500});
    const components = await search('button', {
      cwd,
      type: 'component',
      limit: 500,
    });
    expect(components.data.matchCount).toBe(components.data.results.length);
    expect(components.data.matchCount).toBeLessThanOrEqual(all.data.matchCount);
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

describe('search leaf — exact keyword phrase outranks incidental token matches (issue #5239)', () => {
  it('surfaces Outline for its own declared keyword "table of contents", ranked first', async () => {
    // Before the fix, "table" and "contents" each separately matched dozens
    // of unrelated Table-related templates by coincidence, and their
    // combined token-sum score outranked Outline's single exact match,
    // pushing it out of the results entirely at the default limit.
    const r = await search('table of contents', {cwd});
    expect(r.data.results[0]?.name).toBe('Outline');
  }, SLOW);

  it('surfaces Outline for its own declared keyword "heading navigation", ranked first', async () => {
    const r = await search('heading navigation', {cwd});
    expect(r.data.results[0]?.name).toBe('Outline');
  }, SLOW);

  it('preserves query coverage metadata on the promoted exact phrase', () => {
    const query = 'table of contents';
    const tokens = tokenizeQuery(query);
    expect(
      scoreQuery(query, tokens, {
        name: 'Outline',
        keywords: [query],
      }),
    ).toMatchObject({matched: tokens.length, total: tokens.length});
  });

  it('still returns no results for a nonsense query (the fix does not loosen matching)', async () => {
    const r = await search('zzzzqqqx', {cwd});
    expect(r.data.results).toEqual([]);
  }, SLOW);
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

describe('search — usage guidance is indexed, a tier below description', () => {
  // The vocabulary a reader types usually lives in a component's guidance, not
  // in its one-line description. Banner calls itself "a persistent message";
  // only its best practices name "caution", "problems", "form errors". Before
  // this, none of those words found it.
  const banner = {
    name: 'Banner',
    keywords: ['alert', 'notification'],
    description: 'A persistent message shown above content.',
    guidance: [
      'Pick a status that matches the message: info for updates, warning for caution.',
      'Use error for problems the reader must resolve before continuing.',
    ],
  };

  it('finds a term that appears ONLY in guidance', () => {
    // Red before this change: guidance was never read, so this scored null.
    const hit = scoreCandidate('caution', banner);
    expect(hit).not.toBeNull();
    expect(hit?.reason).toMatch(/guidance mentions "caution"/);
  });

  it('scores guidance BELOW description, so a component about X outranks one that merely mentions X', () => {
    const own = scoreCandidate('persistent', banner);
    const mention = scoreCandidate('caution', banner);
    expect(own?.score).toBe(50);
    expect(mention?.score).toBe(45);
    expect(mention.score).toBeLessThan(own.score);
  });

  it('never lets guidance outrank a name or keyword hit', () => {
    expect(scoreCandidate('banner', banner)?.score).toBe(100);
    expect(scoreCandidate('notification', banner)?.score).toBe(90);
  });

  it('prefers the stronger signal when a term is in both description and guidance', () => {
    const both = scoreCandidate('message', banner);
    expect(both?.score).toBe(50);
    expect(both?.reason).toMatch(/description mentions/);
  });

  it('stays below MIN_TOKEN_SCORE, so guidance never counts as a matched CONCEPT', () => {
    // Measured regression this prevents: counting guidance as a matched term
    // moved `nested menu` from SideNav to List, and `explain why a field is
    // required` from Field to TextInput — in both cases a component whose
    // guidance happens to mention the other word displaced the real answer.
    // Guidance decides single-word queries; it must not win multi-word ones on
    // breadth. Same reason weakKeywords are capped.
    expect(scoreCandidate('caution', banner)?.score).toBeLessThan(50);
    // Both words are in this candidate's guidance and nowhere else, so if
    // guidance counted as a concept this would come back as a 2/2 match.
    const multi = scoreQuery('caution problems', tokenizeQuery('caution problems'), banner);
    expect(multi).toBeNull();
  });

  it('lets a real description hit still win the multi-word pass', () => {
    // The floor must exclude guidance without muting the tiers above it.
    const hit = scoreQuery('persistent message', tokenizeQuery('persistent message'), banner);
    expect(hit?.reason).toMatch(/matches 2\/2 terms/);
  });

  it('tolerates the object-shaped bestPractices entries core actually ships', () => {
    // Core writes `{guidance: true, description: '...'}`, not plain strings.
    const hit = scoreCandidate('resolve', {
      name: 'X',
      guidance: ['Use error for problems the reader must resolve.'],
    });
    expect(hit?.score).toBe(45);
  });
});
