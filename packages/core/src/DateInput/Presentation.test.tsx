// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Presentation.test.tsx
 * @input Uses vitest, Testing Library, and DateInput
 * @output Tests for the `presentation` prop (`spec:AST-043` FR1–FR4)
 * @position Testing; covers surface resolution and precedence
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {DateInput} from './DateInput';
import {resetDateSegmentProbe} from './nativeDateSegments';

const HOVER_CAPABLE = /\(\s*hover\s*:\s*hover\s*\)/;

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function stubPointer(isCoarse: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: /pointer:\s*coarse/.test(query)
      ? isCoarse
      : /pointer:\s*fine/.test(query)
        ? !isCoarse
        : HOVER_CAPABLE.test(query),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  resetDateSegmentProbe();
});

describe('DateInput presentation', () => {
  it('text-input renders a typed field with no calendar toggle', () => {
    stubPointer(false);
    render(
      <DateInput
        label="Ship date"
        presentation="text-input"
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByRole('textbox', {name: 'Ship date'}),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Open calendar'})).toBeNull();
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('popover forces the calendar field on a coarse pointer', () => {
    stubPointer(true);
    render(
      <DateInput
        label="Ship date"
        presentation="popover"
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByRole('button', {name: 'Open calendar'}),
    ).toBeInTheDocument();
    expect(document.querySelector('input[type="date"]')).toBeNull();
  });

  it('bottom-sheet forces the sheet field on a fine pointer', () => {
    stubPointer(false);
    render(
      <DateInput
        label="Ship date"
        presentation="bottom-sheet"
        onChange={() => {}}
      />,
    );
    const input = screen.getByRole('combobox', {name: 'Ship date'});
    expect(input).toHaveAttribute('readonly');
    expect(document.querySelector('input[type="date"]')).toBeNull();
  });

  it('native forces the native field on a fine pointer', () => {
    stubPointer(false);
    render(
      <DateInput label="Ship date" presentation="native" onChange={() => {}} />,
    );
    expect(document.querySelector('input[type="date"]')).not.toBeNull();
  });

  it('presentation wins over nativePicker (FR4)', () => {
    stubPointer(false);
    render(
      <DateInput
        label="Ship date"
        presentation="text-input"
        nativePicker="always"
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByRole('textbox', {name: 'Ship date'}),
    ).toBeInTheDocument();
    expect(document.querySelector('input[type="date"]')).toBeNull();
  });

  it('deprecated nativePicker="never" keeps popover/sheet by pointer (FR3)', () => {
    stubPointer(false);
    const {unmount} = render(
      <DateInput label="Ship date" nativePicker="never" onChange={() => {}} />,
    );
    expect(
      screen.getByRole('button', {name: 'Open calendar'}),
    ).toBeInTheDocument();
    unmount();

    stubPointer(true);
    render(
      <DateInput label="Ship date" nativePicker="never" onChange={() => {}} />,
    );
    expect(screen.getByRole('combobox', {name: 'Ship date'})).toHaveAttribute(
      'readonly',
    );
  });
});
