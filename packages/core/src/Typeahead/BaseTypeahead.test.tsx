// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BaseTypeahead.test.tsx
 * @input BaseTypeahead public props and a synchronous SearchSource
 * @output Focused contract tests for the public combobox engine
 * @position Colocated verification for BaseTypeahead
 */

import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import * as stylex from '@stylexjs/stylex';
import {BaseTypeahead} from './BaseTypeahead';
import {spacingVars} from '../theme/tokens.stylex';
import type {SearchSource, SearchableItem} from './types';

const popoverOpenState = new WeakMap<HTMLElement, boolean>();
const originalMatchesDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'matches',
);
const originalMatches = HTMLElement.prototype.matches;

beforeAll(() => {
  HTMLElement.prototype.showPopover = function () {
    popoverOpenState.set(this, true);
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  };
  HTMLElement.prototype.hidePopover = function () {
    popoverOpenState.set(this, false);
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  };
  Object.defineProperty(HTMLElement.prototype, 'matches', {
    ...originalMatchesDescriptor,
    value(this: HTMLElement, selector: string) {
      if (selector === ':popover-open') {
        return popoverOpenState.get(this) ?? false;
      }
      return originalMatches.call(this, selector);
    },
  });
});

afterAll(() => {
  if (originalMatchesDescriptor) {
    Object.defineProperty(
      HTMLElement.prototype,
      'matches',
      originalMatchesDescriptor,
    );
  }
});

const emptySource: SearchSource<SearchableItem> = {
  search: () => [],
  bootstrap: () => [],
};

const resultItem: SearchableItem = {id: '1', label: 'Result'};

const TYPEAHEAD_VIEWPORT_GUTTER = spacingVars['--spacing-4'];
const TYPEAHEAD_MAX_INLINE_SIZE = `calc(100vi - max(${TYPEAHEAD_VIEWPORT_GUTTER}, env(safe-area-inset-left, 0px)) - max(${TYPEAHEAD_VIEWPORT_GUTTER}, env(safe-area-inset-right, 0px)))`;
const TYPEAHEAD_MAX_INLINE_SIZE_FALLBACK = `calc(100vw - ${TYPEAHEAD_VIEWPORT_GUTTER} - ${TYPEAHEAD_VIEWPORT_GUTTER})`;

const testStyles = stylex.create({
  input: {textTransform: 'uppercase'},
  popover: {
    maxInlineSize: stylex.firstThatWorks(
      TYPEAHEAD_MAX_INLINE_SIZE,
      TYPEAHEAD_MAX_INLINE_SIZE_FALLBACK,
    ),
  },
});

function atomicClasses(
  style: (typeof testStyles)[keyof typeof testStyles],
): string[] {
  return (stylex.props(style).className ?? '')
    .split(' ')
    .filter(className => className !== '' && !className.includes('__'));
}

describe('BaseTypeahead', () => {
  it('forwards supported DOM, styling, and event props to the combobox input', () => {
    const onBlur = vi.fn();
    const onFocus = vi.fn();
    const onPointerDown = vi.fn();

    render(
      <BaseTypeahead
        searchSource={emptySource}
        value={null}
        onChange={() => {}}
        aria-label="Find a framework"
        aria-expanded="true"
        className="consumer-input"
        data-audit-state="forwarded"
        onBlur={onBlur}
        onFocus={onFocus}
        onPointerDown={onPointerDown}
        style={{letterSpacing: '0.08em'}}
        xstyle={testStyles.input}
      />,
    );

    const input = screen.getByRole('combobox', {name: 'Find a framework'});
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('data-audit-state', 'forwarded');
    expect(input).toHaveClass('consumer-input');
    expect(input).toHaveStyle({letterSpacing: '0.08em'});
    expect(getComputedStyle(input).textTransform).toBe('uppercase');

    fireEvent.pointerDown(input);
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(onPointerDown).toHaveBeenCalledOnce();
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it('preserves native input attributes when legacy aliases are undefined', () => {
    render(
      <BaseTypeahead
        searchSource={emptySource}
        value={null}
        onChange={() => {}}
        id="native-input"
        aria-describedby="native-description"
        aria-labelledby="native-label"
        tabIndex={3}
        inputId={undefined}
        ariaDescribedBy={undefined}
        ariaLabelledBy={undefined}
        inputTabIndex={undefined}
      />,
    );

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('id', 'native-input');
    expect(input).toHaveAttribute('aria-describedby', 'native-description');
    expect(input).toHaveAttribute('aria-labelledby', 'native-label');
    expect(input).toHaveAttribute('tabindex', '3');
  });

  it('lets defined legacy aliases override their native equivalents', () => {
    render(
      <BaseTypeahead
        searchSource={emptySource}
        value={null}
        onChange={() => {}}
        id="native-input"
        aria-describedby="native-description"
        aria-labelledby="native-label"
        tabIndex={3}
        inputId="legacy-input"
        ariaDescribedBy="legacy-description"
        ariaLabelledBy="legacy-label"
        inputTabIndex={-1}
      />,
    );

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('id', 'legacy-input');
    expect(input).toHaveAttribute('aria-describedby', 'legacy-description');
    expect(input).toHaveAttribute('aria-labelledby', 'legacy-label');
    expect(input).toHaveAttribute('tabindex', '-1');
  });

  it('counts grapheme clusters when enforcing minQueryLength', async () => {
    const search = vi.fn(() => [resultItem]);
    render(
      <BaseTypeahead
        searchSource={{search, bootstrap: () => []}}
        value={null}
        onChange={() => {}}
        debounceMs={0}
        minQueryLength={2}
      />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: '😀'}});
    await Promise.resolve();
    expect(search).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-expanded', 'false');

    fireEvent.change(input, {target: {value: '😀a'}});
    await waitFor(() => expect(search).toHaveBeenCalledExactlyOnceWith('😀a'));
  });

  it('keeps requested width until guttered fallbacks are exhausted', async () => {
    render(
      <BaseTypeahead
        searchSource={{
          search: () => [resultItem],
          bootstrap: () => [resultItem],
        }}
        value={null}
        onChange={() => {}}
        aria-label="Find a framework"
        hasEntriesOnFocus
        menuWidth={400}
      />,
    );

    fireEvent.focus(screen.getByRole('combobox', {name: 'Find a framework'}));

    const listbox = await screen.findByRole('listbox', {hidden: true});
    const layer = listbox.closest('[popover]') as HTMLElement;
    expect(layer).not.toBeNull();
    expect(layer.style.positionTryFallbacks).toContain(
      '--astryx-layer-block-end-guttered-full-axis',
    );
    expect(layer).toHaveStyle({width: 'var(--x-width)'});
    expect(layer.getAttribute('style')).toContain('--x-width: 400px');
    for (const className of atomicClasses(testStyles.popover)) {
      expect(layer).toHaveClass(className);
    }
  });

  it('exposes a completed empty search as a disabled listbox option', async () => {
    render(
      <BaseTypeahead
        searchSource={emptySource}
        value={null}
        onChange={() => {}}
        debounceMs={0}
        emptySearchResultsText="No matching frameworks"
      />,
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: {value: 'none'},
    });

    await waitFor(() => {
      expect(
        screen.getByRole('option', {
          hidden: true,
          name: 'No matching frameworks',
        }),
      ).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
