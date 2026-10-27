// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useDragToSnapPoints.test.tsx
 * @input vitest (jsdom, fake clock), React Testing Library, the hook
 * @output Checks `spec:AST-107` FR2 and FR6 for the hook: `settleTo` from a
 *   key settles and calls the latest `onSettle`, `settleTo` is stable, an
 *   unmount stops reporting, an empty list stays empty, and the hook module
 *   holds no behavior of its own
 * @position Testing; validates useDragToSnapPoints.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import {act, render} from '@testing-library/react';
import {useRef} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {useDragToSnapPoints} from './useDragToSnapPoints';

beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      'setTimeout',
      'clearTimeout',
      'performance',
      'requestAnimationFrame',
      'cancelAnimationFrame',
    ],
  });
  HTMLElement.prototype.animate = function () {
    let start: number | null = null;
    const animation = {
      get startTime() {
        return start;
      },
      set startTime(value: number | null) {
        start = value;
      },
      playState: 'running',
      ready: new Promise(() => {}),
      finish() {},
      cancel() {},
    };
    requestAnimationFrame(() => {
      start ??= performance.now();
    });
    return animation as unknown as Animation;
  };
});

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, 'animate');
  vi.useRealTimers();
});

const POINTS = [0, 240, 480];

function Drawer({
  onSettle,
  settlers,
  snapPoints = POINTS,
}: {
  onSettle: (index: number) => void;
  settlers: Set<(index: number) => void>;
  snapPoints?: ReadonlyArray<number>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const {settleTo} = useDragToSnapPoints(ref, {
    axis: 'y',
    snapPoints,
    onSettle,
  });
  settlers.add(settleTo);
  return <div ref={ref} />;
}

describe('useDragToSnapPoints', () => {
  it('settleTo settles from a key and calls the latest onSettle; settleTo is stable', async () => {
    const settlers = new Set<(index: number) => void>();
    const first = vi.fn();
    const latest = vi.fn();
    const {rerender} = render(<Drawer onSettle={first} settlers={settlers} />);
    rerender(<Drawer onSettle={latest} settlers={settlers} />);
    expect(settlers.size).toBe(1);
    const [settleTo] = settlers;
    act(() => settleTo(2));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledWith(2);
  });

  it('after an unmount nothing reports', async () => {
    const settlers = new Set<(index: number) => void>();
    const onSettle = vi.fn();
    const {unmount} = render(
      <Drawer onSettle={onSettle} settlers={settlers} />,
    );
    const [settleTo] = settlers;
    act(() => settleTo(1));
    unmount();
    await vi.advanceTimersByTimeAsync(3000);
    expect(onSettle).not.toHaveBeenCalled();
    expect(() => settleTo(2)).not.toThrow();
  });

  it('an empty list stays empty: settleTo does nothing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const settlers = new Set<(index: number) => void>();
    const onSettle = vi.fn();
    render(<Drawer onSettle={onSettle} settlers={settlers} snapPoints={[]} />);
    const [settleTo] = settlers;
    act(() => settleTo(0));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(onSettle).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('delegates entirely to the factory: the hook module holds no behavior of its own', () => {
    const source = fs.readFileSync(
      path.join(__dirname, 'useDragToSnapPoints.ts'),
      'utf8',
    );
    const imports = [...source.matchAll(/from '([^']+)'/g)].map(m => m[1]);
    expect([...new Set(imports)].sort()).toEqual([
      '../dragToSnapPoints/createDragToSnapPoints',
      'react',
    ]);
    expect(source).toContain('createDragToSnapPoints(element');
    expect(source).not.toMatch(/\b(motion|gestures)\//);
  });
});
