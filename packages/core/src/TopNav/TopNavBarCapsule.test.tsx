// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TopNavBarCapsule.test.tsx
 * @input vitest (jsdom), React Testing Library, TopNav in its phone-bar mode,
 *   the iOS 26 bar geometry in motion/uikit/bars, and the raw CSS the StyleX
 *   runtime injects (recorded before jsdom parses it)
 * @output Checks the iOS 26 bar on a touch screen: the phone bar is 54px
 *   tall with its items on the top 44px and 16px from the sides, and its end
 *   items sit on one glass capsule (44px tall, fully rounded, the glass token,
 *   no shadow, each control centred where UIKit centres its 36px cells);
 *   with a mouse the bar and
 *   its end items keep today's layout; an empty end group draws no capsule;
 *   and the values TopNav spells out match bars.ts
 * @position Testing; validates TopNav.tsx's phone-bar styles. jsdom's CSS
 *   parser drops media blocks, so the declarations are read from the rules
 *   StyleX hands to `insertRule`; the geometry in a real browser is proven by
 *   __tests__/TopNavBarCapsule.interaction.browser.spec.ts
 */

import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {render, screen} from '@testing-library/react';
import {beforeAll, describe, expect, it} from 'vitest';
import type {TopNav as TopNavComponent} from './TopNav';
import type {TopNavRenderContext as TopNavRenderContextValue} from './TopNavRenderContext';
import type {Button as ButtonComponent} from '../Button/Button';
import {bars} from '../motion/uikit/bars';

const COARSE = '(pointer: coarse)';

/** Every rule StyleX inserted, as the raw text it handed to `insertRule`. */
const rawRules: string[] = [];
let TopNav: typeof TopNavComponent;
let TopNavRenderContext: typeof TopNavRenderContextValue;
let Button: typeof ButtonComponent;

beforeAll(async () => {
  const insertRule = CSSStyleSheet.prototype.insertRule;
  CSSStyleSheet.prototype.insertRule = function (
    this: CSSStyleSheet,
    rule: string,
    index?: number,
  ) {
    rawRules.push(rule);
    return insertRule.call(this, rule, index);
  };
  // StyleX injects when the styles are created: load TopNav after the
  // recorder is in place.
  ({TopNav} = await import('./TopNav'));
  ({TopNavRenderContext} = await import('./TopNavRenderContext'));
  ({Button} = await import('../Button/Button'));
});

/**
 * The declarations `el`'s own classes make, by property, either outside any
 * media block (`media` omitted) or inside `@media <media>`. StyleX minifies
 * values: they are compared without whitespace.
 */
function declared(el: Element, media?: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const className of Array.from(el.classList)) {
    // Inside a media block StyleX repeats the class for specificity.
    const selector = new RegExp(
      `^\\.${className}(?:\\.${className})?(?::not\\(#\\\\#\\))*\\{([^}]*)\\}$`,
    );
    for (const rule of rawRules) {
      let body = rule;
      if (media != null) {
        const prefix = `@media ${media}{`;
        if (!rule.startsWith(prefix)) {
          continue;
        }
        body = rule.slice(prefix.length, -1);
      } else if (rule.startsWith('@')) {
        continue;
      }
      const match = selector.exec(body);
      if (match == null) {
        continue;
      }
      for (const declaration of match[1].split(';')) {
        const colon = declaration.indexOf(':');
        if (colon > 0) {
          out.set(
            declaration.slice(0, colon).trim(),
            declaration.slice(colon + 1).replace(/\s+/g, ''),
          );
        }
      }
    }
  }
  return out;
}

function renderPhoneBar(endContent?: React.ReactNode) {
  return render(
    <TopNavRenderContext value="mobile-bar">
      <TopNav heading={<span>Acme</span>} endContent={endContent} />
    </TopNavRenderContext>,
  );
}

const profile = () => (
  <Button label="Profile" variant="ghost" icon={<span>P</span>} isIconOnly />
);

describe('TopNav phone bar on a touch screen', () => {
  it('is 54px tall with its items on the top 44px, 16px from the sides', () => {
    renderPhoneBar(profile());
    const bar = screen.getByRole('navigation');
    const touch = declared(bar, COARSE);
    expect(touch.get('padding-inline')).toBe('16px');
    expect(touch.get('padding-top')).toBe('0');
    expect(touch.get('padding-bottom')).toBe('10px');
    // A mouse keeps the 8px padding all round.
    const mouse = declared(bar);
    expect(mouse.get('padding-inline')).toBe('var(--spacing-2)');
    expect(mouse.get('padding-top')).toBe('var(--spacing-2)');
    expect(mouse.get('padding-bottom')).toBe('var(--spacing-2)');
  });

  it('puts the end items on one glass capsule', () => {
    const {container} = renderPhoneBar(profile());
    const capsule = container.querySelector('[data-bar-capsule]')!;
    expect(capsule).not.toBeNull();
    expect(capsule.contains(screen.getByRole('button', {name: 'Profile'})));
    const touch = declared(capsule, COARSE);
    expect(touch.get('height')).toBe('44px');
    expect(touch.get('border-radius')).toBe('22px');
    expect(touch.get('background-color')).toBe('var(--color-background-glass)');
    // UIKit's glass has no shadow layer.
    expect(touch.has('box-shadow')).toBe(false);
    // UIKit's 36px cells, 4px in from the ends and 16px apart: around 32px
    // controls that is 6px ends and a 20px gap, so a lone icon button makes
    // a 44px circle and two make a 96px capsule.
    expect(touch.get('padding-inline')).toBe(
      'calc(4px+(36px-var(--size-element-md))/2)',
    );
    expect(touch.get('gap')).toBe('calc(16px+36px-var(--size-element-md))');
  });

  it('keeps today’s layout with a mouse: no surface, no size, the 4px gap', () => {
    const {container} = renderPhoneBar(profile());
    const capsule = container.querySelector('[data-bar-capsule]')!;
    const mouse = declared(capsule);
    expect(mouse.get('gap')).toBe('var(--spacing-1)');
    for (const property of [
      'height',
      'border-radius',
      'background-color',
      'padding-inline',
    ]) {
      expect(mouse.has(property), property).toBe(false);
    }
  });

  it('draws no capsule for an empty end group', () => {
    const {container} = renderPhoneBar();
    expect(container.querySelector('[data-bar-capsule]')).toBeNull();
  });
});

describe('the values TopNav spells out match bars.ts', () => {
  // StyleX inlines only same-file or .stylex.ts values, so TopNav writes the
  // UIKit geometry as literals; this keeps them equal to the table.
  const source = readFileSync(join(__dirname, 'TopNav.tsx'), 'utf8');
  const {heightPt, buttonCapsules} = bars;

  it.each([
    ['the side inset', `'${buttonCapsules.edgeInsetPt}px'`],
    ['the space under the items', `'${heightPt - buttonCapsules.heightPt}px'`],
    ['the capsule height', `'${buttonCapsules.heightPt}px'`],
    ['the corner radius', `'${buttonCapsules.heightPt / 2}px'`],
    [
      'the cell padding',
      `calc(${buttonCapsules.cellInsetPt}px + (${buttonCapsules.cellHeightPt}px - \${sizeVars['--size-element-md']}) / 2)`,
    ],
    [
      'the cell gap',
      `calc(${buttonCapsules.cellGapPt}px + ${buttonCapsules.cellHeightPt}px - \${sizeVars['--size-element-md']})`,
    ],
  ])('%s', (_, literal) => {
    expect(source).toContain(literal);
  });
});
