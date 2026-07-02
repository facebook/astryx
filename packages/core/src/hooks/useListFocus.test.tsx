// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useListFocus.test.tsx
 * @input Uses vitest, @testing-library/react, useListFocus hook
 * @output Unit tests for useListFocus disabled-item skipping + navigation
 * @position Testing; validates useListFocus.ts keyboard navigation
 *
 * SYNC: When useListFocus.ts changes, update tests to match new behavior
 */

import {describe, it, expect} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {useListFocus} from './useListFocus';

const NO_DISABLED: string[] = [];

function Menu({
  wrap = true,
  disabledLabels = NO_DISABLED,
}: {
  wrap?: boolean;
  disabledLabels?: string[];
}) {
  const {listRef, handleKeyDown} = useListFocus<HTMLDivElement>({wrap});
  const items = ['One', 'Two', 'Three', 'Four'];
  return (
    <div ref={listRef} role="menu" onKeyDown={handleKeyDown}>
      {items.map(label => {
        const disabled = disabledLabels.includes(label);
        return (
          <div
            key={label}
            role="menuitem"
            tabIndex={disabled ? undefined : -1}
            aria-disabled={disabled || undefined}
            data-testid={label}>
            {label}
          </div>
        );
      })}
    </div>
  );
}

describe('useListFocus disabled-item skipping', () => {
  it('ArrowDown skips a disabled item instead of stalling on it', () => {
    render(<Menu disabledLabels={['Two']} />);
    const menu = screen.getByRole('menu');
    screen.getByTestId('One').focus();

    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    // Should skip disabled "Two" and land on "Three".
    expect(screen.getByTestId('Three')).toHaveFocus();
  });

  it('ArrowUp skips a disabled item', () => {
    render(<Menu disabledLabels={['Three']} />);
    const menu = screen.getByRole('menu');
    screen.getByTestId('Four').focus();

    fireEvent.keyDown(menu, {key: 'ArrowUp'});
    // Should skip disabled "Three" and land on "Two".
    expect(screen.getByTestId('Two')).toHaveFocus();
  });

  it('does not freeze at a leading disabled item (regression: menus-4)', () => {
    render(<Menu disabledLabels={['One']} />);
    const menu = screen.getByRole('menu');
    // Focus starts nowhere; ArrowDown should reach the first ENABLED item.
    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(screen.getByTestId('Two')).toHaveFocus();
  });

  it('wraps past a disabled item at the end', () => {
    render(<Menu disabledLabels={['Four']} wrap />);
    const menu = screen.getByRole('menu');
    screen.getByTestId('Three').focus();

    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    // "Four" is disabled, wrap to "One".
    expect(screen.getByTestId('One')).toHaveFocus();
  });

  it('does not wrap when wrap is false', () => {
    render(<Menu disabledLabels={['Four']} wrap={false} />);
    const menu = screen.getByRole('menu');
    screen.getByTestId('Three').focus();

    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    // "Four" disabled, no wrap -> focus stays on "Three".
    expect(screen.getByTestId('Three')).toHaveFocus();
  });

  it('Home focuses the first enabled item, End the last enabled item', () => {
    render(<Menu disabledLabels={['One', 'Four']} />);
    const menu = screen.getByRole('menu');
    screen.getByTestId('Two').focus();

    fireEvent.keyDown(menu, {key: 'End'});
    expect(screen.getByTestId('Three')).toHaveFocus();

    fireEvent.keyDown(menu, {key: 'Home'});
    expect(screen.getByTestId('Two')).toHaveFocus();
  });
});

// ---------------------------------------------------------------------------
// Roving-tabindex mode + composite navigation behaviors.
// These exercise the opt-in `hasRovingTabIndex`, `isRtl`, `orientation: 'both'`,
// `hasCaretGuard`, and shortcut-passthrough behaviors.
// ---------------------------------------------------------------------------

const ROVING_LABELS = ['A', 'B', 'C'];

function RovingToolbar({
  labels = ROVING_LABELS,
  disabledLabels = NO_DISABLED,
  ...opts
}: {
  labels?: string[];
  disabledLabels?: string[];
} & Parameters<typeof useListFocus>[0]) {
  const {listRef, handleKeyDown, handleFocus} = useListFocus<HTMLDivElement>({
    itemSelector: 'button, input, [tabindex]',
    hasRovingTabIndex: true,
    orientation: 'horizontal',
    ...opts,
  });
  return (
    <div
      ref={listRef}
      role="toolbar"
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}>
      {labels.map(label => (
        <button
          key={label}
          type="button"
          disabled={disabledLabels.includes(label)}
          data-testid={label}>
          {label}
        </button>
      ))}
    </div>
  );
}

