// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file mobile-overscroll.test.ts
 * @input apps/docsite/src/app/globals.css and the home hero's pinned layers
 * @output Guards that the docsite never suppresses the platform's overscroll
 * @position Regression test for #5392
 *
 * `overscroll-behavior-y: none` on the root element is how you turn
 * pull-to-refresh off. It was added app-wide to keep the home hero's
 * `position: fixed` layers from showing through the top/bottom overscroll gap
 * (#3032), and silently cost pull-to-refresh on every route of the site on
 * every touch browser.
 *
 * These checks are the halves of the fix, stated as invariants rather than as
 * a mirror of the code: the root may not refuse overscroll at any width, and
 * no hero layer may be pinned to the viewport — a viewport-pinned layer is
 * exactly what paints into the strip an overscroll opens past the end of the
 * page, and is the only reason the root rule was ever wanted.
 */

import {describe, it, expect} from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(HERE, '..', 'app');

function read(...parts: string[]): string {
  return fs.readFileSync(path.join(APP, ...parts), 'utf8');
}

/** Drop comments so their contents can't be mistaken for CSS or braces. */
function stripComments(css: string): string {
  return css.replace(/\/\*[^]*?\*\//g, '');
}

/**
 * The `{...}` preludes open at `offset`, outermost first — e.g.
 * `['@media (min-width: 1024px)', 'html']` for a declaration inside a media
 * block. Good enough for this file's hand-written CSS (no strings, no nesting
 * beyond at-rules).
 */
function openBlocksAt(css: string, offset: number): string[] {
  const stack: string[] = [];
  let preludeStart = 0;
  for (let i = 0; i < offset; i++) {
    const ch = css[i];
    if (ch === '{') {
      stack.push(css.slice(preludeStart, i).trim());
      preludeStart = i + 1;
    } else if (ch === '}') {
      stack.pop();
      preludeStart = i + 1;
    } else if (ch === ';') {
      preludeStart = i + 1;
    }
  }
  return stack;
}

describe('docsite globals.css', () => {
  it('never disables overscroll — that is pull-to-refresh (#5392)', () => {
    const css = stripComments(read('globals.css'));
    const offenders: string[] = [];

    for (const match of css.matchAll(
      /overscroll-behavior(?:-block|-y)?\s*:\s*([^;}]+)/g,
    )) {
      const value = match[1].trim();
      if (value === 'auto') {
        continue;
      }
      const blocks = openBlocksAt(css, match.index);
      offenders.push(
        `${blocks.join(' > ') || '(top level)'} { overscroll-behavior: ${value} }`,
      );
    }

    expect(offenders).toEqual([]);
  });
});

/** The `{...}` body of one `stylex.create` entry, e.g. `backdropGlow`. */
function styleBlock(source: string, name: string): string {
  const start = source.indexOf(`${name}: {`);
  expect(start, `no \`${name}\` style in the source`).toBeGreaterThan(-1);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') {depth++;}
    else if (source[i] === '}' && --depth === 0) {
      return source.slice(open, i + 1);
    }
  }
  throw new Error(`unbalanced braces in \`${name}\``);
}

/** Every value a StyleX property can take — the literal, or each media arm. */
function allValues(block: string, property: string): string[] {
  const at = block.indexOf(`${property}: `);
  expect(at, `no \`${property}\` declaration`).toBeGreaterThan(-1);
  const rest = block.slice(at + property.length + 2);
  if (!rest.startsWith('{')) {
    return [rest.slice(0, rest.search(/[,\n]/)).trim()];
  }
  // One arm per line. The key is matched explicitly (`default`, or a quoted
  // condition) because a condition contains a colon of its own —
  // `'@media (min-width: 1024px)'` — which a bare `:` split would trip on.
  return rest
    .slice(0, rest.indexOf('}'))
    .split('\n')
    .map(line => /^\s*(?:default|'[^']*')\s*:\s*(.+?),?\s*$/.exec(line)?.[1])
    .filter((v): v is string => v != null);
}

/**
 * The hero's decorative layers, and the hero text itself, all used to be
 * `position: fixed`. Fixed is unbounded: the layer stays glued to the viewport
 * for the entire document scroll, so at the end of the page it is still
 * painting in the strip a bottom overscroll opens — the aurora glow bleeding
 * under the footer is exactly that. They are pinned with a bounded sticky
 * layer now, which looks identical while the hero is on screen.
 *
 * `navBackdrop` is deliberately not listed: it is a header-height strip at the
 * very top of the viewport and never reaches the bottom gap.
 */
describe('home hero — no layer is pinned to the viewport (#5392)', () => {
  const cases: ReadonlyArray<[string, string, string]> = [
    ['aurora glow', 'hero/HeroThemeReel.tsx', 'backdropGlow'],
    ['floating cards stage', 'hero/HeroFloatingCards.tsx', 'stage'],
    ['hero text block', 'page.tsx', 'heroContent'],
  ];

  for (const [label, file, style] of cases) {
    it(`${label} (${style})`, () => {
      const source =
        file === 'page.tsx'
          ? read('(site)', 'page.tsx')
          : read('(site)', '_landing', ...file.split('/'));
      expect(allValues(styleBlock(source, style), 'position')).not.toContain(
        "'fixed'",
      );
    });
  }
});
