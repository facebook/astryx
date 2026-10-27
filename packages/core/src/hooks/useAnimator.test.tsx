// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useAnimator.test.tsx
 * @input vitest (jsdom), React Testing Library, the public hook and factory
 * @output Checks `spec:AST-107` FR3 and FR6 for the hook: a stable animator
 *   and ref, the factory's handle and nothing more, an animator used before
 *   its ref attaches (its values reach the element on attach), an unmount
 *   that keeps the values and a remount that resumes, no re-render while
 *   animating, and a hook module with no behavior of its own
 * @position Testing; validates useAnimator.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import {act, render} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {AnimatorHandle} from '../animator/createAnimator';
import {useAnimator} from './useAnimator';

beforeEach(() => {
  HTMLElement.prototype.animate = function () {
    return {
      startTime: null,
      playState: 'running',
      ready: new Promise(() => {}),
      cancel: vi.fn(),
    } as unknown as Animation;
  };
});

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, 'animate');
});

function Probe({
  box,
  onRender,
  show = true,
}: {
  box: {current: AnimatorHandle | null};
  onRender?: () => void;
  show?: boolean;
}) {
  const {ref, animator} = useAnimator();
  box.current = animator;
  onRender?.();
  return show ? <div data-testid="target" ref={ref} /> : null;
}

describe('useAnimator', () => {
  it('returns one animator and one ref for the component\u2019s lifetime, and never re-renders while animating', () => {
    const animators = new Set<AnimatorHandle>();
    const refs = new Set<unknown>();
    let renders = 0;
    function Counter({label}: {label: string}) {
      const {ref, animator} = useAnimator();
      animators.add(animator);
      refs.add(ref);
      renders += 1;
      return (
        <button
          type="button"
          ref={ref}
          onClick={() => void animator.animate({x: 20})}>
          {label}
        </button>
      );
    }
    const {getByRole, rerender} = render(<Counter label="Card" />);
    rerender(<Counter label="Card again" />);
    const after = renders;
    act(() => {
      getByRole('button').click();
    });
    expect(renders).toBe(after);
    expect(animators.size).toBe(1);
    expect(refs.size).toBe(1);
  });

  it('hands out the handle\u2019s six methods', () => {
    const box: {current: AnimatorHandle | null} = {current: null};
    render(<Probe box={box} />);
    const animator = box.current!;
    for (const method of [
      'animate',
      'decay',
      'set',
      'get',
      'getVelocity',
      'stop',
    ] as const) {
      expect(typeof animator[method]).toBe('function');
    }
  });

  it('an animator used before its ref attaches does nothing and resolves at once', async () => {
    const box: {current: AnimatorHandle | null} = {current: null};
    const {rerender, getByTestId} = render(<Probe box={box} show={false} />);
    const animator = box.current!;
    // Unattached: no element yet, so nothing happens and nothing throws.
    animator.set({x: 30, opacity: 0.4});
    animator.stop();
    expect(animator.get()).toMatchObject({x: 0, opacity: 1});
    let resolved = 0;
    await Promise.all([
      animator.animate({y: 10}).then(() => resolved++),
      animator.decay({x: 900}).then(() => resolved++),
    ]);
    expect(resolved).toBe(2);
    rerender(<Probe box={box} show />);
    const target = getByTestId('target');
    expect(animator.get()).toMatchObject({x: 0, y: 0, opacity: 1});
    // Attached, it works.
    animator.set({x: 30});
    expect(target.style.translate).toBe('30px 0px');
  });

  it('an unmount lets the element go and keeps the values; a remount resumes from them', () => {
    const box: {current: AnimatorHandle | null} = {current: null};
    const {rerender, getByTestId} = render(<Probe box={box} />);
    const animator = box.current!;
    animator.set({x: 12, rotate: 5});
    rerender(<Probe box={box} show={false} />);
    // With no element attached, a call does nothing.
    animator.set({x: 24});
    expect(animator.get()).toMatchObject({x: 12, rotate: 5});
    rerender(<Probe box={box} show />);
    expect(getByTestId('target').style.translate).toBe('12px 0px');
    expect(getByTestId('target').style.rotate).toBe('5deg');
  });

  it('delegates entirely to the factory: the hook module holds no behavior of its own', () => {
    const source = fs.readFileSync(
      path.join(__dirname, 'useAnimator.ts'),
      'utf8',
    );
    const imports = [...source.matchAll(/from '([^']+)'/g)].map(m => m[1]);
    expect(imports.sort()).toEqual(['../animator/createAnimator', 'react']);
    // One construction, the factory's: the hook only wires React's ref to it.
    expect(source).toContain('createAttachableAnimator()');
    expect(source).not.toMatch(/\bmotion\//);
  });
});
