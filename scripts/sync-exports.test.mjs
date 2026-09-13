// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Core export generation regression tests.
 * @input A temporary source tree and the actual sync-exports CLI.
 * @output Checks supporting-module exports survive generation and check mode.
 * @position Process-level coverage for the core package manifest generator.
 */

import {execFileSync} from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {expect, it} from 'vitest';

it('preserves the Dialog context subpath alongside discovered components', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'astryx-sync-exports-'));

  try {
    const script = path.join(root, 'scripts/sync-exports.js');
    const manifest = path.join(root, 'packages/core/package.json');
    mkdirSync(path.dirname(script), {recursive: true});
    copyFileSync(new URL('./sync-exports.js', import.meta.url), script);
    for (const name of ['Button', 'Dialog', 'NavItem']) {
      const dir = path.join(root, 'packages/core/src', name);
      mkdirSync(dir, {recursive: true});
      writeFileSync(path.join(dir, 'index.ts'), '');
    }
    writeFileSync(manifest, JSON.stringify({exports: {}}));

    execFileSync(process.execPath, [script]);
    const {exports} = JSON.parse(readFileSync(manifest, 'utf8'));

    expect(exports['./Dialog/DialogContext']).toEqual({
      source: './src/Dialog/DialogContext.ts',
      types: './dist/Dialog/DialogContext.d.ts',
      default: './dist/Dialog/DialogContext.js',
    });
    expect(exports['./Dialog']).toEqual({
      source: './src/Dialog/index.ts',
      types: './dist/Dialog/index.d.ts',
      default: './dist/Dialog/index.js',
    });
    expect(exports['./Button'].source).toBe('./src/Button/index.ts');
    expect(exports).not.toHaveProperty('./NavItem');
    expect(
      execFileSync(process.execPath, [script, '--check'], {encoding: 'utf8'}),
    ).toContain('exports are up to date');
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});
