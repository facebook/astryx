// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tooling-surface-contract.test.mjs
 * @description Pins the Node-only contract between the admitted score-ledger
 *   tooling surface and the Sandbox projection that consumes its exports.
 * @input The score-ledger module and the generator's named import list.
 * @output Fails when an admitted tooling change breaks the operational consumer
 *   that the tooling-only lane intentionally validates without a Sandbox build.
 * @position Safety contract for the first positive CI tooling surface.
 */

import fs from 'node:fs';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

import * as scoreLedger from '../../scripts/score-ledger.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const generatorPath = path.join(
  root,
  'apps/sandbox/scripts/generate-score-ledger.mjs',
);

function consumedScoreLedgerExports() {
  const source = fs.readFileSync(generatorPath, 'utf8');
  const match = source.match(
    /import\s*{([^}]*)}\s*from\s*['"]\.\.\/\.\.\/\.\.\/scripts\/score-ledger\.mjs['"]/,
  );
  if (!match) throw new Error('Sandbox score-ledger import was not found');
  return match[1]
    .split(',')
    .map(name => name.trim())
    .filter(Boolean);
}

describe('score-ledger tooling surface', () => {
  it('keeps every Sandbox projection import available', () => {
    const consumed = consumedScoreLedgerExports();
    expect(consumed.length).toBeGreaterThan(0);
    for (const name of consumed) {
      expect(scoreLedger, `missing Sandbox export ${name}`).toHaveProperty(
        name,
      );
    }
  });

  it('keeps projected values in the shapes the generated module emits', () => {
    expect(scoreLedger.AUDIT_PROMPT).toEqual(expect.any(String));
    expect(scoreLedger.AUDIT_PROMPT.length).toBeGreaterThan(0);
    expect(scoreLedger.DEFAULT_LEDGER_URL).toMatch(/^https:\/\//);
    expect(scoreLedger.DEFAULT_REPO).toEqual(expect.any(String));
    expect(scoreLedger.LEDGER_FETCH_TIMEOUT_MS).toBeGreaterThan(0);
    expect(scoreLedger.SECTION_TITLES).toEqual(expect.any(Object));
    expect(scoreLedger.SECTION_WEIGHTS).toEqual(expect.any(Object));
    expect(scoreLedger.isBlocksShape).toEqual(expect.any(Function));
    expect(scoreLedger.isEvidenceItem).toEqual(expect.any(Function));
    expect(scoreLedger.listComponents).toEqual(expect.any(Function));
  });
});
