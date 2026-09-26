// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useContainerReveal.test.tsx
 * @input Uses vitest, @testing-library/react, useContainerReveal
 * @output Unit tests for the enabled/disabled contract, the dynamic isEnabled
 *   prop, the container options (hoverDelay, forceState), the per-element
 *   option → style-block mapping, and the promise that a large flat list
 *   mounts without dev warnings.
 * @position Testing; validates useContainerReveal.ts.
 *
 * Nesting isolation is a cascade behavior jsdom does not implement, so it is
 * verified in a real browser (Storybook's NestedIsolation story) rather than
 * asserted here. The same goes for what the dwell and the forced states
 * actually paint: these tests assert the wiring, the browser proves the pixels
 * (HoverIntentDelay, ForcedVisibility).
 *
 * SYNC: When useContainerReveal.ts changes, update these tests.
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import {renderHook, render} from '@testing-library/react';
import {useContainerReveal} from './useContainerReveal';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useContainerReveal', () => {
  it('returns spreadable getter props for container and content', () => {
    const {result} = renderHook(() => useContainerReveal());
    const container = result.current.getContainerProps();
    const content = result.current.getContentRevealProps();
    expect(typeof container.className).toBe('string');
    expect(typeof content.className).toBe('string');
  });

  it('is inert when disabled: no container class, empty content props', () => {
    const {result} = renderHook(() => useContainerReveal({isEnabled: false}));
    expect(result.current.getContainerProps()).toEqual({});
    expect(result.current.getContentRevealProps()).toEqual({});
  });

  it('follows isEnabled after mount, in both directions', () => {
    const {result, rerender} = renderHook(
      ({isEnabled}) => useContainerReveal({isEnabled}),
      {initialProps: {isEnabled: true}},
    );
    expect(result.current.getContentRevealProps().className).toBeTruthy();

    rerender({isEnabled: false});
    expect(result.current.getContainerProps()).toEqual({});
    expect(result.current.getContentRevealProps()).toEqual({});

    rerender({isEnabled: true});
    expect(result.current.getContainerProps().className).toBeTruthy();
    expect(result.current.getContentRevealProps().className).toBeTruthy();
  });

  it('reveal and conceal map to different style blocks', () => {
    const {result} = renderHook(() => useContainerReveal());
    const reveal = result.current.getContentRevealProps().className;
    const conceal = result.current.getContentRevealProps({
      isRevealInverted: true,
    }).className;
    expect(reveal).toBeTruthy();
    expect(conceal).toBeTruthy();
    expect(reveal).not.toBe(conceal);
  });

  it('layout-preserved reveal differs from clipped reveal', () => {
    const {result} = renderHook(() => useContainerReveal());
    const clipped = result.current.getContentRevealProps().className;
    const preserved = result.current.getContentRevealProps({
      isLayoutPreserved: true,
    }).className;
    expect(clipped).not.toBe(preserved);
  });

  it('forceState pins each end of the container to its own style block', () => {
    const {result} = renderHook(() => useContainerReveal());
    const auto = result.current.getContainerProps().className;
    const inactive = result.current.getContainerProps({
      forceState: 'inactive',
    }).className;
    const active = result.current.getContainerProps({
      forceState: 'active',
    }).className;
    expect(new Set([auto, inactive, active]).size).toBe(3);
  });

  it('forceVisibility pins one element, independent of its reveal mode', () => {
    const {result} = renderHook(() => useContainerReveal());
    const auto = result.current.getContentRevealProps().className;
    const shown = result.current.getContentRevealProps({
      forceVisibility: 'shown',
    }).className;
    const hidden = result.current.getContentRevealProps({
      forceVisibility: 'hidden',
    }).className;
    expect(new Set([auto, shown, hidden]).size).toBe(3);

    // The layout-preserved variant has no position to flip, so hidden maps to
    // its own opacity-only block.
    expect(
      result.current.getContentRevealProps({
        forceVisibility: 'hidden',
        isLayoutPreserved: true,
      }).className,
    ).not.toBe(hidden);
  });

  it('hoverDelay publishes the dwell as an inline custom property', () => {
    const {result} = renderHook(() => useContainerReveal());
    const {style} = result.current.getContainerProps({hoverDelay: 120});
    expect(Object.values(style ?? {})).toContain('120ms');
    expect(result.current.getContainerProps({hoverDelay: 0}).style).toEqual(
      result.current.getContainerProps().style,
    );
  });

  it('hoverDelay and forceState compose on one container', () => {
    const {result} = renderHook(() => useContainerReveal());
    const props = result.current.getContainerProps({
      hoverDelay: 120,
      forceState: 'inactive',
    });
    expect(Object.values(props.style ?? {})).toContain('120ms');
    expect(props.className).not.toBe(
      result.current.getContainerProps({hoverDelay: 120}).className,
    );
  });

  it('ignores container options while disabled', () => {
    const {result} = renderHook(() => useContainerReveal({isEnabled: false}));
    expect(
      result.current.getContainerProps({
        hoverDelay: 120,
        forceState: 'inactive',
      }),
    ).toEqual({});
  });

  it('mounts a large flat list without a dev warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    function Row() {
      const {getContainerProps, getContentRevealProps} = useContainerReveal();
      return (
        <div {...getContainerProps()}>
          <span {...getContentRevealProps()}>actions</span>
        </div>
      );
    }
    render(
      <>
        {Array.from({length: 500}, (_, i) => (
          <Row key={i} />
        ))}
      </>,
    );
    expect(warn).not.toHaveBeenCalled();
  });
});
