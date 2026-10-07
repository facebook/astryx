// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file Compatibility and deprecation coverage for the two-step theme-add lifecycle. */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {runCli} from '../../../test-utils/run-cli.mjs';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-theme-add-cli-'));
  fs.mkdirSync(path.join(tmpDir, 'src'));
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'app', private: true}),
  );
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('theme add compatibility lifecycle', () => {
  it('keeps copy stdout and emits one text-only deprecation warning', async () => {
    const result = await runCli(['theme', 'add', 'neutral'], tmpDir);

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain(
      '[ok] Added Neutral theme from @astryxdesign/cli to src/themes/neutral/',
    );
    expect(result.stdout).toContain('This is your copy of the Neutral theme');
    expect(result.stderr.match(/source copying is deprecated/g)).toHaveLength(
      1,
    );
    expect(result.stderr).toContain('pnpm exec astryx theme eject neutral');
    expect(result.stderr).toContain(
      'pnpm exec astryx theme add neutral --import',
    );
    expect(fs.existsSync(path.join(tmpDir, 'src/themes/neutral'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'src/astryx-themes.ts'))).toBe(
      false,
    );
  });

  it('keeps theme.add data and adds machine-readable deprecation metadata', async () => {
    const result = await runCli(['theme', 'add', 'neutral', '--json'], tmpDir);

    expect(result.status, result.stderr).toBe(0);
    expect(result.stderr).not.toContain('source copying is deprecated');
    expect(JSON.parse(result.stdout)).toMatchObject({
      type: 'theme.add',
      data: {
        slug: 'neutral',
        package: '@astryxdesign/cli',
        outputDir: 'src/themes/neutral',
      },
      meta: {
        deprecations: [
          {
            id: 'DEP-0005',
            replacements: ['theme eject', 'theme add --import'],
          },
        ],
      },
    });
  });

  it('keeps the list JSON unchanged and names the stage commands in text', async () => {
    fs.mkdirSync(path.join(tmpDir, 'src/themes/broken'), {recursive: true});
    fs.writeFileSync(
      path.join(tmpDir, 'src/themes/broken/brokenTheme.ts'),
      'export const brokenTheme = {};\n',
    );

    const textResult = await runCli(['theme', 'add', '--list'], tmpDir);
    expect(textResult.status, textResult.stderr).toBe(0);
    expect(textResult.stdout).toContain(
      'Import one: pnpm exec astryx theme add <slug> --import [--package <package>]',
    );
    expect(textResult.stdout).toContain(
      'Fork source: pnpm exec astryx theme eject <slug> [target-path]',
    );
    expect(textResult.stdout).not.toContain('theme add <slug> [target-path]');
    expect(textResult.stderr).not.toContain('deprecated');

    const result = await runCli(['theme', 'add', '--list', '--json'], tmpDir);

    expect(result.status, result.stderr).toBe(0);
    const payload = JSON.parse(result.stdout);
    expect(payload).toMatchObject({type: 'theme.list'});
    expect(payload.meta).toBeUndefined();
    expect(payload.data.some(theme => theme.slug === 'broken')).toBe(false);
    expect(Object.keys(payload.data[0]).sort()).toEqual([
      'description',
      'displayName',
      'maintained',
      'package',
      'slug',
    ]);
    expect(result.stderr).not.toContain('deprecated');
  });

  it.each([
    ['target path', ['src/brand']],
    ['overwrite', ['--overwrite']],
  ])('rejects --import with a %s before writing', async (_label, extra) => {
    const result = await runCli(
      ['theme', 'add', 'neutral', '--import', ...extra, '--json'],
      tmpDir,
    );

    expect(result.status).not.toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      code: 'ERR_THEME_INVALID',
      error: expect.stringContaining('cannot be combined'),
    });
    expect(fs.existsSync(path.join(tmpDir, 'src/astryx-themes.ts'))).toBe(
      false,
    );
    expect(fs.existsSync(path.join(tmpDir, 'src/brand'))).toBe(false);
  });

  it('lists --import in help', async () => {
    const result = await runCli(['theme', 'add', '--help'], tmpDir);

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('--import');
  });
});
