// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as http from 'node:http';
import {describe, expect, it} from 'vitest';
import {defineArea, defineDispatcher, defineSearcher} from './areas.mjs';
import {
  assertOffline,
  checkExamples,
  partialMatch,
  pinOutputBytes,
} from './testing.mjs';

describe('assertOffline', () => {
  it('passes code that stays local and returns its value', async () => {
    expect(await assertOffline(() => 2 + 2)).toBe(4);
  });
  it('fails code that reaches the network, even when it catches the error', async () => {
    await expect(
      assertOffline(() => {
        try {
          http.get('http://example.invalid');
        } catch {
          // swallowed on purpose
        }
      }),
    ).rejects.toThrow(/reached http.get/);
    await expect(
      assertOffline(() => fetch('http://example.invalid')),
    ).rejects.toThrow(/fetch/);
  });
  it('restores what it stubbed', async () => {
    const before = http.get;
    await assertOffline(() => null);
    expect(http.get).toBe(before);
  });
});

describe('pinOutputBytes', () => {
  it('fails an answer longer than its pin', async () => {
    const run = (/** @type {string} */ q) => ({q});
    await pinOutputBytes(run, [{input: 'a', maxBytes: 9}]);
    await expect(
      pinOutputBytes(run, [{input: 'abc', maxBytes: 9}]),
    ).rejects.toThrow(/answers grew/);
  });
});

describe('partialMatch', () => {
  it('matches stated keys and leading array items only', () => {
    expect(partialMatch({a: 1, b: [1, 2, 3]}, {b: [1, 2]})).toBe(true);
    expect(partialMatch({a: 1}, {a: 2})).toBe(false);
    expect(partialMatch([1], [1, 2])).toBe(false);
    expect(partialMatch(null, {a: 1})).toBe(false);
  });
});

describe('checkExamples', () => {
  const main = defineSearcher({
    id: 'main',
    area: 'demo',
    summary: 'Echoes a non-empty query.',
    handles: [{input: 'hi', expect: {echo: 'hi'}}],
    declines: [{input: '', note: 'empty'}],
    weights: null,
    tests: 'main.test.mjs',
    run: (/** @type {string} */ q) => (q ? {echo: q} : null),
  });
  const root = defineDispatcher({
    id: 'root',
    area: 'demo',
    summary: 'Long queries go to main.',
    handles: [{input: 'hello', expect: {ids: ['main']}}],
    declines: [{input: 'x', note: 'too short to be sure'}],
    weights: null,
    tests: 'root.test.mjs',
    children: ['main'],
    floor: 0.5,
    fallback: 'main',
    route: (/** @type {string} */ q) => ({
      ids: ['main'],
      confidence: q.length > 3 ? 1 : 0,
    }),
  });
  const area = defineArea({area: 'demo', root: 'root', nodes: [root, main]});

  it('passes examples that hold', async () => {
    await checkExamples(area, 'main', {catalog: null, weights: {}});
    await checkExamples(area, 'root', {catalog: null, weights: {}});
  });
  it('fails an example that no longer holds', async () => {
    const wrong = defineSearcher({
      ...main,
      handles: [{input: 'hi', expect: {echo: 'bye'}}],
    });
    const bad = defineArea({area: 'demo', root: 'main', nodes: [wrong]});
    await expect(
      checkExamples(bad, 'main', {catalog: null, weights: {}}),
    ).rejects.toThrow(/handles "hi"/);
  });
});
