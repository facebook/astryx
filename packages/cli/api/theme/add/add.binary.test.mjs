// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {themeAdd} from './add.mjs';

const HEADER = '// Copyright (c) Meta Platforms, Inc. and affiliates.\n\n';

let tmpDir;

/** Every byte value, so any lossy text decoding shows up as a changed file. */
const FONT_BYTES = Buffer.concat([
  Buffer.from('wOF2'),
  Buffer.from(Array.from({length: 256}, (_, byte) => byte)),
]);

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-themeadd-binary-'));
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
  fs.writeFileSync(
    path.join(packageDir, 'package.json'),
    JSON.stringify({name: '@acme/themes', version: '1.0.0'}),
  );
  fs.writeFileSync(
    path.join(packageDir, 'astryx.integration.mjs'),
    "export default {themes: './themes'};\n",
  );
  fs.writeFileSync(
    path.join(packageDir, 'themes', 'manifest.json'),
    JSON.stringify({
      version: 1,
      themes: [
        {
          slug: 'ocean',
          displayName: 'Ocean',
          description: 'Integration theme that ships a font.',
          maintained: true,
          entry: 'oceanTheme.ts',
          exportName: 'oceanTheme',
          files: ['oceanTheme.ts', 'fonts/ocean.woff2'],
        },
      ],
    }),
  );
  fs.writeFileSync(
    path.join(themeDir, 'oceanTheme.ts'),
    `${HEADER}export const oceanTheme = {};\n`,
  );
  fs.writeFileSync(path.join(themeDir, 'fonts', 'ocean.woff2'), FONT_BYTES);
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('themeAdd copies every listed file', () => {
  it('copies a binary file byte for byte', async () => {
    const result = await themeAdd('ocean', {
      cwd: tmpDir,
      package: '@acme/themes',
    });

    expect(result.data.files).toEqual(['oceanTheme.ts', 'fonts/ocean.woff2']);
    const copied = fs.readFileSync(
      path.join(tmpDir, 'src', 'themes', 'ocean', 'fonts', 'ocean.woff2'),
    );
    expect(copied.equals(FONT_BYTES)).toBe(true);
  });

  it('still strips the repo header from a text source', async () => {
    await themeAdd('ocean', {cwd: tmpDir, package: '@acme/themes'});

    expect(
      fs.readFileSync(
        path.join(tmpDir, 'src', 'themes', 'ocean', 'oceanTheme.ts'),
        'utf-8',
      ),
    ).toBe('export const oceanTheme = {};\n');
  });
});
