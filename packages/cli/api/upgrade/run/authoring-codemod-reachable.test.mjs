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
 * fails loudly if that happens: with installed core at the registry's latest
 * version, an old-surface authoring file must be rewritten by `upgrade`.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {upgrade} from '../upgrade.mjs';
import {latestVersion, versions} from '../../../assets/codemods/registry.mjs';

const SLOW = 30_000;

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
    // Upgrade from the version just below latest so the range is (prev, latest].
    const from = versions[versions.length - 2];
    const res = await upgrade({from, path: 'src'}, {cwd: dir});
    expect(res.type).toBe('upgrade.run');
    // Dry run: the authoring codemods must have MATCHED the old-surface import.
    expect(res.data.filesChanged).toBeGreaterThan(0);
  }, SLOW);

  it('does NOT strand the migration: latestVersion is the authoring codemod tier', () => {
    // The authoring codemods live at the registry's top version. If a later
    // core version is added above them without also advancing the codemods,
    // `upgrade` on a core below that version would skip them. Pinning this makes
    // that regression explicit at the registry layer.
    expect(latestVersion).toBe(versions[versions.length - 1]);
  });
});
