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
import {
  settlingDuration,
  toSpring,
  type SpringDescription,
} from '../motion/spring';
import {alertController} from '../motion/uikit/alert';
import {springs} from '../motion/uikit/springs';
import type * as SpringsModule from '../motion/uikit/springs';
import {useAlertMotion, type AlertMotion} from './useAlertMotion';

type RecordedCall =
  | {kind: 'attach'; target: unknown}
  | {kind: 'set'; values: Record<string, number>}
  | {
      kind: 'animate';
      values: Record<string, number>;
      spring: unknown;
      velocity?: Record<string, number>;
      options: {at?: number; touchRelease?: boolean};
    };

interface Recorded {
  readonly options: {pseudoElement?: string};
  readonly calls: RecordedCall[];
  /** What `get` and `getVelocity` answer: the values on screen. */
  presented: Record<string, number>;
  velocities: Record<string, number>;
  /** Ends each `animate` call's animation, in call order. */
  readonly endings: ((isDone: boolean) => void)[];
  /** Reports each `animate` call's start (when the browser started it). */
  readonly starts: ((time: number) => void)[];
}

const {recorded, reducedMotion, alertSprings} = vi.hoisted(() => ({
  recorded: [] as Recorded[],
  reducedMotion: {matches: false},
  // The alert's springs as the hook reads them: the table's own, unless a
  // test changes one.
  alertSprings: {
    present: null as SpringDescription | null,
    dismiss: null as SpringDescription | null,
  },
}));

vi.mock('../motion/uikit/springs', async importOriginal => {
  const actual = await importOriginal<typeof SpringsModule>();
  const table = Object.defineProperties(
    {...actual.springs},
    {
      alertPresent: {
        get: () => alertSprings.present ?? actual.springs.alertPresent,
        enumerable: true,
      },
      alertDismiss: {
        get: () => alertSprings.dismiss ?? actual.springs.alertDismiss,
        enumerable: true,
      },
    },
  );
  return {...actual, springs: table};
});

