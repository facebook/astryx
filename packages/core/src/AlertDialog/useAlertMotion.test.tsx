// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useAlertMotion.test.tsx
 * @input A component using useAlertMotion, with the motion animator replaced
 *   by a recorder whose animations start and end when the test says so
 * @output The alert motion contract: an opening sets the alert to scale 1.2
 *   and opacity 0 with the dimming at 0 and presents both from rest on
 *   springs.alertPresent with no start time (the browser's commit); closed
 *   right after, it leaves from where it is; a closing keeps it presented
 *   while both fade out on springs.alertDismiss, then hides it (or after a
 *   backstop if the end is never reported); reopening mid-exit fades back
 *   without hiding; touches are refused during both transitions, the
 *   presentation's window counted from its reported start; under Reduce
 *   Motion the presentation cross-fades on its spring; a mouse taking over
 *   gets the dialog back at rest; disabled, it does nothing and follows the
 *   caller's open state
 * @position jsdom tests of packages/core/src/AlertDialog/useAlertMotion.ts
 */

import {act, render} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {alertController, springs} from '../motion/uikit';
import {useAlertMotion, type AlertMotion} from './useAlertMotion';

type RecordedCall =
  | {kind: 'attach'; target: unknown}
  | {kind: 'set'; values: Record<string, number>}
  | {
      kind: 'animate';
      values: Record<string, number>;
      spring: unknown;
      options: {at?: number; crossfade?: unknown};
    };

interface Recorded {
  readonly options: {pseudoElement?: string};
  readonly calls: RecordedCall[];
  /** Ends each `animate` call's animation, in call order. */
  readonly endings: ((isDone: boolean) => void)[];
  /** Reports each `animate` call's start (when the browser started it). */
  readonly starts: ((time: number) => void)[];
}

const {recorded} = vi.hoisted(() => ({recorded: [] as Recorded[]}));

vi.mock('../motion/animator', () => ({
  createAnimator: (
    _element: unknown,
    options: {pseudoElement?: string} = {},
  ) => {
    const record: Recorded = {options, calls: [], endings: [], starts: []};
    recorded.push(record);
    let element: unknown = null;
    return {
      get element() {
        return element;
      },
      attach: (target: unknown) => {
        element = target;
        record.calls.push({kind: 'attach', target});
      },
      set: (values: Record<string, number>) =>
        record.calls.push({kind: 'set', values}),
      animate: (
        values: Record<string, number>,
        transition: {spring: unknown},
        animateOptions: {at?: number; crossfade?: unknown} = {},
      ) => {
        record.calls.push({
          kind: 'animate',
          values,
          spring: transition.spring,
          options: animateOptions,
        });
        let end: (isDone: boolean) => void = () => {};
        const finished = new Promise<boolean>(resolve => {
          end = resolve;
        });
        record.endings.push(end);
        let start: (time: number) => void = () => {};
        const started = new Promise<number>(resolve => {
          start = resolve;
        });
        record.starts.push(start);
        return {
          properties: Object.keys(values),
          finished,
          started,
          value: () => 0,
          velocity: () => 0,
          retarget: () => {
            throw new Error('not used');
          },
          stop: () => {},
        };
      },
      get: () => 0,
      getVelocity: () => 0,
      play: () => {
        throw new Error('not used');
      },
      decay: () => {
        throw new Error('not used');
      },
      stop: () => {},
      dispose: () => {},
    };
  },
}));

let latest: AlertMotion | null = null;

function Alert({isOpen, isEnabled}: {isOpen: boolean; isEnabled: boolean}) {
  const motion = useAlertMotion({isOpen, isEnabled});
  latest = motion;
  return <div ref={motion.ref} data-testid="alert" />;
}

const motion = (): AlertMotion => {
  if (latest == null) {
    throw new Error('not rendered');
  }
  return latest;
};

/** The two animators the hook made: the alert and its dimming. */
function animators(): {panel: Recorded; backdrop: Recorded} {
  const panel = recorded.find(r => r.options.pseudoElement == null);
  const backdrop = recorded.find(r => r.options.pseudoElement === '::backdrop');
  if (panel == null || backdrop == null) {
    throw new Error('animators not created');
  }
  return {panel, backdrop};
}

const moves = (record: Recorded) =>
  record.calls.filter(call => call.kind !== 'attach');

let now = 1000;
beforeEach(() => {
  recorded.length = 0;
  latest = null;
  now = 1000;
  vi.spyOn(performance, 'now').mockImplementation(() => now);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('useAlertMotion', () => {
  it('presents from scale 1.2 and opacity 0 with the dimming, from rest, on one spring and one start', () => {
    render(<Alert isOpen isEnabled />);
    const {panel, backdrop} = animators();
    // Set to its starting values and started in the same task: no start
    // time, so the browser starts both at the commit that first shows the
    // dialog, on one clock. Under Reduce Motion the animator drops the scale
    // and keeps the fade on this spring, as UIKit's alert does.
    expect(moves(panel)).toEqual([
      {
        kind: 'set',
        values: {opacity: 0, scale: alertController.present.scaleFrom},
      },
      {
        kind: 'animate',
        values: {opacity: 1, scale: 1},
        spring: springs.alertPresent,
        options: {crossfade: springs.alertPresent},
      },
    ]);
    expect(moves(backdrop)).toEqual([
      {kind: 'set', values: {opacity: 0}},
      {
        kind: 'animate',
        values: {opacity: 1},
        spring: springs.alertPresent,
        options: {},
      },
    ]);
    expect(motion().isPresented).toBe(true);
    expect(motion().isDriving).toBe(true);
  });

  it('leaves from where it is when closed right after opening', async () => {
    const view = render(<Alert isOpen isEnabled />);
    const {panel, backdrop} = animators();
    view.rerender(<Alert isOpen={false} isEnabled />);
    expect(moves(panel).at(-1)).toMatchObject({
      kind: 'animate',
      values: {opacity: 0},
      spring: springs.alertDismiss,
    });
    expect(moves(backdrop).at(-1)).toMatchObject({
      kind: 'animate',
      values: {opacity: 0},
    });
    await act(async () => {
      panel.endings.at(-1)?.(true);
    });
    expect(motion().isPresented).toBe(false);
  });

  it('attaches both animators to the element only while it drives', () => {
    const view = render(<Alert isOpen isEnabled={false} />);
    const {panel, backdrop} = animators();
    expect(panel.calls.at(-1)).toEqual({kind: 'attach', target: null});
    expect(backdrop.calls.at(-1)).toEqual({kind: 'attach', target: null});
    view.rerender(<Alert isOpen isEnabled />);
    const element = view.getByTestId('alert');
    expect(panel.calls.at(-1)).toEqual({kind: 'attach', target: element});
    expect(backdrop.calls.at(-1)).toEqual({kind: 'attach', target: element});
  });

  it('gives the dialog back at rest when a mouse takes over', () => {
    const view = render(<Alert isOpen isEnabled />);
    const {panel, backdrop} = animators();
    view.rerender(<Alert isOpen isEnabled={false} />);
    expect(moves(panel).at(-1)).toEqual({
      kind: 'set',
      values: {opacity: 1, scale: 1},
    });
    expect(moves(backdrop).at(-1)).toEqual({
      kind: 'set',
      values: {opacity: 1},
    });
    expect(panel.calls.at(-1)).toEqual({kind: 'attach', target: null});
    expect(backdrop.calls.at(-1)).toEqual({kind: 'attach', target: null});
  });

  it('stays presented while it fades out on alertDismiss, then hides', async () => {
    const view = render(<Alert isOpen isEnabled />);
    const {panel, backdrop} = animators();
    now = 2000;
    view.rerender(<Alert isOpen={false} isEnabled />);
    expect(motion().isPresented).toBe(true);
    expect(moves(panel).at(-1)).toEqual({
      kind: 'animate',
      values: {opacity: 0},
      spring: springs.alertDismiss,
      options: {at: 2000},
    });
    expect(moves(backdrop).at(-1)).toEqual({
      kind: 'animate',
      values: {opacity: 0},
      spring: springs.alertDismiss,
      options: {at: 2000},
    });
    // Only the alert's fade decides when it is hidden.
    await act(async () => {
      panel.endings.at(-1)?.(true);
    });
    expect(motion().isPresented).toBe(false);
  });

  it('hides once the exit has had its time when its end is never reported', () => {
    vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']});
    const view = render(<Alert isOpen isEnabled />);
    view.rerender(<Alert isOpen={false} isEnabled />);
    act(() => {
      vi.advanceTimersByTime(alertController.dismiss.durationMs);
    });
    expect(motion().isPresented).toBe(true);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(motion().isPresented).toBe(false);
  });

  it('fades back without hiding when reopened mid-exit', async () => {
    const view = render(<Alert isOpen isEnabled />);
    const {panel, backdrop} = animators();
    view.rerender(<Alert isOpen={false} isEnabled />);
    const exitEnding = panel.endings.at(-1);
    now = 1200;
    view.rerender(<Alert isOpen isEnabled />);
    expect(motion().isPresented).toBe(true);
    expect(moves(panel).at(-1)).toEqual({
      kind: 'animate',
      values: {opacity: 1},
      spring: springs.alertPresent,
      options: {at: 1200},
    });
    expect(moves(backdrop).at(-1)).toEqual({
      kind: 'animate',
      values: {opacity: 1},
      spring: springs.alertPresent,
      options: {at: 1200},
    });
    // The abandoned exit ending late does not hide the reopened alert.
    await act(async () => {
      exitEnding?.(true);
    });
    expect(motion().isPresented).toBe(true);
  });

  it('refuses touches until the presentation completes, counted from its actual start, and while it leaves', async () => {
    const view = render(<Alert isOpen isEnabled />);
    const {panel} = animators();
    // The browser has not reported its start yet (a busy main thread can
    // push it later): refused, however long that takes.
    now = 9000;
    expect(motion().acceptsTouches()).toBe(false);
    await act(async () => {
      panel.starts.at(-1)?.(6100);
    });
    now = 6100 + alertController.present.ignoresTouchesForMs - 1;
    expect(motion().acceptsTouches()).toBe(false);
    now = 6100 + alertController.present.ignoresTouchesForMs;
    expect(motion().acceptsTouches()).toBe(true);
    view.rerender(<Alert isOpen={false} isEnabled />);
    expect(motion().acceptsTouches()).toBe(false);
  });

  it('keeps refusing touches when the presentation reports its start after the alert began to leave', async () => {
    const view = render(<Alert isOpen isEnabled />);
    const {panel} = animators();
    const presentStart = panel.starts.at(-1);
    view.rerender(<Alert isOpen={false} isEnabled />);
    await act(async () => {
      presentStart?.(1016);
    });
    now = 5000;
    expect(motion().acceptsTouches()).toBe(false);
  });

  it('does nothing when disabled: no animation, and it closes with the caller', () => {
    const view = render(<Alert isOpen isEnabled={false} />);
    view.rerender(<Alert isOpen={false} isEnabled={false} />);
    const {panel, backdrop} = animators();
    expect(moves(panel)).toEqual([]);
    expect(moves(backdrop)).toEqual([]);
    expect(motion().isPresented).toBe(false);
    expect(motion().isDriving).toBe(false);
    expect(motion().acceptsTouches()).toBe(true);
  });

  it('leaves no timer behind when unmounted mid-exit', () => {
    vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']});
    const view = render(<Alert isOpen isEnabled />);
    view.rerender(<Alert isOpen={false} isEnabled />);
    expect(vi.getTimerCount()).toBe(1);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
