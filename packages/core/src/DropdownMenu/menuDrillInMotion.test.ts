// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menuDrillInMotion.test.ts
 * @input vitest (jsdom) with WAAPI recorded and layout stubbed, UIMenu's
 *   sub-menu values from the constants table
 * @output The in-place sub-menu's contract: a push adds no element: the
 *   menu's box grows from the edge it is anchored by on its own
 *   pseudo-elements, the live parent rows recede, the card reveals its view as
 *   a window (the view stands still while the card's edge uncovers it), the
 *   title starts on the tapped row, drawn once, and the chevron turns down. Back plays the leaving card
 *   itself, with no copy, while the parent rows come back and the box
 *   shrinks, and reports when it is done. Once the springs settle nothing the
 *   motion set stays; reset removes everything at once and reports done;
 *   under Reduce Motion nothing moves.
 * @position jsdom tests of packages/core/src/DropdownMenu/menuDrillInMotion.ts
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {menu} from '../motion/uikit/menu';
import {
  createMenuDrillInMotion,
  MENU_BOX_MOTION_ATTRIBUTE,
} from './menuDrillInMotion';

interface Recorded {
  target: Element;
  pseudoElement: string | undefined;
  keyframes: Keyframe[];
  cancelled: boolean;
}

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const rect = ({left, top, width, height}: Rect) =>
  ({
    left,
    top,
    width,
    height,
    x: left,
    y: top,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({}),
  }) as DOMRect;

// UIKit's sub-menu capture (iOS 26.2): a three-row menu (top 370, 104 tall)
// anchored by its bottom grows to 178 tall for the sub-menu, keeping its
// bottom at 474. The card holds the sub-menu from the box's top; its header
// is 42 tall.
const RADIUS = 13;
const PARENT_BOX: Rect = {left: 76, top: 370, width: 250, height: 104};
const SUBMENU_BOX: Rect = {left: 76, top: 296, width: 250, height: 178};
const HEADER_HEIGHT = 42;
const ROW_TITLE_TOP = 380;
const TITLE_TOP = 306;

let recorded: Recorded[] = [];
let motions: {dispose(): void}[] = [];
const originalRect = HTMLElement.prototype.getBoundingClientRect;

beforeEach(() => {
  recorded = [];
  motions = [];
  // The animator settles its handles on timers at each curve's end, and
  // drops a finished animation on the next frame: both run on fake time.
  vi.useFakeTimers();
  // jsdom has no layout: the exit copy stands where its inline box says.
  HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
    if (this.style.position === 'fixed') {
      return rect({
        left: parseFloat(this.style.left) || 0,
        top: parseFloat(this.style.top) || 0,
        width: parseFloat(this.style.width) || 0,
        height: parseFloat(this.style.height) || 0,
      });
    }
    return originalRect.call(this);
  };
  Element.prototype.animate = function (keyframes, options) {
    const record: Recorded = {
      target: this,
      pseudoElement:
        (options as KeyframeAnimationOptions | undefined)?.pseudoElement ??
        undefined,
      keyframes: keyframes as Keyframe[],
      cancelled: false,
    };
    const animation = {
      startTime: null,
      currentTime: 0,
      effect: null,
      playState: 'running',
      finished: new Promise<Animation>(() => {}),
      cancel() {
        record.cancelled = true;
      },
    };
    recorded.push(record);
    return animation as unknown as Animation;
  };
});

