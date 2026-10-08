// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Cleanup-stage compatibility: `theme eject` keeps the released copying
 * `theme add` receipt fields, file order, and copied bytes. Its one intentional
 * addition is the unmaintained descriptor that makes the fork a local theme.
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {themeEject} from './eject.mjs';
import {runCli} from '../../../test-utils/run-cli.mjs';

const HEADER = '// Copyright (c) Meta Platforms, Inc. and affiliates.\n\n';
const FILES = [
  'oceanTheme.ts',
  'fonts/ocean.woff2',
  'icons.tsx',
  'oceanTheme.doc.mjs',
  'tokens/colors.ts',
];
const FONT_BYTES = Buffer.concat([
  Buffer.from('wOF2'),
  Buffer.from(Array.from({length: 256}, (_, byte) => byte)),
]);

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-themeeject-compat-'));
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({
      name: 'consumer',
      dependencies: {'@acme/themes': '^1.0.0'},
    }),
  );
  const packageDir = path.join(tmpDir, 'node_modules', '@acme', 'themes');
  const themeDir = path.join(packageDir, 'themes', 'ocean');
  fs.mkdirSync(path.join(themeDir, 'fonts'), {recursive: true});
  fs.mkdirSync(path.join(themeDir, 'tokens'), {recursive: true});
  fs.writeFileSync(
    path.join(packageDir, 'package.json'),
    JSON.stringify({name: '@acme/themes', version: '1.0.0'}),
  );
  fs.writeFileSync(
    path.join(packageDir, 'astryx.integration.mjs'),
    "export default {themes: './themes'};\n",
  );
  fs.writeFileSync(
    path.join(themeDir, 'oceanTheme.doc.mjs'),
    `/** @type {import('@astryxdesign/cli/authoring').ThemeDoc} */
export default {type: 'theme', name: 'ocean', displayName: 'Ocean', description: 'Integration theme that ships a font.', maintained: true};
`,
  );
  fs.writeFileSync(
    path.join(themeDir, 'oceanTheme.ts'),
    `${HEADER}export const oceanTheme = {};\n`,
  );
  fs.writeFileSync(
    path.join(themeDir, 'icons.tsx'),
    'export const oceanIcons = {};\n',
  );
  fs.writeFileSync(path.join(themeDir, 'fonts', 'ocean.woff2'), FONT_BYTES);
  fs.writeFileSync(
    path.join(themeDir, 'tokens', 'colors.ts'),
    "export const oceanBlue = '#0064e0';\n",
  );
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('themeEject released-copy compatibility', () => {
  it('keeps the old copy receipt fields and output order', async () => {
    const result = await themeEject('ocean', {
      cwd: tmpDir,
      package: '@acme/themes',
    });

    expect(result).toEqual({
      type: 'theme.eject',
      data: {
        slug: 'ocean',
        displayName: 'Ocean',
        maintained: true,
        package: '@acme/themes',
        outputDir: 'src/themes/ocean',
        entry: 'oceanTheme.ts',
        exportName: 'oceanTheme',
        files: FILES,
      },
    });
    expect(Object.keys(result.data)).toEqual([
      'slug',
      'displayName',
      'maintained',
      'package',
      'outputDir',
      'entry',
      'exportName',
      'files',
    ]);
  });

  it('keeps copied source and binary bytes, with only the local descriptor change', async () => {
    await themeEject('ocean', {cwd: tmpDir, package: '@acme/themes'});
    const output = path.join(tmpDir, 'src', 'themes', 'ocean');

    expect(fs.readFileSync(path.join(output, 'oceanTheme.ts'), 'utf-8')).toBe(
      'export const oceanTheme = {};\n',
    );
    expect(
      fs
        .readFileSync(path.join(output, 'fonts/ocean.woff2'))
        .equals(FONT_BYTES),
    ).toBe(true);
    expect(fs.readFileSync(path.join(output, 'icons.tsx'), 'utf-8')).toBe(
      'export const oceanIcons = {};\n',
    );
    expect(
      fs.readFileSync(path.join(output, 'tokens/colors.ts'), 'utf-8'),
    ).toBe("export const oceanBlue = '#0064e0';\n");
    expect(
      fs.readFileSync(path.join(output, 'oceanTheme.doc.mjs'), 'utf-8'),
    ).toContain('maintained: false');
  });

  it('keeps the same fields and file order in CLI JSON and text', async () => {
    const json = await runCli(
      [
        'theme',
        'eject',
        'ocean',
        'json-fork',
        '--package',
        '@acme/themes',
        '--json',
      ],
      tmpDir,
    );
    expect(json.status, json.stderr).toBe(0);
    expect(JSON.parse(json.stdout)).toMatchObject({
      type: 'theme.eject',
      data: {outputDir: 'json-fork', files: FILES},
    });

    const text = await runCli(
      ['theme', 'eject', 'ocean', 'text-fork', '--package', '@acme/themes'],
      tmpDir,
    );
    expect(text.status, text.stderr).toBe(0);
    const positions = FILES.map(file => text.stdout.indexOf(file));
    expect(positions.every(position => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });
});
