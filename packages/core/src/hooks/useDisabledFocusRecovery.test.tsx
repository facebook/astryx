// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useDisabledFocusRecovery.test.tsx
 * @input React, Testing Library and private disabled-focus recovery
 * @output Regression coverage for focus ownership across committed disablement
 * @position Tests for useDisabledFocusRecovery.ts
 */

import {StrictMode, useRef} from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {__resetInteractionModalityForTest} from '../utils/interactionModality';

afterEach(__resetInteractionModalityForTest);
import {useDisabledFocusRecovery} from './useDisabledFocusRecovery';

function Fixture({
  disabled = false,
  nodeKey = 'original',
  hasReceiver = true,
}: {
  disabled?: boolean;
  nodeKey?: string;
  hasReceiver?: boolean;
}) {
  const sourceRef = useRef<HTMLButtonElement>(null);
  const receiverRef = useRef<HTMLButtonElement>(null);
  const focus = useDisabledFocusRecovery(
    disabled,
    sourceRef,
    () => receiverRef.current,
  );
  return (
    <>
      <button
        type="button"
        key={nodeKey}
        ref={sourceRef}
        disabled={disabled}
        {...focus}>
        Next
      </button>
      {hasReceiver && (
        <button type="button" ref={receiverRef}>
          Previous
        </button>
      )}
      <button type="button">Outside</button>
    </>
  );
}

describe('useDisabledFocusRecovery', () => {
  it('moves once, without scrolling, only when the focused button becomes disabled', () => {
    const {rerender} = render(
      <StrictMode>
        <Fixture />
      </StrictMode>,
    );
    const next = screen.getByRole('button', {name: 'Next'});
    const previous = screen.getByRole('button', {name: 'Previous'});
    const focus = vi.spyOn(previous, 'focus');
    next.focus();
    rerender(
      <StrictMode>
        <Fixture disabled />
      </StrictMode>,
    );
    expect(previous).toHaveFocus();
    expect(focus).toHaveBeenCalledExactlyOnceWith({preventScroll: true});
    rerender(
      <StrictMode>
        <Fixture disabled />
      </StrictMode>,
    );
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it('does not move focus for an unchanged enabled state or an ignored request', () => {
    const {rerender} = render(<Fixture />);
    const next = screen.getByRole('button', {name: 'Next'});
    next.focus();
    fireEvent.click(next);
    rerender(<Fixture />);
    expect(next).toHaveFocus();
  });

  it('retains ownership through the native blur caused by disablement', () => {
    const {rerender} = render(<Fixture />);
    const next = screen.getByRole('button', {
      name: 'Next',
    });
    next.focus();
    // jsdom does not blur a natively disabled button. Dispatch the browser's
    // blur event explicitly; real-browser runs cover the body focus outcome.
    next.disabled = true;
    fireEvent.blur(next, {relatedTarget: null});
    rerender(<Fixture disabled />);
    expect(screen.getByRole('button', {name: 'Previous'})).toHaveFocus();
  });

  it('does not reclaim focus after the user explicitly blurs to the document', () => {
    const {rerender} = render(<Fixture />);
    const next = screen.getByRole('button', {name: 'Next'});
    next.focus();
    next.blur();
    rerender(<Fixture disabled />);
    expect(document.body).toHaveFocus();
  });

  it('does not reclaim focus from a newer target', () => {
    const {rerender} = render(<Fixture />);
    screen.getByRole('button', {name: 'Next'}).focus();
    const outside = screen.getByRole('button', {name: 'Outside'});
    outside.focus();
    rerender(<Fixture disabled />);
    expect(outside).toHaveFocus();
  });

  it('preserves native pointer focus behavior after keyboard input', () => {
    const {rerender} = render(<Fixture />);
    const next = screen.getByRole('button', {name: 'Next'});
    fireEvent.keyDown(next, {key: 'Tab'});
    next.focus();
    fireEvent.pointerDown(next, {pointerType: 'mouse'});
    const previous = screen.getByRole('button', {name: 'Previous'});
    const focus = vi.spyOn(previous, 'focus');
    rerender(<Fixture disabled />);
    expect(focus).not.toHaveBeenCalled();
    rerender(<Fixture />);
    const outside = screen.getByRole('button', {name: 'Outside'});
    outside.focus();
    fireEvent.keyDown(outside, {key: 'Tab'});
    next.focus();
    rerender(<Fixture disabled />);
    expect(previous).toHaveFocus();
    expect(focus).toHaveBeenCalledExactlyOnceWith({preventScroll: true});
  });

  it('does not transfer stale ownership to a replacement node', () => {
    const {rerender} = render(<Fixture />);
    screen.getByRole('button', {name: 'Next'}).focus();
    const previous = screen.getByRole('button', {name: 'Previous'});
    const focus = vi.spyOn(previous, 'focus');
    rerender(<Fixture disabled nodeKey="replacement" />);
    expect(focus).not.toHaveBeenCalled();
  });

  it('does not replay a consumed transition when a receiver mounts later', () => {
    const {rerender} = render(<Fixture hasReceiver={false} />);
    screen.getByRole('button', {name: 'Next'}).focus();
    rerender(<Fixture disabled hasReceiver={false} />);
    rerender(<Fixture disabled />);
    expect(screen.getByRole('button', {name: 'Previous'})).not.toHaveFocus();
  });

  it('does not move focus on an initially disabled mount or unmount', () => {
    const {unmount} = render(<Fixture disabled />);
    const outside = screen.getByRole('button', {name: 'Outside'});
    const focus = vi.spyOn(outside, 'focus');
    expect(document.body).toHaveFocus();
    unmount();
    expect(focus).not.toHaveBeenCalled();
  });
});
