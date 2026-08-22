// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * A component's *documented* theming vars must survive `astryx theme build`.
 *
 * `validatePrivateVars` rejects a theme that sets a `--_*` var, on the rule
 * that private vars are reached through the derived-var pipeline rather than
 * written directly. That makes "which prefix a themeable var carries" a
 * build-time contract, not a naming preference — and nothing was checking the
 * two against each other, so a component could ship docs and a changeset
 * telling theme authors to set a var the build then complains about (#5214).
 *
 * This runs the real builder over the snippet the docs advertise, and asserts
 * on the receipt's `warnings` rather than on a rejection: a private var is
 * reported (logged as `✗`, collected into the receipt) but the build still
 * emits its CSS and resolves. Asserting a throw here would pass for the wrong
 * reason — it never throws.
 *
 * `themeBuild` compiles via @astryxdesign/core's generator, so it needs a built
 * core — the `node` project's globalSetup builds it once before workers fork.
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {themeBuild} from './build.mjs';

vi.setConfig({testTimeout: 30000});

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-public-vars-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

/** Build a theme whose components block is `components`, returning stderr-ish errors. */
async function buildTheme(name, components) {
  const themeFile = path.join(tmpDir, `${name}.mjs`);
  fs.writeFileSync(
    themeFile,
    `export default ${JSON.stringify({name, tokens: {}, components}, null, 2)};\n`,
  );
  return themeBuild(`${name}.mjs`, {}, {cwd: tmpDir});
}

describe('documented component vars build cleanly', () => {
  it('accepts the Spinner geometry and color snippet from its docs', async () => {
    // The exact shape Spinner.doc.mjs and the changeset tell theme authors to
    // write. A `--_`-prefixed var here fails the build instead.
    const result = await buildTheme('spinnertheme', {
      spinner: {
        'size:xl': {
          '--spinner-diameter': '2.5rem',
          '--spinner-rail-width': '0.375rem',
        },
        'shade:subtle': {'--spinner-track-color': 'transparent'},
        base: {'--spinner-color': 'var(--color-accent)'},
      },
    });

    expect(result).not.toBeNull();
    expect(result?.type).toBe('theme.build');
    expect(
      (result?.data.warnings ?? []).filter(w => /private var/i.test(w)),
    ).toEqual([]);
  });

  it('still refuses a private var, so the rule this relies on is real', async () => {
    // The negative control for the test above: if the builder ever stopped
    // reporting `--_*`, the check would pass for the wrong reason.
    const result = await buildTheme('privatetheme', {
      spinner: {'size:xl': {'--_spinner-diameter': '40px'}},
    });

    expect(
      (result?.data.warnings ?? []).filter(w => /private var/i.test(w)),
    ).toHaveLength(1);
  });
});
