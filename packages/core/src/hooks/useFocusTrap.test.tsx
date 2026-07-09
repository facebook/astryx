// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useFocusTrap.test.tsx
 * @input Uses vitest, @testing-library/react, useFocusTrap hook
 * @output Unit tests for useFocusTrap tabbable-element model + Escape/IME guard
 * @position Testing; validates useFocusTrap.ts focusable detection + dismissal coordination
 *
 * SYNC: When useFocusTrap.ts changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {useFocusTrap} from './useFocusTrap';

function Trap({children}: {children: React.ReactNode}) {
  const {containerRef, focusFirst} = useFocusTrap<HTMLDivElement>({
    isActive: true,
  });
  return (
    <div>
      <button type="button" data-testid="outside">
        Outside
      </button>
      <div ref={containerRef} data-testid="trap">
        {children}
      </div>
      <button type="button" onClick={focusFirst} data-testid="focus-first">
        Focus first
      </button>
    </div>
  );
}

function EscapeTrap({
  isActive,
  onEscape,
  label,
}: {
  isActive: boolean;
  onEscape: () => void;
  label: string;
}) {
  const {containerRef} = useFocusTrap<HTMLDivElement>({isActive, onEscape});
  return (
    <div ref={containerRef} data-testid={label}>
      <button type="button">{label}-btn</button>
    </div>
  );
}

function RestoreTrap({isActive}: {isActive: boolean}) {
  const {containerRef} = useFocusTrap<HTMLDivElement>({isActive});
  return (
    <div ref={containerRef} data-testid="restore-trap">
      <button type="button" data-testid="inside">
        Inside trap
      </button>
    </div>
  );
}

function RestoreFixture({
  isActive,
  showPrev = true,
  showTrap = true,
}: {
  isActive: boolean;
  showPrev?: boolean;
  showTrap?: boolean;
}) {
  return (
    <div>
      {showPrev && (
        <button type="button" data-testid="prev">
          Previously focused
        </button>
      )}
      <button type="button" data-testid="other">
        Other outside
      </button>
      {showTrap && <RestoreTrap isActive={isActive} />}
    </div>
  );
}

describe('useFocusTrap tabbable model (infra-8)', () => {
  it('treats a contenteditable as focusable (focusFirst lands on it)', () => {
    render(
      <Trap>
        <div
          contentEditable
          data-testid="editor"
          suppressContentEditableWarning>
          Type here
        </div>
      </Trap>,
    );
    fireEvent.click(screen.getByTestId('focus-first'));
    expect(screen.getByTestId('editor')).toHaveFocus();
  });

  it('ignores an inert subtree when finding focusables', () => {
    render(
      <Trap>
        <div inert>
          <button type="button" data-testid="inert-btn">
            Inert
          </button>
        </div>
        <button type="button" data-testid="real-btn">
          Real
        </button>
      </Trap>,
    );
    fireEvent.click(screen.getByTestId('focus-first'));
    // Focus skips the inert button and lands on the real one.
    expect(screen.getByTestId('real-btn')).toHaveFocus();
  });
});

describe('useFocusTrap Escape coordination', () => {
  it('calls onEscape for a single active trap', () => {
    const onEscape = vi.fn();
    render(<EscapeTrap isActive onEscape={onEscape} label="only" />);
    fireEvent.keyDown(document, {key: 'Escape'});
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('only the top-most trap responds to Escape when nested', () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <>
        <EscapeTrap isActive onEscape={outer} label="outer" />
        <EscapeTrap isActive onEscape={inner} label="inner" />
      </>,
    );
    // The most recently activated trap (inner) is on top.
    fireEvent.keyDown(document, {key: 'Escape'});
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });

  it('ignores Escape during IME composition', () => {
    const onEscape = vi.fn();
    render(<EscapeTrap isActive onEscape={onEscape} label="ime" />);
    fireEvent.keyDown(document, {key: 'Escape', isComposing: true});
    expect(onEscape).not.toHaveBeenCalled();
    // keyCode 229 (composition) is also ignored
    fireEvent.keyDown(document, {key: 'Escape', keyCode: 229});
    expect(onEscape).not.toHaveBeenCalled();
    // a normal Escape still works
    fireEvent.keyDown(document, {key: 'Escape'});
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('does not respond after the trap is deactivated', () => {
    const onEscape = vi.fn();
    const {rerender} = render(
      <EscapeTrap isActive onEscape={onEscape} label="toggle" />,
    );
    rerender(
      <EscapeTrap isActive={false} onEscape={onEscape} label="toggle" />,
    );
    fireEvent.keyDown(document, {key: 'Escape'});
    expect(onEscape).not.toHaveBeenCalled();
  });
});

describe('useFocusTrap focus restoration', () => {
  it('restores focus to the previously-focused element when deactivated', () => {
    const {rerender} = render(<RestoreFixture isActive={false} />);
    const prev = screen.getByTestId('prev');
    prev.focus();
    expect(prev).toHaveFocus();

    // Activate the trap (captures `prev` as the restore target) and move focus
    // inside it, as auto-focus or a keyboard user would.
    rerender(<RestoreFixture isActive={true} />);
    screen.getByTestId('inside').focus();
    expect(screen.getByTestId('inside')).toHaveFocus();

    // Deactivating returns focus to where it was before the trap opened.
    rerender(<RestoreFixture isActive={false} />);
    expect(prev).toHaveFocus();
  });

  it('does not steal focus when it was moved elsewhere outside the trap', () => {
    const {rerender} = render(<RestoreFixture isActive={false} />);
    const prev = screen.getByTestId('prev');
    prev.focus();

    rerender(<RestoreFixture isActive={true} />);
    // The user (or a consumer that self-restores) moves focus to a different
    // outside control while the trap is open.
    const other = screen.getByTestId('other');
    other.focus();

    rerender(<RestoreFixture isActive={false} />);
    // Focus is left where the user put it — not yanked back to `prev`.
    expect(other).toHaveFocus();
    expect(prev).not.toHaveFocus();
  });

  it('does not crash or restore when the captured element was removed', () => {
    const {rerender} = render(<RestoreFixture isActive={false} />);
    const prev = screen.getByTestId('prev');
    prev.focus();

    rerender(<RestoreFixture isActive={true} />);
    screen.getByTestId('inside').focus();

    // Remove the captured element from the DOM before the trap deactivates.
    rerender(<RestoreFixture isActive={true} showPrev={false} />);
    expect(() =>
      rerender(<RestoreFixture isActive={false} showPrev={false} />),
    ).not.toThrow();
  });

  it('restores focus when the trap unmounts while active', () => {
    const {rerender} = render(
      <RestoreFixture isActive={true} showTrap={false} />,
    );
    const prev = screen.getByTestId('prev');
    prev.focus();

    // Mounting the trap active captures `prev`; then focus moves inside it.
    rerender(<RestoreFixture isActive={true} showTrap={true} />);
    screen.getByTestId('inside').focus();
    expect(screen.getByTestId('inside')).toHaveFocus();

    // Unmounting the trap (cleanup path, not an isActive flip) still restores.
    rerender(<RestoreFixture isActive={true} showTrap={false} />);
    expect(prev).toHaveFocus();
  });
});
