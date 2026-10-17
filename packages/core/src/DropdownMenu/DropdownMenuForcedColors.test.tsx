// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuForcedColors.test.tsx
 * @input vitest, @testing-library/react, DropdownMenu row components, the
 *   forced-colors CSS helper
 * @output Asserts every focusable menu row keeps a focus indicator under
 *   forced colors
 * @position Component-local; the real-engine frames live in
 *   __tests__/DropdownMenuAudit.a11y.chromium.spec.ts
 *
 * A menu row shows focus — the one highlight the keyboard and the mouse both
 * drive — with a translucent overlay background. Forced colors replace that
 * background with the page color, so a focused row would look like its
 * neighbours and a keyboard user in a high-contrast mode could not tell which
 * row Enter will activate (WCAG 2.4.7). The focused row receives an inset
 * system-color outline while its content remains under user-agent control, so
 * labels, icons, and end content stay perceptible. jsdom cannot render forced
 * colors, so these assert the compiled rule each focusable row carries; the
 * Chromium spec observes the rendered result.
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {getAllInjectedCss} from '../__tests__/forcedColors';
import {DropdownMenu} from './DropdownMenu';
import {DropdownMenuItem} from './DropdownMenuItem';
import {DropdownMenuCheckboxItem} from './DropdownMenuCheckboxItem';
import {DropdownMenuRadioGroup} from './DropdownMenuRadioGroup';
import {DropdownMenuRadioItem} from './DropdownMenuRadioItem';
import {DropdownMenuSubMenu} from './DropdownMenuSubMenu';

beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.setAttribute('popover-open', '');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('popover-open');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  });
  const originalMatches = HTMLElement.prototype.matches;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = function (
    selector: string,
  ): boolean {
    if (selector === ':popover-open') {
      return this.hasAttribute('popover-open');
    }
    return originalMatches.call(this, selector);
  };
});

/**
 * The declarations the row's own classes apply on `:focus` under forced
 * colors, joined into one string.
 */
function forcedColorsFocusDeclarations(row: HTMLElement): string {
  const css = getAllInjectedCss();
  const declarations: string[] = [];
  for (const className of Array.from(row.classList)) {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(
      `\\.${escaped}:focus-visible[^{,]*\\{([^}]*)\\}`,
      'g',
    );
    for (const match of css.matchAll(pattern)) {
      declarations.push(match[1] ?? '');
    }
  }
  return declarations.join(' ');
}

function expectSystemFocusOutline(row: HTMLElement) {
  const declarations = forcedColorsFocusDeclarations(row);
  expect(declarations).toContain('outline-width: var(--focus-outline-width)');
  expect(declarations).toContain('outline-style: var(--focus-outline-style)');
  expect(declarations).toContain('outline-color: var(--focus-outline-color)');
  expect(declarations).not.toContain('background-color: highlight');
  expect(declarations).not.toContain('color: highlighttext');
}

async function openMenu() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', {name: /Actions/}));
}

describe('forced colors: a focused menu row keeps a visible indicator (WCAG 2.4.7)', () => {
  it('an action row paints the outline on focus', async () => {
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem label="Edit" onClick={() => {}} />
      </DropdownMenu>,
    );
    await openMenu();
    expectSystemFocusOutline(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    );
  });

  it('a data-mode row paints the same outline', async () => {
    render(
      <DropdownMenu button={{label: 'Actions'}} items={[{label: 'Edit'}]} />,
    );
    await openMenu();
    expectSystemFocusOutline(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    );
  });

  it('a destructive row keeps a visible outline without forcing its content colors', async () => {
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem
          label="Delete"
          variant="destructive"
          onClick={() => {}}
        />
      </DropdownMenu>,
    );
    await openMenu();
    expectSystemFocusOutline(
      screen.getByRole('menuitem', {name: 'Delete', hidden: true}),
    );
  });

  it('a checkbox row paints the outline on focus', async () => {
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuCheckboxItem label="Show archived" value={false} />
      </DropdownMenu>,
    );
    await openMenu();
    expectSystemFocusOutline(
      screen.getByRole('menuitemcheckbox', {
        name: /Show archived/,
        hidden: true,
      }),
    );
  });

  it('a radio row paints the outline on focus', async () => {
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuRadioGroup
          value="newest"
          onChange={() => {}}
          label="Sort by">
          <DropdownMenuRadioItem value="newest" label="Newest" />
        </DropdownMenuRadioGroup>
      </DropdownMenu>,
    );
    await openMenu();
    expectSystemFocusOutline(
      screen.getByRole('menuitemradio', {name: /Newest/, hidden: true}),
    );
  });

  it('a sub-menu row paints the outline on focus', async () => {
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuSubMenu label="Share" presentation="flyout">
          <DropdownMenuItem label="Copy link" onClick={() => {}} />
        </DropdownMenuSubMenu>
      </DropdownMenu>,
    );
    await openMenu();
    expectSystemFocusOutline(
      screen.getByRole('menuitem', {name: /Share/, hidden: true}),
    );
  });
});
