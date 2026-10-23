// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Below the first result, matches the lexical ranker scored the same
 * are ordered by fit, not by name: a part of the first result leads its tie,
 * then the match on the query's rarer words. Scores, reasons and the set of
 * results stay the lexical ranker's (see _order.test.mjs).
 */

import {describe, expect, it} from 'vitest';
import {search} from './search.mjs';

describe('ties below the first result', () => {
  it('a part of the first result leads its tie', async () => {
    const results = (await search('progress bar with percent')).data.results;
    expect(results[0]).toMatchObject({name: 'ProgressBar'});
    expect(results[1]?.name).toMatch(/^ProgressBar./);
  });

  it('keeps which results are shown', async () => {
    const results = (await search('chat')).data.results.map(r => r.name);
    expect(results).toContain('ai-chat');
    expect(results).toContain('ai-chat-landing');
  });
});
