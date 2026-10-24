// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pressFeedback.test.ts
 * @input pressFeedback.ts, the gesture host's press profiles and paint
 *   (gestures/PressTracker.ts, gestures/pressPaint.ts) and
 *   interactionOverlay.stylex.ts
 * @output Unit tests for the press model's marker (the profile it names and
 *   the release clock that follows), for the presses this file paints (a
 *   mouse or the Space key where the primary pointer is coarse) and those it
 *   leaves alone (a finger's, a pen's, a desktop's), for the one install a
 *   list pays for, and for the CSS arms the attribute drives: each profile's
 *   release runs on its own clock
 * @position Testing; validates pressFeedback.ts in jsdom. A finger's press is
 *   tested where it is tracked: gestures/__tests__/delegatedPress.test.ts and
 *   the press interaction specs
 */

import * as stylex from '@stylexjs/stylex';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {PRESS_PROFILES} from '../gestures/PressTracker';
import {button} from '../motion/uikit/button';
import {timing} from '../motion/uikit/timing';
import {list} from '../motion/uikit/list';
import {
  hasReleaseFade,
  readsPressStrength,
  declaresPressPaint,
  rulesDeclaredFor,
  rulesWithSelector,
} from '../__tests__/pressState';
import {
  interactionOverlayStyles,
  pressConsts,
} from './interactionOverlay.stylex';
import {
  cellPressableProps,
  installPressFeedback,
  PRESSABLE_ATTRIBUTE,
  PRESSED_ATTRIBUTE,
  pressableProps,
  pressReleaseMs,
} from './pressFeedback';

const CONTROL_RELEASE_MS = PRESS_PROFILES.control.releaseMs;
const CELL_RELEASE_MS = PRESS_PROFILES.cell.releaseMs;

let release: () => void = () => undefined;
let rows: HTMLElement[];

function pointer(
  element: Element,
  type: string,
  pointerType = 'mouse',
  init: {button?: number; pointerId?: number} = {},
): void {
  const event = new Event(type, {bubbles: true, cancelable: true});
  Object.assign(event, {
    button: init.button ?? 0,
    clientX: 10,
    clientY: 10,
    pointerId: init.pointerId ?? 1,
    pointerType,
  });
  element.dispatchEvent(event);
}

function key(target: Element, type: 'keydown' | 'keyup', init = {}): void {
  target.dispatchEvent(
    new KeyboardEvent(type, {
      key: ' ',
      bubbles: true,
      cancelable: true,
      ...init,
    }),
  );
}

function pressable(tag = 'div', profile = ''): HTMLElement {
  const element = document.createElement(tag);
  element.setAttribute(PRESSABLE_ATTRIBUTE, profile);
  return element;
}

function focusedButton(row: HTMLElement): HTMLButtonElement {
  const control = document.createElement('button');
  control.setAttribute(PRESSABLE_ATTRIBUTE, '');
  row.appendChild(control);
  control.focus();
  return control;
}

const painted = () => document.querySelectorAll(`[${PRESSED_ATTRIBUTE}]`);

/** `(pointer: coarse)` matching or not: a phone or tablet, or a desktop. */
const primaryPointer =
  (isCoarse: boolean) =>
  (query: string): MediaQueryList =>
    ({
      matches: isCoarse && /\(\s*pointer\s*:\s*coarse\s*\)/.test(query),
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = '';
  rows = [];
  for (let index = 0; index < 4; index += 1) {
    const row = pressable();
    row.textContent = `row ${index}`;
    document.body.appendChild(row);
    rows.push(row);
  }
});

afterEach(() => {
  release();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('the marker names the press profile', () => {
  it('is empty for a control and `cell` for a list row', () => {
    expect(pressableProps).toEqual({[PRESSABLE_ATTRIBUTE]: ''});
    expect(cellPressableProps).toEqual({[PRESSABLE_ATTRIBUTE]: 'cell'});
  });

  it("gives each surface its profile's release clock: UIButton's for a control, the deselect for a cell", () => {
    expect(CONTROL_RELEASE_MS).toBe(timing.press.buttonReleaseMs);
    expect(CELL_RELEASE_MS).toBe(list.highlight.releaseMs);
    expect(pressReleaseMs(pressable('button'))).toBe(CONTROL_RELEASE_MS);
    expect(pressReleaseMs(pressable('div', 'control'))).toBe(
      CONTROL_RELEASE_MS,
    );
    expect(pressReleaseMs(pressable('div', 'cell'))).toBe(CELL_RELEASE_MS);
    // An unknown value is a control, as the gesture host reads it.
    expect(pressReleaseMs(pressable('div', 'other'))).toBe(CONTROL_RELEASE_MS);
  });
});

describe('a desktop keeps `:active`', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', primaryPointer(false));
    release = installPressFeedback();
  });

  it('paints nothing for a mouse press or a Space press where the primary pointer is fine', () => {
    pointer(rows[0], 'pointerdown');
    const control = focusedButton(rows[1]);
    key(control, 'keydown');
    vi.advanceTimersByTime(1000);
    expect(painted()).toHaveLength(0);
  });
});

