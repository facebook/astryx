// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useInputContainer.test.tsx
 * @input Uses React Testing Library, useInputContainer
 * @output Unit tests for focus-vs-click forwarding on container click
 */

import {fireEvent, render} from '@testing-library/react';
import {useRef} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {useInputContainer} from './useInputContainer';

/**
 * Renders a container wired with useInputContainer around a single control.
 * The control is described by `control`, which receives the ref to attach.
 */
function TestContainer({
  renderControl,
}: {
  renderControl: (ref: React.RefObject<HTMLElement | null>) => React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLElement | null>(null);
  const {onClick, onMouseUp} = useInputContainer({
    containerRef,
    inputRef,
  });
  return (
    <div ref={containerRef} onClick={onClick} onMouseUp={onMouseUp}>
      <span data-testid="chrome">chrome</span>
      {renderControl(inputRef)}
    </div>
  );
}

describe('useInputContainer', () => {
  it('clicks (not focuses) a role="combobox" aria-haspopup="dialog" text input', () => {
    const onFocus = vi.fn();
    const onControlClick = vi.fn();
    const {getByTestId} = render(
      <TestContainer
        renderControl={ref => (
          <input
            ref={ref as React.RefObject<HTMLInputElement>}
            data-testid="control"
            type="text"
            role="combobox"
            aria-haspopup="dialog"
            onFocus={onFocus}
            onClick={onControlClick}
          />
        )}
      />,
    );

    // Click the non-interactive chrome so the container handler fires.
    fireEvent.click(getByTestId('chrome'));

    // A popup trigger must be activated via click, not merely focused —
    // otherwise DateInput's calendar would never open.
    expect(onControlClick).toHaveBeenCalledTimes(1);
    expect(onFocus).not.toHaveBeenCalled();
  });

  it('clicks a control that only advertises aria-haspopup (no combobox role)', () => {
    const onFocus = vi.fn();
    const onControlClick = vi.fn();
    const {getByTestId} = render(
      <TestContainer
        renderControl={ref => (
          <input
            ref={ref as React.RefObject<HTMLInputElement>}
            data-testid="control"
            type="text"
            aria-haspopup="menu"
            onFocus={onFocus}
            onClick={onControlClick}
          />
        )}
      />,
    );

    fireEvent.click(getByTestId('chrome'));

    expect(onControlClick).toHaveBeenCalledTimes(1);
    expect(onFocus).not.toHaveBeenCalled();
  });

  it('focuses (not clicks) a plain type="text" input', () => {
    const onFocus = vi.fn();
    const onControlClick = vi.fn();
    const {getByTestId} = render(
      <TestContainer
        renderControl={ref => (
          <input
            ref={ref as React.RefObject<HTMLInputElement>}
            data-testid="control"
            type="text"
            onFocus={onFocus}
            onClick={onControlClick}
          />
        )}
      />,
    );

    fireEvent.click(getByTestId('chrome'));

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onControlClick).not.toHaveBeenCalled();
  });

  it('focuses (not clicks) a plain type="number" input', () => {
    const onFocus = vi.fn();
    const onControlClick = vi.fn();
    const {getByTestId} = render(
      <TestContainer
        renderControl={ref => (
          <input
            ref={ref as React.RefObject<HTMLInputElement>}
            data-testid="control"
            type="number"
            onFocus={onFocus}
            onClick={onControlClick}
          />
        )}
      />,
    );

    fireEvent.click(getByTestId('chrome'));

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onControlClick).not.toHaveBeenCalled();
  });

  it('focuses (not clicks) a textarea', () => {
    const onFocus = vi.fn();
    const onControlClick = vi.fn();
    const {getByTestId} = render(
      <TestContainer
        renderControl={ref => (
          <textarea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            data-testid="control"
            onFocus={onFocus}
            onClick={onControlClick}
          />
        )}
      />,
    );

    fireEvent.click(getByTestId('chrome'));

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onControlClick).not.toHaveBeenCalled();
  });

  it('clicks (not focuses) a checkbox — unchanged behavior', () => {
    const onFocus = vi.fn();
    const onControlClick = vi.fn();
    const {getByTestId} = render(
      <TestContainer
        renderControl={ref => (
          <input
            ref={ref as React.RefObject<HTMLInputElement>}
            data-testid="control"
            type="checkbox"
            onFocus={onFocus}
            onClick={onControlClick}
          />
        )}
      />,
    );

    fireEvent.click(getByTestId('chrome'));

    expect(onControlClick).toHaveBeenCalledTimes(1);
    expect(onFocus).not.toHaveBeenCalled();
  });
});
