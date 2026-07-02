// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useFocusTrap.test.tsx
 * @input Uses vitest, @testing-library/react, useFocusTrap hook
 * @output Unit tests for useFocusTrap tabbable-element model
 * @position Testing; validates useFocusTrap.ts focusable detection
 *
 * SYNC: When useFocusTrap.ts changes, update tests to match new behavior
 */

import {describe, it, expect} from 'vitest';
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
