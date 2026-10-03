// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menuPressGesture.test.ts
 * @input vitest, the pure menuPressStep machine
 * @output One test per transition of the press-model state diagram (a press
 *   inside the menu; the trigger states have their own suite)
 * @position Testing; validates menuPressGesture.ts without a browser
 */

import {describe, it, expect} from 'vitest';
import {
  IDLE_MENU_PRESS,
  menuPressStep,
  type MenuPressEvent,
  type MenuPressGesture,
} from './menuPressGesture';

type Row = 'A' | 'B';

function run(events: MenuPressEvent<Row>[]) {
  let gesture: MenuPressGesture<Row> = IDLE_MENU_PRESS;
  const effects = [];
  for (const event of events) {
    const step = menuPressStep(gesture, event);
    gesture = step.gesture;
    effects.push(step.effect);
  }
  return {gesture, effects, last: effects[effects.length - 1]};
}

const downInMenu = (
  row: Row | null,
  pointerType: 'mouse' | 'touch' = 'touch',
) => ({type: 'down', pointerType, row, time: 0}) as const;
const move = (row: Row | null, isInMenu = true, time = 10) =>
  ({type: 'move', row, isInMenu, time}) as const;
const up = (
  row: Row | null,
  {
    isInMenu = row != null,
    isOnTrigger = false,
    time = 20,
  }: {isInMenu?: boolean; isOnTrigger?: boolean; time?: number} = {},
) => ({type: 'up', row, isInMenu, isOnTrigger, time}) as const;

describe('menuPressStep — inside the menu', () => {
  it('Idle → Tracking: a pointer down inside the menu highlights the row under it', () => {
    const {gesture, last} = run([downInMenu('A')]);
    expect(gesture.phase).toBe('tracking');
    expect(last).toEqual({type: 'highlight', row: 'A'});
  });

  it('Idle → Tracking: a pointer down over a divider highlights nothing', () => {
    const {gesture, last} = run([downInMenu(null)]);
    expect(gesture.phase).toBe('tracking');
    expect(last).toEqual({type: 'clear'});
  });

  it('Tracking → Tracking: a move onto another row moves the highlight', () => {
    const {last} = run([downInMenu('A'), move('B')]);
    expect(last).toEqual({type: 'highlight', row: 'B'});
  });

  it('Tracking → Tracking: a move over a disabled row or a heading clears the highlight', () => {
    const {last} = run([downInMenu('A'), move(null)]);
    expect(last).toEqual({type: 'clear'});
  });

  it('Tracking → Tracking: a move within the same row changes nothing', () => {
    const {last} = run([downInMenu('A'), move('A')]);
    expect(last).toEqual({type: 'none'});
  });

  it('Tracking → Acted: a release over an enabled row acts on THAT row, not the one pressed', () => {
    const {gesture, last} = run([downInMenu('A'), move('B'), up('B')]);
    expect(last).toEqual({type: 'act', row: 'B'});
    expect(gesture.phase).toBe('idle');
  });

  it('a tap that never left its row acts on that row and swallows nothing else', () => {
    const {last} = run([downInMenu('A'), up('A')]);
    expect(last).toEqual({type: 'act', row: 'A'});
  });

  it('Tracking → Idle: a release over a divider, heading or disabled row acts on nothing and keeps the menu', () => {
    const {last} = run([
      downInMenu('A'),
      move(null),
      up(null, {isInMenu: true}),
    ]);
    expect(last).toEqual({type: 'settle', stray: true, dismiss: false});
  });

  it('Tracking → Released → Idle: a MOUSE released outside acts on nothing and dismisses', () => {
    const {last} = run([
      downInMenu('A', 'mouse'),
      move(null, false),
      up(null, {isInMenu: false}),
    ]);
    expect(last).toEqual({type: 'settle', stray: true, dismiss: true});
  });

  it('Tracking → Released → Idle: a FINGER released outside acts on nothing and leaves the menu open', () => {
    const {last} = run([
      downInMenu('A', 'touch'),
      move(null, false),
      up(null, {isInMenu: false}),
    ]);
    expect(last).toEqual({type: 'settle', stray: true, dismiss: false});
  });

  it('Tracking → Idle: a cancel (scroll, second pointer, browser) acts on nothing', () => {
    const {gesture, last} = run([downInMenu('A'), move('B'), {type: 'cancel'}]);
    expect(gesture.phase).toBe('idle');
    expect(last).toEqual({type: 'settle', stray: false, dismiss: false});
  });

  it('ignores a move or a release with no gesture live', () => {
    expect(menuPressStep(IDLE_MENU_PRESS, move('A')).effect).toEqual({
      type: 'none',
    });
    expect(menuPressStep(IDLE_MENU_PRESS, up('A')).effect).toEqual({
      type: 'none',
    });
  });
});
