// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Regression guard: the authoring-migration codemods must be REACHABLE
 * through `astryx upgrade`, not just correct in isolation.
 *
 * `upgrade` targets the installed @astryxdesign/core version — it runs every
 * codemod in `(from, installedCore]`. The v0.3.0 authoring codemods
 * (unwrap-factories / migrate-imports / rename-doctypes) are registered at the
 * registry's top version, so they only run when the installed core has reached
 * that version. Because core ships in the same fixed-version release group as
 * the CLI, a released core DOES reach it — but nothing pinned that invariant, so
 * a future registry entry above the shipped core version would silently strand
 * the migration (the chaos-test "codemods unreachable" finding). This test
 * fails loudly if that happens: running `astryx upgrade` with installed core at
 * the registry's latest version, starting from below the tier that holds them,
 * must rewrite an old-surface authoring file.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {upgrade} from '../upgrade.mjs';
import {
  latestVersion,
  versions,
  getTransformsBetween,
} from '../../../assets/codemods/registry.mjs';

const SLOW = 30_000;

const AUTHORING_CODEMOD = 'migrate-authoring-imports';

/** The registry version whose manifest ships the authoring migration. */
async function authoringTier() {
  const all = await getTransformsBetween('0.0.0', latestVersion);
  const tier = all.find(({transforms}) =>
    transforms.some(t => t.name === AUTHORING_CODEMOD),
  );
  if (!tier) throw new Error(`no registry version ships ${AUTHORING_CODEMOD}`);
  return tier.version;
}

/** Seed a consumer project with installed core pinned to `coreVersion`. */
function seedProject(dir, coreVersion) {
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({
      name: 'consumer',
      version: '1.0.0',
      dependencies: {'@astryxdesign/core': coreVersion},
    }),
  );
  const core = path.join(dir, 'node_modules', '@astryxdesign', 'core');
  fs.mkdirSync(core, {recursive: true});
  fs.writeFileSync(
    path.join(core, 'package.json'),
    JSON.stringify({name: '@astryxdesign/core', version: coreVersion}),
  );
  fs.mkdirSync(path.join(dir, 'src'), {recursive: true});
  // Uses the pre-v0.3.0 authoring surface the migration codemods rewrite.
  fs.writeFileSync(
    path.join(dir, 'src', 'Button.doc.mjs'),
    [
      "import {createComponentDoc} from '@astryxdesign/core/authoring';",
      "export default createComponentDoc({name: 'Button', props: []});",
      '',
    ].join('\n'),
  );
}

describe('upgrade — authoring codemods are reachable', () => {
  let dir;
  afterEach(() => dir && fs.rmSync(dir, {recursive: true, force: true}));

  it('rewrites an old-surface authoring file when installed core is at the registry latest', async () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'upg-authoring-'));
    seedProject(dir, latestVersion);
    // Start below the tier that ships the authoring codemods, so the range
    // (from, latest] contains them however many versions land on top.
    const tier = await authoringTier();
    const from = versions[versions.indexOf(tier) - 1];
    const res = await upgrade({from, path: 'src'}, {cwd: dir});
    expect(res.type).toBe('upgrade.run');
    // Dry run: the authoring codemods must have MATCHED the old-surface import.
    expect(res.data.filesChanged).toBeGreaterThan(0);
  }, SLOW);

  it('does NOT strand the migration: the authoring tier is reachable from below it', async () => {
    // The authoring codemods live at a fixed registry tier. A consumer coming
    // from under that tier must still cross it on the way to latest — if a
    // later version could exclude it, `upgrade` would skip the migration.
    const tier = await authoringTier();
    const from = versions[versions.indexOf(tier) - 1];
    const crossed = await getTransformsBetween(from, latestVersion);
    expect(crossed.map(r => r.version)).toContain(tier);
  });
});
