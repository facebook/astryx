// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {runCodemods} from '../runner.mjs';

let tmpDir;
let originalCwd;

beforeEach(() => {
  originalCwd = process.cwd();
  // Repo-local temp dir (not /tmp) to mirror the integration-runner tests and
  // avoid any Vite dynamic-import quirks with absolute /tmp paths.
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-runner-test-'));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('runCodemods — unified config codemod path', () => {
  it('routes a core config codemod through the (file, api) runner to edit astryx.config.*', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: 'consumer'}),
    );
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.config.mjs'),
      `export default { theme: 'old-theme' };\n`,
    );

    // A synthetic CORE registry transform marked as a config codemod via
    // meta.codemodType === 'config'. It authors against the unified
    // (file, api) => string contract, just like createConfigCodemod results.
    const versionManifests = [
      {
        version: '0.1.3',
        transforms: [
          {
            name: 'synthetic-config-codemod',
            meta: {
              title: 'Synthetic config codemod',
              codemodType: 'config',
            },
            transform: (file, api) => {
              // Exercise the unified (file, api) contract: api carries a
              // configured jscodeshift instance, and the transform returns the
              // rewritten source string (or null/undefined for no-op).
              expect(typeof api.jscodeshift).toBe('function');
              return file.source.replace('old-theme', 'new-theme');
            },
          },
        ],
      },
    ];

    const result = await runCodemods(versionManifests, {
      apply: true,
      path: './src',
      silent: true,
    });

    expect(result.errors).toHaveLength(0);
    expect(result.totalFilesChanged).toBe(1);
    expect(
      fs.readFileSync(path.join(tmpDir, 'astryx.config.mjs'), 'utf-8'),
    ).toContain('new-theme');
  });

  it('still runs core code codemods against source files', async () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir);
    fs.writeFileSync(path.join(srcDir, 'a.ts'), 'const foo = 1;\n');

    const versionManifests = [
      {
        version: '0.1.3',
        transforms: [
          {
            name: 'synthetic-code-codemod',
            meta: {title: 'Synthetic code codemod'},
            transform: file => file.source.replace(/foo/g, 'bar'),
          },
        ],
      },
    ];

    const result = await runCodemods(versionManifests, {
      apply: true,
      path: './src',
      silent: true,
    });

    expect(result.errors).toHaveLength(0);
    expect(result.totalFilesChanged).toBe(1);
    expect(fs.readFileSync(path.join(srcDir, 'a.ts'), 'utf-8')).toContain(
      'const bar = 1',
    );
    // writtenFiles must be returned (consumed by upgrade.mjs to run the
    // post-codemod formatting/lint hooks). Regression guard: it was previously
    // built internally but omitted from the return object, so hooks received an
    // empty file list and silently skipped, leaving codemod output unformatted.
    expect(result.writtenFiles).toEqual([path.join(srcDir, 'a.ts')]);
  });

  it('returns writtenFiles for every changed file (post-codemod hook input)', async () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir);
    fs.writeFileSync(path.join(srcDir, 'a.ts'), 'const foo = 1;\n');
    fs.writeFileSync(path.join(srcDir, 'b.ts'), 'const foo = 2;\n');
    fs.writeFileSync(path.join(srcDir, 'c.ts'), 'const untouched = 3;\n');

    const versionManifests = [
      {
        version: '0.1.3',
        transforms: [
          {
            name: 'synthetic-code-codemod',
            meta: {title: 'Synthetic code codemod'},
            transform: file => file.source.replace(/foo/g, 'bar'),
          },
        ],
      },
    ];

    const result = await runCodemods(versionManifests, {
      apply: true,
      path: './src',
      silent: true,
    });

    expect(result.totalFilesChanged).toBe(2);
    // Only the two files that actually changed are reported (not c.ts).
    expect([...result.writtenFiles].sort()).toEqual(
      [path.join(srcDir, 'a.ts'), path.join(srcDir, 'b.ts')].sort(),
    );
  });
});
