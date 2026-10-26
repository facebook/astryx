// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menuTouchPlacement.test.ts
 * @input placeOverTrigger with a stubbed trigger rect in jsdom
 * @output Proof that the covering menu's room caps the box that scrolls (the
 *   `role="menu"` element and the column around it), not only the surface,
 *   so a short compact screen never shows a menu taller than its room; that
 *   each LayerProvider inline inset sits on the side it names, right to left
 *   included; and that a menu that does not cover its trigger keeps no cap
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

  it('puts each LayerProvider inline inset on the side it names, right to left included', () => {
    const {surface, menu, trigger} = menuAt(94);
    placeOverTrigger(surface, trigger, true, menu);
    expect(surface.style.getPropertyValue('left')).toContain(
      '--astryx-layer-inset-inline-start',
    );
    expect(surface.style.getPropertyValue('right')).toContain(
      '--astryx-layer-inset-inline-end',
    );
    // Right to left, inline start is the right side.
    surface.style.direction = 'rtl';
    placeOverTrigger(surface, trigger, true, menu);
    expect(surface.style.getPropertyValue('left')).toContain(
      '--astryx-layer-inset-inline-end',
    );
    expect(surface.style.getPropertyValue('right')).toContain(
      '--astryx-layer-inset-inline-start',
    );
    // A menu that does not cover its trigger keeps no side of ours.
    placeOverTrigger(surface, trigger, false, menu);
    expect(surface.style.getPropertyValue('left')).toBe('');
    expect(surface.style.getPropertyValue('right')).toBe('');
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

  it('keeps a caller’s own inline cap: a menu that does not cover leaves it, and a cleared cover gives it back', () => {
    const {surface, menu, trigger} = menuAt(94);
    menu.style.setProperty('max-block-size', '120px');
    placeOverTrigger(surface, trigger, false, menu);
    expect(menu.style.getPropertyValue('max-block-size')).toBe('120px');
    placeOverTrigger(surface, trigger, true, menu);
    expect(menu.style.getPropertyValue('max-block-size')).toMatch(
      /^min\(120px, calc\(/,
    );
    placeOverTrigger(surface, trigger, false, menu);
    expect(menu.style.getPropertyValue('max-block-size')).toBe('120px');
  });
});
