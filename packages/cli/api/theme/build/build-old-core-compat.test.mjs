// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

vi.mock('@astryxdesign/core/theme', async importActual => {
  const actual = /** @type {Record<string, unknown>} */ (await importActual());
  const {defineTonalPalettes: _unsupported, ...olderCore} = actual;
  return {...olderCore, defineTonalPalettes: undefined};
});

const {themeBuild} = await import('./build.mjs');

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-old-core-build-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('themeBuild() — older core compatibility', () => {
  it('builds palette-free themes without defineTonalPalettes', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'legacy-theme.mjs'),
      `export default {name: 'legacy-theme', tokens: {'--color-accent': '#123456'}};\n`,
    );

    await expect(
      themeBuild('legacy-theme.mjs', {}, {cwd: tmpDir}),
    ).resolves.toMatchObject({type: 'theme.build'});
  });

  it('requires a newer core only when palette metadata is present', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'palette-theme.mjs'),
      `export default {name: 'palette-theme', palettes: {blue: {light: {}}}};\n`,
    );

    await expect(
      themeBuild('palette-theme.mjs', {}, {cwd: tmpDir}),
    ).rejects.toThrow('does not export defineTonalPalettes');
  });
});
