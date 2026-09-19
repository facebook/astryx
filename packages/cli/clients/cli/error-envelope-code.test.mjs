// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Static regression: every inline JSON error envelope constructed in
 * cli/index.mjs carries a `code` field.
 *
 * The JSON contract guarantees `code` always appears on an error envelope so
 * consumers can branch on it unconditionally. Most error envelopes flow through
 * `toErrorEnvelope`/`cliError` (which always set a code), but cli/index.mjs
 * hand-builds two envelopes (the --json gate rejection and the postAction
 * "completed without emitting an envelope" fallback). This scan catches a new
 * hand-built envelope that forgets `code`.
 */

import {describe, it, expect} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

describe('inline JSON error envelopes carry a `code`', () => {
  it('cli/index.mjs — no hand-built error envelope missing code', () => {
    const file = path.resolve(HERE, 'index.mjs');
    const lines = fs.readFileSync(file, 'utf-8').split('\n');
    const offenders = [];
    lines.forEach((ln, i) => {
      if (/^\s*error:/.test(ln)) {
        const windowText = lines.slice(Math.max(0, i - 4), i + 6).join('\n');
        if (!/\bcode:/.test(windowText)) offenders.push(i + 1);
      }
    });
    expect(
      offenders,
      `index.mjs error envelope(s) missing code at line(s) ${offenders.join(', ')}`,
    ).toEqual([]);
  });
});
