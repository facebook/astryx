// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Type-level checks for the area kit, run by the
 * CLI's strict type check: a node has exactly two kinds and a complete
 * descriptor. Each `@ts-expect-error` below must stay an error.
 * @input none
 * @output none (checked by tsc only)
 * @position next to the kit it checks
 */

import {defineSearcher} from './areas.mjs';
import type {AreaNode} from './areas.type.mjs';

type Req = {query: string};
type Ans = {results: string[]};

const ok = defineSearcher<Req, Ans, null, null>({
  id: 'main',
  area: 'demo',
  summary: 'Echo.',
  handles: [{input: {query: 'a'}, expect: {results: ['a']}}],
  declines: [{input: {query: ''}, note: 'empty'}],
  weights: null,
  tests: 'main.test.mjs',
  run: request => ({results: [request.query]}),
});

export const nodes: AreaNode<Req, Ans, null>[] = [ok];

// @ts-expect-error a third kind is not a node
export const third: AreaNode<Req, Ans, null> = {...ok, kind: 'ranker'};

// @ts-expect-error a searcher needs examples
defineSearcher<Req, Ans, null, null>({
  id: 'bare',
  area: 'demo',
  summary: 'No examples.',
  weights: null,
  tests: 'bare.test.mjs',
  run: () => null,
});

defineSearcher<Req, Ans, null, null>({
  id: 'wrong-answer',
  area: 'demo',
  summary: 'Answers in the wrong shape.',
  handles: [{input: {query: 'a'}, expect: {}}],
  declines: [{input: {query: ''}, note: 'empty'}],
  weights: null,
  tests: 'wrong-answer.test.mjs',
  // @ts-expect-error a searcher answers in the area's shape
  run: () => ({result: 'a'}),
});
