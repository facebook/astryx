// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, afterAll} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {ensureTsxFiles} from './utils.js';

const dirs: string[] = [];
function tmpDir(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-'));
  dirs.push(d);
  return d;
}
afterAll(() => dirs.forEach(d => fs.rmSync(d, {recursive: true})));

describe('ensureTsxFiles', () => {
  it('extracts depth-0 TSX from JSON result arrays', () => {
    const dir = tmpDir();
    fs.writeFileSync(
      path.join(dir, 'cwm-1.json'),
      JSON.stringify([
        {response: 'import {XDSButton} from "@astryxdesign/core";', trajectoryDepth: 0},
        {response: 'import {XDSCard} from "@astryxdesign/core";', trajectoryDepth: 1},
      ]),
    );
    fs.writeFileSync(
      path.join(dir, 'dd-2.json'),
      JSON.stringify([
        {response: 'export default function Dash() {}', trajectoryDepth: 0},
      ]),
    );

    const ids = ensureTsxFiles(dir);
    expect(ids).toHaveLength(2);
    expect(fs.readFileSync(path.join(dir, 'cwm-1.tsx'), 'utf-8')).toContain(
      'XDSButton',
    );
    expect(fs.readFileSync(path.join(dir, 'cwm-1.tsx'), 'utf-8')).not.toContain(
      'XDSCard',
    );
    expect(fs.existsSync(path.join(dir, 'dd-2.tsx'))).toBe(true);
  });

  it('preserves existing .tsx files without overwriting', () => {
    const dir = tmpDir();
    fs.writeFileSync(path.join(dir, 'p1.tsx'), 'original');
    fs.writeFileSync(
      path.join(dir, 'p1.json'),
      JSON.stringify([{response: 'OVERWRITE', trajectoryDepth: 0}]),
    );

    const ids = ensureTsxFiles(dir);
    expect(ids).toEqual(['p1']);
    expect(fs.readFileSync(path.join(dir, 'p1.tsx'), 'utf-8')).toBe('original');
  });

  it('skips malformed JSON gracefully', () => {
    const dir = tmpDir();
    fs.writeFileSync(path.join(dir, 'bad.json'), '{{{not json');
    fs.writeFileSync(
      path.join(dir, 'ok.json'),
      JSON.stringify([{response: 'valid', trajectoryDepth: 0}]),
    );

    const ids = ensureTsxFiles(dir);
    expect(ids).toHaveLength(1);
    expect(fs.existsSync(path.join(dir, 'bad.tsx'))).toBe(false);
  });

  it('skips JSON without a response field', () => {
    const dir = tmpDir();
    fs.writeFileSync(
      path.join(dir, 'meta.json'),
      JSON.stringify({some: 'data'}),
    );
    fs.writeFileSync(
      path.join(dir, 'real.json'),
      JSON.stringify([{response: 'code', trajectoryDepth: 0}]),
    );

    const ids = ensureTsxFiles(dir);
    expect(ids).toEqual(['real']);
    expect(fs.existsSync(path.join(dir, 'meta.tsx'))).toBe(false);
  });

  it('returns empty array for empty directory', () => {
    expect(ensureTsxFiles(tmpDir())).toEqual([]);
  });

  it('handles single-object JSON (non-array)', () => {
    const dir = tmpDir();
    fs.writeFileSync(
      path.join(dir, 'single.json'),
      JSON.stringify({response: 'single entry', trajectoryDepth: 0}),
    );

    const ids = ensureTsxFiles(dir);
    expect(ids).toHaveLength(1);
    expect(fs.readFileSync(path.join(dir, 'single.tsx'), 'utf-8')).toBe(
      'single entry',
    );
  });
});
