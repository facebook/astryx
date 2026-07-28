// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TreeList row indent must stay reachable from the theming layer (#4308).
 *
 * The row's content wrapper is the `astryx-tree-list-item` theme target. When
 * its `margin-inline-start` was set as an inline longhand, no rule in
 * `@layer astryx-theme` could ever win against it — inline styles outrank every
 * cascade layer — so the indent sat outside the theming contract and consumers
 * were pushed to `!important`.
 *
 * The row now publishes only the VALUE (`--_tree-indent`) inline and declares
 * `margin-inline-start` in the stylesheet, which restores normal cascade order.
 *
 * These assertions deliberately avoid depending on jsdom resolving `@layer`
 * precedence: they pin the two facts the fix rests on — no inline longhand, and
 * a stylesheet declaration that consumes the variable.
 *
 * @input Rendered TreeList at several nesting depths.
 * @output Fails if the indent longhand moves back inline, or the stylesheet
 *   stops consuming the variable.
 * @position Colocated with TreeList.test.tsx, which covers behaviour.
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {TreeList} from './TreeList';
import type {TreeListItemData} from './TreeListTypes';

const items: TreeListItemData[] = [
  {
    id: 'root',
    label: 'Root',
    isExpanded: true,
    children: [
      {
        id: 'mid',
        label: 'Mid',
        isExpanded: true,
        children: [{id: 'leaf', label: 'Leaf'}],
      },
    ],
  },
];

/** The row element that carries the theme target and the indent. */
function rowFor(text: string): HTMLElement {
  const li = screen.getByText(text).closest('li');
  const row = li?.querySelector<HTMLElement>('.astryx-tree-list-item');
  if (!row) {
    throw new Error(`no themed row for "${text}"`);
  }
  return row;
}

/** Every stylesheet rule whose text mentions `prop`. */
function rulesMentioning(prop: string): string[] {
  const out: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      if (rule.cssText.includes(prop)) {
        out.push(rule.cssText);
      }
    }
  }
  return out;
}

describe('TreeList indent is reachable from the theme layer', () => {
  it('never sets margin-inline-start as an inline longhand', () => {
    render(<TreeList items={items} />);

    for (const label of ['Root', 'Mid', 'Leaf']) {
      const inline = rowFor(label).getAttribute('style') ?? '';
      // An inline longhand would outrank @layer astryx-theme unconditionally.
      expect(inline).not.toMatch(/(^|;)\s*margin-inline-start\s*:/);
      expect(inline).not.toMatch(/(^|;)\s*margin-left\s*:/);
    }
  });

  it('publishes the indent as a custom property on the themed row', () => {
    render(<TreeList items={items} />);

    for (const label of ['Root', 'Mid', 'Leaf']) {
      const row = rowFor(label);
      expect(row.style.getPropertyValue('--_tree-indent')).not.toBe('');
      // The indent sits on the same element that carries the theme target,
      // so a theme override lands on the element it is documented against.
      expect(row.classList.contains('astryx-tree-list-item')).toBe(true);
    }
  });

  it('declares margin-inline-start in the stylesheet, consuming the variable', () => {
    render(<TreeList items={items} />);

    const consuming = rulesMentioning('margin-inline-start').filter(text =>
      text.includes('--_tree-indent'),
    );
    expect(consuming.length).toBeGreaterThan(0);
  });

  it('still grows the indent with depth', () => {
    render(<TreeList items={items} />);

    const multiplier = (label: string): number => {
      const value = rowFor(label).style.getPropertyValue('--_tree-indent');
      const match = /calc\((\d+)/.exec(value);
      return match ? Number(match[1]) : NaN;
    };

    expect(multiplier('Mid')).toBeGreaterThan(multiplier('Root'));
    expect(multiplier('Leaf')).toBeGreaterThan(multiplier('Mid'));
  });

  it('keeps a leaf indented past its parent to clear the chevron column', () => {
    // Leaves add a chevron-width offset so their labels line up with sibling
    // parents' labels; that offset must survive the move to a variable.
    render(<TreeList items={items} />);

    const leaf = rowFor('Leaf').style.getPropertyValue('--_tree-indent');
    expect(leaf).toContain('+');
  });
});
