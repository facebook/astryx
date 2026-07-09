// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useToast.test.tsx
 * @input Uses vitest, @testing-library/react, useToast/ToastViewport/Theme
 * @output Unit tests for the fallback viewport's theme mode resolution
 * @position Testing; validates useToast.tsx's FallbackThemeProvider
 *
 * SYNC: When useToast.tsx's fallback theme provision changes, update these tests
 *
 * The fallback viewport root is a module-level singleton, so the first two
 * tests run in order and share it (mounted by the first) — mirroring a real
 * app whose root <Theme> mode changes over time.
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import {render, screen, fireEvent, act, waitFor} from '@testing-library/react';
import React from 'react';
import {Theme} from '../theme/Theme';
import {defineTheme} from '../theme/defineTheme';
import {ToastViewport} from './ToastViewport';
import {useToast} from './useToast';
import type {ToastOptions} from './types';

const testTheme = defineTheme({name: 'test', tokens: {}});
const NO_AUTO_HIDE: ToastOptions = {body: 'hello', isAutoHide: false};

function mockMatchMedia(prefersDark: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('dark') ? prefersDark : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function ShowToastButton({label = 'Trigger'}: {label?: string}) {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast(NO_AUTO_HIDE)}>
      {label}
    </button>
  );
}

// The fallback's toasts accumulate in one persistent viewport across tests
// (see file header) — take the most recently added one.
function newestMediaAttr(scope: ParentNode): string | null {
  const nodes = scope.querySelectorAll('[data-astryx-media]');
  const last = nodes[nodes.length - 1];
  return last ? last.getAttribute('data-astryx-media') : null;
}

describe('useToast fallback viewport theme mode', () => {
  afterEach(async () => {
    mockMatchMedia(false);
    // RTL's cleanup (unmounting each test's <Theme>) removes data-theme,
    // which the fallback's still-live MutationObserver reacts to a tick
    // later — flush that microtask inside an active act() so React doesn't
    // warn about an update outside it.
    await act(async () => {});
  });

  it('resolves the app mode (light) instead of OS preference (dark) with no LayerProvider', async () => {
    mockMatchMedia(true); // OS prefers dark

    render(
      <Theme theme={testTheme} mode="light">
        <ShowToastButton />
      </Theme>,
    );

    act(() => {
      fireEvent.click(screen.getByText('Trigger'));
    });

    await waitFor(() => {
      expect(
        document.querySelector(
          '[data-astryx-toast-fallback] [data-astryx-media]',
        ),
      ).not.toBeNull();
    });

    // App mode is light, so the toast's inverted surface must be dark — if
    // the fallback fell back to OS preference (dark) instead, this would be
    // 'light' and the toast's text/icon would compute the same color as its
    // own background (the invisible-toast bug).
    expect(
      newestMediaAttr(document.querySelector('[data-astryx-toast-fallback]')!),
    ).toBe('dark');
  });

  it('keeps the OS-preference fallback for mode="system" with no LayerProvider', async () => {
    mockMatchMedia(true); // OS prefers dark

    render(
      <Theme theme={testTheme} mode="system">
        <ShowToastButton label="Trigger System" />
      </Theme>,
    );

    act(() => {
      fireEvent.click(screen.getByText('Trigger System'));
    });

    await waitFor(() => {
      const nodes = document.querySelectorAll(
        '[data-astryx-toast-fallback] [data-astryx-media]',
      );
      expect(nodes.length).toBeGreaterThan(1);
    });

    // mode="system" means #1587 removes data-theme from <html> — the provider
    // must not override anything, leaving useTheme's own OS-preference
    // resolution (dark here) in place, same as before this fix.
    expect(
      newestMediaAttr(document.querySelector('[data-astryx-toast-fallback]')!),
    ).toBe('light');
  });
});

describe('useToast LayerProvider path', () => {
  afterEach(() => {
    mockMatchMedia(false);
  });

  it('resolves mode via real context, unaffected by the fallback provider', () => {
    mockMatchMedia(true); // OS prefers dark; should be irrelevant here

    const {container} = render(
      <Theme theme={testTheme} mode="light">
        <ToastViewport isTopLayer={false}>
          <ShowToastButton label="Trigger Provider" />
        </ToastViewport>
      </Theme>,
    );

    act(() => {
      fireEvent.click(screen.getByText('Trigger Provider'));
    });

    expect(newestMediaAttr(container)).toBe('dark');
  });
});