describe('useListFocus roving tabindex (hasRovingTabIndex)', () => {
  it('stamps a single tab stop (first enabled item is tabbable)', () => {
    render(<RovingToolbar />);
    expect(screen.getByTestId('A')).toHaveAttribute('tabindex', '0');
    expect(screen.getByTestId('B')).toHaveAttribute('tabindex', '-1');
    expect(screen.getByTestId('C')).toHaveAttribute('tabindex', '-1');
  });

  it('promotes the first ENABLED item when the first is disabled (repair)', () => {
    render(<RovingToolbar disabledLabels={['A']} />);
    expect(screen.getByTestId('B')).toHaveAttribute('tabindex', '0');
    expect(screen.getByTestId('A')).toHaveAttribute('tabindex', '-1');
  });

  it('ArrowRight moves the tab stop to the next enabled item', () => {
    render(<RovingToolbar />);
    const toolbar = screen.getByRole('toolbar');
    screen.getByTestId('A').focus();
    fireEvent.keyDown(toolbar, {key: 'ArrowRight'});
    expect(screen.getByTestId('B')).toHaveFocus();
    expect(screen.getByTestId('B')).toHaveAttribute('tabindex', '0');
    expect(screen.getByTestId('A')).toHaveAttribute('tabindex', '-1');
  });

  it('ArrowRight skips a disabled item', () => {
    render(<RovingToolbar disabledLabels={['B']} />);
    const toolbar = screen.getByRole('toolbar');
    screen.getByTestId('A').focus();
    fireEvent.keyDown(toolbar, {key: 'ArrowRight'});
    expect(screen.getByTestId('C')).toHaveFocus();
  });

  it('wraps at the end by default', () => {
    render(<RovingToolbar />);
    const toolbar = screen.getByRole('toolbar');
    screen.getByTestId('C').focus();
    fireEvent.keyDown(toolbar, {key: 'ArrowRight'});
    expect(screen.getByTestId('A')).toHaveFocus();
  });

  it('does not wrap when wrap=false', () => {
    render(<RovingToolbar wrap={false} />);
    const toolbar = screen.getByRole('toolbar');
    screen.getByTestId('C').focus();
    fireEvent.keyDown(toolbar, {key: 'ArrowRight'});
    expect(screen.getByTestId('C')).toHaveFocus();
  });

  it('Home/End jump to first/last enabled items', () => {
    render(<RovingToolbar />);
    const toolbar = screen.getByRole('toolbar');
    screen.getByTestId('B').focus();
    fireEvent.keyDown(toolbar, {key: 'End'});
    expect(screen.getByTestId('C')).toHaveFocus();
    fireEvent.keyDown(toolbar, {key: 'Home'});
    expect(screen.getByTestId('A')).toHaveFocus();
  });

  it('flips ArrowLeft/ArrowRight under RTL', () => {
    render(<RovingToolbar isRtl />);
    const toolbar = screen.getByRole('toolbar');
    screen.getByTestId('A').focus();
    // In RTL, ArrowLeft is "forward".
    fireEvent.keyDown(toolbar, {key: 'ArrowLeft'});
    expect(screen.getByTestId('B')).toHaveFocus();
  });

  it('orientation "both" navigates with all four arrows', () => {
    render(<RovingToolbar orientation="both" />);
    const toolbar = screen.getByRole('toolbar');
    screen.getByTestId('A').focus();
    fireEvent.keyDown(toolbar, {key: 'ArrowDown'});
    expect(screen.getByTestId('B')).toHaveFocus();
    fireEvent.keyDown(toolbar, {key: 'ArrowRight'});
    expect(screen.getByTestId('C')).toHaveFocus();
  });

  it('vertical orientation ignores horizontal arrows', () => {
    render(<RovingToolbar orientation="vertical" />);
    const toolbar = screen.getByRole('toolbar');
    screen.getByTestId('A').focus();
    fireEvent.keyDown(toolbar, {key: 'ArrowDown'});
    expect(screen.getByTestId('B')).toHaveFocus();
    fireEvent.keyDown(toolbar, {key: 'ArrowRight'});
    // ArrowRight is inert in vertical mode.
    expect(screen.getByTestId('B')).toHaveFocus();
  });

  it('does not manage tabindex when hasRovingTabIndex is off', () => {
    render(<RovingToolbar hasRovingTabIndex={false} />);
    // No tabindex stamped — the buttons keep their intrinsic tab order.
    expect(screen.getByTestId('A')).not.toHaveAttribute('tabindex');
    expect(screen.getByTestId('B')).not.toHaveAttribute('tabindex');
  });
});

