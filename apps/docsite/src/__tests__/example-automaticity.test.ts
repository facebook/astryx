// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration-block automaticity proof (discovery seam).
 *
 * The contract this PR series relies on: documenting a NEW Lab example needs
 * exactly two authored files — a same-stem `<Name>.tsx` + `<Name>.doc.mjs`
 * pair in the package's declared templates root (packages/lab/blocks) — and
 * ZERO edits anywhere else (no astryx.config change, no generator change, no
 * hand-maintained catalog).
 *
 * SCOPE: this file proves the DISCOVERY seam only — it writes a temporary
 * fixture pair into packages/lab/blocks and asserts the exact CLI API call
 * `generate-data.mjs` makes (`template --list/--show`, same cwd) returns it.
 * It does not re-run generation, so the projection from a discovered entry
 * into blockRegistry/showcaseRegistry/exampleRegistry is covered elsewhere:
 * by the Drawer assertions in data-extraction.test.ts (registry side) and by
 * the authored→generated admission check in example-coverage.test.ts, which
 * together pin that whatever this seam returns for Lab reaches the registries.
 *
 * The fixture files exist only while this file runs (created in beforeAll,
 * removed in afterAll; leftovers from a killed run are cleaned first). The
 * AUTOMATICITY_FIXTURE_PREFIX is reserved so the example-coverage report,
 * which walks the same directory in a parallel worker, ignores them.
 *
 * @input A temporary authored block pair in packages/lab/blocks and the CLI
 *   template listing API with the docsite's own working directory
 * @output Proof that block authoring is registration-free for integrations
 * @position Build-time docsite discovery verification
 * Run: pnpm -F @astryxdesign/docsite test
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {template as queryTemplates} from '@astryxdesign/cli/api';
import type {
  TemplateListEntry,
  TemplateListResponse,
  TemplateShowResponse,
} from '@astryxdesign/cli/api';
import {AUTOMATICITY_FIXTURE_PREFIX} from '../lib/exampleCoverage.mjs';

/** The api's declared envelope is `{type, data: unknown}`; narrow to the
 *  documented response typedefs for the two invocations this file makes. */
async function listBlocks(cwd: string): Promise<TemplateListEntry[]> {
  const response = (await queryTemplates(undefined, {
    list: true,
    type: 'block',
    cwd,
  })) as TemplateListResponse;
  return response.data;
}

const DOCSITE_ROOT = path.resolve(__dirname, '../..');
const LAB_BLOCKS_DIR = path.resolve(DOCSITE_ROOT, '../../packages/lab/blocks');
const FIXTURE_NAME = AUTOMATICITY_FIXTURE_PREFIX;
const FIXTURE_TSX = path.join(LAB_BLOCKS_DIR, `${FIXTURE_NAME}.tsx`);
const FIXTURE_DOC = path.join(LAB_BLOCKS_DIR, `${FIXTURE_NAME}.doc.mjs`);
const FIXTURE_MARKER = 'Automaticity probe: zero-registration Lab block';

const FIXTURE_TSX_SOURCE = `// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Text} from '@astryxdesign/core/Text';

export default function ${FIXTURE_NAME}() {
  return <Text>${FIXTURE_MARKER}</Text>;
}
`;

const FIXTURE_DOC_SOURCE = `// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: '${FIXTURE_NAME}',
  displayName: '${FIXTURE_NAME}',
  description:
    'Temporary test fixture written by example-automaticity.test.ts; never committed.',
  isReady: true,
  aspectRatio: 16 / 9,
  componentsUsed: ['Text'],
};
`;

function removeFixture() {
  fs.rmSync(FIXTURE_TSX, {force: true});
  fs.rmSync(FIXTURE_DOC, {force: true});
}

beforeAll(() => {
  expect(fs.existsSync(LAB_BLOCKS_DIR)).toBe(true);
  removeFixture();
  fs.writeFileSync(FIXTURE_TSX, FIXTURE_TSX_SOURCE, 'utf-8');
  fs.writeFileSync(FIXTURE_DOC, FIXTURE_DOC_SOURCE, 'utf-8');
});

afterAll(() => {
  removeFixture();
});

describe('integration block automaticity', () => {
  it('discovers a newly authored Lab block pair with zero registration edits', async () => {
    // Exactly what generate-data.mjs runs to assemble the canary block
    // registry — same API, same cwd. Nothing about the fixture exists outside
    // packages/lab/blocks: astryx.config.mjs, the Lab integration manifest,
    // and every generator are untouched.
    const entries = await listBlocks(DOCSITE_ROOT);
    const entry = entries.find(
      candidate =>
        candidate.package === '@astryxdesign/lab' &&
        candidate.id === FIXTURE_NAME,
    );
    expect(
      entry,
      'authored fixture pair was not discovered as a Lab block',
    ).toBeDefined();
    expect(entry!.name).toBe(FIXTURE_NAME);
    expect(entry!.description).toContain('Temporary test fixture');

    const shown = (await queryTemplates(entry!.id, {
      show: true,
      type: 'block',
      package: entry!.package,
      cwd: DOCSITE_ROOT,
    })) as TemplateShowResponse;
    expect(shown.data.source).toContain(FIXTURE_MARKER);
  }, 60_000);

  it('still lists the real Drawer blocks alongside the fixture (no shadowing)', async () => {
    const entries = await listBlocks(DOCSITE_ROOT);
    const labIds = entries
      .filter(candidate => candidate.package === '@astryxdesign/lab')
      .map(candidate => candidate.id);
    expect(labIds).toContain('DrawerShowcase');
    expect(labIds).toContain(FIXTURE_NAME);
  }, 60_000);
});
