// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for the init.remove leaf.
 *
 * `astryx init --remove-agents` in a project with nothing to remove reported
 * `{removed: true}` — the response type was the literal `{removed: true}`, so
 * the contract could not express "there was nothing there". The receipt now
 * distinguishes the two, and the human line says which happened.
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {init} from '../init.mjs';
import {remove} from './remove.mjs';
import {logger} from '../../logger.mjs';

const MARKER_START = '<!-- ASTRYX:START -->';

let dir;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-init-remove-'));
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({name: 'consumer', version: '1.0.0'}),
  );
});

afterEach(() => {
  fs.rmSync(dir, {recursive: true, force: true});
  logger.setSilent(true);
});

describe('init.remove says whether anything was removed', () => {
  it('reports removed: false in a project with no agent-docs block', async () => {
    const res = await remove({cwd: dir});

    expect(res.type).toBe('init.remove');
    expect(res.data.removed).toBe(false);
  });

  it('reports removed: true when a block was there, and false on a second run', async () => {
    await init({features: ['agents']}, {cwd: dir});
    expect(fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8')).toContain(
      MARKER_START,
    );

    const first = await remove({cwd: dir});
    expect(first.data.removed).toBe(true);

    // Idempotent, and honest about it the second time.
    const second = await remove({cwd: dir});
    expect(second.data.removed).toBe(false);
  });

  it('says so in the human line too', async () => {
    /** @type {string[]} */
    const lines = [];
    const logSpy = vi
      .spyOn(console, 'log')
      .mockImplementation((...a) => lines.push(a.join(' ')));
    logger.setSilent(false);
    try {
      await remove({cwd: dir});
    } finally {
      logger.setSilent(true);
      logSpy.mockRestore();
    }

    expect(lines.join('\n')).toContain('Nothing to remove');
  });
});