function ToolbarWithInput(opts: Parameters<typeof useListFocus>[0]) {
  const {listRef, handleKeyDown, handleFocus} = useListFocus<HTMLDivElement>({
    itemSelector: 'button, input, [tabindex]',
    hasRovingTabIndex: true,
    orientation: 'horizontal',
    hasCaretGuard: true,
    ...opts,
  });
  return (
    <div
      ref={listRef}
      role="toolbar"
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}>
      <button type="button" data-testid="before">
        Before
      </button>
      <input type="text" defaultValue="hello" data-testid="field" />
      <button type="button" data-testid="after">
        After
      </button>
    </div>
  );
}

describe('useListFocus caret-boundary guard (hasCaretGuard, navigation-4)', () => {
  function getField(): HTMLInputElement {
    const el = screen.getByTestId('field');
    if (!(el instanceof HTMLInputElement)) {
      throw new Error('expected an input');
    }
    return el;
  }

  it('does not steal ArrowRight from a text input mid-line', () => {
    render(<ToolbarWithInput />);
    const toolbar = screen.getByRole('toolbar');
    const field = getField();
    field.focus();
    field.setSelectionRange(1, 1); // caret in the middle of "hello"
    fireEvent.keyDown(toolbar, {key: 'ArrowRight'});
    // Focus stays in the input; caret movement is left to the browser.
    expect(field).toHaveFocus();
  });

  it('steals ArrowRight when the caret is at the end of the input', () => {
    render(<ToolbarWithInput />);
    const toolbar = screen.getByRole('toolbar');
    const field = getField();
    field.focus();
    field.setSelectionRange(5, 5); // caret at end of "hello"
    fireEvent.keyDown(toolbar, {key: 'ArrowRight'});
    // Now the composite navigates to the next item.
    expect(screen.getByTestId('after')).toHaveFocus();
  });

  it('does not steal an arrow key when the input has a selection', () => {
    render(<ToolbarWithInput />);
    const toolbar = screen.getByRole('toolbar');
    const field = getField();
    field.focus();
    field.setSelectionRange(0, 5); // whole value selected
    fireEvent.keyDown(toolbar, {key: 'ArrowRight'});
    expect(field).toHaveFocus();
  });

  it('steals the key from a text input when hasCaretGuard is off', () => {
    render(<ToolbarWithInput hasCaretGuard={false} />);
    const toolbar = screen.getByRole('toolbar');
    const field = getField();
    field.focus();
    field.setSelectionRange(1, 1); // caret mid-line, but no caret guard
    fireEvent.keyDown(toolbar, {key: 'ArrowRight'});
    expect(screen.getByTestId('after')).toHaveFocus();
  });
});

function ToolbarWithEditable(opts: Parameters<typeof useListFocus>[0]) {
  const {listRef, handleKeyDown, handleFocus} = useListFocus<HTMLDivElement>({
    itemSelector: 'button, input, [contenteditable], [tabindex]',
    hasRovingTabIndex: true,
    orientation: 'horizontal',
    hasCaretGuard: true,
    ...opts,
  });
  return (
    <div
      ref={listRef}
      role="toolbar"
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}>
      <button type="button" data-testid="before">
        Before
      </button>
      <div
        contentEditable
        suppressContentEditableWarning
        data-testid="composer">
        hello world
      </div>
      <button type="button" data-testid="after">
        After
      </button>
    </div>
  );
}

describe('useListFocus caret-boundary guard: contenteditable (navigation-4)', () => {
  it('does not steal arrow keys from a non-empty contenteditable', () => {
    render(<ToolbarWithEditable />);
    const toolbar = screen.getByRole('toolbar');
    const composer = screen.getByTestId('composer');
    composer.focus();
    fireEvent.keyDown(toolbar, {key: 'ArrowRight'});
    // Focus stays in the editor; list navigation must not hijack the arrow.
    expect(composer).toHaveFocus();
    fireEvent.keyDown(toolbar, {key: 'ArrowLeft'});
    expect(composer).toHaveFocus();
  });
});

describe('useListFocus shortcut passthrough', () => {
  it('passes browser shortcut chords (Cmd/Ctrl/Alt) through', () => {
    render(<RovingToolbar />);
    const toolbar = screen.getByRole('toolbar');
    screen.getByTestId('A').focus();
    fireEvent.keyDown(toolbar, {key: 'ArrowRight', metaKey: true});
    // Focus should not move on a modified chord.
    expect(screen.getByTestId('A')).toHaveFocus();
  });
});
