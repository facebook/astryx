// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {render, cleanup} from '@testing-library/react';
import React from 'react';
import {XDSTheme} from './XDSTheme';
import {defineTheme} from './defineTheme';
import {
  setThemeLayerName,
  DEFAULT_THEME_LAYER,
  ASTRYX_THEME_LAYER,
} from '../naming';

const testTheme = defineTheme({
  name: 'test',
  tokens: {
    '--color-accent': ['#AA0000', '#FF5555'],
  },
});

const altTheme = defineTheme({
  name: 'alt',
  tokens: {
    '--color-accent': ['#00AA00', '#55FF55'],
  },
});

describe('XDSTheme', () => {
  beforeEach(() => {
    // Clean up documentElement state before each test
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-xds-theme');
  });

  afterEach(() => {
    cleanup();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-xds-theme');
  });

  it('renders children', () => {
    const {getByText} = render(
      <XDSTheme theme={testTheme}>
        <span>hello</span>
      </XDSTheme>,
    );
    expect(getByText('hello')).toBeTruthy();
  });

  it('sets data-xds-theme on wrapper div', () => {
    const {container} = render(
      <XDSTheme theme={testTheme}>
        <span>child</span>
      </XDSTheme>,
    );
    const wrapper = container.querySelector('[data-xds-theme="test"]');
    expect(wrapper).toBeTruthy();
  });

  // =========================================================================
  // Root detection — data-theme on <html>
  // =========================================================================

  it('syncs data-theme to <html> for root provider in dark mode', () => {
    render(
      <XDSTheme theme={testTheme} mode="dark">
        <span>child</span>
      </XDSTheme>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('syncs data-theme to <html> for root provider in light mode', () => {
    render(
      <XDSTheme theme={testTheme} mode="light">
        <span>child</span>
      </XDSTheme>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('removes data-theme from <html> for root provider in system mode', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    render(
      <XDSTheme theme={testTheme} mode="system">
        <span>child</span>
      </XDSTheme>,
    );
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('removes data-theme from <html> when root provider unmounts', () => {
    const {unmount} = render(
      <XDSTheme theme={testTheme} mode="dark">
        <span>child</span>
      </XDSTheme>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    unmount();
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  // =========================================================================
  // Root detection — data-xds-theme on <html>
  // =========================================================================

  it('syncs data-xds-theme to <html> for root provider', () => {
    render(
      <XDSTheme theme={testTheme} mode="light">
        <span>child</span>
      </XDSTheme>,
    );
    expect(document.documentElement.getAttribute('data-xds-theme')).toBe(
      'test',
    );
  });

  it('removes data-xds-theme from <html> when root provider unmounts', () => {
    const {unmount} = render(
      <XDSTheme theme={testTheme} mode="light">
        <span>child</span>
      </XDSTheme>,
    );
    expect(document.documentElement.getAttribute('data-xds-theme')).toBe(
      'test',
    );
    unmount();
    expect(document.documentElement.hasAttribute('data-xds-theme')).toBe(false);
  });

  // =========================================================================
  // Nested themes — should NOT sync to <html>
  // =========================================================================

  it('does not let nested XDSTheme override <html> data-xds-theme', () => {
    render(
      <XDSTheme theme={testTheme} mode="dark">
        <XDSTheme theme={altTheme} mode="light">
          <span>nested</span>
        </XDSTheme>
      </XDSTheme>,
    );
    // Root is "test" — nested "alt" should NOT override
    expect(document.documentElement.getAttribute('data-xds-theme')).toBe(
      'test',
    );
  });

  it('does not let nested XDSTheme override <html> data-theme', () => {
    render(
      <XDSTheme theme={testTheme} mode="dark">
        <XDSTheme theme={altTheme} mode="light">
          <span>nested</span>
        </XDSTheme>
      </XDSTheme>,
    );
    // Root is dark — nested light should NOT override
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('nested XDSTheme still sets data-theme on its own wrapper div', () => {
    const {container} = render(
      <XDSTheme theme={testTheme} mode="dark">
        <XDSTheme theme={altTheme} mode="light">
          <span>nested</span>
        </XDSTheme>
      </XDSTheme>,
    );
    // The nested wrapper should have data-theme="light" on its own div
    const nestedWrapper = container.querySelector('[data-xds-theme="alt"]');
    expect(nestedWrapper).toBeTruthy();
    expect(nestedWrapper?.getAttribute('data-theme')).toBe('light');
  });

  // =========================================================================
  // Configurable theme layer (XDS-prefix migration P2380608025)
  // =========================================================================
  describe('component-override layer name', () => {
    /** Read the @layer name from the injected component-override <style>. */
    function injectedLayerFor(themeName: string): string | null {
      const style = document.head.querySelector(
        `style[data-xds-theme="${themeName}"]`,
      );
      const text = style?.textContent ?? '';
      const match = text.match(/@layer\s+([\w-]+)\s*\{/);
      return match ? match[1] : null;
    }

    afterEach(() => {
      setThemeLayerName(DEFAULT_THEME_LAYER);
      // Remove injected theme <style> nodes so re-injection isn't deduped.
      document.head
        .querySelectorAll('style[data-xds-theme]')
        .forEach(el => el.remove());
    });

    it('injects component overrides into xds-theme by default', () => {
      const theme = defineTheme({
        name: 'layer-default',
        components: {button: {'variant:secondary': {backgroundColor: 'red'}}},
      });
      render(
        <XDSTheme theme={theme}>
          <span>x</span>
        </XDSTheme>,
      );
      expect(injectedLayerFor('layer-default')).toBe('xds-theme');
    });

    it('injects into astryx-theme when configured (opt-in)', () => {
      setThemeLayerName(ASTRYX_THEME_LAYER);
      const theme = defineTheme({
        name: 'layer-astryx',
        components: {button: {'variant:secondary': {backgroundColor: 'red'}}},
      });
      render(
        <XDSTheme theme={theme}>
          <span>x</span>
        </XDSTheme>,
      );
      expect(injectedLayerFor('layer-astryx')).toBe('astryx-theme');
    });
  });
});