afterEach(() => {
  for (const motion of motions) {
    motion.dispose();
  }
  vi.clearAllTimers();
  vi.useRealTimers();
  HTMLElement.prototype.getBoundingClientRect = originalRect;
  Reflect.deleteProperty(Element.prototype, 'animate');
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

/** Run every curve to its end: the springs settle and the motion cleans up. */
async function settleAll() {
  await vi.advanceTimersByTimeAsync(30_000);
}

function mount({rtl = false}: {rtl?: boolean} = {}) {
  const surface = document.createElement('div');
  surface.setAttribute('popover', 'manual');
  surface.style.backgroundColor = 'rgb(250, 250, 250)';
  surface.style.borderTopLeftRadius = `${RADIUS}px`;
  surface.innerHTML = `
    <div role="menu" aria-label="Actions">
      <div data-parent>
        <div role="menuitem">Edit</div>
        <div role="menuitem" data-more><span data-astryx-item-label>More</span></div>
        <div role="menuitem">Delete</div>
      </div>
      <div data-host>
        <div data-view hidden>
          <div role="menuitem" aria-label="Back to Actions" data-astryx-menu-submenu-header><span data-astryx-menu-submenu-title>More</span><span data-astryx-menu-submenu-chevron></span></div>
          <div role="menuitem">X</div>
          <div role="menuitem">Y</div>
        </div>
      </div>
    </div>`;
  document.body.append(surface);
  const q = (selector: string) => surface.querySelector<HTMLElement>(selector)!;
  const list = q('[role="menu"]');
  const parent = q('[data-parent]');
  const host = q('[data-host]');
  const view = q('[data-view]');
  const more = q('[data-more]');
  const header = q('[data-astryx-menu-submenu-header]');
  const title = q('[data-astryx-menu-submenu-title]');
  const chevron = q('[data-astryx-menu-submenu-chevron]');
  if (rtl) {
    chevron.style.direction = 'rtl';
  }
  let box = PARENT_BOX;
  surface.getBoundingClientRect = () => rect(box);
  more.querySelector<HTMLElement>(
    '[data-astryx-item-label]',
  )!.getBoundingClientRect = () =>
    rect({left: 92, top: ROW_TITLE_TOP, width: 40, height: 22});
  host.getBoundingClientRect = () => rect(SUBMENU_BOX);
  header.getBoundingClientRect = () =>
    rect({...SUBMENU_BOX, height: HEADER_HEIGHT});
  title.getBoundingClientRect = () =>
    rect({left: 92, top: TITLE_TOP, width: 40, height: 22});
  const motion = createMenuDrillInMotion(() => ({surface, list}), {
    now: () => Date.now(),
  });
  motions.push(motion);
  return {
    surface,
    list,
    parent,
    host,
    view,
    more,
    header,
    title,
    chevron,
    motion,
    /** What useMenuDrillIn renders once the sub-menu's card shows. */
    drill() {
      parent.setAttribute('data-astryx-menu-parent', '');
      parent.setAttribute('aria-hidden', 'true');
      parent.inert = true;
      host.setAttribute('data-astryx-menu-card', '');
      view.hidden = false;
      box = SUBMENU_BOX;
    },
    /**
     * And once it is back on the parent's rows: the card going back stays
     * rendered (out of the menu's flow) until the motion is done.
     */
    back() {
      parent.removeAttribute('data-astryx-menu-parent');
      parent.removeAttribute('aria-hidden');
      parent.inert = false;
      host.removeAttribute('data-astryx-menu-card');
      box = PARENT_BOX;
    },
  };
}

/** The curves played on `target` (or its pseudo-element), set frames left out. */
const curvesOf = (target: Element, pseudoElement?: string) =>
  recorded.filter(
    animation =>
      animation.target === target &&
      animation.pseudoElement === pseudoElement &&
      animation.keyframes.length > 2,
  );

/** The first and last value a curve on `target` gives `property`. */
function endsOf(target: Element, property: string, pseudoElement?: string) {
  const curve = curvesOf(target, pseudoElement).find(animation =>
    animation.keyframes.some(frame => property in frame),
  );
  if (curve == null) {
    return null;
  }
  return [
    String(curve.keyframes[0][property]),
    String(curve.keyframes.at(-1)![property]),
  ];
}

const translateY = (value: unknown) =>
  Number(String(value).split(' ')[1]?.replace('px', ''));

const elementCount = () => document.querySelectorAll('*').length;

function push(m: ReturnType<typeof mount>) {
  m.motion.capture('push', m.more, true);
  m.drill();
  m.motion.play();
}

/**
 * A second level inside the first one's card, as useMenuDrillIn renders it:
 * every level portals into the one card, and the level under the shown one
 * stays there, hidden.
 */
function addSecondLevel(m: ReturnType<typeof mount>) {
  const view = document.createElement('div');
  view.hidden = true;
  view.innerHTML = `
    <div role="menuitem" aria-label="Sort, Back to More" data-astryx-menu-submenu-header><span data-astryx-menu-submenu-title>Sort</span><span data-astryx-menu-submenu-chevron></span></div>
    <div role="menuitem">Name</div>`;
  m.host.append(view);
  const header = view.querySelector<HTMLElement>(
    '[data-astryx-menu-submenu-header]',
  )!;
  header.getBoundingClientRect = () =>
    rect({...SUBMENU_BOX, height: HEADER_HEIGHT});
  const chevron = view.querySelector<HTMLElement>(
    '[data-astryx-menu-submenu-chevron]',
  )!;
  return {
    view,
    chevron,
    /** The second level shows; the first waits under it, hidden. */
    show() {
      m.view.hidden = true;
      view.hidden = false;
    },
    /** Back on the first level: the second one is gone. */
    leave() {
      view.remove();
      m.view.hidden = false;
    },
  };
}

describe('createMenuDrillInMotion', () => {
  it('a push adds no element: the box grows from the edge it is anchored by on its own pseudo-elements', () => {
    const m = mount();
    const before = elementCount();
    push(m);
    expect(elementCount()).toBe(before);
    // The bottom stays (474 before and after): the top edge travels.
    expect(m.surface.getAttribute(MENU_BOX_MOTION_ATTRIBUTE)).toBe('bottom');
    const middleFrom =
      (PARENT_BOX.height - 2 * RADIUS) / (SUBMENU_BOX.height - 2 * RADIUS);
    const [scaleFrom, scaleTo] = endsOf(m.surface, 'scale', '::after')!;
    expect(Number(scaleFrom.split(' ')[1])).toBeCloseTo(middleFrom, 4);
    expect(scaleTo).toBe('1 1');
    expect(endsOf(m.surface, 'translate', '::before')).toEqual([
      `0px ${PARENT_BOX.top - SUBMENU_BOX.top}px`,
      '0px 0px',
    ]);
    // The box itself never scales: its rows keep their size.
    expect(curvesOf(m.surface)).toEqual([]);
  });

  it('the live parent rows recede under the card to UIMenu’s opacity and scale', () => {
    const m = mount();
    push(m);
    expect(endsOf(m.parent, 'opacity')).toEqual([
      '1',
      String(menu.submenuParentOpacity),
    ]);
    expect(endsOf(m.parent, 'scale')).toEqual([
      '1 1',
      `${menu.submenuParentScale} ${menu.submenuParentScale}`,
    ]);
  });

  it('the card is a window: its edge uncovers the view, which stands still', () => {
    const m = mount();
    push(m);
    const covered = SUBMENU_BOX.height - HEADER_HEIGHT;
    const [card] = curvesOf(m.host);
    const [view] = curvesOf(m.view);
    expect(translateY(card.keyframes[0].translate)).toBe(-covered);
    expect(translateY(card.keyframes.at(-1)!.translate)).toBe(0);
    expect(translateY(view.keyframes[0].translate)).toBe(covered);
    // Frame by frame the view moves back by what the card moves: it never
    // moves on screen, and nothing is faded or slid.
    expect(view.keyframes.length).toBe(card.keyframes.length);
    card.keyframes.forEach((frame, i) => {
      expect(
        translateY(frame.translate) + translateY(view.keyframes[i].translate),
      ).toBeCloseTo(0, 3);
    });
    expect(endsOf(m.view, 'opacity')).toBeNull();
    expect(m.host.style.getPropertyValue('overflow')).toBe('clip');
  });

  it('the header stays on the row: its title starts where the row’s stood, drawn once', () => {
    const m = mount();
    push(m);
    expect(endsOf(m.title, 'translate')).toEqual([
      `0px ${ROW_TITLE_TOP - TITLE_TOP}px`,
      '0px 0px',
    ]);
    // Its text is drawn once: nothing draws a second copy of it.
    expect(curvesOf(m.title, '::before')).toEqual([]);
    expect(curvesOf(m.title, '::after')).toEqual([]);
  });

  it('the chevron turns from ahead to down, from the left in right-to-left', () => {
    const ltr = mount();
    push(ltr);
    expect(endsOf(ltr.chevron, 'rotate')).toEqual(['0deg', '90deg']);
    document.body.replaceChildren();
    recorded = [];
    const rtl = mount({rtl: true});
    push(rtl);
    expect(endsOf(rtl.chevron, 'rotate')).toEqual(['180deg', '90deg']);
  });

  it('once the springs settle, nothing the push set stays', async () => {
    const m = mount();
    push(m);
    await settleAll();
    expect(m.surface.hasAttribute(MENU_BOX_MOTION_ATTRIBUTE)).toBe(false);
    expect(m.surface.style.getPropertyValue('--_menu-box-radius')).toBe('');
    expect(m.host.style.getPropertyValue('overflow')).toBe('');
  });

  it('back plays the leaving card itself, adding no element, while the parent rows come back', async () => {
    const m = mount();
    push(m);
    await settleAll();
    recorded = [];
    const before = elementCount();
    const done = vi.fn();
    m.motion.capture('pop', m.more, true);
    m.back();
    m.motion.play(done);
    expect(elementCount()).toBe(before);
    expect(m.surface.getAttribute(MENU_BOX_MOTION_ATTRIBUTE)).toBe('bottom');
    const middleFrom =
      (SUBMENU_BOX.height - 2 * RADIUS) / (PARENT_BOX.height - 2 * RADIUS);
    const [scaleFrom, scaleTo] = endsOf(m.surface, 'scale', '::after')!;
    expect(Number(scaleFrom.split(' ')[1])).toBeCloseTo(middleFrom, 4);
    expect(scaleTo).toBe('1 1');
    expect(endsOf(m.parent, 'opacity')).toEqual([
      String(menu.submenuParentOpacity),
      '1',
    ]);
    expect(endsOf(m.parent, 'scale')).toEqual([
      `${menu.submenuParentScale} ${menu.submenuParentScale}`,
      '1 1',
    ]);
    // The card hides back up into its header, as it came, and its view stands
    // still while it does.
    const covered = SUBMENU_BOX.height - HEADER_HEIGHT;
    const [card] = curvesOf(m.host);
    const [view] = curvesOf(m.view);
    expect(translateY(card.keyframes[0].translate)).toBe(0);
    expect(translateY(card.keyframes.at(-1)!.translate)).toBe(-covered);
    expect(translateY(view.keyframes.at(-1)!.translate)).toBe(covered);
    expect(endsOf(m.chevron, 'rotate')).toEqual(['90deg', '0deg']);
    expect(done).not.toHaveBeenCalled();
    await settleAll();
    expect(done).toHaveBeenCalledTimes(1);
    expect(elementCount()).toBe(before);
    expect(m.surface.hasAttribute(MENU_BOX_MOTION_ATTRIBUTE)).toBe(false);
    expect(m.host.style.getPropertyValue('overflow')).toBe('');
    expect(m.parent.style.getPropertyValue('display')).toBe('');
  });

  it('two levels deep, the second level reveals itself and turns its own chevron, and the parent rows stay receded', async () => {
    const m = mount();
    push(m);
    await settleAll();
    const second = addSecondLevel(m);
    recorded = [];
    m.motion.capture(
      'push',
      m.view.querySelector<HTMLElement>('[role="menuitem"]:nth-child(2)'),
      false,
    );
    second.show();
    m.motion.play();
    // The level that showed is the one revealed, not the first one under it.
    expect(curvesOf(second.view)).toHaveLength(1);
    expect(curvesOf(m.view)).toEqual([]);
    expect(endsOf(second.chevron, 'rotate')).toEqual(['0deg', '90deg']);
    expect(curvesOf(m.chevron)).toEqual([]);
    // The root's rows stay where the first level left them.
    expect(curvesOf(m.parent)).toEqual([]);
  });

  it('back from the second level leaves the parent rows receded and plays no card out', async () => {
    const m = mount();
    push(m);
    await settleAll();
    const second = addSecondLevel(m);
    m.motion.capture('push', null, false);
    second.show();
    m.motion.play();
    await settleAll();
    recorded = [];
    const done = vi.fn();
    m.motion.capture('pop', null, false);
    second.leave();
    m.motion.play(done);
    expect(curvesOf(m.parent)).toEqual([]);
    expect(curvesOf(m.host)).toEqual([]);
    await settleAll();
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('reset ends a back at once: it reports done and undoes what it set', () => {
    const m = mount();
    push(m);
    const done = vi.fn();
    m.motion.capture('pop', m.more, true);
    m.back();
    m.motion.play(done);
    m.motion.reset();
    expect(done).toHaveBeenCalledTimes(1);
    expect(m.surface.hasAttribute(MENU_BOX_MOTION_ATTRIBUTE)).toBe(false);
    expect(m.parent.style.getPropertyValue('display')).toBe('');
    expect(m.host.style.getPropertyValue('overflow')).toBe('');
  });

  it('with nothing captured (no touch presentation), play reports done at once', () => {
    const m = mount();
    const done = vi.fn();
    m.motion.play(done);
    expect(done).toHaveBeenCalledTimes(1);
    expect(recorded).toEqual([]);
  });

  it('under Reduce Motion nothing moves: what would move fades', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query.includes('(not ')
          ? false
          : query.includes('(prefers-reduced-motion: reduce)') ||
            query.includes('(pointer: coarse)'),
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    const m = mount();
    push(m);
    const curves = recorded.filter(animation => animation.keyframes.length > 2);
    expect(curves.length).toBeGreaterThan(0);
    for (const curve of curves) {
      for (const frame of curve.keyframes) {
        expect(Object.keys(frame).filter(key => key !== 'offset')).toEqual([
          'opacity',
        ]);
      }
    }
  });
});
