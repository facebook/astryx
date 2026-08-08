// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useContainerReveal.test.tsx
 * @input Uses vitest, @testing-library/react, useContainerReveal
 * @output Unit tests for the marker-pool free-list, per-instance scoping, the
 *   inert (disabled) path, and the content-option → style-block mapping.
 * @position Testing; validates useContainerReveal.ts and its pool.
 *
 * SYNC: When useContainerReveal.ts changes, update these tests.
 */

import {describe, it, expect} from 'vitest';
import {renderHook, render, act} from '@testing-library/react';
import {useContainerReveal} from './useContainerReveal';
import {POOL_SIZE} from './containerReveal.pool.stylex';

describe('useContainerReveal', () => {
  it('returns spreadable getter props for container and content', () => {
    const {result} = renderHook(() => useContainerReveal());
    const container = result.current.getContainerProps();
    const content = result.current.getContentRevealProps();
    expect(container).toHaveProperty('className');
    expect(content).toHaveProperty('className');
    expect(typeof container.className).toBe('string');
    expect(typeof content.className).toBe('string');
  });

  it('is inert when disabled: no marker class, empty content props', () => {
    const {result} = renderHook(() =>
      useContainerReveal({isEnabled: false}),
    );
    expect(result.current.getContainerProps()).toEqual({});
    expect(result.current.getContentRevealProps()).toEqual({});
  });

  it('gives two concurrently mounted containers DISTINCT marker classes', () => {
    // The core leak-safety property: nested/concurrent containers must never
    // share a marker, or an ancestor container's :hover would reveal a
    // descendant container's content.
    const a = renderHook(() => useContainerReveal());
    const b = renderHook(() => useContainerReveal());
    const classA = a.result.current.getContainerProps().className;
    const classB = b.result.current.getContainerProps().className;
    expect(classA).toBeTruthy();
    expect(classB).toBeTruthy();
    expect(classA).not.toBe(classB);
    a.unmount();
    b.unmount();
  });

  it('recycles a slot after unmount (free-list release)', () => {
    const first = renderHook(() => useContainerReveal());
    const firstClass = first.result.current.getContainerProps().className;
    first.unmount();
    // A fresh mount should be able to reclaim the just-released slot.
    const second = renderHook(() => useContainerReveal());
    const secondClass = second.result.current.getContainerProps().className;
    expect(secondClass).toBe(firstClass);
    second.unmount();
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

  it('assigns distinct markers across a full pool of concurrent containers', () => {
    function Probe({onClass}: {onClass: (c: string) => void}) {
      const {getContainerProps} = useContainerReveal();
      onClass(getContainerProps().className ?? '');
      return null;
    }
    const classes: string[] = [];
    const {unmount} = render(
      <>
        {Array.from({length: POOL_SIZE}, (_, i) => (
          <Probe key={i} onClass={(c) => classes.push(c)} />
        ))}
      </>,
    );
    const unique = new Set(classes.filter(Boolean));
    expect(unique.size).toBe(POOL_SIZE);
    unmount();
  });

  it('survives repeated mount/unmount without leaking the pool', () => {
    // Mount and unmount a full pool several times; each cycle must still hand
    // out POOL_SIZE distinct markers, proving slots are released.
    for (let cycle = 0; cycle < 3; cycle++) {
      const hooks = Array.from({length: POOL_SIZE}, () =>
        renderHook(() => useContainerReveal()),
      );
      const classes = hooks.map(
        (h) => h.result.current.getContainerProps().className,
      );
      expect(new Set(classes).size).toBe(POOL_SIZE);
      act(() => hooks.forEach((h) => h.unmount()));
    }
  });
});
