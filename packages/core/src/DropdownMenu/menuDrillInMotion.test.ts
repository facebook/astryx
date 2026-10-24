// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menuDrillInMotion.test.ts
 * @input vitest (jsdom) with WAAPI recorded and layout stubbed, the motion's
 *   copies and slices, UIMenu's sub-menu values from the constants table
 * @output The in-place sub-menu's contract: a push leaves an inert, unnamed
 *   copy of the menu behind the popover and plays it to UIMenu's scale and
 *   drop with its tapped row faded; the box grows from the anchored edge on
 *   three slices while the popover's own paint steps aside; the sub-menu rides
 *   with the moving edge, its header's chevron turning down and its rows
 *   fading in; back hands the card over to the live parent rows growing back,
 *   plays the sub-menu out on a copy above them, and turns its chevron back;
 *   reset removes everything; Reduce Motion cross-fades
 * @position jsdom tests of packages/core/src/DropdownMenu/menuDrillInMotion.ts
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {menu} from '../motion/uikit';
import {
  createMenuDrillInMotion,
  MENU_BOX_SLICE_ATTRIBUTE,
  MENU_PARENT_COPY_ATTRIBUTE,
  MENU_SUBMENU_COPY_ATTRIBUTE,
} from './menuDrillInMotion';

interface Recorded {
  target: Element;
  keyframes: Keyframe[];
}

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const rect = ({left, top, width, height}: Rect) => ({
  left,
  top,
  width,
  height,
  x: left,
  y: top,
  right: left + width,
  bottom: top + height,
  toJSON: () => ({}),
});

// UIKit's M8 (iOS 26.2): a three-row menu (top 370, 104 tall) anchored by its
// bottom grows to 178 tall for the sub-menu, keeping its bottom at 474.
const PARENT_BOX: Rect = {left: 76, top: 370, width: 250, height: 104};
const SUBMENU_BOX: Rect = {left: 76, top: 296, width: 250, height: 178};

let recorded: Recorded[] = [];
// How far the popover (the containing block of the copies placed in it) has
// moved since a copy was placed: the box shrinking under a bottom anchor.
let containingShift = 0;
const originalRect = HTMLElement.prototype.getBoundingClientRect;
const originalClientRects = Element.prototype.getClientRects;

beforeEach(() => {
  recorded = [];
  Element.prototype.animate = function (keyframes) {
    const animation = {
      target: this,
      keyframes: keyframes as Keyframe[],
      startTime: null,
      finished: new Promise(() => {}),
      cancel() {},
    };
    recorded.push(animation);
    return animation as unknown as Animation;
  };
  // jsdom has no layout: an element is shown unless it sits in a hidden
  // subtree, and a copy stands where its inline box says.
  Element.prototype.getClientRects = function (this: Element) {
    return (this.closest('[hidden]') == null
      ? [rect({left: 0, top: 0, width: 1, height: 1})]
      : []) as unknown as DOMRectList;
  };
  containingShift = 0;
  HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
    if (this.style.position === 'fixed') {
      const inPopover = this.parentElement?.closest('[popover]') != null;
      return rect({
        left: parseFloat(this.style.left),
        top: parseFloat(this.style.top) + (inPopover ? containingShift : 0),
        width: parseFloat(this.style.width),
        height: parseFloat(this.style.height),
      });
    }
    return originalRect.call(this);
  };
});

afterEach(() => {
  Reflect.deleteProperty(Element.prototype, 'animate');
  HTMLElement.prototype.getBoundingClientRect = originalRect;
  Element.prototype.getClientRects = originalClientRects;
  document.body.replaceChildren();
});

function mount() {
  const surface = document.createElement('div');
  surface.setAttribute('popover', 'manual');
  surface.style.backgroundColor = 'rgb(250, 250, 250)';
  surface.style.borderTopLeftRadius = '13px';
  surface.innerHTML = `
    <div role="menu" aria-label="Actions" id="list">
      <div data-root>
        <div role="menuitem" aria-label="Edit">Edit</div>
        <div role="menuitem" data-astryx-press="on">More</div>
        <div role="menuitem">Delete</div>
      </div>
      <div data-host>
        <div data-view hidden>
          <div role="menuitem" aria-label="Back to Actions" data-astryx-menu-submenu-header data-astryx-press="on"><span>More</span><span data-astryx-menu-submenu-chevron></span></div>
          <div role="menuitem">X</div>
          <div role="menuitem">Y</div>
        </div>
      </div>
    </div>`;
  document.body.append(surface);
  let box = PARENT_BOX;
  surface.getBoundingClientRect = () => rect(box);
  const list = surface.querySelector<HTMLElement>('[role="menu"]')!;
  const root = surface.querySelector<HTMLElement>('[data-root]')!;
  const view = surface.querySelector<HTMLElement>('[data-view]')!;
  view.getBoundingClientRect = () => rect(SUBMENU_BOX);
  const more = root.children[1] as HTMLElement;
  // As in UIKit's capture, the tapped row leads the parent list.
  more.getBoundingClientRect = () =>
    rect({left: PARENT_BOX.left, top: PARENT_BOX.top, width: 250, height: 42});
  return {
    surface,
    list,
    root,
    view,
    more,
    drill() {
      root.hidden = true;
      view.hidden = false;
      box = SUBMENU_BOX;
    },
    back() {
      root.hidden = false;
      view.hidden = true;
      box = PARENT_BOX;
    },
  };
}

