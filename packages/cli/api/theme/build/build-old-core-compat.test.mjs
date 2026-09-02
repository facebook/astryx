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
  it('builds a palette-free theme when the installed Core predates palettes', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'legacy-theme.mjs'),
      `export default {name: 'legacy-theme', tokens: {'--color-accent': '#123456'}};\n`,
    );

    await expect(
      themeBuild('legacy-theme.mjs', {}, {cwd: tmpDir}),
    ).resolves.toMatchObject({type: 'theme.build'});
  });

  it('requires palette support only when the resolved theme has palettes', async () => {
    const tones = Object.fromEntries(
      Array.from({length: 21}, (_, index) => [index * 5, '#123456']),
    );
    fs.writeFileSync(
      path.join(tmpDir, 'palette-helper-theme.mjs'),
      `export default ${JSON.stringify({
        name: 'palette-helper-theme',
        tokens: {'--color-accent': '#123456'},
        palettes: {blue: {light: tones}},
      })};\n`,
    );

    await expect(
      themeBuild('palette-helper-theme.mjs', {}, {cwd: tmpDir}),
    ).rejects.toThrow('does not support approved tonal palettes');
  });
});
