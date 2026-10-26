// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menuTouchPlacement.test.ts
 * @input placeOverTrigger with a stubbed trigger rect in jsdom
 * @output Proof that the covering menu's room caps the box that scrolls (the
 *   `role="menu"` element and the column around it), not only the surface,
 *   so a short compact screen never shows a menu taller than its room; and
 *   that a menu that does not cover its trigger keeps no cap
 * @position Unit test beside DropdownMenu/menuTouchPlacement.ts
 */

import {afterEach, describe, expect, it} from 'vitest';
import {placeOverTrigger} from './menuTouchPlacement';

afterEach(() => {
  document.body.innerHTML = '';
});

function menuAt(top: number) {
  const surface = document.createElement('div');
  surface.style.maxHeight = '300px';
  const column = document.createElement('div');
  column.style.maxHeight = '300px';
  const menu = document.createElement('div');
  menu.setAttribute('role', 'menu');
  menu.style.maxHeight = '188px';
  column.append(menu);
  surface.append(column);
  const trigger = document.createElement('button');
  trigger.getBoundingClientRect = () =>
    ({
      top,
      bottom: top + 40,
      height: 40,
      left: 0,
      right: 100,
      width: 100,
    }) as DOMRect;
  document.body.append(surface, trigger);
  return {surface, column, menu, trigger};
}

describe('placeOverTrigger', () => {
  it('caps the scrolling menu and its column to the room, not only the surface', () => {
    const {surface, column, menu, trigger} = menuAt(94);
    placeOverTrigger(surface, trigger, true, menu);
    const room = `calc(${window.innerHeight - 94}px - `;
    for (const box of [surface, column, menu]) {
      expect(box.style.getPropertyValue('max-block-size')).toContain(room);
    }
    expect(menu.style.getPropertyValue('max-block-size')).toMatch(
      /^min\(188px, /,
    );
  });

  it('clears every cap when the menu does not cover its trigger', () => {
    const {surface, column, menu, trigger} = menuAt(94);
    placeOverTrigger(surface, trigger, true, menu);
    placeOverTrigger(surface, trigger, false, menu);
    for (const box of [surface, column, menu]) {
      expect(box.style.getPropertyValue('max-block-size')).toBe('');
    }
    expect(surface.style.getPropertyValue('top')).toBe('');
  });
});
