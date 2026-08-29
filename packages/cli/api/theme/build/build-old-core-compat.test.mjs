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

  it('ignores palette API names that only appear in comments', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'commented-palette-theme.mjs'),
      `// defineTonalPalettes() would be used by newer cores.
/* palettes: approvedPalettes */
export default {name: 'commented-palette-theme', tokens: {'--color-accent': '#123456'}};
`,
    );

    await expect(
      themeBuild('commented-palette-theme.mjs', {}, {cwd: tmpDir}),
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

  it('reports the compatibility error before evaluating the palette helper', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'palette-helper-theme.mjs'),
      `import {defineTheme, defineTonalPalettes} from '@astryxdesign/core/theme';
const palettes = defineTonalPalettes({blue: {light: {}}});
export default defineTheme({name: 'palette-helper-theme', palettes});
`,
    );

    await expect(
      themeBuild('palette-helper-theme.mjs', {}, {cwd: tmpDir}),
    ).rejects.toThrow('does not export defineTonalPalettes');
  });

  it('reports the compatibility error before older defineTheme can drop palettes', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'inline-palette-theme.mjs'),
      `import {defineTheme} from '@astryxdesign/core/theme';
export default defineTheme({
  name: 'inline-palette-theme',
  palettes: {blue: {light: {}}},
});
`,
    );

    await expect(
      themeBuild('inline-palette-theme.mjs', {}, {cwd: tmpDir}),
    ).rejects.toThrow('does not export defineTonalPalettes');
  });
});
