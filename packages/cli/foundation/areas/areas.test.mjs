// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  defineArea,
  defineDispatcher,
  defineSearcher,
  loadAreaWeights,
  runArea,
} from './areas.mjs';

/** @typedef {{query: string}} Req */
/** @typedef {{results: string[]}} Ans */
/** @typedef {{names: string[]}} Cat */

const catalog = {names: ['Button', 'ButtonGroup', 'Card']};

/** @param {Partial<Record<string, any>>} over */
const searcher = (over = {}) =>
  defineSearcher({
    id: 'main',
    area: 'demo',
    summary: 'Names that contain the query.',
    handles: [{input: {query: 'card'}, expect: {results: ['Card']}}],
    declines: [{input: {query: 'zzz'}, note: 'nothing matches'}],
    weights: null,
    tests: 'main.test.mjs',
    /** @param {Req} request @param {import('./areas.type.mjs').NodeContext<Cat, never>} ctx */
    run: (request, ctx) => {
      const results = ctx.catalog.names.filter(n =>
        n.toLowerCase().includes(request.query),
      );
      return results.length ? {results} : null;
    },
    ...over,
  });

const exact = defineSearcher({
  id: 'exact',
  area: 'demo',
  summary: 'The one name the query spells.',
  handles: [{input: {query: 'Button'}, expect: {results: ['Button']}}],
  declines: [{input: {query: 'butt'}, note: 'not a whole name'}],
  weights: 'exact.weights.json',
  tests: 'exact.test.mjs',
  /** @param {Req} request @param {import('./areas.type.mjs').NodeContext<Cat, {prefix: string}>} ctx */
  run: (request, ctx) => {
    const hit = ctx.catalog.names.find(n => n === request.query);
    return hit ? {results: [`${ctx.weights?.prefix ?? ''}${hit}`]} : null;
  },
});

/** @param {number} confidence */
const root = (confidence = 1) =>
  defineDispatcher({
    id: 'root',
    area: 'demo',
    summary: 'Identifiers go to exact lookup.',
    handles: [{input: {query: 'Button'}, expect: {ids: ['exact']}}],
    declines: [{input: {query: 'button'}, note: 'not an identifier'}],
    weights: null,
    tests: 'root.test.mjs',
    children: ['exact', 'main'],
    floor: 0.5,
    fallback: 'main',
    /** @param {Req} request */
    route: request =>
      /^[A-Z]/.test(request.query)
        ? {ids: ['exact'], confidence}
        : {ids: [], confidence: 0},
  });

const area = (confidence = 1) =>
  defineArea({
    area: 'demo',
    root: 'root',
    nodes: [root(confidence), exact, searcher()],
  });

describe('defineSearcher / defineDispatcher', () => {
  it('stamp the kind', () => {
    expect(searcher().kind).toBe('searcher');
    expect(root().kind).toBe('dispatcher');
  });
  it('reject an incomplete descriptor', () => {
    expect(() => searcher({id: 'Main'})).toThrow(/kebab-case/);
    expect(() => searcher({summary: 'two\nlines'})).toThrow(/one plain line/);
    expect(() => searcher({handles: []})).toThrow(/handled example/);
    expect(() => searcher({declines: []})).toThrow(/not-handled example/);
    expect(() => searcher({declines: [{input: {query: ''}}]})).toThrow(/note/);
    expect(() => searcher({weights: 'w.json'})).toThrow(/main.weights.json/);
    expect(() => searcher({tests: 'x.test.mjs'})).toThrow(/main.test.mjs/);
  });
});

describe('defineArea', () => {
  it('rejects a missing child, a non-searcher fallback, a duplicate, a foreign node', () => {
    expect(() =>
      defineArea({area: 'demo', root: 'root', nodes: [root(), searcher()]}),
    ).toThrow(/missing node "exact"/);
    const toRoot = defineDispatcher({...root(), fallback: 'root'});
    expect(() =>
      defineArea({
        area: 'demo',
        root: 'root',
        nodes: [toRoot, exact, searcher()],
      }),
    ).toThrow(/not a searcher/);
    expect(() =>
      defineArea({area: 'demo', root: 'main', nodes: [searcher(), searcher()]}),
    ).toThrow(/duplicate/);
    expect(() =>
      defineArea({area: 'other', root: 'main', nodes: [searcher()]}),
    ).toThrow(/belongs to "demo"/);
  });
  it('rejects a dispatcher cycle', () => {
    const a = defineDispatcher({
      ...root(),
      id: 'a',
      tests: 'a.test.mjs',
      children: ['b'],
    });
    const b = defineDispatcher({
      ...root(),
      id: 'b',
      tests: 'b.test.mjs',
      children: ['a'],
    });
    expect(() =>
      defineArea({area: 'demo', root: 'a', nodes: [a, b, searcher()]}),
    ).toThrow(/cycle a -> b -> a/);
  });
});

