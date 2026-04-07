import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, cleanup} from '@testing-library/react';
import React from 'react';
import {XDSTheme} from './XDSTheme';
import {defineTheme} from './defineTheme';

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
  });

  afterEach(() => {
    cleanup();
    document.documentElement.removeAttribute('data-theme');
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
  // Nested themes — should NOT sync to <html>
  // =========================================================================

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
});
