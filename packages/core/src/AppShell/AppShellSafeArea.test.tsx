// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AppShellSafeArea.test.tsx
 * @input vitest (jsdom), React Testing Library, AppShell, and the raw CSS the
 *   StyleX runtime injects (recorded before jsdom parses it)
 * @output Checks that AppShell keeps to the device's safe area: the header
 *   (and the sidenav-only phone top bar) pads its items by the top and side
 *   insets, so its background reaches under the status bar while its items
 *   stay clear, and the main region ends with a spacer of the bottom inset
 * @position Testing; validates AppShell.tsx's safe-area styles. jsdom's CSS
 *   parser drops `env()` values, so the declarations are read from the rules
 *   StyleX hands to `insertRule`; the geometry under real insets is proven by
 *   __tests__/AppShellSafeArea.interaction.browser.spec.ts
 */

import {render, screen} from '@testing-library/react';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import type {AppShell as AppShellComponent} from './AppShell';
import type {
  SideNav as SideNavComponent,
  SideNavItem as SideNavItemComponent,
  SideNavSection as SideNavSectionComponent,
} from '../SideNav';

/** Every rule StyleX inserted, as the raw text it handed to `insertRule`. */
const rawRules: string[] = [];
let AppShell: typeof AppShellComponent;
let SideNav: typeof SideNavComponent;
let SideNavItem: typeof SideNavItemComponent;
let SideNavSection: typeof SideNavSectionComponent;

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
  // StyleX injects when the styles are created: load AppShell after the
  // recorder is in place.
  vi.resetModules();
  ({AppShell} = await import('./AppShell'));
  ({SideNav, SideNavItem, SideNavSection} = await import('../SideNav'));
});

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

beforeEach(() => {
  stubMatchMedia(false);
});

/** The declarations `el`'s classes make, from the raw rules, by property. */
function rawDeclarations(el: Element, pseudo = ''): Map<string, string> {
  const declarations = new Map<string, string>();
  for (const className of Array.from(el.classList)) {
    for (const rule of rawRules) {
      const match = new RegExp(
        `^\\.${className}(?::not\\(#\\\\#\\))*${pseudo}\\{([^}]*)\\}$`,
      ).exec(rule);
      if (match == null) {
        continue;
      }
      for (const declaration of match[1].split(';')) {
        const colon = declaration.indexOf(':');
        if (colon > 0) {
          // StyleX minifies values: compare without whitespace.
          declarations.set(
            declaration.slice(0, colon).trim(),
            declaration.slice(colon + 1).replace(/\s+/g, ''),
          );
        }
      }
    }
  }
  return declarations;
}

describe('AppShell safe area', () => {
  it('pads the header by the top and side insets', () => {
    render(
      <AppShell topNav={<div>Nav</div>}>
        <div>Content</div>
      </AppShell>,
    );
    const declarations = rawDeclarations(screen.getByRole('banner'));
    expect(declarations.get('padding-top')).toBe(
      'env(safe-area-inset-top,0px)',
    );
    // Left-to-right here; a right-to-left context swaps the sides.
    expect(declarations.get('padding-inline-start')).toBe(
      'env(safe-area-inset-left,0px)',
    );
    expect(declarations.get('padding-inline-end')).toBe(
      'env(safe-area-inset-right,0px)',
    );
  });

  it('pads the sidenav-only phone top bar the same way', () => {
    stubMatchMedia(true);
    render(
      <AppShell
        sideNav={
          <SideNav>
            <SideNavSection title="Main" isHeaderHidden>
              <SideNavItem label="Home" />
            </SideNavSection>
          </SideNav>
        }>
        <div>Content</div>
      </AppShell>,
    );
    const bar = screen.getByRole('banner');
    expect(rawDeclarations(bar).get('padding-top')).toBe(
      'env(safe-area-inset-top,0px)',
    );
  });

  it('ends the main region with a spacer of the bottom inset', () => {
    render(
      <AppShell topNav={<div>Nav</div>}>
        <div>Content</div>
      </AppShell>,
    );
    const spacer = rawDeclarations(screen.getByRole('main'), '::after');
    expect(spacer.get('content')).toBe('""');
    expect(spacer.get('display')).toBe('block');
    expect(spacer.get('height')).toBe('env(safe-area-inset-bottom,0px)');
  });
});
