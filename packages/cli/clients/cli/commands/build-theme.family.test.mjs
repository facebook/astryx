// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build-theme.family.test.mjs
 * @input Public `astryx theme build --family … --family-key …` invocations
 * @output Closed flag matrix and one keyed family receipt
 * @position End-to-end AST-034 CLI contract tests
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {runCli} from '../../../test-utils/run-cli.mjs';

let cwd;
beforeEach(() => {
  cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-cli-family-'));
  fs.writeFileSync(
    path.join(cwd, 'base.mjs'),
    `import {defineTheme} from '@astryxdesign/core/theme';
export const baseTheme = defineTheme({name: 'base', tokens: {'--color-accent': 'red'}});
`,
  );
  fs.writeFileSync(
    path.join(cwd, 'child.mjs'),
    `import {defineTheme} from '@astryxdesign/core/theme';
import {baseTheme} from './base.mjs';
export const childTheme = defineTheme({name: 'child', extends: baseTheme, tokens: {'--color-accent': 'blue'}});
`,
  );
});
afterEach(() => {
  fs.rmSync(cwd, {recursive: true, force: true});
});

const family = ['--family', 'base.mjs', 'child.mjs'];

describe('theme build family CLI', () => {
  it('documents the exact family and family-key flags', async () => {
    const result = await runCli(['theme', 'build', '--help'], cwd);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('--family <base> <children...>');
    expect(result.stdout).toContain('--family-key <key>');
  });

  it('requires the key exactly in family mode and validates lower-kebab spelling', async () => {
    const missing = await runCli(['theme', 'build', ...family], cwd);
    expect(missing.status).toBe(1);
    expect(missing.stderr).toMatch(/--family-key.*required/i);

    const oneMember = await runCli(
      ['theme', 'build', '--family', 'base.mjs', '--family-key', 'family'],
      cwd,
    );
    expect(oneMember.status).toBe(1);
    expect(oneMember.stderr).toMatch(/base and at least one child/i);

    const outside = await runCli(
      ['theme', 'build', 'base.mjs', '--family-key', 'family'],
      cwd,
    );
    expect(outside.status).toBe(1);
    expect(outside.stderr).toMatch(/--family-key.*--family/i);

    const invalid = await runCli(
      ['theme', 'build', ...family, '--family-key', '../Family'],
      cwd,
    );
    expect(invalid.status).toBe(1);
    expect(invalid.stderr).toMatch(/lower-kebab/i);
    expect(fs.existsSync(path.join(cwd, 'family'))).toBe(false);
  });

  it('refuses positional files, watch, and out while composing with check', async () => {
    const positional = await runCli(
      ['theme', 'build', 'base.mjs', ...family, '--family-key', 'family'],
      cwd,
    );
    expect(positional.status).toBe(1);
    expect(positional.stderr).toMatch(/positional.*--family/i);

    for (const extra of [['--watch'], ['--out', 'family.css']]) {
      const result = await runCli(
        ['theme', 'build', ...family, '--family-key', 'family', ...extra],
        cwd,
      );
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/--family.*cannot be combined/i);
    }

    const built = await runCli(
      [
        '--json',
        'theme',
        'build',
        ...family,
        '--family-key',
        'family',
        '--icons-specifier',
        '@example/icons',
      ],
      cwd,
    );
    expect(built.status).toBe(0);
    expect(JSON.parse(built.stdout)).toMatchObject({
      type: 'theme.build',
      data: {name: 'family'},
    });

    const current = path.join(cwd, 'family', 'current');
    expect(fs.lstatSync(current).isSymbolicLink()).toBe(true);
    expect(fs.readlinkSync(current)).toMatch(/^generations\//);
    expect(fs.readdirSync(current).sort()).toEqual([
      'family.css',
      'family.d.ts',
      'family.js',
      'family.manifest.json',
      'receipts',
    ]);
    expect(fs.readdirSync(path.join(current, 'receipts')).sort()).toEqual([
      'build.json',
      'members',
    ]);
    expect(
      fs.readdirSync(path.join(current, 'receipts', 'members')).sort(),
    ).toEqual(['000-base.json', '001-child.json']);

    const checked = await runCli(
      [
        '--json',
        'theme',
        'build',
        ...family,
        '--family-key',
        'family',
        '--icons-specifier',
        '@example/icons',
        '--check',
      ],
      cwd,
    );
    expect(checked.status).toBe(0);
    expect(JSON.parse(checked.stdout)).toMatchObject({
      type: 'theme.build.check',
      data: {name: 'family', upToDate: true},
    });

    fs.writeFileSync(
      path.join(cwd, 'family', 'current', 'family.css'),
      'stale',
    );
    const stale = await runCli(
      [
        '--json',
        'theme',
        'build',
        ...family,
        '--family-key',
        'family',
        '--icons-specifier',
        '@example/icons',
        '--check',
      ],
      cwd,
    );
    expect(stale.status).toBe(1);
    expect(JSON.parse(stale.stdout)).toMatchObject({
      type: 'theme.build.check',
      data: {
        name: 'family',
        upToDate: false,
        stale: [expect.objectContaining({reason: 'outdated'})],
      },
    });
  }, 120_000);
});
