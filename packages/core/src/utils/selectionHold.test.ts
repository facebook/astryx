// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file selectionHold.test.ts
 * @input vitest, Item and TreeList rows, the spring and Bézier solvers, and
 *   the in-transition deselect clock (motion/uikit/list.ts)
 * @output Unit tests for holdSelection: which targets it holds, the held
 *   state it writes and leaves, presentation values from each timing's
 *   closed-form curve, interruption, completion, cancel and replacement
 * @position Beside utils/selectionHold.ts; the compositor and pixel proofs are
 *   in List/__tests__/ListSelectionHold.interaction.browser.spec.ts
 */

import {createElement} from 'react';
import {render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Item} from '../Item';
import {List, ListItem} from '../List';
import {TreeList} from '../TreeList';
import {cubicBezier} from '../motion/bezier';
import {solveSpring, toSpring} from '../motion/spring';
import {list} from '../motion/uikit/list';
import {timing} from '../motion/uikit/timing';
import {PRESSABLE_ATTRIBUTE, PRESSED_ATTRIBUTE} from './pressFeedback';
import {CELL_PRESS_PROFILE, holdSelection} from './selectionHold';

let clock = 0;
const now = () => clock;

beforeEach(() => {
  clock = 1000;
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

function listRow(label = 'Inbox') {
  render(
    createElement(
      List,
      null,
      createElement(ListItem, {label, onClick: () => {}}),
      createElement(ListItem, {label: 'Static'}),
    ),
  );
  const row = screen.getByText(label).closest('li') as HTMLElement;
  // The activation's target: the row's own control.
  const control = row.querySelector('button') as HTMLElement;
  return {row, control};
}

describe('what a hold holds', () => {
  it('holds the list row around the activation target, marked as a cell', () => {
    const {row, control} = listRow();
    expect(row.getAttribute(PRESSABLE_ATTRIBUTE)).toBe(CELL_PRESS_PROFILE);
    const hold = holdSelection(control, {now});
    expect(hold?.element).toBe(row);
    expect(row.getAttribute(PRESSED_ATTRIBUTE)).toBe('held');
  });

  it('holds a TreeList row by its row box', () => {
    render(
      createElement(TreeList, {
        items: [{id: 'a', label: 'App.tsx', onClick: () => {}}],
      }),
    );
    const box = screen
      .getByRole('treeitem')
      .querySelector(`[${PRESSABLE_ATTRIBUTE}]`) as HTMLElement;
    const hold = holdSelection(screen.getByText('App.tsx'), {now});
    expect(hold?.element).toBe(box);
  });

  it('holds nothing outside an enabled row with an action', () => {
    render(
      createElement(
        'div',
        null,
        createElement(Item, {label: 'Static', 'data-testid': 'static'}),
        createElement(Item, {
          label: 'Off',
          onClick: () => {},
          isDisabled: true,
          'data-testid': 'off',
        }),
        createElement('button', {'data-testid': 'button'}, 'Plain'),
      ),
    );
    expect(holdSelection(screen.getByTestId('static'))).toBeNull();
    expect(holdSelection(screen.getByTestId('off'))).toBeNull();
    expect(holdSelection(screen.getByTestId('button'))).toBeNull();
    expect(holdSelection(null)).toBeNull();
    expect(holdSelection(window)).toBeNull();
  });
});

describe('presentation follows each timing’s curve', () => {
  it('a programmatic pop: UIKit’s in-transition deselect, 350 ms linear', () => {
    const {control} = listRow();
    const hold = holdSelection(control, {now});
    expect(hold?.presentation()).toBe(0);
    void hold?.animate(1, {startTime: 1000});
    const ms = list.deselect.navigationPopMs;
    expect(hold?.presentation(1000)).toBe(0);
    expect(hold?.presentation(1000 + ms / 2)).toBeCloseTo(0.5, 6);
    expect(hold?.presentation(1000 + ms / 4)).toBeCloseTo(0.25, 6);
    expect(hold?.presentation(1000 + ms)).toBe(1);
  });

  it('an interactive finish: the navigation’s spring from the scrubbed value, with its velocity', () => {
    const {control} = listRow();
    const hold = holdSelection(control, {now});
    hold?.setProgress(0.4);
    expect(hold?.presentation()).toBe(0.4);
    const spring = {response: 0.3, dampingRatio: 0.85};
    void hold?.animate(1, {spring, velocity: 2, startTime: 1000});
    const expected = solveSpring(toSpring(spring), {
      from: 0.4,
      to: 1,
      velocity: 2,
    });
    for (const t of [0, 0.05, 0.1, 0.2]) {
      expect(hold?.presentation(1000 + t * 1000)).toBeCloseTo(
        Math.min(1, Math.max(0, expected.value(t))),
        6,
      );
    }
  });

  it('Reduce Motion: a fixed duration on a Bézier curve', () => {
    const {control} = listRow();
    const hold = holdSelection(control, {now});
    const curve = timing.curves.easeInOut;
    void hold?.animate(1, {
      durationMs: timing.reducedMotionCrossFadeMs,
      curve,
      startTime: 1000,
    });
    const ease = cubicBezier(curve);
    const d = timing.reducedMotionCrossFadeMs;
    expect(hold?.presentation(1000 + d * 0.3)).toBeCloseTo(ease(0.3), 6);
    expect(hold?.presentation(1000 + d)).toBe(1);
  });

  it('a pop that starts from a scrubbed value takes its share of the clock', () => {
    const {control} = listRow();
    const hold = holdSelection(control, {now});
    hold?.setProgress(0.5);
    void hold?.animate(1, {startTime: 1000});
    const half = list.deselect.navigationPopMs / 2;
    expect(hold?.presentation(1000 + half / 2)).toBeCloseTo(0.75, 6);
    expect(hold?.presentation(1000 + half)).toBe(1);
  });
});

describe('interruption, completion and cancel', () => {
  it('resolves true when the deselect arrives', async () => {
    const {control} = listRow();
    const hold = holdSelection(control, {now});
    const arrived = hold?.animate(1, {startTime: 1000});
    clock = 1000 + list.deselect.navigationPopMs;
    vi.advanceTimersByTime(list.deselect.navigationPopMs);
    await expect(arrived).resolves.toBe(true);
    expect(hold?.presentation()).toBe(1);
  });

  it('a finger grabbing mid-flight stops it where it is: the promise resolves false', async () => {
    const {control} = listRow();
    const hold = holdSelection(control, {now});
    const arrived = hold?.animate(1, {startTime: 1000});
    clock = 1000 + list.deselect.navigationPopMs * 0.3;
    // Where it is on screen, from the curve: the finger starts there.
    expect(hold?.presentation()).toBeCloseTo(0.3, 6);
    hold?.setProgress(hold.presentation());
    await expect(arrived).resolves.toBe(false);
    expect(hold?.presentation()).toBeCloseTo(0.3, 6);
  });

  it('a completed pop deselects the row and drops the hold', () => {
    const {row, control} = listRow();
    const hold = holdSelection(control, {now});
    hold?.end(true);
    expect(row.hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
    // Inert from here on.
    hold?.end(false);
    hold?.setProgress(0.5);
    expect(row.hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
  });

  it('a cancelled pop selects the row again at once and keeps the hold', async () => {
    const {row, control} = listRow();
    const hold = holdSelection(control, {now});
    hold?.setProgress(0.6);
    const back = hold?.animate(0, {
      spring: {response: 0.3, dampingRatio: 0.85},
      startTime: 1000,
    });
    hold?.end(false);
    await expect(back).resolves.toBe(false);
    expect(row.getAttribute(PRESSED_ATTRIBUTE)).toBe('held');
    expect(hold?.presentation()).toBe(0);
    // The next pop still deselects it.
    hold?.end(true);
    expect(row.hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
  });

  it('a second hold on the row takes over; the first goes inert', () => {
    const {row, control} = listRow();
    const first = holdSelection(control, {now});
    const second = holdSelection(control, {now});
    first?.end(true);
    expect(row.getAttribute(PRESSED_ATTRIBUTE)).toBe('held');
    second?.end(true);
    expect(row.hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
  });

  it('returns focus to the row’s own control', () => {
    const {control} = listRow();
    const hold = holdSelection(control, {now});
    hold?.end(true);
    hold?.focus({preventScroll: true});
    expect(document.activeElement).toBe(control);
  });
});
