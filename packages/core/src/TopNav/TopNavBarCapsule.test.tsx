// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TopNavBarCapsule.test.tsx
 * @input vitest (jsdom), React Testing Library, TopNav in its phone-bar mode,
 *   the iOS 26 bar geometry in motion/uikit/bars, and the raw CSS the StyleX
 *   runtime injects (recorded before jsdom parses it)
 * @output Checks the iOS 26 bar under a finger (the coarse pointer: one
 *   touch model on every touch device), built from the theme's tokens: the
 *   phone bar's items sit `--spacing-4` from the sides with the measured
 *   10px under them, and its end items sit on one capsule (as tall as a
 *   `--size-element-lg` cell plus `--spacing-1` above and below, fully
 *   rounded, the theme's surface, no shadow, each control centred where
 *   UIKit centres its cells); with a mouse the bar and its end items keep
 *   today's layout; an empty end group draws no capsule; and the default
 *   tokens give the geometry measured in bars.ts
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
import {sizeDefaults, spacingDefaults} from '../theme/tokens.stylex';

const COARSE_KEY = '@media (pointer: coarse)';

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
 * The declarations `el`'s own classes make, by property: outside any at-rule
 * (`where` omitted), or under the coarse pointer alone (`'touch'`). StyleX
 * minifies values: they are compared without whitespace.
 */
function declared(
  el: Element,
  where: 'default' | 'touch' = 'default',
): Map<string, string> {
  const out = new Map<string, string>();
  for (const className of Array.from(el.classList)) {
    // Inside at-rules StyleX repeats the class for specificity.
    const selector = new RegExp(
      `^(?:\\.${className})+(?::not\\(#\\\\#\\))*\\{([^}]*)\\}$`,
    );
    for (const raw of rawRules) {
      let body = raw;
      const atRules: string[] = [];
      for (let match; (match = /^(@[^{]+)\{(.*)\}$/s.exec(body));) {
        atRules.push(match[1].trim());
        body = match[2];
      }
      const ruleWhere =
        atRules.length === 0
          ? 'default'
          : atRules.length === 1 && atRules[0] === COARSE_KEY
            ? 'touch'
            : null;
      if (ruleWhere !== where) {
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

describe('TopNav phone bar under a finger', () => {
  it('sits its items `--spacing-4` from the sides, with the measured 10px under them', () => {
    renderPhoneBar(profile());
    const bar = screen.getByRole('navigation');
    const touch = declared(bar, 'touch');
    expect(touch.get('padding-inline')).toBe('var(--spacing-4)');
    expect(touch.get('padding-top')).toBe('0');
    expect(touch.get('padding-bottom')).toBe('10px');
    // A mouse keeps the 8px padding all round.
    const mouse = declared(bar);
    expect(mouse.get('padding-inline')).toBe('var(--spacing-2)');
    expect(mouse.get('padding-top')).toBe('var(--spacing-2)');
    expect(mouse.get('padding-bottom')).toBe('var(--spacing-2)');
  });

  it('puts the end items on one capsule painted with the theme’s surface', () => {
    const {container} = renderPhoneBar(profile());
    const capsule = container.querySelector('[data-bar-capsule]')!;
    expect(capsule).not.toBeNull();
    expect(capsule.contains(screen.getByRole('button', {name: 'Profile'})));
    const touch = declared(capsule, 'touch');
    expect(touch.get('height')).toBe(
      'calc(var(--size-element-lg)+2*var(--spacing-1))',
    );
    expect(touch.get('border-radius')).toBe(
      'calc((var(--size-element-lg)+2*var(--spacing-1))/2)',
    );
    expect(touch.get('background-color')).toBe(
      'var(--color-background-surface)',
    );
    // UIKit's capsule has no shadow layer.
    expect(touch.has('box-shadow')).toBe(false);
    // UIKit's cells (`--size-element-lg`), `--spacing-1` in from the ends and
    // `--spacing-4` apart: with the default tokens, around 32px controls that
    // is 6px ends and a 20px gap, so a lone icon button makes a 44px circle
    // and two make a 96px capsule.
    expect(touch.get('padding-inline')).toBe(
      'calc(var(--spacing-1)+(var(--size-element-lg)-var(--size-element-md))/2)',
    );
    expect(touch.get('gap')).toBe(
      'calc(var(--spacing-4)+var(--size-element-lg)-var(--size-element-md))',
    );
  });

  it('keeps today’s layout with a mouse: no surface, no size, the 4px gap', () => {
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
    const {container} = renderPhoneBar(profile());
    const capsule = container.querySelector('[data-bar-capsule]')!;
    const mouse = declared(capsule);
    expect(mouse.get('gap')).toBe('var(--spacing-1)');
    // The capsule is the touch rules': none of its rules is gated on WebKit
    // for iOS.
    const own = Array.from(capsule.classList);
    expect(
      rawRules.some(
        rule =>
          rule.includes('touch-callout') &&
          own.some(className => rule.includes(`.${className}`)),
      ),
    ).toBe(false);
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

describe('the default tokens give the geometry measured in bars.ts', () => {
  const source = readFileSync(join(__dirname, 'TopNav.tsx'), 'utf8');
  const {heightPt, buttonCapsules} = bars;
  /** A default token in px (rem at the default 16px root). */
  const px = (value: string): number =>
    value.endsWith('rem') ? parseFloat(value) * 16 : parseFloat(value);
  const spacing1 = px(spacingDefaults['--spacing-1']);
  const spacing4 = px(spacingDefaults['--spacing-4']);
  const cell = px(sizeDefaults['--size-element-lg']);

  it('the side inset and the cell gap are `--spacing-4`', () => {
    expect(spacing4).toBe(buttonCapsules.edgeInsetPt);
    expect(spacing4).toBe(buttonCapsules.cellGapPt);
  });

  it('a cell is `--size-element-lg`, `--spacing-1` in from the capsule', () => {
    expect(cell).toBe(buttonCapsules.cellHeightPt);
    expect(spacing1).toBe(buttonCapsules.cellInsetPt);
    expect(cell + 2 * spacing1).toBe(buttonCapsules.heightPt);
  });

  it('the space under the items is the measured constant', () => {
    expect(source).toContain(`'${heightPt - buttonCapsules.heightPt}px'`);
  });
});
