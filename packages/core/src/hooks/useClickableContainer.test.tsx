// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useClickableContainer.test.tsx
 * @input Uses vitest, @testing-library/react, useClickableContainer
 * @output Unit tests for the hook's imperative navigation paths
 * @position Testing; validates the href scheme rule on window.open /
 *   location.href, which never pass through React DOM's own href vetting.
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import {useRef} from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {useClickableContainer} from './useClickableContainer';

// The scheme the rule exists to stop (kept in a const so the JSX below stays
// lint-clean — the tests are ABOUT this URL never navigating).
const scriptUrl = 'javascript:alert(1)';

function Card({href, target}: {href: string; target?: string}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {onClick, onMouseUp} = useClickableContainer({
    containerRef,
    href,
    target,
  });
  return (
    <div
      ref={containerRef}
      data-testid="card"
      onClick={onClick}
      onMouseUp={onMouseUp}>
      content
    </div>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useClickableContainer navigation', () => {
  it('opens ordinary hrefs in a new tab for target="_blank"', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<Card href="https://example.com/docs" target="_blank" />);
    fireEvent.click(screen.getByTestId('card'));
    expect(open).toHaveBeenCalledWith(
      'https://example.com/docs',
      '_blank',
      'noopener',
    );
  });

  it('does not open a script-scheme href in a new tab', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    // eslint-disable-next-line @eslint-react/dom-no-script-url -- the test proves this URL never navigates
    render(<Card href={scriptUrl} target="_blank" />);
    fireEvent.click(screen.getByTestId('card'));
    expect(open).not.toHaveBeenCalled();
  });

  it('opens ordinary hrefs on middle-click', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<Card href="/docs" />);
    fireEvent.mouseUp(screen.getByTestId('card'), {button: 1});
    expect(open).toHaveBeenCalledWith('/docs', '_blank', 'noopener');
  });

  it('does not open a script-scheme href on middle-click', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    // eslint-disable-next-line @eslint-react/dom-no-script-url -- the test proves this URL never navigates
    render(<Card href={scriptUrl} />);
    fireEvent.mouseUp(screen.getByTestId('card'), {button: 1});
    expect(open).not.toHaveBeenCalled();
  });

  it('does not assign a script-scheme href to location on plain click', () => {
    const before = window.location.href;
    // eslint-disable-next-line @eslint-react/dom-no-script-url -- the test proves this URL never navigates
    render(<Card href={scriptUrl} />);
    fireEvent.click(screen.getByTestId('card'));
    expect(window.location.href).toBe(before);
  });
});