const lastOf = (target: Element, property: string) =>
  recorded
    .filter(animation => animation.target === target)
    .map(animation => animation.keyframes.at(-1)?.[property])
    .filter(value => value != null)
    .at(-1);
const firstOf = (target: Element, property: string) =>
  recorded
    .filter(animation => animation.target === target)
    .map(animation => animation.keyframes[0]?.[property])
    .filter(value => value != null)
    .at(-1);

describe('createMenuDrillInMotion', () => {
  it('a push leaves an inert, unnamed copy of the menu behind and plays it to UIMenu\u2019s scale and drop', () => {
    const menuDom = mount();
    const motion = createMenuDrillInMotion(
      () => ({
        surface: menuDom.surface,
        list: menuDom.list,
      }),
      {prefersReducedMotion: () => false},
    );
    motion.capture('push', menuDom.more);
    const card = document.querySelector<HTMLElement>(
      `[${MENU_PARENT_COPY_ATTRIBUTE}]`,
    );
    expect(card).not.toBeNull();
    // Beside the popover, so outside its top layer: behind it.
    expect(card!.previousElementSibling).toBe(menuDom.surface);
    expect(card!.getAttribute('aria-hidden')).toBe('true');
    expect(card!.hasAttribute('inert')).toBe(true);
    expect(card!.querySelector('[role], [aria-label], [id]')).toBeNull();
    // At rest: the tapped row's press paint does not come along.
    expect(card!.querySelector('[data-astryx-press]')).toBeNull();
    menuDom.drill();
    motion.play();
    const scale = menu.submenuParentScale;
    expect(String(lastOf(card!, 'scale'))).toBe(`${scale} ${scale}`);
    expect(String(lastOf(card!, 'translate'))).toBe(
      `0px ${menu.submenuParentDropPx}px`,
    );
    // The tapped row fades out on the card.
    const cardMore = card!.querySelectorAll('[data-root] > div')[1];
    expect(Number(lastOf(cardMore, 'opacity'))).toBe(0);
    motion.reset();
  });

  it('grows the box from its anchored bottom on three slices while the popover\u2019s paint steps aside', () => {
    const menuDom = mount();
    const motion = createMenuDrillInMotion(
      () => ({
        surface: menuDom.surface,
        list: menuDom.list,
      }),
      {prefersReducedMotion: () => false},
    );
    motion.capture('push', menuDom.more);
    menuDom.drill();
    motion.play();
    const slices = [
      ...menuDom.surface.querySelectorAll<HTMLElement>(
        `[${MENU_BOX_SLICE_ATTRIBUTE}]`,
      ),
    ];
    expect(
      slices.map(slice => slice.getAttribute(MENU_BOX_SLICE_ATTRIBUTE)),
    ).toEqual(['bottom', 'middle', 'top']);
    const [bottom, middle, top] = slices;
    expect(menuDom.surface.style.backgroundColor).toBe('transparent');
    expect(menuDom.surface.style.boxShadow).toBe('none');
    // The top cap starts where the parent's top stood and rises to the new top.
    const rise = PARENT_BOX.top - SUBMENU_BOX.top;
    expect(String(firstOf(top, 'translate'))).toBe(`0px ${rise}px`);
    expect(String(lastOf(top, 'translate'))).toBe('0px 0px');
    // The middle grows from the parent's height, from the bottom.
    expect(middle.style.transformOrigin).toBe('50% 100%');
    const [, fromY] = String(firstOf(middle, 'scale')).split(' ').map(Number);
    expect(fromY).toBeCloseTo(
      (PARENT_BOX.height - 26) / (SUBMENU_BOX.height - 26),
      4,
    );
    // The bottom cap does not move.
    expect(recorded.some(animation => animation.target === bottom)).toBe(false);
    motion.reset();
    expect(
      menuDom.surface.querySelector(`[${MENU_BOX_SLICE_ATTRIBUTE}]`),
    ).toBeNull();
    // The box's own inline values are back as they were.
    expect(menuDom.surface.style.backgroundColor).toBe('rgb(250, 250, 250)');
  });

  it('the sub-menu rides with the moving edge, its chevron turning down and its rows fading in', () => {
    const menuDom = mount();
    const motion = createMenuDrillInMotion(
      () => ({
        surface: menuDom.surface,
        list: menuDom.list,
      }),
      {prefersReducedMotion: () => false},
    );
    motion.capture('push', menuDom.more);
    menuDom.drill();
    motion.play();
    const rise = PARENT_BOX.top - SUBMENU_BOX.top;
    expect(String(firstOf(menuDom.view, 'translate'))).toBe(`0px ${rise}px`);
    expect(String(lastOf(menuDom.view, 'translate'))).toBe('0px 0px');
    const chevron = menuDom.view.querySelector(
      '[data-astryx-menu-submenu-chevron]',
    )!;
    expect(String(firstOf(chevron, 'rotate'))).toBe('0deg');
    expect(String(lastOf(chevron, 'rotate'))).toBe('90deg');
    const [header, x, y] = menuDom.view.children;
    expect(
      recorded.some(
        a => a.target === header && 'opacity' in (a.keyframes[0] ?? {}),
      ),
    ).toBe(false);
    expect(Number(lastOf(x, 'opacity'))).toBe(1);
    expect(Number(firstOf(y, 'opacity'))).toBe(0);
    motion.reset();
  });

  it('back hands the card over to the parent rows growing back and plays the sub-menu out on a copy above them', () => {
    const menuDom = mount();
    const motion = createMenuDrillInMotion(
      () => ({
        surface: menuDom.surface,
        list: menuDom.list,
      }),
      {prefersReducedMotion: () => false},
    );
    motion.capture('push', menuDom.more);
    menuDom.drill();
    motion.play();
    recorded = [];
    motion.capture('pop', menuDom.more);
    menuDom.back();
    motion.play();
    expect(
      document.querySelector(`[${MENU_PARENT_COPY_ATTRIBUTE}]`),
    ).toBeNull();
    const scale = menu.submenuParentScale;
    expect(String(firstOf(menuDom.list, 'scale'))).toBe(`${scale} ${scale}`);
    expect(String(lastOf(menuDom.list, 'scale'))).toBe('1 1');
    expect(Number(lastOf(menuDom.more, 'opacity'))).toBe(1);
    const copy = menuDom.surface.querySelector<HTMLElement>(
      `[${MENU_SUBMENU_COPY_ATTRIBUTE}]`,
    );
    expect(copy).not.toBeNull();
    // Inside the popover, after the list: above the parent rows.
    expect(copy!.previousElementSibling).toBe(menuDom.list);
    expect(copy!.querySelector('[role], [aria-label]')).toBeNull();
    expect(copy!.querySelector('[data-astryx-press]')).toBeNull();
    expect(String(lastOf(copy!, 'translate'))).toBe(
      `0px ${PARENT_BOX.top - SUBMENU_BOX.top}px`,
    );
    expect(
      String(
        lastOf(
          copy!.querySelector('[data-astryx-menu-submenu-chevron]')!,
          'rotate',
        ),
      ),
    ).toBe('0deg');
    motion.reset();
    expect(
      menuDom.surface.querySelector(`[${MENU_SUBMENU_COPY_ATTRIBUTE}]`),
    ).toBeNull();
  });

  it('the slices carry the box\u2019s border and shadow, and the box\u2019s own paint steps aside', () => {
    const menuDom = mount();
    menuDom.surface.style.boxShadow = '0px 4px 12px rgba(0, 0, 0, 0.2)';
    menuDom.surface.style.border = '1px solid rgb(200, 200, 200)';
    const motion = createMenuDrillInMotion(
      () => ({surface: menuDom.surface, list: menuDom.list}),
      {prefersReducedMotion: () => false},
    );
    motion.capture('push', menuDom.more);
    menuDom.drill();
    motion.play();
    const slices = [
      ...menuDom.surface.querySelectorAll<HTMLElement>(
        `[${MENU_BOX_SLICE_ATTRIBUTE}]`,
      ),
    ];
    expect(slices).toHaveLength(3);
    for (const slice of slices) {
      expect(slice.style.boxShadow).toBe('0px 4px 12px rgba(0, 0, 0, 0.2)');
      // Against the border box: the slices reach over the box's border.
      expect(slice.style.left).toBe('-1px');
      expect(slice.style.right).toBe('-1px');
      expect(slice.style.borderLeft).toBe('1px solid rgb(200, 200, 200)');
    }
    const [bottom, , top] = slices;
    expect(top.style.borderTop).toBe('1px solid rgb(200, 200, 200)');
    expect(bottom.style.borderBottom).toBe('1px solid rgb(200, 200, 200)');
    expect(menuDom.surface.style.boxShadow).toBe('none');
    expect(menuDom.surface.style.borderColor).toBe('transparent');
    motion.reset();
    expect(menuDom.surface.style.boxShadow).toBe(
      '0px 4px 12px rgba(0, 0, 0, 0.2)',
    );
    expect(menuDom.surface.style.borderColor).toBe('rgb(200, 200, 200)');
  });

  it('back puts the leaving sub-menu back where it stood when the box moves under it, so its header lands on its row', () => {
    const menuDom = mount();
    const motion = createMenuDrillInMotion(
      () => ({surface: menuDom.surface, list: menuDom.list}),
      {prefersReducedMotion: () => false},
    );
    motion.capture('push', menuDom.more);
    menuDom.drill();
    motion.play();
    motion.capture('pop', menuDom.more);
    const copy = menuDom.surface.querySelector<HTMLElement>(
      `[${MENU_SUBMENU_COPY_ATTRIBUTE}]`,
    )!;
    expect(copy.style.top).toBe(`${SUBMENU_BOX.top}px`);
    // The box shrinks keeping its bottom: the popover, the copy's containing
    // block, moves down by what it lost.
    menuDom.back();
    containingShift = SUBMENU_BOX.height - PARENT_BOX.height;
    motion.play();
    expect(copy.getBoundingClientRect().top).toBe(SUBMENU_BOX.top);
    expect(copy.style.top).toBe(`${SUBMENU_BOX.top - containingShift}px`);
    // From there, the header rides down onto the row it returns to.
    expect(String(lastOf(copy, 'translate'))).toBe(
      `0px ${PARENT_BOX.top - SUBMENU_BOX.top}px`,
    );
    motion.reset();
  });

  it('while drilled in, the box keeps the width it had at the push, until the menu closes', () => {
    const menuDom = mount();
    const motion = createMenuDrillInMotion(
      () => ({surface: menuDom.surface, list: menuDom.list}),
      {prefersReducedMotion: () => false},
    );
    menuDom.surface.style.boxSizing = 'border-box';
    motion.capture('push', menuDom.more);
    expect(menuDom.surface.style.minWidth).toBe(`${PARENT_BOX.width}px`);
    menuDom.drill();
    motion.play();
    motion.capture('pop', menuDom.more);
    menuDom.back();
    motion.play();
    expect(menuDom.surface.style.minWidth).toBe(`${PARENT_BOX.width}px`);
    motion.reset();
    expect(menuDom.surface.style.minWidth).toBe('');
  });

  it('back: the leaving header lands looking as its row, lit when the row is lit', async () => {
    const menuDom = mount();
    const motion = createMenuDrillInMotion(
      () => ({surface: menuDom.surface, list: menuDom.list}),
      {prefersReducedMotion: () => false},
    );
    motion.capture('push', menuDom.more);
    menuDom.drill();
    motion.play();
    motion.capture('pop', menuDom.more);
    menuDom.back();
    // The row takes focus as the view pops, and a focused row is lit.
    menuDom.more.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
    motion.play();
    await new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, 50);
    });
    const header = menuDom.surface.querySelector<HTMLElement>(
      `[${MENU_SUBMENU_COPY_ATTRIBUTE}] [data-astryx-menu-submenu-header]`,
    )!;
    // Opaque: the row's tint over the menu's paint.
    expect(header.style.backgroundColor).toBe('rgb(250, 250, 250)');
    expect(header.style.backgroundImage).toBe(
      'linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05))',
    );
    motion.reset();
  });

  it('reset removes the card behind an open sub-menu', () => {
    const menuDom = mount();
    const motion = createMenuDrillInMotion(
      () => ({
        surface: menuDom.surface,
        list: menuDom.list,
      }),
      {prefersReducedMotion: () => false},
    );
    motion.capture('push', menuDom.more);
    menuDom.drill();
    motion.play();
    motion.reset();
    expect(
      document.querySelector(`[${MENU_PARENT_COPY_ATTRIBUTE}]`),
    ).toBeNull();
  });

  it('under Reduce Motion nothing moves: the views cross-fade', () => {
    const menuDom = mount();
    const motion = createMenuDrillInMotion(
      () => ({surface: menuDom.surface, list: menuDom.list}),
      {prefersReducedMotion: () => true},
    );
    motion.capture('push', menuDom.more);
    menuDom.drill();
    motion.play();
    expect(
      recorded.filter(animation =>
        animation.keyframes.some(
          frame =>
            frame.translate != null ||
            frame.scale != null ||
            frame.rotate != null,
        ),
      ),
    ).toEqual([]);
    expect(
      menuDom.surface.querySelector(`[${MENU_BOX_SLICE_ATTRIBUTE}]`),
    ).toBeNull();
    expect(Number(lastOf(menuDom.view, 'opacity'))).toBe(1);
    const card = document.querySelector(`[${MENU_PARENT_COPY_ATTRIBUTE}]`)!;
    expect(Number(lastOf(card, 'opacity'))).toBe(0);
    motion.reset();
  });
});
