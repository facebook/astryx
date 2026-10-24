// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file modalBackdrop.test.tsx
 * @input Dialog, Drawer, MobileNav and BottomSheet rendered open; the StyleX
 *   rules vitest injects into the document (`runtimeInjection`)
 * @output The modal dim contract: every modal `::backdrop` paints the theme's
 *   `--color-background-backdrop`, and a theme can still put a blur on the dim through
 *   component theming
 * @position Cross-component regression test for the shared modal dim
 *
 * The dim behind a modal presentation is one theme colour, the same in every
 * component that dims (iOS dims an alert, a sheet and a popover with the same
 * colour), and a flat one: no `backdrop-filter`. `--color-overlay` stays the
 * scrim that keeps text legible over media (Overlay, Thumbnail) and is not a
 * modal dim.
 *
 * jsdom has no top layer and paints nothing, so this pins the declaration the
 * dim rests on. jsdom's CSS parser also drops `backdrop-filter`, so the
 * no-blur half of the contract and the computed colours are proven in real
 * browsers by __tests__/ModalBackdrop.a11y.browser.spec.ts.
 *
 * SYNC: When a component gains a modal ::backdrop, add it here.
 */

import {render} from '@testing-library/react';
import type {ReactElement} from 'react';
import {beforeAll, describe, expect, it} from 'vitest';
import {BottomSheet} from '../BottomSheet/BottomSheet';
import {Dialog} from '../Dialog/Dialog';
import {Drawer} from '../Drawer/Drawer';
import {MobileNav} from '../MobileNav/MobileNav';
import {defineTheme} from '../theme/defineTheme';
import {generateThemeRules} from '../theme/generateThemeRules';

// jsdom does not implement showModal/close on <dialog>.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal =
    HTMLDialogElement.prototype.showModal ||
    function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
  HTMLDialogElement.prototype.close =
    HTMLDialogElement.prototype.close ||
    function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    };
});

/**
 * Every declaration the element's StyleX classes make on its `::backdrop`,
 * outside media queries and starting styles, in cascade order. Properties
 * jsdom does not know (`backdrop-filter`) are not kept by its parser.
 */
function backdropDeclarations(el: Element): Map<string, string> {
  const classes = new Set(el.className.split(/\s+/));
  const declarations = new Map<string, string>();
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRule[];
    try {
      rules = Array.from(sheet.cssRules);
    } catch {
      continue;
    }
    for (const rule of rules) {
      if (!(rule instanceof CSSStyleRule)) {
        continue;
      }
      // StyleX raises a pseudo-element rule's specificity with `:not(#\#)`
      // repeats: `.x1abc:not(#\#)…::backdrop`.
      const owner = /^\.([\w-]+)(?::not\([^)]*\))*::backdrop$/.exec(
        rule.selectorText,
      )?.[1];
      if (owner == null || !classes.has(owner)) {
        continue;
      }
      for (let i = 0; i < rule.style.length; i++) {
        const property = rule.style.item(i);
        declarations.set(property, rule.style.getPropertyValue(property));
      }
    }
  }
  return declarations;
}

const modals: ReadonlyArray<[string, () => ReactElement]> = [
  [
    'Dialog',
    () => (
      <Dialog isOpen onOpenChange={() => {}} aria-label="Title">
        Content
      </Dialog>
    ),
  ],
  [
    'Drawer',
    () => (
      <Drawer isOpen onOpenChange={() => {}} label="Details">
        Content
      </Drawer>
    ),
  ],
  [
    'MobileNav',
    () => (
      <MobileNav isOpen onOpenChange={() => {}}>
        Navigation
      </MobileNav>
    ),
  ],
  [
    'BottomSheet',
    () => (
      <BottomSheet isOpen onOpenChange={() => {}} label="Filters">
        Content
      </BottomSheet>
    ),
  ],
];

describe('modal dim', () => {
  it.each(modals)(
    '%s paints its ::backdrop with --color-background-backdrop',
    (_name, element) => {
      render(element());
      const dialog = document.querySelector('dialog');
      expect(dialog).not.toBeNull();
      expect(backdropDeclarations(dialog!).get('background-color')).toBe(
        'var(--color-background-backdrop)',
      );
    },
  );

  it('lets a theme put a blur back on the dim', () => {
    // The flat dim is the default look, not a lock: component theming
    // reaches the ::backdrop of a component's own dialog element.
    const blurred = defineTheme({
      name: 'blurred-dim',
      components: {
        dialog: {base: {'::backdrop': {backdropFilter: 'blur(2px)'}}},
      },
    });
    const warnings: string[] = [];
    const rules = generateThemeRules(blurred, warnings).join('\n');
    expect(warnings).toEqual([]);
    expect(rules).toMatch(
      /\.astryx-dialog::backdrop \{\s*backdrop-filter: blur\(2px\);\s*\}/,
    );
  });
});
