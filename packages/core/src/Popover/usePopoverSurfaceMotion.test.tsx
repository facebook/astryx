// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file usePopoverSurfaceMotion.test.tsx
 * @input vitest (jsdom), React Testing Library, a stand-in popover layer and
 *   trigger, and a stubbed pointer query
 * @output Checks what the hook costs a popover that never presents under a
 *   finger: a fine pointer leaves the layer with no `beforetoggle` listener
 *   and nothing promoted (spec:AST-094 FR24)
 * @position Testing; Popover's touch presentation, the hook that drives it
 */

import {renderHook} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {TOUCH_QUERY} from '../utils/touchPresentation';
import {usePopoverSurfaceMotion} from './usePopoverSurfaceMotion';

let isTouch = false;

beforeEach(() => {
  isTouch = false;
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query === TOUCH_QUERY ? isTouch : false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function layerAndTrigger() {
  const layer = document.createElement('div');
  layer.setAttribute('popover', 'auto');
  layer.innerHTML = '<div role="dialog" aria-label="Filters"></div>';
  const trigger = document.createElement('button');
  document.body.append(layer, trigger);
  const listeners: string[] = [];
  const add = layer.addEventListener.bind(layer);
  layer.addEventListener = (type: string, ...rest: unknown[]) => {
    listeners.push(type);
    return (add as (type: string, ...rest: unknown[]) => void)(type, ...rest);
  };
  return {layer, trigger, listeners};
}

describe('usePopoverSurfaceMotion', () => {
  it('leaves a fine-pointer open untouched: no listener, no promotion (FR24)', () => {
    const {layer, trigger, listeners} = layerAndTrigger();
    const {result} = renderHook(() => usePopoverSurfaceMotion());
    result.current(layer, trigger);
    expect(listeners).not.toContain('beforetoggle');
    expect(layer.style.willChange).toBe('');
    expect(layer.getAttribute('style')).toBeNull();
  });

  it('drives the touch presentation under a coarse pointer', () => {
    isTouch = true;
    const {layer, trigger, listeners} = layerAndTrigger();
    const {result} = renderHook(() => usePopoverSurfaceMotion());
    result.current(layer, trigger);
    expect(listeners).toContain('beforetoggle');
  });
});
