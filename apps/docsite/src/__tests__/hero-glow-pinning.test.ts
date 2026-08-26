// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file hero-glow-pinning.test.ts
 * @input The home hero's HeroThemeReel source
 * @output Guards both halves of the aurora glow's contract
 * @position Regression test for the fidelity regression #5415 shipped, and for
 *   the #5392 property it must keep
 *
 * The glow has to satisfy two things at once, and #5415 traded one for the
 * other in each direction:
 *
 *   1. It must stay PINNED while the hero is on screen. The blobs sit low in
 *      its 1050px box, so a glow that scrolls with the hero walks them up
 *      through the viewport and visibly warms the page mid-scroll.
 *   2. It must be BOUNDED, so it can't paint into the strip an overscroll
 *      opens past the end of the page — the exposure that had the whole site
 *      suppressing overscroll, which costs pull-to-refresh (#5392).
 *
 * `position: fixed` gives (1) but not (2); an ordinary in-flow `absolute`
 * gives (2) but not (1). A sticky, zero-height layer with the glow absolute
 * inside it gives both, which is why the structural assertion below matters as
 * much as the property one.
 */

import {describe, it, expect} from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = fs.readFileSync(
  path.join(
    HERE,
    '..',
    'app',
    '(site)',
    '_landing',
    'hero',
    'HeroThemeReel.tsx',
  ),
  'utf8',
);

/** The `{...}` body of one `stylex.create` entry, e.g. `backdropGlow`. */
function styleBlock(name: string): string {
  const start = SOURCE.indexOf(`${name}: {`);
  expect(start, `no \`${name}\` style in the source`).toBeGreaterThan(-1);
  const open = SOURCE.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < SOURCE.length; i++) {
    if (SOURCE[i] === '{') {
      depth++;
    } else if (SOURCE[i] === '}' && --depth === 0) {
      return SOURCE.slice(open, i + 1);
    }
  }
  throw new Error(`unbalanced braces in \`${name}\``);
}

/** The value a StyleX property takes with no media query in play. */
function narrowValue(block: string, property: string): string {
  const at = block.indexOf(`${property}: `);
  expect(at, `no \`${property}\` declaration`).toBeGreaterThan(-1);
  const rest = block.slice(at + property.length + 2);
  if (!rest.startsWith('{')) {
    return rest.slice(0, rest.search(/[,\n]/)).trim();
  }
  const arm = /default:\s*([^,\n]+)/.exec(rest.slice(0, rest.indexOf('}')));
  expect(arm, `\`${property}\` has no default arm`).not.toBeNull();
  return arm![1].trim();
}

describe('home hero — the aurora glow', () => {
  it('is bounded at narrow widths, so overscroll can stay enabled (#5392)', () => {
    // Unbounded === `fixed`: glued to the viewport for the whole document
    // scroll, so still painting in the gap at the end of the page.
    expect(narrowValue(styleBlock('backdropGlow'), 'position')).not.toBe(
      "'fixed'",
    );
  });

  it('is still pinned at narrow widths, not scrolling with the hero (regressed by #5415)', () => {
    // Bounded is not enough on its own — an `absolute` glow parked in ordinary
    // flow scrolls away. It has to be absolute against the STICKY layer, which
    // is what keeps it visually pinned. Assert the containment structurally:
    // the glow's element must be rendered inside the element carrying
    // `pinLayer`, and `pinLayer` must actually be sticky.
    expect(narrowValue(styleBlock('pinLayer'), 'position')).toBe("'sticky'");
    expect(narrowValue(styleBlock('pinLayer'), 'height')).toBe('0');

    // Slice out the pin layer's JSX children by indentation: the source is
    // prettier-formatted, so the element's closing tag sits at the same column
    // its opening tag does. (Tag-depth counting is the obvious alternative and
    // gets this wrong — the glow is self-closing and never emits a `</div>`.)
    const lines = SOURCE.split('\n');
    const open = lines.findIndex(l =>
      l.includes('stylex.props(styles.pinLayer)'),
    );
    expect(open, 'nothing renders `pinLayer`').toBeGreaterThan(-1);
    const indent = lines[open].length - lines[open].trimStart().length;
    const close = lines.findIndex(
      (l, i) => i > open && l === `${' '.repeat(indent)}</div>`,
    );
    expect(close, 'could not find the pin layer’s closing tag').toBeGreaterThan(
      -1,
    );

    expect(lines.slice(open + 1, close).join('\n')).toContain(
      'styles.backdropGlow',
    );
  });
});
