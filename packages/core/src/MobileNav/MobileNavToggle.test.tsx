// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MobileNavToggle.test.tsx
 * @input Uses vitest, @testing-library/react, AppShell + SideNav
 * @output Unit tests for MobileNavToggle ARIA wiring
 * @position Testing; validates MobileNavToggle.tsx exposes aria-expanded and
 *   aria-controls so screen-reader users know the drawer state and target.
 *
 * SYNC: When MobileNavToggle.tsx changes, update tests to match new behavior
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {AppShell} from '../AppShell/AppShell';
import {SideNav, SideNavItem, SideNavSection} from '../SideNav';

// jsdom doesn't implement showModal/close on <dialog>, so we mock them
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

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', MockResizeObserver);

function createMockMatchMedia(matches: boolean) {
  return {
    matches,
    media: '',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
}

beforeEach(() => {
  // Below the breakpoint so the mobile nav (and its toggle) render.
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue(createMockMatchMedia(true)),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

function TestShell() {
  return (
    <AppShell
      sideNav={
        <SideNav>
          <SideNavSection title="Test" isHeaderHidden>
            <SideNavItem label="Home" />
          </SideNavSection>
        </SideNav>
      }
      mobileNav={{breakpoint: 'md'}}>
      <div>Content</div>
    </AppShell>
  );
}

describe('MobileNavToggle ARIA wiring', () => {
  it('exposes aria-expanded="false" when the drawer is closed', () => {
    render(<TestShell />);

    const toggle = screen.getByRole('button', {name: /open navigation/i});
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('exposes aria-expanded="true" after opening the drawer', () => {
    render(<TestShell />);

    const toggle = screen.getByRole('button', {name: /open navigation/i});
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('references the nav drawer via aria-controls that resolves to the dialog', () => {
    render(<TestShell />);

    const toggle = screen.getByRole('button', {name: /open navigation/i});
    const controls = toggle.getAttribute('aria-controls');
    expect(controls).toBeTruthy();

    const target = document.getElementById(controls!);
    expect(target).not.toBeNull();
    expect(target).toBe(screen.getAllByRole('dialog', {hidden: true})[0]);
    expect(target?.tagName).toBe('DIALOG');
  });
});
