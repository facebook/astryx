// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file keyboardNotification.test.ts
 * @input timing.ts, bundled on its own with esbuild
 * @output Proof that the keyboard notifications' duration is its own export:
 *   the timing table composes it, and a bundle that reads only it carries no
 *   other row of the table
 * @position Guards architecture:component-style-authoring INV6 for the
 *   keyboard layout guide's one read of the timing table
 */

import {execFileSync} from 'node:child_process';
import {describe, expect, it} from 'vitest';
import {keyboardNotification, timing} from './timing';

describe('keyboardNotification', () => {
  it('is the timing table\u2019s keyboard duration', () => {
    expect(timing.keyboardNotificationMs).toBe(keyboardNotification.durationMs);
  });

  it('a bundle that reads only the keyboard\u2019s duration drops the rest of the table', () => {
    // esbuild runs in its own Node process: jsdom's TextEncoder fails its
    // startup check.
    const code = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        [
          "import {build} from 'esbuild';",
          'const result = await build({',
          "  stdin: {contents: \"import {keyboardNotification} from './timing'; export const ms = keyboardNotification.durationMs;\", resolveDir: process.cwd(), loader: 'ts'},",
          "  bundle: true, write: false, format: 'esm', minify: true, logLevel: 'silent',",
          '});',
          'process.stdout.write(result.outputFiles[0].text);',
        ].join('\n'),
      ],
      {cwd: __dirname, encoding: 'utf8'},
    );
    expect(code).toContain('383.3');
    // No other row: not the navigation bar's duration, not the press clocks,
    // not the Reduce Motion fade that shares the table's composition.
    expect(code).not.toContain('navigationBarHideShowMs');
    expect(code).not.toContain('buttonReleaseMs');
    // The fade's length and curve, however esbuild prints them: inline in its
    // group or through a shared constant.
    expect(code).not.toMatch(/\b500\b/);
    expect(code).not.toContain('.42,0,.58,1');
  });
});
