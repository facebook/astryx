// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createElement, createRef} from 'react';
import {render} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {mergeRefs} from './mergeRefs';

describe('mergeRefs', () => {
  it('forwards the value to callback and object refs', () => {
    const callbackRef = vi.fn();
    const objectRef = createRef<HTMLDivElement>();

    const {container} = render(
      createElement('div', {ref: mergeRefs(callbackRef, objectRef)}),
    );

    expect(callbackRef).toHaveBeenCalledWith(container.firstElementChild);
    expect(objectRef.current).toBe(container.firstElementChild);
  });

  it('runs callback cleanup and clears object refs', () => {
    const cleanup = vi.fn();
    const callbackRef = vi.fn(() => cleanup);
    const objectRef = createRef<HTMLDivElement>();

    const {unmount} = render(
      createElement('div', {ref: mergeRefs(callbackRef, objectRef)}),
    );
    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(callbackRef).toHaveBeenCalledTimes(1);
    expect(objectRef.current).toBeNull();
  });

  it('passes null to callback refs that do not return cleanup functions', () => {
    const callbackRef = vi.fn();

    const {container, unmount} = render(
      createElement('div', {ref: mergeRefs(callbackRef)}),
    );
    const element = container.firstElementChild;
    unmount();

    expect(callbackRef).toHaveBeenNthCalledWith(1, element);
    expect(callbackRef).toHaveBeenNthCalledWith(2, null);
  });
});
