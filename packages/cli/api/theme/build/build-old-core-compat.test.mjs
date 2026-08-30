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
  it('requires a Core version that supports the palette contract', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'legacy-theme.mjs'),
      `export default {name: 'legacy-theme', tokens: {'--color-accent': '#123456'}};\n`,
    );

    await expect(
      themeBuild('legacy-theme.mjs', {}, {cwd: tmpDir}),
    ).rejects.toThrow('does not support approved tonal palettes');
  });

  it('reports the compatibility error before evaluating a theme module', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'palette-helper-theme.mjs'),
      `import {defineTheme, defineTonalPalettes} from '@astryxdesign/core/theme';
const palettes = defineTonalPalettes({blue: {light: {}}});
export default defineTheme({name: 'palette-helper-theme', palettes});
`,
    );

    await expect(
      themeBuild('palette-helper-theme.mjs', {}, {cwd: tmpDir}),
    ).rejects.toThrow('does not support approved tonal palettes');
  });
});
