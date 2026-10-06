// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Path-safety tests for the `layout.expand` write. The file written, not
 * only the directory it lands in, must stay inside the project root.
 */

import {describe, it, expect, beforeAll} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {layoutExpand} from '../layout.mjs';
import {buildRegistry} from '../../../foundation/xle/registry.mjs';

const SLOW = 30_000;

// The registry imports every component doc on first use; warm it once.
beforeAll(async () => {
  await buildRegistry();
}, 120_000);

describe('layout.expand — write confinement', () => {
  it('rejects a directory target whose generated file is a symlink leading outside cwd', async () => {
    // Inside the workspace so @astryxdesign/core resolves.
    const cwd = fs.mkdtempSync(path.join(process.cwd(), '.xle-confine-test-'));
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'xle-confine-outside-'));
    try {
      const victim = path.join(outside, 'victim.tsx');
      fs.writeFileSync(victim, 'OUTSIDE');
      fs.mkdirSync(path.join(cwd, 'out'));
      fs.symlinkSync(victim, path.join(cwd, 'out', 'GeneratedLayout.tsx'));

      await expect(
        layoutExpand('V > B', {targetPath: './out', cwd}),
      ).rejects.toMatchObject({code: 'ERR_PATH_TRAVERSAL'});
      expect(fs.readFileSync(victim, 'utf-8')).toBe('OUTSIDE');
    } finally {
      fs.rmSync(cwd, {recursive: true, force: true});
      fs.rmSync(outside, {recursive: true, force: true});
    }
  }, SLOW);

  it('still writes <Name>.tsx into a plain directory target', async () => {
    const cwd = fs.mkdtempSync(path.join(process.cwd(), '.xle-confine-test-'));
    try {
      const result = await layoutExpand('V > B', {targetPath: './out', name: 'Demo', cwd});
      expect(result.data.written).toBe(path.join('out', 'Demo.tsx'));
      expect(fs.existsSync(path.join(cwd, 'out', 'Demo.tsx'))).toBe(true);
    } finally {
      fs.rmSync(cwd, {recursive: true, force: true});
    }
  }, SLOW);
});
