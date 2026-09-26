// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {integrationPackCheck} from './pack-check.mjs';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-pack-check-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

/** @param {Record<string, string>} scripts */
function writeThemePackage(scripts) {
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    `${JSON.stringify(
      {
        name: '@acme/widgets',
        version: '1.0.0',
        files: ['astryx.integration.mjs', 'themes'],
        scripts,
      },
      null,
      2,
    )}\n`,
  );
  fs.writeFileSync(
    path.join(tmpDir, 'astryx.integration.mjs'),
    "export default {themes: './themes'};\n",
  );
  const root = path.join(tmpDir, 'themes');
  fs.mkdirSync(path.join(root, 'ocean'), {recursive: true});
  fs.writeFileSync(
    path.join(root, 'ocean', 'oceanTheme.ts'),
    "import {defineTheme} from '@astryxdesign/core/theme';\n\nexport const oceanTheme = defineTheme({name: 'ocean'});\n",
  );
  fs.writeFileSync(
    path.join(root, 'manifest.json'),
    `${JSON.stringify(
      {
        version: 1,
        themes: [
          {
            slug: 'ocean',
            displayName: 'Ocean',
            description: 'Ocean theme.',
            maintained: true,
            entry: 'oceanTheme.ts',
            exportName: 'oceanTheme',
            files: ['oceanTheme.ts'],
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
}

describe('integrationPackCheck with lifecycle script output', () => {
  it('checks the tarball when lifecycle scripts print to stdout', async () => {
    writeThemePackage({
      prepack: 'node -e "console.log(\'building the package\')"',
      prepare: 'node -e "console.log(\'preparing\')"',
      postpack: 'node -e "console.log(\'packed\')"',
    });

    const result = await integrationPackCheck({cwd: tmpDir});

    expect(result.data.issues).toEqual([]);
    expect(result.data.packable).toBe(true);
    expect(result.data.tarball?.filename).toBe('acme-widgets-1.0.0.tgz');
    expect(result.data.contributions.packed).toEqual(
      result.data.contributions.local,
    );
  });

  it('still runs a chatty lifecycle script and compares what it packed', async () => {
    const renameTheme = [
      "console.log('renaming ocean to storm')",
      "const fs=require('fs')",
      "fs.renameSync('themes/ocean','themes/storm')",
      "const p='themes/manifest.json'",
      'const x=JSON.parse(fs.readFileSync(p))',
      "x.themes[0].slug='storm'",
      'fs.writeFileSync(p,JSON.stringify(x))',
    ].join(';');
    writeThemePackage({prepack: `node -e "${renameTheme}"`});

    const result = await integrationPackCheck({cwd: tmpDir});
    const codes = result.data.issues.map(issue => issue.code);

    expect(codes).not.toContain('pack_failed');
    expect(codes).toContain('identity_not_packed');
    expect(codes).toContain('packed_identity_unexpected');
    expect(result.data.packable).toBe(false);
  });

  it('keeps a failing lifecycle script output in the pack_failed issue', async () => {
    writeThemePackage({
      prepack:
        'node -e "console.error(\'prepack exploded\'); process.exit(3)"',
    });

    const result = await integrationPackCheck({cwd: tmpDir});
    const failure = result.data.issues.find(
      issue => issue.code === 'pack_failed',
    );

    expect(result.data.packable).toBe(false);
    expect(failure?.message).toContain('npm pack failed (exit 3)');
    expect(failure?.message).toContain('prepack exploded');
  });
});
