// Copyright (c) Meta Platforms, Inc. and affiliates.

/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * @file themingTargets.test.ts
 * @input Reads every richtext source file and RichTextEditor.doc.mjs
 * @output Guard: every themeProps() call site in this package is documented
 *   by a theming target whose visualProps/states cover the props the source
 *   actually emits
 * @position Flat-package analog of core's themingTargets.test.ts guard. That
 *   guard discovers component subdirectories under packages/core/src and
 *   cannot see this package's flat src layout, so the same doc-matches-source
 *   contract is enforced here.
 */

import {describe, it, expect} from 'vitest';
import {readdirSync, readFileSync} from 'node:fs';
import {join} from 'node:path';

const SRC_DIR = __dirname;

interface ThemePropsSite {
  file: string;
  name: string;
  keys: string[];
}

/**
 * Matches themeProps('<name>') and themeProps('<name>', {...}) in both
 * prettier call shapes (hug, and expanded with a trailing comma). matchAll
 * never advances a shared /g literal's lastIndex, so one instance is safe.
 */
const THEMEPROPS_RE =
  /themeProps\(\s*'([^']+)'\s*(?:,\s*\{([\s\S]*?)\}\s*,?\s*)?\)/g;

/** Split an object-literal body on top-level commas only. */
function splitTopLevel(body: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of body) {
    if (ch === '{' || ch === '(' || ch === '[') {
      depth++;
    } else if (ch === '}' || ch === ')' || ch === ']') {
      depth--;
    }
    if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts.map(p => p.trim()).filter(Boolean);
}

/**
 * Extract every themeProps call site from one source text. The self-tests
 * below exercise this exact function, so a drifting regex fails them rather
 * than silently extracting nothing.
 */
function extractSites(src: string, file: string): ThemePropsSite[] {
  const sites: ThemePropsSite[] = [];
  for (const match of src.matchAll(THEMEPROPS_RE)) {
    const [, name, body] = match;
    const keys =
      body == null
        ? []
        : splitTopLevel(body).map(part => part.split(':')[0].trim());
    sites.push({file, name, keys});
  }
  return sites;
}

/** Extract every themeProps('<name>', {...}) call site in the package. */
function themePropsSites(): ThemePropsSite[] {
  const files = readdirSync(SRC_DIR).filter(
    f =>
      (f.endsWith('.ts') || f.endsWith('.tsx')) &&
      !f.includes('.test.') &&
      !f.endsWith('.d.ts'),
  );
  return files.flatMap(file =>
    extractSites(readFileSync(join(SRC_DIR, file), 'utf8'), file),
  );
}

interface DocTarget {
  className: string;
  visualProps?: string[];
  states?: string[];
}

function docTargets(): DocTarget[] {
  const mod = require('./RichTextEditor.doc.mjs') as {
    docs?: {theming?: {targets?: DocTarget[]}};
  };
  return mod.docs?.theming?.targets ?? [];
}

describe('themeProps extraction', () => {
  it('parses both prettier call shapes (hug and expanded with trailing comma)', () => {
    const hug = `themeProps('rich-text-editor', {size, status: s ?? null})`;
    const expanded = `themeProps(
      'rich-text-editor',
      {
        size,
        status: s ?? null,
      },
    )`;
    for (const src of [hug, expanded]) {
      expect(extractSites(src, '<inline>')).toEqual([
        {file: '<inline>', name: 'rich-text-editor', keys: ['size', 'status']},
      ]);
    }
  });

  it('extracts an empty key list when the call site passes no props object', () => {
    expect(extractSites(`themeProps('rich-text-toolbar')`, '<inline>')).toEqual(
      [{file: '<inline>', name: 'rich-text-toolbar', keys: []}],
    );
  });

  it('splits only top-level commas when a prop value nests an object literal', () => {
    const src = `themeProps('rich-text-editor', {size, status: cond ? {a: 1, b: 2} : null})`;
    expect(extractSites(src, '<inline>')).toEqual([
      {file: '<inline>', name: 'rich-text-editor', keys: ['size', 'status']},
    ]);
  });
});

describe('richtext theming targets', () => {
  it('finds the themeProps call sites it guards', () => {
    // If this goes to zero the extraction regex has drifted from the source —
    // fix the guard, not the assertion.
    expect(themePropsSites().length).toBeGreaterThan(0);
  });

  it('documents every themeProps call site, covering its emitted props', () => {
    const targets = docTargets();
    for (const site of themePropsSites()) {
      const className = `astryx-${site.name}`;
      const target = targets.find(t => t.className === className);
      expect(
        target,
        `${site.file} renders themeProps('${site.name}') but no doc target ` +
          `declares className '${className}'`,
      ).toBeDefined();
      const documented = new Set([
        ...(target?.visualProps ?? []),
        ...(target?.states ?? []),
      ]);
      for (const key of site.keys) {
        expect(
          documented.has(key),
          `${site.file} emits themeProps prop '${key}' for '${site.name}', ` +
            `but the doc target lists neither a visualProp nor a state for it — ` +
            `themes cannot discover it`,
        ).toBe(true);
      }
    }
  });
});
