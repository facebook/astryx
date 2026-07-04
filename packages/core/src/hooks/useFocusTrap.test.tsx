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
    rerender(<EscapeTrap isActive={false} onEscape={onEscape} label="toggle" />);
    fireEvent.keyDown(document, {key: 'Escape'});
    expect(onEscape).not.toHaveBeenCalled();
  });
});