describe('a phone or tablet paints a mouse or Space press itself', () => {
  // `(pointer: coarse)` reads the PRIMARY pointer. Where it matches, the
  // stylesheet drops every `:active` arm, so a trackpad click or a Space press
  // on a focused button would paint nothing at all unless this paints it: a
  // tablet with a keyboard and trackpad, a phone with a mouse.
  beforeEach(() => {
    vi.stubGlobal('matchMedia', primaryPointer(true));
    release = installPressFeedback();
  });

  it("paints a mouse press at once, holds it, and fades it on the control's clock", () => {
    pointer(rows[1], 'pointerdown');
    // No delay: a mouse button cannot become a scroll.
    expect(rows[1].getAttribute(PRESSED_ATTRIBUTE)).toBe('on');
    vi.advanceTimersByTime(1000);
    expect(rows[1].getAttribute(PRESSED_ATTRIBUTE)).toBe('on');
    pointer(rows[1], 'pointerup');
    expect(rows[1].getAttribute(PRESSED_ATTRIBUTE)).toBe('fading');
    vi.advanceTimersByTime(CONTROL_RELEASE_MS - 1);
    expect(rows[1].getAttribute(PRESSED_ATTRIBUTE)).toBe('fading');
    vi.advanceTimersByTime(1);
    expect(rows[1].hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
  });

  it("fades a cell's press on the deselect clock", () => {
    const row = pressable('div', 'cell');
    document.body.appendChild(row);
    pointer(row, 'pointerdown');
    pointer(row, 'pointerup');
    expect(row.getAttribute(PRESSED_ATTRIBUTE)).toBe('fading');
    vi.advanceTimersByTime(CELL_RELEASE_MS);
    expect(row.hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
  });

  it('keeps the paint while the mouse is dragged off the surface, as `:active` does', () => {
    pointer(rows[1], 'pointerdown');
    pointer(document.body, 'pointermove');
    document.dispatchEvent(new Event('scroll'));
    expect(rows[1].getAttribute(PRESSED_ATTRIBUTE)).toBe('on');
    pointer(document.body, 'pointerup');
    expect(rows[1].getAttribute(PRESSED_ATTRIBUTE)).toBe('fading');
  });

  it('paints only the primary button, and only its own pointer releases it', () => {
    pointer(rows[0], 'pointerdown', 'mouse', {button: 2});
    expect(painted()).toHaveLength(0);
    pointer(rows[0], 'pointerdown', 'mouse', {pointerId: 3});
    pointer(rows[0], 'pointerup', 'mouse', {pointerId: 4});
    expect(rows[0].getAttribute(PRESSED_ATTRIBUTE)).toBe('on');
  });

  it("leaves a finger's or a pen's press to the gesture host", () => {
    pointer(rows[0], 'pointerdown', 'touch');
    pointer(rows[1], 'pointerdown', 'pen');
    vi.advanceTimersByTime(1000);
    expect(painted()).toHaveLength(0);
  });

  it('paints the innermost surface, and nothing on a disabled one', () => {
    const inner = pressable('button');
    rows[2].appendChild(inner);
    pointer(inner, 'pointerdown');
    expect(inner.getAttribute(PRESSED_ATTRIBUTE)).toBe('on');
    expect(rows[2].hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
    pointer(inner, 'pointerup');
    vi.advanceTimersByTime(CONTROL_RELEASE_MS);

    const disabled = pressable('button');
    disabled.setAttribute('aria-disabled', 'true');
    rows[3].appendChild(disabled);
    pointer(disabled, 'pointerdown');
    expect(painted()).toHaveLength(0);
  });

  it('drops the paint at once when the pointer is cancelled or a drag starts', () => {
    pointer(rows[0], 'pointerdown');
    pointer(rows[0], 'pointercancel');
    expect(rows[0].hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);

    pointer(rows[1], 'pointerdown');
    rows[1].dispatchEvent(new Event('dragstart', {bubbles: true}));
    expect(rows[1].hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
    // Free again: the next press paints.
    pointer(rows[2], 'pointerdown');
    expect(rows[2].getAttribute(PRESSED_ATTRIBUTE)).toBe('on');
  });

  it('never overwrites or clears a value another owner holds', () => {
    // A row kept selected through a navigation push.
    rows[0].setAttribute(PRESSED_ATTRIBUTE, 'held');
    pointer(rows[0], 'pointerdown');
    expect(rows[0].getAttribute(PRESSED_ATTRIBUTE)).toBe('held');
    pointer(rows[0], 'pointerup');
    pointer(rows[0], 'pointercancel');
    vi.advanceTimersByTime(1000);
    expect(rows[0].getAttribute(PRESSED_ATTRIBUTE)).toBe('held');
  });

  it('a mouse press on a surface whose release is still fading owns its paint', () => {
    pointer(rows[0], 'pointerdown');
    pointer(rows[0], 'pointerup');
    expect(rows[0].getAttribute(PRESSED_ATTRIBUTE)).toBe('fading');
    pointer(rows[0], 'pointerdown');
    // The first release's timer would have removed the attribute here.
    vi.advanceTimersByTime(CONTROL_RELEASE_MS * 2);
    expect(rows[0].getAttribute(PRESSED_ATTRIBUTE)).toBe('on');
  });

  it('paints a Space press on a focused button while the key is down', () => {
    const control = focusedButton(rows[0]);
    key(control, 'keydown');
    expect(control.getAttribute(PRESSED_ATTRIBUTE)).toBe('on');
    vi.advanceTimersByTime(1000);
    key(control, 'keydown', {repeat: true});
    expect(control.getAttribute(PRESSED_ATTRIBUTE)).toBe('on');
    key(control, 'keyup');
    expect(control.getAttribute(PRESSED_ATTRIBUTE)).toBe('fading');
    vi.advanceTimersByTime(CONTROL_RELEASE_MS);
    expect(control.hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
  });

  it('paints the surface around a focused checkbox or radio', () => {
    for (const type of ['checkbox', 'radio']) {
      const input = document.createElement('input');
      input.type = type;
      rows[2].appendChild(input);
      input.focus();
      key(input, 'keydown');
      expect(rows[2].getAttribute(PRESSED_ATTRIBUTE)).toBe('on');
      key(input, 'keyup');
      vi.advanceTimersByTime(CONTROL_RELEASE_MS);
      expect(rows[2].hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
    }
  });

  it('paints nothing where Space activates nothing, for Enter, or for a press the page cancelled', () => {
    const link = document.createElement('a');
    link.href = '#';
    link.setAttribute(PRESSABLE_ATTRIBUTE, '');
    rows[0].appendChild(link);
    key(link, 'keydown');

    const roleButton = pressable('div');
    roleButton.setAttribute('role', 'button');
    roleButton.tabIndex = 0;
    rows[1].appendChild(roleButton);
    key(roleButton, 'keydown');

    const control = focusedButton(rows[2]);
    key(control, 'keydown', {key: 'Enter'});
    control.addEventListener('keydown', event => event.preventDefault(), {
      once: true,
    });
    key(control, 'keydown');
    expect(painted()).toHaveLength(0);
  });

  it('ends the press with its fade when focus leaves before the key comes up', () => {
    const control = focusedButton(rows[0]);
    key(control, 'keydown');
    control.dispatchEvent(new FocusEvent('blur'));
    expect(control.getAttribute(PRESSED_ATTRIBUTE)).toBe('fading');
    vi.advanceTimersByTime(CONTROL_RELEASE_MS);
    expect(control.hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
  });

  it('leaves nothing painted when the page hides or the last install comes down', () => {
    const control = focusedButton(rows[0]);
    key(control, 'keydown');
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });
    expect(control.hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);

    pointer(rows[1], 'pointerdown');
    release();
    expect(rows[1].hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
    key(control, 'keydown');
    pointer(rows[2], 'pointerdown');
    expect(painted()).toHaveLength(0);
    // Re-install for afterEach's release.
    release = installPressFeedback();
  });
});

describe('what the list pays for it', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', primaryPointer(true));
  });

  it('adds no listener to any row', () => {
    const spies = rows.map(row => vi.spyOn(row, 'addEventListener'));
    release = installPressFeedback();
    pointer(rows[0], 'pointerdown');
    pointer(rows[0], 'pointerup');
    for (const spy of spies) {
      expect(spy).not.toHaveBeenCalled();
    }
  });

  it('installs once, however many times it is called, and stays while any holder remains', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const first = installPressFeedback();
    const second = installPressFeedback();
    const pointerdowns = add.mock.calls.filter(
      ([type]) => type === 'pointerdown',
    );
    expect(pointerdowns).toHaveLength(1);
    first();
    pointer(rows[0], 'pointerdown');
    expect(rows[0].getAttribute(PRESSED_ATTRIBUTE)).toBe('on');
    second();
    expect(rows[0].hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
    pointer(rows[1], 'pointerdown');
    expect(painted()).toHaveLength(0);
    // Releasing twice is harmless.
    second();
  });
});

describe('the release fades: the arms the controller writes to', () => {
  // The CSS half of the model, asserted off the StyleX dev runtime's injected
  // rules the way the component tests do. jsdom runs no animation, so what is
  // held here is the declaration: which arm animates, on which clock, and
  // what the paint reads.
  const variants = [
    'backgroundColor',
    'backgroundImage',
    'backgroundImageOnNeutral',
    'pressedBackgroundColor',
  ] as const;

  function surface(
    style: (typeof interactionOverlayStyles)[keyof typeof interactionOverlayStyles],
  ): HTMLElement {
    const element = pressable('button');
    element.className = stylex.props(style).className ?? '';
    document.body.appendChild(element);
    return element;
  }

  it("runs the release animation on the fading arm, for the machine's clock, on every variant", () => {
    for (const variant of variants) {
      expect(
        hasReleaseFade(surface(interactionOverlayStyles[variant])),
        variant,
      ).toBe(true);
    }
    expect(hasReleaseFade(surface(interactionOverlayStyles.pressedAlpha))).toBe(
      true,
    );
  });

  it("each profile's clock is the stylesheet's constant: one number each", () => {
    expect(pressConsts.releaseMs).toBe(list.highlight.releaseMs);
    expect(pressConsts.controlReleaseMs).toBe(button.highlight.releaseMs);
    expect(hasReleaseFade(surface(interactionOverlayStyles.pressedAlpha))).toBe(
      true,
    );
  });

  it("declares the press's paint at its strength on every variant, the one place the formula lives", () => {
    for (const variant of variants) {
      expect(
        declaresPressPaint(surface(interactionOverlayStyles[variant])),
        variant,
      ).toBe(true);
    }
    expect(
      declaresPressPaint(surface(interactionOverlayStyles.pressedAlpha)),
    ).toBe(true);
  });

  it("paints both touch arms as the pressed token at the press's strength, and declares the strength 1 on both", () => {
    for (const variant of variants) {
      const element = surface(interactionOverlayStyles[variant]);
      expect(
        readsPressStrength(element, '[data-astryx-press="on"]'),
        variant,
      ).toBe(true);
      expect(readsPressStrength(element), variant).toBe(true);
      // The fading arm declares 1, like the on arm: only the animation moves
      // the strength, so nothing a composer transitions changes at the lift.
      for (const arm of [
        '[data-astryx-press="on"]',
        '[data-astryx-press="fading"]',
      ]) {
        expect(
          rulesWithSelector(element, arm).some(rule =>
            /--astryx-press-alpha:\s*1\b/.test(rule),
          ),
          `${variant} ${arm}`,
        ).toBe(true);
      }
      // ...and lands on nothing, not on the hover strength: under a finger
      // there is no hover.
      expect(
        rulesWithSelector(element, '[data-astryx-press="fading"]').some(rule =>
          rule.includes('--color-overlay-hover'),
        ),
        variant,
      ).toBe(false);
    }
  });

  it('pressedAlpha owns the strength and the release and paints nothing itself', () => {
    const element = surface(interactionOverlayStyles.pressedAlpha);
    expect(
      rulesDeclaredFor(element).some(rule => rule.includes('background')),
    ).toBe(false);
    expect(readsPressStrength(element)).toBe(false);
  });
});
