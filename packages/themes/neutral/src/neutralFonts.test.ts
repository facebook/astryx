// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Guards the README against drifting from the fonts the theme declares (#5991).
 * @input README.md plus every font surface of the resolved neutralTheme:
 *   --font-family-* tokens and component-level fontFamily overrides.
 * @output Fails when the README omits, misdescribes, or gives no loading
 *   recipe for a webfont the theme resolves.
 * @position Package-local docs guard, sibling of neutralTheme.test.ts.
 *
 * Neutral shipped describing itself as "system fonts" while declaring Figtree
 * for body and heading. Astryx never loads font files, so an undocumented
 * webfont silently falls back and a missing font looks like a consumer
 * integration failure. The README must name every webfont the theme resolves
 * and show how to load each one — a recipe, not just a warning — so if the
 * theme's typography ever changes, the README has to follow.
 *
 * The font surface mirrors the CLI's collectUnloadedFonts
 * (packages/cli/api/theme/build/font-warning.mjs): tokens are discovered by
 * prefix rather than a fixed key list, and component overrides are walked
 * because sibling themes (butter, gothic, y2k) declare display webfonts only
 * through components.text fontFamily. var() aliases are stripped before
 * parsing — Neutral's components carry 17 of them today.
 */

import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {neutralTheme} from './neutralTheme';

const readme = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'README.md'),
  'utf8',
);

/**
 * Families every browser resolves without loading anything: CSS generics and
 * platform system-UI names. Same spirit as the CLI theme-build font warning —
 * anything else is a webfont the app must load itself.
 */
const PREINSTALLED = new Set([
  'sans-serif',
  'serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
]);

function firstFamily(stack: string): string {
  return (
    stack
      .replace(/var\([^()]*(?:\([^()]*\)[^()]*)*\)/g, '')
      .split(',')
      .map(part => part.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean)[0] ?? ''
  );
}

function isPreinstalled(family: string): boolean {
  return (
    PREINSTALLED.has(family) ||
    family.startsWith('ui-') ||
    family.startsWith('-')
  );
}

function collectComponentFamilies(node: unknown, out: string[] = []): string[] {
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(
      node as Record<string, unknown>,
    )) {
      if (key === 'fontFamily' && typeof value === 'string') {
        out.push(value);
      } else {
        collectComponentFamilies(value, out);
      }
    }
  }
  return out;
}

const fontFamilyTokens = Object.entries(neutralTheme.tokens).filter(([key]) =>
  key.startsWith('--font-family-'),
);

const declaredWebfonts = [
  ...new Set(
    [
      ...fontFamilyTokens.map(([, stack]) => stack),
      ...collectComponentFamilies(neutralTheme.components),
    ]
      .filter((stack): stack is string => typeof stack === 'string')
      .map(firstFamily)
      .filter(
        family =>
          family !== '' && !family.includes('(') && !isPreinstalled(family),
      ),
  ),
];

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('neutral README documents the declared fonts (#5991)', () => {
  it('still resolves the canonical font-family tokens', () => {
    expect(fontFamilyTokens.map(([key]) => key)).toEqual(
      expect.arrayContaining([
        '--font-family-body',
        '--font-family-heading',
        '--font-family-code',
      ]),
    );
  });

  it('resolves Figtree as a webfont the app must load', () => {
    expect(declaredWebfonts).toContain('Figtree');
  });

  it('collects component-level font overrides like sibling themes declare', () => {
    expect(
      collectComponentFamilies({
        text: {'type:display-1': {fontFamily: '"Sarina", cursive'}},
      }),
    ).toEqual(['"Sarina", cursive']);
    expect(firstFamily('"Sarina", cursive')).toBe('Sarina');
    expect(firstFamily('var(--font-family-body)')).toBe('');
  });

  it('names every declared webfont in the README', () => {
    for (const family of declaredWebfonts) {
      expect(readme).toContain(family);
    }
  });

  it('shows a loading recipe for each declared webfont', () => {
    for (const family of declaredWebfonts) {
      const escaped = escapeRegExp(family);
      const cssParam = new RegExp(`family=${escaped.replace(/ /g, '\\+')}`);
      const fontFace = new RegExp(
        `@font-face[^}]*font-family:\\s*["']?${escaped}`,
      );
      expect(
        cssParam.test(readme) || fontFace.test(readme),
        `README loads "${family}" via a Google Fonts URL or @font-face`,
      ).toBe(true);
    }
  });

  it('does not claim the theme runs on system fonts alone', () => {
    expect(readme).not.toMatch(/uses system fonts|with system fonts/i);
    expect(readme).not.toMatch(/no external font loading is required/i);
  });

  it('keeps the intro free of system-font claims entirely', () => {
    const intro = readme.split(/\n## /)[0];
    expect(intro).not.toMatch(/system[ -]fonts?/i);
  });
});
