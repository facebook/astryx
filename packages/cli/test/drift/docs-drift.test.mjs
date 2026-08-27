// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CI gate: the colocated CLI docs must stay in sync with their sources of
 * truth (parse, command↔function refs, and the two enums vs their real sets).
 */

import {describe, it, expect} from 'vitest';
import {runDrift} from './docs-drift.mjs';

describe('colocated CLI docs drift', () => {
  it('every doc parses and stays in sync with its source of truth', async () => {
    const {count, errors} = await runDrift();
    expect(count).toBeGreaterThan(0);
    if (errors.length) {
      throw new Error(
        `docs drift detected (${errors.length}):\n  ${errors.join('\n  ')}`,
      );
    }
    expect(errors).toEqual([]);
  }, 60_000);
});