vi.mock('../motion/animator', () => ({
  createAnimator: (
    _element: unknown,
    options: {pseudoElement?: string} = {},
  ) => {
    const record: Recorded = {
      options,
      calls: [],
      endings: [],
      starts: [],
      presented: {},
      velocities: {},
    };
    recorded.push(record);
    let element: unknown = null;
    return {
      // What Reduced Motion makes of a call here: the animator's own answer.
      reducedMotion: () => (reducedMotion.matches ? 'crossfade' : 'off'),
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
        transition: {spring: unknown; velocity?: Record<string, number>},
        animateOptions: {at?: number; touchRelease?: boolean} = {},
      ) => {
        record.calls.push({
          kind: 'animate',
          values,
          spring: transition.spring,
          ...(transition.velocity == null
            ? {}
            : {velocity: transition.velocity}),
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
      get: (property: string) => record.presented[property] ?? 0,
      getVelocity: (property: string) => record.velocities[property] ?? 0,
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

/** Slower springs than the alert's, both critically damped. */
const SLOW_PRESENT = {mass: 1, stiffness: 240, damping: 31} as const;
const SLOW_DISMISS = {mass: 1, stiffness: 150, damping: 24.5} as const;

/** A spring's length in whole ms: its settling duration (0.1 % from rest). */
const lengthMs = (spring: SpringDescription) =>
  Math.round(settlingDuration(toSpring(spring)) * 1000);

let now = 1000;
beforeEach(() => {
  recorded.length = 0;
  reducedMotion.matches = false;
  alertSprings.present = null;
  alertSprings.dismiss = null;
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
    // dialog, on one clock. No reduced-motion curve of its own: under reduced
    // motion the animator's policy applies (design:reduced-motion DR4).
    expect(moves(panel)).toEqual([
      {
        kind: 'set',
        values: {opacity: 0, scale: alertController.present.scaleFrom},
      },
      {
        kind: 'animate',
        values: {opacity: 1, scale: 1},
        spring: springs.alertPresent,
        options: {},
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

  it("starts no wider than the viewport: an alert wider than UIKit's scales from less than 1.2", () => {
    const offsetWidth = vi
      .spyOn(HTMLElement.prototype, 'offsetWidth', 'get')
      .mockReturnValue(370);
    const clientWidth = vi
      .spyOn(document.documentElement, 'clientWidth', 'get')
      .mockReturnValue(402);
    render(<Alert isOpen isEnabled />);
    const {panel} = animators();
    expect(moves(panel)[0]).toEqual({
      kind: 'set',
      values: {opacity: 0, scale: 402 / 370},
    });
    offsetWidth.mockRestore();
    clientWidth.mockRestore();
  });

  it("starts at UIKit's 1.2 when that fits the viewport (its 320 pt alert on a 402 pt phone)", () => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(320);
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(
      402,
    );
    render(<Alert isOpen isEnabled />);
    const {panel} = animators();
    expect(moves(panel)[0]).toEqual({
      kind: 'set',
      values: {opacity: 0, scale: alertController.present.scaleFrom},
    });
  });

  it('leaves from where it is when closed right after opening: the fade springs from the presented values with the velocity on screen', async () => {
    const view = render(<Alert isOpen isEnabled />);
    const {panel, backdrop} = animators();
    // Mid-presentation: what the screen shows, and how fast it moves.
    panel.presented = {opacity: 0.83, scale: 1.03};
    panel.velocities = {opacity: 2.1};
    backdrop.presented = {opacity: 0.83};
    backdrop.velocities = {opacity: 2.1};
    view.rerender(<Alert isOpen={false} isEnabled />);
    // From the presented values (the animator's), with their velocity; no
    // start time from AlertDialog (the animator continues motion from its
    // call).
    expect(moves(panel).at(-1)).toEqual({
      kind: 'animate',
      values: {opacity: 0},
      spring: springs.alertDismiss,
      velocity: {opacity: 2.1},
      options: {},
    });
    expect(moves(backdrop).at(-1)).toEqual({
      kind: 'animate',
      values: {opacity: 0},
      spring: springs.alertDismiss,
      velocity: {opacity: 2.1},
      options: {},
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
      velocity: {opacity: 0},
      options: {},
    });
    expect(moves(backdrop).at(-1)).toEqual({
      kind: 'animate',
      values: {opacity: 0},
      spring: springs.alertDismiss,
      velocity: {opacity: 0},
      options: {},
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
    // Mid-exit: fading out at 0.4, and falling.
    panel.presented = {opacity: 0.4, scale: 1};
    panel.velocities = {opacity: -3};
    backdrop.presented = {opacity: 0.4};
    backdrop.velocities = {opacity: -3};
    now = 1200;
    view.rerender(<Alert isOpen isEnabled />);
    expect(motion().isPresented).toBe(true);
    expect(moves(panel).at(-1)).toEqual({
      kind: 'animate',
      values: {opacity: 1},
      spring: springs.alertPresent,
      velocity: {opacity: -3},
      options: {},
    });
    expect(moves(backdrop).at(-1)).toEqual({
      kind: 'animate',
      values: {opacity: 1},
      spring: springs.alertPresent,
      velocity: {opacity: -3},
      options: {},
    });
    // Touches come back a presentation's time after the fade back starts.
    expect(motion().acceptsTouches()).toBe(false);
    await act(async () => {
      panel.starts.at(-1)?.(1216);
    });
    now = 1216 + alertController.present.ignoresTouchesForMs;
    expect(motion().acceptsTouches()).toBe(true);
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

  it("under reduced motion refuses touches until the animator's cross-fade ends, not a spring's time after it starts", async () => {
    reducedMotion.matches = true;
    render(<Alert isOpen isEnabled />);
    const {panel} = animators();
    expect(moves(panel).at(-1)).toMatchObject({kind: 'animate', options: {}});
    await act(async () => {
      panel.starts.at(-1)?.(1000);
    });
    // Past the spring's window, the cross-fade still running: refused.
    now = 1000 + alertController.present.ignoresTouchesForMs + 50;
    expect(motion().acceptsTouches()).toBe(false);
    // The cross-fade ends (its duration is the animator's): accepted.
    await act(async () => {
      panel.endings.at(-1)?.(true);
    });
    expect(motion().acceptsTouches()).toBe(true);
  });

  it('under reduced motion, reopened mid-exit, takes touches once the cross-fade back ends', async () => {
    const view = render(<Alert isOpen isEnabled />);
    const {panel} = animators();
    view.rerender(<Alert isOpen={false} isEnabled />);
    reducedMotion.matches = true;
    view.rerender(<Alert isOpen isEnabled />);
    expect(motion().acceptsTouches()).toBe(false);
    await act(async () => {
      panel.starts.at(-1)?.(1000);
    });
    now = 1000 + alertController.present.ignoresTouchesForMs + 50;
    expect(motion().acceptsTouches()).toBe(false);
    await act(async () => {
      panel.endings.at(-1)?.(true);
    });
    expect(motion().acceptsTouches()).toBe(true);
  });

  it("derives the touch window and the exit backstop from the springs' lengths: slower springs move both", async () => {
    alertSprings.present = SLOW_PRESENT;
    alertSprings.dismiss = SLOW_DISMISS;
    vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']});
    const view = render(<Alert isOpen isEnabled />);
    const {panel} = animators();
    // The animator plays the spring the window is timed from.
    expect(panel.calls.find(call => call.kind === 'animate')).toMatchObject({
      spring: SLOW_PRESENT,
    });
    await act(async () => {
      panel.starts.at(-1)?.(2000);
    });
    // UIKit's frame or two after the spring stays: 435 of 404 ms.
    const lag =
      alertController.present.ignoresTouchesForMs -
      alertController.present.durationMs;
    const present = lengthMs(SLOW_PRESENT);
    expect(present).toBeGreaterThan(alertController.present.durationMs + 100);
    now = 2000 + present + lag - 1;
    expect(motion().acceptsTouches()).toBe(false);
    now = 2000 + present + lag;
    expect(motion().acceptsTouches()).toBe(true);
    view.rerender(<Alert isOpen={false} isEnabled />);
    act(() => {
      vi.advanceTimersByTime(lengthMs(SLOW_DISMISS) + 99);
    });
    expect(motion().isPresented).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(motion().isPresented).toBe(false);
  });

  it('takes no theme variable: `--motion-springs-alert-*` on its theme changes neither the spring it plays nor the touch window', async () => {
    render(
      <div
        data-astryx-theme="slow"
        style={{
          ['--motion-springs-alert-present' as string]: '0.8s 0',
          ['--motion-springs-alert-dismiss' as string]: '0.8s 0',
        }}>
        <Alert isOpen isEnabled />
      </div>,
    );
    const {panel} = animators();
    expect(panel.calls.find(call => call.kind === 'animate')).toMatchObject({
      spring: springs.alertPresent,
    });
    await act(async () => {
      panel.starts.at(-1)?.(2000);
    });
    now = 2000 + alertController.present.ignoresTouchesForMs - 1;
    expect(motion().acceptsTouches()).toBe(false);
    now = 2000 + alertController.present.ignoresTouchesForMs;
    expect(motion().acceptsTouches()).toBe(true);
  });

  it("measures UIKit's durations as its springs' lengths, so the alert keeps UIKit's 435 ms window", () => {
    for (const [spring, measured] of [
      [springs.alertPresent, alertController.present.durationMs],
      [springs.alertDismiss, alertController.dismiss.durationMs],
    ] as const) {
      expect(Math.round(settlingDuration(toSpring(spring)) * 1000)).toBe(
        measured,
      );
    }
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