describe('runArea', () => {
  const run = (/** @type {string} */ query, /** @type {any} */ extra = {}) =>
    runArea(
      area(extra.confidence ?? 1),
      {query},
      {catalog, weights: {exact: {prefix: '>'}}, ...extra},
    );

  it('takes the first routed answer at or above the floor', async () => {
    expect(await run('Button')).toEqual({results: ['>Button']});
  });
  it('falls back below the floor', async () => {
    expect(await run('Card', {confidence: 0.2})).toEqual(null);
    expect(await run('Button', {confidence: 0.2})).toEqual(null);
    const lower = await runArea(
      area(0.2),
      {query: 'button'},
      {catalog, weights: {}},
    );
    expect(lower).toEqual({results: ['Button', 'ButtonGroup']});
  });
  it('runs the fallback, not the routed node, below the floor', async () => {
    /** @type {any[]} */
    const steps = [];
    await run('Button', {
      confidence: 0.2,
      tuning: {onTrace: (/** @type {any} */ e) => steps.push(e)},
    });
    expect(steps.map(s => [s.nodeId, s.fallback])).toEqual([
      ['root', false],
      ['main', true],
    ]);
  });
  it('falls back when no routed node answers', async () => {
    expect(await run('Butt')).toEqual(null);
    expect(await run('Car')).toEqual(null);
    expect(await run('card')).toEqual({results: ['Card']});
  });
  it('uses a tuning override over the shipped weights, and traces every step', async () => {
    /** @type {any[]} */
    const steps = [];
    const answer = await run('Button', {
      tuning: {
        weights: {exact: {prefix: '*'}},
        onTrace: (/** @type {any} */ e) => steps.push(e),
      },
    });
    expect(answer).toEqual({results: ['*Button']});
    expect(steps.map(s => [s.nodeId, s.kind, s.depth, s.fallback])).toEqual([
      ['root', 'dispatcher', 0, false],
      ['exact', 'searcher', 1, false],
    ]);
    expect(steps[1].answered).toBe(true);
  });
  it('gives the same answer with an empty tuning as with none', async () => {
    expect(await run('Button', {tuning: {}})).toEqual(await run('Button'));
  });
  it('runs one node slice with start', async () => {
    expect(await run('card', {start: 'main'})).toEqual({results: ['Card']});
  });
  it('rejects a route to a node that is not a child', async () => {
    const stray = defineDispatcher({
      ...root(),
      route: () => ({ids: ['root'], confidence: 1}),
    });
    const bad = defineArea({
      area: 'demo',
      root: 'root',
      nodes: [stray, exact, searcher()],
    });
    await expect(
      runArea(bad, {query: 'x'}, {catalog, weights: {}}),
    ).rejects.toThrow(/not one of its children/);
  });
  it('runs prepare once before the root', async () => {
    let calls = 0;
    const prepared = defineArea({
      area: 'demo',
      root: 'main',
      nodes: [searcher()],
      prepare: (/** @type {Req} */ request) => {
        calls++;
        return {query: request.query.toLowerCase()};
      },
    });
    expect(
      await runArea(prepared, {query: 'CARD'}, {catalog, weights: {}}),
    ).toEqual({results: ['Card']});
    expect(calls).toBe(1);
  });
});

describe('loadAreaWeights', () => {
  it('reads each declared weights file through the given reader', () => {
    /** @type {string[]} */
    const read = [];
    const weights = loadAreaWeights(area(), file => {
      read.push(file);
      return {prefix: '!'};
    });
    expect(read).toEqual(['exact.weights.json']);
    expect(weights).toEqual({exact: {prefix: '!'}});
  });
});
