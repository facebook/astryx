// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build-theme.test.mjs — exercise the --no-prose flag end-to-end.
 *
 * We can't easily invoke the registerTheme commander action in a unit test
 * (it lives inside .action()), so we instead verify the underlying core API
 * accepts {prose: false} and that prose rules are excluded.
 */

import {describe, it, expect} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {execSync} from 'node:child_process';

import {
  defineTheme,
  generateThemeRulesSplit,
} from '@xds/core/theme';

describe('generateThemeRulesSplit prose option', () => {
  const theme = defineTheme({
    name: 'test-theme',
    tokens: {
      '--color-bg-primary': '#ffffff',
      '--color-text-primary': '#000000',
    },
  });

  it('emits prose rules by default', () => {
    const {prose, component} = generateThemeRulesSplit(theme);
    expect(prose.length).toBeGreaterThan(0);
    expect(prose.join('\n')).toMatch(/:where\(h1, h2/);
    expect(component.length).toBeGreaterThan(0);
  });

  it('emits prose rules when prose: true', () => {
    const {prose} = generateThemeRulesSplit(theme, {prose: true});
    expect(prose.length).toBeGreaterThan(0);
  });

  it('omits prose rules when prose: false', () => {
    const {prose, component} = generateThemeRulesSplit(theme, {prose: false});
    expect(prose).toEqual([]);
    // Component rules should still be present (token block survives)
    expect(component.length).toBeGreaterThan(0);
  });
});

describe('xds theme build --no-prose (cli)', () => {
  // Resolve from CWD (vitest runs from repo root) — robust across vitest/node.
  const repoRoot = process.cwd();
  const cliBin = path.join(repoRoot, 'packages/cli/bin/xds.mjs');
  const themeFile = path.join(repoRoot, 'packages/themes/default/src/defaultTheme.ts');

  // Skip when the default theme source isn't present (e.g. partial checkout)
  const canRun = fs.existsSync(themeFile) && fs.existsSync(cliBin);
  const maybeIt = canRun ? it : it.skip;

  maybeIt('produces CSS without prose selectors when --no-prose is passed', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-no-prose-'));
    try {
      const outNoProse = path.join(tmpDir, 'no-prose.css');
      const outWithProse = path.join(tmpDir, 'with-prose.css');
      execSync(
        `node ${cliBin} theme build ${themeFile} -o ${outNoProse} --no-prose`,
        {stdio: 'pipe'},
      );
      execSync(
        `node ${cliBin} theme build ${themeFile} -o ${outWithProse}`,
        {stdio: 'pipe'},
      );
      const noProse = fs.readFileSync(outNoProse, 'utf-8');
      const withProse = fs.readFileSync(outWithProse, 'utf-8');

      // With prose: must contain :where(h1...) and an @layer reset
      expect(withProse).toMatch(/:where\(h1, h2, h3/);
      expect(withProse).toMatch(/@layer reset/);

      // Without prose: must NOT contain those
      expect(noProse).not.toMatch(/:where\(h1, h2, h3/);
      expect(noProse).not.toMatch(/@layer reset/);

      // No-prose output should be smaller
      expect(noProse.length).toBeLessThan(withProse.length);
    } finally {
      fs.rmSync(tmpDir, {recursive: true, force: true});
    }
  }, 30000);
});
