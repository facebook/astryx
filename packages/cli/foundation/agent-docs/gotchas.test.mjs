// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  loadGotchas,
  renderGotchaLines,
  validateGotchas,
} from './gotchas.mjs';
import {generateCompressedIndex} from './agent-docs.mjs';
import {CLI_ROOT} from '../fs/paths.mjs';

const cliRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);
expect(cliRoot).toBe(CLI_ROOT);

describe('gotchas.json schema validation', () => {
  it('loads the shipped gotchas.json with all required fields', () => {
    const gotchas = loadGotchas(CLI_ROOT);
    expect(gotchas.length).toBeGreaterThanOrEqual(8);
    expect(gotchas.length).toBeLessThanOrEqual(12);
    for (const g of gotchas) {
      expect(g.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(g.title.length).toBeGreaterThan(0);
      expect(g.trigger.length).toBeGreaterThan(0);
      expect(g.fix.length).toBeGreaterThan(0);
      expect(['high', 'medium', 'low']).toContain(g.severity);
    }
    expect(new Set(gotchas.map(g => g.id)).size).toBe(gotchas.length);
  });

  it('covers the required setup gotchas', () => {
    const ids = new Set(loadGotchas(CLI_ROOT).map(g => g.id));
    for (const required of [
      'stylex-compiler-setup',
      'ssr-theme-build',
      'hover-on-touch-guard',
      'cascade-layer-order',
    ]) {
      expect(ids.has(required)).toBe(true);
    }
  });

  it('rejects a non-object payload', () => {
    expect(() => validateGotchas(null)).toThrow();
    expect(() => validateGotchas([])).toThrow();
    expect(() => validateGotchas({gotchas: []})).toThrow(/non-empty array/);
  });

  it('rejects missing fields, bad severity, bad ids, and duplicates', () => {
    const good = {
      id: 'ok-gotcha',
      title: 'T',
      trigger: 'Tr',
      fix: 'F',
      severity: 'high',
    };
    const check = gotchas =>
      validateGotchas({version: 1, gotchas});
    expect(() =>
      check([{...good, id: 'Bad_ID'}]),
    ).toThrow(/kebab-case/);
    expect(() =>
      check([{...good, severity: 'critical'}]),
    ).toThrow(/severity/);
    expect(() =>
      check([{...good, title: ''}]),
    ).toThrow(/title/);
    const {fix: _fix, ...noFix} = good;
    expect(() => check([noFix])).toThrow(/fix/);
    expect(() => check([good, {...good}])).toThrow(/duplicate id/);
    expect(() => check([])).toThrow(/non-empty array/);
    // The valid entry passes through untouched.
    expect(check([good])).toEqual([good]);
  });
});

describe('gotcha rendering', () => {
  it('orders lines by severity, highest first', () => {
    const lines = renderGotchaLines([
      {id: 'a', title: 'Low', trigger: 't', fix: 'f', severity: 'low'},
      {id: 'b', title: 'High', trigger: 't', fix: 'f', severity: 'high'},
      {id: 'c', title: 'Medium', trigger: 't', fix: 'f', severity: 'medium'},
    ]);
    expect(lines.map(l => l.slice(2).split(':')[0])).toEqual([
      'High',
      'Medium',
      'Low',
    ]);
  });

  it('every gotcha appears in the generated agent cheat sheet', () => {
    const gotchas = loadGotchas(CLI_ROOT);
    const block = generateCompressedIndex('1.0.0');
    expect(block).toContain('GOTCHAS');
    for (const g of gotchas) {
      expect(block).toContain(g.title);
      expect(block).toContain(g.fix);
    }
  });

  it('renders gotchas for every styling system without crashing', () => {
    for (const stylingSystem of ['stylex', 'tailwind', 'css']) {
      const block = generateCompressedIndex('1.0.0', {stylingSystem});
      expect(block).toContain('GOTCHAS');
      expect(block).toContain('StyleX compiler not wired');
    }
  });
});
